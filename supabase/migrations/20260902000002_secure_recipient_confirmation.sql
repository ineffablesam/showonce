-- Replace the obsolete helper alternative with the actual available plan.
do $migration$
declare
  procedure_signature regprocedure;
  definition text;
begin
  foreach procedure_signature in array array[
    'public.create_helper_request(text,jsonb)'::regprocedure,
    'public.save_owner_helper_request(text,jsonb)'::regprocedure,
    'public.record_helper_decision(text,jsonb)'::regprocedure,
    'public.save_owner_decision(text,jsonb)'::regprocedure
  ]
  loop
    select pg_catalog.pg_get_functiondef(procedure_signature)
      into definition;
    execute pg_catalog.replace(
      definition,
      '''silver'',''premium''',
      '''silver'',''platinum'''
    );
  end loop;
end;
$migration$;

alter table public.handoffs
  add column if not exists recipient_token_hash bytea;

create table if not exists public.handoff_confirmations (
  id uuid primary key default extensions.gen_random_uuid(),
  handoff_id uuid not null references public.handoffs(id) on delete cascade,
  recipient_token_hash bytea not null,
  confirmation_token_hash bytea not null unique,
  created_at timestamptz not null default pg_catalog.now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  check (expires_at <= created_at + interval '120 seconds')
);

create index if not exists handoff_confirmations_lookup_idx
  on public.handoff_confirmations (
    handoff_id, recipient_token_hash, confirmation_token_hash
  );
create index if not exists handoff_confirmations_expires_idx
  on public.handoff_confirmations (expires_at);

alter table public.handoff_confirmations enable row level security;
revoke all on table public.handoff_confirmations
  from public, anon, authenticated;

drop function if exists public.mark_handoff_opened(text);
drop function if exists public.mark_handoff_opened(text, text);

create or replace function public.mark_handoff_opened(
  p_public_token text,
  p_recipient_token text
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare h public.handoffs;
begin
  if p_public_token !~ '^[A-Za-z0-9_-]{24}$'
    or p_recipient_token !~ '^rcp_[A-Za-z0-9_-]{43}$' then
    raise exception 'Handoff unavailable';
  end if;
  select * into h from public.handoffs
  where public_token = p_public_token for update;
  if h.id is null then raise exception 'Handoff unavailable'; end if;
  if h.expires_at <= pg_catalog.now() then
    update public.handoffs set status = 'expired', updated_at = pg_catalog.now()
    where id = h.id and status not in ('completed','expired');
    return null;
  end if;
  if h.status in ('expired','completed') then
    raise exception 'Handoff unavailable';
  end if;
  if h.recipient_token_hash is null then
    update public.handoffs
    set recipient_token_hash = public.owner_hash(p_recipient_token),
        status = case when status = 'created' then 'opened' else status end,
        updated_at = pg_catalog.now()
    where id = h.id returning * into h;
  elsif h.recipient_token_hash <> public.owner_hash(p_recipient_token) then
    raise exception 'Handoff is bound to another recipient';
  elsif h.status = 'created' then
    update public.handoffs set status = 'opened', updated_at = pg_catalog.now()
    where id = h.id returning * into h;
  end if;
  return public.public_handoff_json(h);
end;
$$;

create or replace function public.transition_public_handoff(
  p_public_token text, p_status public.handoff_status
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare h public.handoffs; allowed boolean;
begin
  select * into h from public.handoffs where public_token = p_public_token for update;
  if h.id is null or p_public_token !~ '^[A-Za-z0-9_-]{24}$' then
    raise exception 'Handoff unavailable';
  end if;
  if h.expires_at <= pg_catalog.now() then
    update public.handoffs set status = 'expired', updated_at = pg_catalog.now()
    where id = h.id and status not in ('completed','expired');
    return null;
  end if;
  if h.status in ('expired','completed') then raise exception 'Handoff unavailable'; end if;
  if h.status = p_status then return public.public_handoff_json(h); end if;
  allowed :=
    (h.status = 'opened' and p_status = 'running') or
    (h.status = 'running' and p_status in ('needs_input','waiting_confirmation')) or
    (h.status = 'needs_input' and p_status in ('running','waiting_confirmation')) or
    (h.status = 'waiting_confirmation' and p_status = 'running');
  if not allowed then raise exception 'Illegal handoff status transition'; end if;
  update public.handoffs set status = p_status, updated_at = pg_catalog.now()
  where id = h.id returning * into h;
  return public.public_handoff_json(h);
end;
$$;

create or replace function public.create_recipient_confirmation(
  p_public_token text,
  p_recipient_token text
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  h public.handoffs;
  opaque_token text;
  confirmation public.handoff_confirmations;
begin
  if p_public_token !~ '^[A-Za-z0-9_-]{24}$'
    or p_recipient_token !~ '^rcp_[A-Za-z0-9_-]{43}$' then
    raise exception 'Recipient confirmation unavailable';
  end if;
  select * into h from public.handoffs where public_token = p_public_token for update;
  if h.id is null or h.expires_at <= pg_catalog.now()
    or h.status not in ('opened','running','needs_input','waiting_confirmation')
    or h.recipient_token_hash is null
    or h.recipient_token_hash <> public.owner_hash(p_recipient_token) then
    raise exception 'Recipient confirmation unavailable';
  end if;
  opaque_token := pg_catalog.rtrim(
    pg_catalog.translate(
      pg_catalog.encode(extensions.gen_random_bytes(32), 'base64'),
      '+/',
      '-_'
    ),
    '='
  );
  insert into public.handoff_confirmations(
    handoff_id,
    recipient_token_hash,
    confirmation_token_hash,
    expires_at
  ) values (
    h.id,
    public.owner_hash(p_recipient_token),
    public.owner_hash(opaque_token),
    pg_catalog.now() + interval '120 seconds'
  ) returning * into confirmation;
  return jsonb_build_object(
    'token', opaque_token,
    'createdAt', extract(epoch from confirmation.created_at) * 1000,
    'expiresAt', extract(epoch from confirmation.expires_at) * 1000
  );
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

revoke all on function public.mark_handoff_opened(text, text)
  from public, anon, authenticated;
revoke all on function public.create_recipient_confirmation(text, text)
  from public, anon, authenticated;
revoke all on function public.complete_recipient_handoff(text, text, text)
  from public, anon, authenticated;
revoke all on function public.transition_public_handoff(text, public.handoff_status)
  from public, anon, authenticated;

grant execute on function public.mark_handoff_opened(text, text) to anon;
grant execute on function public.create_recipient_confirmation(text, text) to anon;
grant execute on function public.complete_recipient_handoff(text, text, text) to anon;
grant execute on function public.transition_public_handoff(text, public.handoff_status) to anon;
