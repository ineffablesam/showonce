-- Repair already-applied create_procedure/create_handoff definitions that parsed
-- json extraction minus array as subtraction instead of key removal.

create or replace function public.create_procedure(p_owner_token text, p_payload jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_owner_token !~ '^own_[A-Za-z0-9_-]{32}$'
    or not public.payload_is_safe(p_payload)
    or not (p_payload ?& array['id','recordingId','title','createdAt','sourceEventIds','steps'])
    or p_payload - array['id','recordingId','title','createdAt','sourceEventIds','steps'] <> '{}'::jsonb
    or char_length(p_payload->>'id') not between 1 and 128
    or char_length(p_payload->>'recordingId') not between 1 and 128
    or char_length(p_payload->>'title') not between 1 and 120
    or jsonb_typeof(p_payload->'steps') <> 'array'
    or jsonb_array_length(p_payload->'steps') > 100 then
    raise exception 'Invalid procedure payload';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_payload->'steps') as steps(step)
    where jsonb_typeof(step) <> 'object'
      or not (step ?& array['id','commandType','policy','input'])
      or step - array['id','commandType','policy','input'] <> '{}'::jsonb
      or step->>'commandType' not in (
        'set_preference','select_plan','review_recipient_details',
        'preview_renewal','create_confirmation','submit_renewal'
      )
      or jsonb_typeof(step->'input') <> 'object'
      or (step->'input') - array[
        'type','key','value','planId','observedMonthlyPrice'
      ] <> '{}'::jsonb
      or step->'input'->>'type' <> step->>'commandType'
      or step->>'policy' <> case step->>'commandType'
        when 'set_preference' then 'safe_preference'
        when 'select_plan' then 'availability_checked'
        when 'review_recipient_details' then 'recipient_specific'
        when 'preview_renewal' then 'state_check'
        when 'create_confirmation' then 'confirmation_required'
        when 'submit_renewal' then 'confirmation_required'
      end
      or (step->>'commandType' = 'set_preference' and (
        step->'input'->>'key' not in ('paperless','communication','renewalFrequency')
        or (step->'input'->>'key' = 'paperless'
          and jsonb_typeof(step->'input'->'value') <> 'boolean')
        or (step->'input'->>'key' = 'communication'
          and step->'input'->>'value' not in ('email','mail'))
        or (step->'input'->>'key' = 'renewalFrequency'
          and step->'input'->>'value' not in ('monthly','annual'))
      ))
      or (step->>'commandType' = 'select_plan' and (
        char_length(step->'input'->>'planId') not between 1 and 64
        or (step->'input' ? 'observedMonthlyPrice' and (
          jsonb_typeof(step->'input'->'observedMonthlyPrice') <> 'number'
          or (step->'input'->>'observedMonthlyPrice')::numeric < 0
        ))
      ))
  ) then
    raise exception 'Invalid procedure step';
  end if;
  if not exists (
    select 1 from public.procedures
    where owner_token_hash = public.owner_hash(p_owner_token)
      and external_id = p_payload->>'id'
  ) then
    perform public.assert_owner_quota(public.owner_hash(p_owner_token), 'procedure');
  end if;
  insert into public.procedures(
    external_id, recording_id, owner_token_hash, title, payload, created_at
  ) values (
    p_payload->>'id', p_payload->>'recordingId', public.owner_hash(p_owner_token),
    p_payload->>'title',
    p_payload - array['id','recordingId','title','createdAt'],
    to_timestamp((p_payload->>'createdAt')::double precision / 1000)
  )
  on conflict (owner_token_hash, external_id) do update
  set title = excluded.title, payload = excluded.payload, updated_at = pg_catalog.now();
end;
$$;

create or replace function public.create_handoff(p_owner_token text, p_payload jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  procedure_row public.procedures;
begin
  if p_owner_token !~ '^own_[A-Za-z0-9_-]{32}$'
    or not public.payload_is_safe(p_payload)
    or not (p_payload ?& array['id','publicToken','procedureId','title','createdAt','expiresAt','status'])
    or p_payload - array[
      'id','publicToken','procedureId','title','createdAt','updatedAt','expiresAt',
      'status','procedure','recipient','note','policy'
    ] <> '{}'::jsonb
    or p_payload->>'publicToken' !~ '^[A-Za-z0-9_-]{24}$'
    or p_payload->>'status' <> 'created'
    or char_length(p_payload->>'title') not between 1 and 120
    or char_length(coalesce(p_payload->>'note','')) > 500
    or to_timestamp((p_payload->>'expiresAt')::double precision / 1000)
      <= pg_catalog.now() then
    raise exception 'Invalid handoff payload';
  end if;
  if p_payload ? 'policy' and (
    jsonb_typeof(p_payload->'policy') <> 'object'
    or not (p_payload->'policy' ?& array[
      'allowSafePreferences','requireConfirmation','allowHelperEscalation'
    ])
    or (p_payload->'policy') - array[
      'allowSafePreferences','requireConfirmation','allowHelperEscalation'
    ] <> '{}'::jsonb
  ) then
    raise exception 'Invalid handoff policy';
  end if;
  if not (p_payload ? 'policy') then raise exception 'Handoff policy is required'; end if;
  select * into procedure_row from public.procedures p
  where p.owner_token_hash = public.owner_hash(p_owner_token)
    and p.external_id = p_payload->>'procedureId';
  if procedure_row.id is null then raise exception 'Procedure unavailable'; end if;
  if not exists (
    select 1 from public.handoffs
    where owner_token_hash = public.owner_hash(p_owner_token)
      and external_id = p_payload->>'id'
  ) then
    perform public.assert_owner_quota(public.owner_hash(p_owner_token), 'handoff');
  end if;
  insert into public.handoffs(
    external_id, procedure_id, owner_token_hash, public_token, status,
    title, payload, expires_at, created_at
  ) values (
    p_payload->>'id', procedure_row.id, public.owner_hash(p_owner_token),
    p_payload->>'publicToken', 'created', p_payload->>'title',
    p_payload - array[
      'id','publicToken','procedureId','title','createdAt','updatedAt','expiresAt',
      'status','procedure'
    ],
    least(
      to_timestamp((p_payload->>'expiresAt')::double precision / 1000),
      pg_catalog.now() + interval '7 days'
    ),
    to_timestamp((p_payload->>'createdAt')::double precision / 1000)
  )
  on conflict (owner_token_hash, external_id) do nothing;
end;
$$;

revoke all on function public.create_procedure(text, jsonb) from public, anon, authenticated;
revoke all on function public.create_handoff(text, jsonb) from public, anon, authenticated;

grant execute on function public.create_procedure(text, jsonb) to anon;
grant execute on function public.create_handoff(text, jsonb) to anon;
