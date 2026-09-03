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
  if h.id is null or h.expires_at <= pg_catalog.now()
    or h.status not in ('running','waiting_confirmation')
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
      'source', 'webmcp',
      'commandType', 'submit_renewal',
      'policy', 'confirmation_required',
      'outcome', 'applied'
    ),
    pg_catalog.now()
  );
  return public.public_handoff_json(h);
end;
$$;

revoke all on function public.complete_recipient_handoff(text, text, text)
  from public, anon, authenticated;
grant execute on function public.complete_recipient_handoff(text, text, text)
  to anon;
