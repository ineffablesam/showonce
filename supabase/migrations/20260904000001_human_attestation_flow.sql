-- The recipient confirmation flow no longer round-trips through WebMCP:
-- a human's single "Confirm & submit" click records a `recipient_attestation`
-- semantic event and submits atomically. This migration:
--   1. Lets `recipient_attestation` be logged as a valid activity commandType.
--   2. Adds the tool names introduced since the base migration
--      (`benefits_set_renewal_period`, `benefits_set_paperless`,
--      `benefits_prepare_renewal`) to the webmcp_invocation allowlist —
--      `benefits_submit_renewal` stays allowed for any already-queued client.
--   3. Marks the atomic submission activity event this function inserts as
--      `source: 'human'` instead of `'webmcp'`, since only a human attestation
--      can ever reach this function now.

create or replace function public.append_owner_activity(p_owner_token text, p_payload jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_owner_token !~ '^own_[A-Za-z0-9_-]{32}$'
    or not public.payload_is_safe(p_payload)
    or not (p_payload ?& array['id','kind','timestamp','source'])
    or p_payload - array[
      'id','kind','timestamp','source','toolName','commandType','policy','outcome'
    ] <> '{}'::jsonb
    or p_payload->>'kind' not in ('command','webmcp_invocation')
    or p_payload->>'source' not in ('human','webmcp','system')
    or (p_payload ? 'outcome'
      and p_payload->>'outcome' not in ('applied','refused','read','aborted','error'))
    or (p_payload ? 'commandType' and p_payload->>'commandType' not in (
      'set_preference','select_plan','set_address','add_dependent',
      'review_recipient_details','preview_renewal','create_confirmation',
      'recipient_attestation','submit_renewal','record_decision'
    ))
    or (p_payload ? 'policy' and p_payload->>'policy' not in (
      'safe_preference','availability_checked','never_transfer',
      'recipient_specific','state_check','confirmation_required','human_judgment'
    ))
    or (p_payload->>'kind' = 'webmcp_invocation' and (
      p_payload->>'source' <> 'webmcp' or not (p_payload ? 'toolName')
      or p_payload ? 'commandType' or p_payload ? 'policy'
      or p_payload->>'toolName' not in (
        'showonce_get_handoff','benefits_get_account_state',
        'benefits_get_current_plan','benefits_get_available_plans',
        'showonce_compare_to_handoff','benefits_apply_safe_preferences',
        'benefits_set_renewal_period','benefits_set_paperless',
        'benefits_preview_renewal','showonce_request_helper',
        'showonce_get_helper_decision','benefits_prepare_renewal',
        'benefits_submit_renewal'
      )
    ))
    or (p_payload->>'kind' = 'command' and (
      not (p_payload ?& array['commandType','policy','outcome'])
      or p_payload ? 'toolName'
    ))
    or char_length(p_payload->>'id') not between 1 and 128 then
    raise exception 'Invalid activity';
  end if;
  if not exists (
    select 1 from public.shared_activity_events
    where owner_token_hash = public.owner_hash(p_owner_token)
      and external_id = p_payload->>'id'
  ) then
    perform public.assert_owner_quota(public.owner_hash(p_owner_token), 'activity');
  end if;
  insert into public.shared_activity_events(external_id, owner_token_hash, payload, created_at)
  values (
    p_payload->>'id', public.owner_hash(p_owner_token),
    p_payload - array['id','timestamp'],
    to_timestamp((p_payload->>'timestamp')::double precision / 1000)
  )
  on conflict (owner_token_hash, external_id) do update
  set payload = excluded.payload, updated_at = pg_catalog.now();
end;
$$;

create or replace function public.append_public_activity(p_handoff_token text, p_payload jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
declare h public.handoffs;
begin
  select * into h from public.handoffs where public_token = p_handoff_token;
  if h.id is null or p_handoff_token !~ '^[A-Za-z0-9_-]{24}$'
    or h.expires_at <= pg_catalog.now() or h.status in ('completed','expired')
    or not public.payload_is_safe(p_payload)
    or not (p_payload ?& array['id','kind','timestamp','source'])
    or p_payload - array[
      'id','kind','timestamp','source','toolName','commandType','policy','outcome'
    ] <> '{}'::jsonb
    or p_payload->>'kind' not in ('command','webmcp_invocation')
    or p_payload->>'source' not in ('human','webmcp')
    or (p_payload ? 'outcome'
      and p_payload->>'outcome' not in ('applied','refused','read','aborted','error'))
    or (p_payload ? 'commandType' and p_payload->>'commandType' not in (
      'set_preference','select_plan','set_address','add_dependent',
      'review_recipient_details','preview_renewal','create_confirmation',
      'recipient_attestation','submit_renewal','record_decision'
    ))
    or (p_payload ? 'policy' and p_payload->>'policy' not in (
      'safe_preference','availability_checked','never_transfer',
      'recipient_specific','state_check','confirmation_required','human_judgment'
    ))
    or (p_payload->>'kind' = 'webmcp_invocation' and (
      p_payload->>'source' <> 'webmcp' or not (p_payload ? 'toolName')
      or p_payload ? 'commandType' or p_payload ? 'policy'
      or p_payload->>'toolName' not in (
        'showonce_get_handoff','benefits_get_account_state',
        'benefits_get_current_plan','benefits_get_available_plans',
        'showonce_compare_to_handoff','benefits_apply_safe_preferences',
        'benefits_set_renewal_period','benefits_set_paperless',
        'benefits_preview_renewal','showonce_request_helper',
        'showonce_get_helper_decision','benefits_prepare_renewal',
        'benefits_submit_renewal'
      )
    ))
    or (p_payload->>'kind' = 'command' and (
      not (p_payload ?& array['commandType','policy','outcome'])
      or p_payload ? 'toolName'
    )) then raise exception 'Invalid activity'; end if;
  if p_payload->>'commandType' = 'set_preference'
    and coalesce((h.payload->'policy'->>'allowSafePreferences')::boolean, false) = false then
    raise exception 'Safe preference application is disabled by handoff policy';
  end if;
  if not exists (
    select 1 from public.shared_activity_events
    where owner_token_hash = h.owner_token_hash
      and external_id = p_payload->>'id'
  ) then
    perform public.assert_owner_quota(h.owner_token_hash, 'activity');
  end if;
  insert into public.shared_activity_events(
    external_id, owner_token_hash, handoff_id, payload, created_at
  ) values (
    p_payload->>'id', h.owner_token_hash, h.id,
    p_payload - array['id','timestamp'],
    to_timestamp((p_payload->>'timestamp')::double precision / 1000)
  )
  on conflict (owner_token_hash, external_id) do update
  set payload = excluded.payload, updated_at = pg_catalog.now();
end;
$$;

create or replace function public.complete_recipient_handoff(
  p_public_token text,
  p_recipient_token text,
  p_confirmation_token text
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  h public.handoffs;
  confirmation public.handoff_confirmations;
begin
  if p_public_token !~ '^[A-Za-z0-9_-]{24}$'
    or p_recipient_token !~ '^rcp_[A-Za-z0-9_-]{43}$'
    or p_confirmation_token !~ '^[A-Za-z0-9_-]{43}$' then
    raise exception 'Recipient confirmation is invalid';
  end if;
  select * into h from public.handoffs where public_token = p_public_token for update;
  -- Reaching AWAITING HUMAN APPROVAL may have happened from 'running' or,
  -- when the comparison flagged a material difference, 'needs_input' —
  -- both are valid predecessors of the atomic human completion below.
  if h.id is null or h.expires_at <= pg_catalog.now()
    or h.status not in ('running','waiting_confirmation','needs_input')
    or h.recipient_token_hash is null
    or h.recipient_token_hash <> public.owner_hash(p_recipient_token) then
    raise exception 'Recipient confirmation is invalid';
  end if;
  select * into confirmation
  from public.handoff_confirmations
  where handoff_id = h.id
    and recipient_token_hash = public.owner_hash(p_recipient_token)
    and confirmation_token_hash = public.owner_hash(p_confirmation_token)
    and expires_at > pg_catalog.now()
    and consumed_at is null
  for update;
  if confirmation.id is null then
    raise exception 'Recipient confirmation is invalid, expired, or consumed';
  end if;
  update public.handoff_confirmations
  set consumed_at = pg_catalog.now()
  where id = confirmation.id;
  update public.handoffs
  set status = 'completed', updated_at = pg_catalog.now()
  where id = h.id returning * into h;
  perform public.assert_owner_quota(h.owner_token_hash, 'activity');
  insert into public.shared_activity_events(
    external_id, owner_token_hash, handoff_id, payload, created_at
  ) values (
    'submit-' || extensions.gen_random_uuid()::text,
    h.owner_token_hash,
    h.id,
    jsonb_build_object(
      'kind', 'command',
      'source', 'human',
      'commandType', 'submit_renewal',
      'policy', 'confirmation_required',
      'outcome', 'applied'
    ),
    pg_catalog.now()
  );
  return public.public_handoff_json(h);
end;
$$;
