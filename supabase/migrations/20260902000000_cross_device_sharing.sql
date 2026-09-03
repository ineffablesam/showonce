create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.handoff_status as enum (
  'created', 'opened', 'running', 'needs_input',
  'waiting_confirmation', 'completed', 'expired'
);

create function public.owner_hash(p_token text) returns bytea
language sql immutable strict
set search_path = ''
return extensions.digest(p_token, 'sha256');

create function public.payload_is_safe(p_payload jsonb) returns boolean
language sql immutable strict
set search_path = ''
return
  pg_catalog.octet_length(p_payload::text) <= 65536
  and p_payload::text !~* '"(password|authorization|credential|session|payment|card|cookie|secret|authToken)"[[:space:]]*:';

create table public.procedures (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  recording_id text not null,
  owner_token_hash bytea not null,
  title text not null check (char_length(title) between 1 and 120),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_token_hash, external_id),
  unique (owner_token_hash, recording_id)
);

create table public.handoffs (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  procedure_id uuid not null references public.procedures(id) on delete restrict,
  owner_token_hash bytea not null,
  recipient_token_hash bytea,
  public_token text not null unique check (public_token ~ '^[A-Za-z0-9_-]{24}$'),
  status public.handoff_status not null default 'created',
  title text not null check (char_length(title) between 1 and 120),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_token_hash, external_id)
);

create index handoffs_public_token_idx on public.handoffs (public_token);
create index handoffs_owner_idx on public.handoffs (owner_token_hash);
create index handoffs_expires_at_idx on public.handoffs (expires_at);

create table public.helper_requests (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  handoff_id uuid not null references public.handoffs(id) on delete cascade,
  owner_token_hash bytea not null,
  public_token text not null unique check (public_token ~ '^[A-Za-z0-9_-]{24}$'),
  status text not null default 'open' check (status in ('open', 'resolved')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_token_hash, external_id)
);

create index helper_requests_public_token_idx on public.helper_requests (public_token);
create index helper_requests_owner_idx on public.helper_requests (owner_token_hash);
create index helper_requests_expires_at_idx on public.helper_requests (expires_at);

create table public.helper_decisions (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  helper_request_id uuid not null unique references public.helper_requests(id) on delete cascade,
  owner_token_hash bytea not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_token_hash, external_id)
);

create table public.shared_activity_events (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  owner_token_hash bytea not null,
  handoff_id uuid references public.handoffs(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_token_hash, external_id)
);

create table public.handoff_confirmations (
  id uuid primary key default gen_random_uuid(),
  handoff_id uuid not null references public.handoffs(id) on delete cascade,
  recipient_token_hash bytea not null,
  confirmation_token_hash bytea not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  check (expires_at <= created_at + interval '120 seconds')
);

create index handoff_confirmations_lookup_idx
  on public.handoff_confirmations (
    handoff_id, recipient_token_hash, confirmation_token_hash
  );
create index handoff_confirmations_expires_idx
  on public.handoff_confirmations (expires_at);

alter table public.procedures enable row level security;
alter table public.handoffs enable row level security;
alter table public.helper_requests enable row level security;
alter table public.helper_decisions enable row level security;
alter table public.shared_activity_events enable row level security;
alter table public.handoff_confirmations enable row level security;

revoke all on table public.procedures from anon, authenticated;
revoke all on table public.handoffs from anon, authenticated;
revoke all on table public.helper_requests from anon, authenticated;
revoke all on table public.helper_decisions from anon, authenticated;
revoke all on table public.shared_activity_events from anon, authenticated;
revoke all on table public.handoff_confirmations from public, anon, authenticated;

create function public.assert_owner_quota(p_owner_hash bytea, p_resource text)
returns void language plpgsql set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(pg_catalog.encode(p_owner_hash, 'hex'), 0)
  );
  if p_resource = 'procedure' and (
    select count(*) from public.procedures where owner_token_hash = p_owner_hash
  ) >= 50 then raise exception 'Procedure quota exceeded'; end if;
  if p_resource = 'handoff' and (
    select count(*) from public.handoffs where owner_token_hash = p_owner_hash
  ) >= 100 then raise exception 'Handoff quota exceeded'; end if;
  if p_resource = 'helper_request' and (
    select count(*) from public.helper_requests where owner_token_hash = p_owner_hash
  ) >= 200 then raise exception 'Helper request quota exceeded'; end if;
  if p_resource = 'activity' and (
    select count(*) from public.shared_activity_events where owner_token_hash = p_owner_hash
  ) >= 2000 then raise exception 'Activity quota exceeded'; end if;
end;
$$;

create function public.create_procedure(p_owner_token text, p_payload jsonb)
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

create function public.list_owner_procedures(p_owner_token text)
returns setof jsonb language sql stable security definer set search_path = ''
as $$
  select p.payload || jsonb_build_object(
    'id', p.external_id, 'recordingId', p.recording_id, 'title', p.title,
    'createdAt', extract(epoch from p.created_at) * 1000
  )
  from public.procedures p
  where p_owner_token ~ '^own_[A-Za-z0-9_-]{32}$'
    and p.owner_token_hash = public.owner_hash(p_owner_token)
  order by p.created_at desc;
$$;

create function public.get_owner_procedure(
  p_owner_token text, p_external_id text, p_recording_id text
) returns jsonb language sql stable security definer set search_path = ''
as $$
  select p.payload || jsonb_build_object(
    'id', p.external_id, 'recordingId', p.recording_id, 'title', p.title,
    'createdAt', extract(epoch from p.created_at) * 1000
  )
  from public.procedures p
  where p_owner_token ~ '^own_[A-Za-z0-9_-]{32}$'
    and p.owner_token_hash = public.owner_hash(p_owner_token)
    and ((p_external_id is not null and p.external_id = p_external_id)
      or (p_recording_id is not null and p.recording_id = p_recording_id))
  limit 1;
$$;

create function public.create_handoff(p_owner_token text, p_payload jsonb)
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

create function public.owner_handoff_json(h public.handoffs)
returns jsonb language sql stable set search_path = ''
as $$
  select h.payload - array['status','publicToken','expiresAt','createdAt','updatedAt','id','procedureId']
  || jsonb_build_object(
    'id', h.external_id, 'publicToken', h.public_token,
    'procedureId', p.external_id, 'title', h.title, 'status', h.status,
    'expiresAt', extract(epoch from h.expires_at) * 1000,
    'createdAt', extract(epoch from h.created_at) * 1000,
    'updatedAt', extract(epoch from h.updated_at) * 1000,
    'procedure', p.payload || jsonb_build_object(
      'id', p.external_id, 'recordingId', p.recording_id, 'title', p.title,
      'createdAt', extract(epoch from p.created_at) * 1000
    )
  )
  from public.procedures p where p.id = h.procedure_id;
$$;

create function public.public_handoff_json(h public.handoffs)
returns jsonb language sql stable set search_path = ''
as $$
  select jsonb_build_object(
    'publicToken', h.public_token, 'title', h.title, 'status', h.status,
    'expiresAt', extract(epoch from h.expires_at) * 1000,
    'createdAt', extract(epoch from h.created_at) * 1000,
    'policy', h.payload->'policy',
    'procedure', jsonb_build_object(
      'title', p.title,
      'steps', coalesce((
        select jsonb_agg(step - 'id')
        from jsonb_array_elements(p.payload->'steps') as steps(step)
      ), '[]'::jsonb)
    )
  )
  from public.procedures p where p.id = h.procedure_id;
$$;

create function public.list_owner_handoffs(p_owner_token text)
returns setof jsonb language plpgsql security definer set search_path = ''
as $$
begin
  update public.handoffs set status = 'expired', updated_at = pg_catalog.now()
  where owner_token_hash = public.owner_hash(p_owner_token)
    and expires_at <= pg_catalog.now() and status not in ('completed','expired');
  return query select public.owner_handoff_json(h) from public.handoffs h
  where p_owner_token ~ '^own_[A-Za-z0-9_-]{32}$'
    and h.owner_token_hash = public.owner_hash(p_owner_token)
  order by h.created_at desc;
end;
$$;

create function public.get_owner_handoff(p_owner_token text, p_external_id text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare result jsonb;
begin
  update public.handoffs set status = 'expired', updated_at = pg_catalog.now()
  where owner_token_hash = public.owner_hash(p_owner_token)
    and external_id = p_external_id and expires_at <= pg_catalog.now()
    and status not in ('completed','expired');
  select public.owner_handoff_json(h) into result from public.handoffs h
  where p_owner_token ~ '^own_[A-Za-z0-9_-]{32}$'
    and h.owner_token_hash = public.owner_hash(p_owner_token)
    and h.external_id = p_external_id limit 1;
  return result;
end;
$$;

create function public.get_public_handoff(p_public_token text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare h public.handoffs;
begin
  select * into h from public.handoffs where public_token = p_public_token for update;
  if h.id is null or p_public_token !~ '^[A-Za-z0-9_-]{24}$' then return null; end if;
  if h.expires_at <= pg_catalog.now() then
    if h.status not in ('completed','expired') then
      update public.handoffs set status = 'expired', updated_at = pg_catalog.now()
      where id = h.id;
    end if;
    return null;
  end if;
  return public.public_handoff_json(h);
end;
$$;

create function public.mark_handoff_opened(
  p_public_token text,
  p_recipient_token text
)
returns jsonb language plpgsql security definer set search_path = ''
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
  if h.status in ('expired','completed') then raise exception 'Handoff unavailable'; end if;
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

create function public.transition_public_handoff(
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

create function public.create_recipient_confirmation(
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
    handoff_id, recipient_token_hash, confirmation_token_hash, expires_at
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

create function public.complete_recipient_handoff(
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

create function public.create_helper_request(p_handoff_token text, p_payload jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
declare h public.handoffs;
begin
  select * into h from public.handoffs where public_token = p_handoff_token for update;
  if h.id is null or p_handoff_token !~ '^[A-Za-z0-9_-]{24}$'
    or h.expires_at <= pg_catalog.now() or h.status in ('expired','completed') then
    raise exception 'Handoff unavailable';
  end if;
  if coalesce((h.payload->'policy'->>'allowHelperEscalation')::boolean, false) = false then
    raise exception 'Helper escalation is disabled by handoff policy';
  end if;
  if not public.payload_is_safe(p_payload)
    or not (p_payload ?& array['id','publicToken','createdAt','expiresAt','status','detail','options'])
    or p_payload - array[
      'id','publicToken','handoffId','createdAt','updatedAt','expiresAt','status','detail','options'
    ] <> '{}'::jsonb
    or p_payload->>'publicToken' !~ '^[A-Za-z0-9_-]{24}$'
    or p_payload->>'status' <> 'open' or p_payload->>'detail' <> 'plan_unavailable'
    or jsonb_typeof(p_payload->'options') <> 'array'
    or jsonb_array_length(p_payload->'options') not between 1 and 3
    or to_timestamp((p_payload->>'expiresAt')::double precision / 1000)
      <= pg_catalog.now() then
    raise exception 'Invalid helper request';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(p_payload->'options') as options(option)
    where option not in ('silver','platinum','let_recipient_decide')
  ) then
    raise exception 'Invalid helper request option';
  end if;
  if not exists (
    select 1 from public.helper_requests
    where owner_token_hash = h.owner_token_hash
      and external_id = p_payload->>'id'
  ) then
    perform public.assert_owner_quota(h.owner_token_hash, 'helper_request');
  end if;
  insert into public.helper_requests(
    external_id, handoff_id, owner_token_hash, public_token, status,
    payload, expires_at, created_at
  ) values (
    p_payload->>'id', h.id, h.owner_token_hash, p_payload->>'publicToken', 'open',
    jsonb_build_object('detail', p_payload->>'detail', 'options', p_payload->'options'),
    least(
      h.expires_at,
      to_timestamp((p_payload->>'expiresAt')::double precision / 1000),
      pg_catalog.now() + interval '7 days'
    ),
    pg_catalog.now()
  ) on conflict (owner_token_hash, external_id) do nothing;
end;
$$;

create function public.save_owner_helper_request(p_owner_token text, p_payload jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
declare h public.handoffs;
begin
  if p_owner_token !~ '^own_[A-Za-z0-9_-]{32}$'
    or not public.payload_is_safe(p_payload)
    or not (p_payload ?& array[
      'id','publicToken','handoffId','createdAt','expiresAt','status','detail','options'
    ])
    or p_payload - array[
      'id','publicToken','handoffId','createdAt','updatedAt','expiresAt','status','detail','options'
    ] <> '{}'::jsonb
    or p_payload->>'publicToken' !~ '^[A-Za-z0-9_-]{24}$'
    or p_payload->>'detail' <> 'plan_unavailable'
    or jsonb_typeof(p_payload->'options') <> 'array'
    or jsonb_array_length(p_payload->'options') not between 1 and 3
    or p_payload->>'status' not in ('open','resolved') then
    raise exception 'Invalid owner helper request';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(p_payload->'options') as options(option)
    where option not in ('silver','platinum','let_recipient_decide')
  ) then
    raise exception 'Invalid helper request option';
  end if;
  select * into h from public.handoffs
  where owner_token_hash = public.owner_hash(p_owner_token)
    and external_id = p_payload->>'handoffId';
  if h.id is null then raise exception 'Handoff unavailable'; end if;
  if exists (
    select 1 from public.helper_requests r
    where r.owner_token_hash = public.owner_hash(p_owner_token)
      and r.external_id = p_payload->>'id'
  ) then
    update public.helper_requests
    set status = (p_payload->>'status'), updated_at = pg_catalog.now()
    where owner_token_hash = public.owner_hash(p_owner_token)
      and external_id = p_payload->>'id';
  elsif p_payload->>'status' = 'open' then
    perform public.create_helper_request(h.public_token, p_payload);
  else
    raise exception 'Helper request unavailable';
  end if;
end;
$$;

create function public.helper_request_json(r public.helper_requests)
returns jsonb language sql stable set search_path = ''
as $$
  select r.payload - array['status','publicToken','expiresAt','createdAt','updatedAt','id','handoffId']
  || jsonb_build_object(
    'id', r.external_id, 'handoffId', h.external_id, 'publicToken', r.public_token,
    'status', r.status, 'expiresAt', extract(epoch from r.expires_at) * 1000,
    'createdAt', extract(epoch from r.created_at) * 1000,
    'updatedAt', extract(epoch from r.updated_at) * 1000
  )
  from public.handoffs h where h.id = r.handoff_id;
$$;

create function public.list_owner_helper_requests(p_owner_token text)
returns setof jsonb language sql stable security definer set search_path = ''
as $$
  select public.helper_request_json(r) from public.helper_requests r
  where p_owner_token ~ '^own_[A-Za-z0-9_-]{32}$'
    and r.owner_token_hash = public.owner_hash(p_owner_token)
  order by r.created_at desc;
$$;

create function public.get_owner_helper_request(p_owner_token text, p_external_id text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select public.helper_request_json(r) from public.helper_requests r
  where p_owner_token ~ '^own_[A-Za-z0-9_-]{32}$'
    and r.owner_token_hash = public.owner_hash(p_owner_token)
    and r.external_id = p_external_id limit 1;
$$;

create function public.get_public_helper_request(p_public_token text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select r.payload - array['status','publicToken','expiresAt','createdAt','updatedAt','id','handoffId']
    || jsonb_build_object(
      'publicToken', r.public_token, 'status', r.status,
      'expiresAt', extract(epoch from r.expires_at) * 1000
    )
  from public.helper_requests r join public.handoffs h on h.id = r.handoff_id
  where p_public_token ~ '^[A-Za-z0-9_-]{24}$'
    and r.public_token = p_public_token
    and r.expires_at > pg_catalog.now() and h.expires_at > pg_catalog.now()
    and h.status not in ('completed','expired') limit 1;
$$;

create function public.record_helper_decision(p_request_token text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare r public.helper_requests; h public.handoffs; d public.helper_decisions;
begin
  select * into r from public.helper_requests where public_token = p_request_token for update;
  if r.id is null or p_request_token !~ '^[A-Za-z0-9_-]{24}$' then
    raise exception 'Request unavailable';
  end if;
  select * into h from public.handoffs where id = r.handoff_id;
  if r.status <> 'open' or r.expires_at <= pg_catalog.now()
    or h.expires_at <= pg_catalog.now() or h.status in ('completed','expired') then
    raise exception 'Request unavailable';
  end if;
  if not public.payload_is_safe(p_payload)
    or not (p_payload ?& array['id','outcome','decidedAt'])
    or p_payload - array['id','requestId','outcome','decidedAt','recommendedPlanId'] <> '{}'::jsonb
    or p_payload->>'outcome' not in ('recommend_plan','let_recipient_decide')
    or (p_payload->>'outcome' = 'recommend_plan'
      and p_payload->>'recommendedPlanId' not in ('silver','platinum'))
    or (p_payload->>'outcome' = 'let_recipient_decide'
      and p_payload ? 'recommendedPlanId') then
    raise exception 'Invalid helper decision';
  end if;
  insert into public.helper_decisions(
    external_id, helper_request_id, owner_token_hash, payload
  ) values (
    p_payload->>'id', r.id, r.owner_token_hash,
    p_payload - array['id','requestId','decidedAt']
  ) returning * into d;
  update public.helper_requests set status = 'resolved', updated_at = pg_catalog.now()
  where id = r.id;
  return d.payload || jsonb_build_object(
    'id', d.external_id, 'requestId', r.external_id,
    'decidedAt', extract(epoch from d.created_at) * 1000
  );
end;
$$;

create function public.poll_helper_decision(p_request_token text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select d.payload || jsonb_build_object(
    'id', d.external_id, 'requestId', r.external_id,
    'decidedAt', extract(epoch from d.created_at) * 1000
  )
  from public.helper_requests r
  join public.handoffs h on h.id = r.handoff_id
  join public.helper_decisions d on d.helper_request_id = r.id
  where p_request_token ~ '^[A-Za-z0-9_-]{24}$'
    and r.public_token = p_request_token
    and r.expires_at > pg_catalog.now() and h.expires_at > pg_catalog.now()
    and h.status not in ('completed','expired') limit 1;
$$;

create function public.save_owner_decision(p_owner_token text, p_payload jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_owner_token !~ '^own_[A-Za-z0-9_-]{32}$'
    or not public.payload_is_safe(p_payload)
    or not (p_payload ?& array['id','requestId','outcome','decidedAt'])
    or p_payload - array['id','requestId','outcome','decidedAt','recommendedPlanId'] <> '{}'::jsonb
    or p_payload->>'outcome' not in ('recommend_plan','let_recipient_decide')
    or (p_payload->>'outcome' = 'recommend_plan'
      and p_payload->>'recommendedPlanId' not in ('silver','platinum'))
    or (p_payload->>'outcome' = 'let_recipient_decide'
      and p_payload ? 'recommendedPlanId') then
    raise exception 'Invalid decision';
  end if;
  insert into public.helper_decisions(external_id, helper_request_id, owner_token_hash, payload)
  select p_payload->>'id', r.id, r.owner_token_hash,
    p_payload - array['id','requestId','decidedAt']
  from public.helper_requests r
  where r.owner_token_hash = public.owner_hash(p_owner_token)
    and r.external_id = p_payload->>'requestId'
  on conflict (owner_token_hash, external_id) do update
  set payload = excluded.payload, updated_at = pg_catalog.now();
end;
$$;

create function public.list_owner_decisions(p_owner_token text)
returns setof jsonb language sql stable security definer set search_path = ''
as $$
  select d.payload || jsonb_build_object(
    'id', d.external_id, 'requestId', r.external_id,
    'decidedAt', extract(epoch from d.created_at) * 1000
  )
  from public.helper_decisions d join public.helper_requests r on r.id = d.helper_request_id
  where p_owner_token ~ '^own_[A-Za-z0-9_-]{32}$'
    and d.owner_token_hash = public.owner_hash(p_owner_token)
  order by d.created_at desc;
$$;

create function public.get_owner_decision(p_owner_token text, p_external_id text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select d.payload || jsonb_build_object(
    'id', d.external_id, 'requestId', r.external_id,
    'decidedAt', extract(epoch from d.created_at) * 1000
  )
  from public.helper_decisions d join public.helper_requests r on r.id = d.helper_request_id
  where p_owner_token ~ '^own_[A-Za-z0-9_-]{32}$'
    and d.owner_token_hash = public.owner_hash(p_owner_token)
    and d.external_id = p_external_id limit 1;
$$;

create function public.append_owner_activity(p_owner_token text, p_payload jsonb)
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
      'submit_renewal','record_decision'
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
        'benefits_preview_renewal','showonce_request_helper',
        'showonce_get_helper_decision','benefits_submit_renewal'
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

create function public.append_public_activity(p_handoff_token text, p_payload jsonb)
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
      'submit_renewal','record_decision'
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
        'benefits_preview_renewal','showonce_request_helper',
        'showonce_get_helper_decision','benefits_submit_renewal'
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
  ) on conflict (owner_token_hash, external_id) do nothing;
end;
$$;

create function public.list_owner_activity(p_owner_token text)
returns setof jsonb language sql stable security definer set search_path = ''
as $$
  select a.payload || jsonb_build_object(
    'id', a.external_id, 'timestamp', extract(epoch from a.created_at) * 1000
  )
  from public.shared_activity_events a
  where p_owner_token ~ '^own_[A-Za-z0-9_-]{32}$'
    and a.owner_token_hash = public.owner_hash(p_owner_token)
  order by a.created_at desc;
$$;

create function public.get_owner_activity(p_owner_token text, p_external_id text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select a.payload || jsonb_build_object(
    'id', a.external_id, 'timestamp', extract(epoch from a.created_at) * 1000
  )
  from public.shared_activity_events a
  where p_owner_token ~ '^own_[A-Za-z0-9_-]{32}$'
    and a.owner_token_hash = public.owner_hash(p_owner_token)
    and a.external_id = p_external_id limit 1;
$$;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant execute on function public.create_procedure(text, jsonb) to anon;
grant execute on function public.list_owner_procedures(text) to anon;
grant execute on function public.get_owner_procedure(text, text, text) to anon;
grant execute on function public.create_handoff(text, jsonb) to anon;
grant execute on function public.list_owner_handoffs(text) to anon;
grant execute on function public.get_owner_handoff(text, text) to anon;
grant execute on function public.get_public_handoff(text) to anon;
grant execute on function public.mark_handoff_opened(text, text) to anon;
grant execute on function public.transition_public_handoff(text, public.handoff_status) to anon;
grant execute on function public.create_recipient_confirmation(text, text) to anon;
grant execute on function public.complete_recipient_handoff(text, text, text) to anon;
grant execute on function public.create_helper_request(text, jsonb) to anon;
grant execute on function public.save_owner_helper_request(text, jsonb) to anon;
grant execute on function public.list_owner_helper_requests(text) to anon;
grant execute on function public.get_owner_helper_request(text, text) to anon;
grant execute on function public.get_public_helper_request(text) to anon;
grant execute on function public.record_helper_decision(text, jsonb) to anon;
grant execute on function public.poll_helper_decision(text) to anon;
grant execute on function public.save_owner_decision(text, jsonb) to anon;
grant execute on function public.list_owner_decisions(text) to anon;
grant execute on function public.get_owner_decision(text, text) to anon;
grant execute on function public.append_owner_activity(text, jsonb) to anon;
grant execute on function public.append_public_activity(text, jsonb) to anon;
grant execute on function public.list_owner_activity(text) to anon;
grant execute on function public.get_owner_activity(text, text) to anon;
