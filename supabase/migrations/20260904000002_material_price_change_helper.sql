-- Allow regional-pricing helper requests (material_price_change + gold option).

create or replace function public.create_helper_request(p_handoff_token text, p_payload jsonb)
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
    or p_payload->>'status' <> 'open'
    or p_payload->>'detail' not in ('plan_unavailable', 'material_price_change')
    or jsonb_typeof(p_payload->'options') <> 'array'
    or jsonb_array_length(p_payload->'options') not between 1 and 3
    or to_timestamp((p_payload->>'expiresAt')::double precision / 1000)
      <= pg_catalog.now() then
    raise exception 'Invalid helper request';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(p_payload->'options') as options(option)
    where case p_payload->>'detail'
      when 'plan_unavailable' then option not in ('silver','platinum','let_recipient_decide')
      when 'material_price_change' then option not in ('gold','silver','let_recipient_decide')
      else true
    end
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

create or replace function public.save_owner_helper_request(p_owner_token text, p_payload jsonb)
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
    or p_payload->>'detail' not in ('plan_unavailable', 'material_price_change')
    or jsonb_typeof(p_payload->'options') <> 'array'
    or jsonb_array_length(p_payload->'options') not between 1 and 3
    or p_payload->>'status' not in ('open','resolved') then
    raise exception 'Invalid owner helper request';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(p_payload->'options') as options(option)
    where case p_payload->>'detail'
      when 'plan_unavailable' then option not in ('silver','platinum','let_recipient_decide')
      when 'material_price_change' then option not in ('gold','silver','let_recipient_decide')
      else true
    end
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

create or replace function public.record_helper_decision(p_request_token text, p_payload jsonb)
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
      and p_payload->>'recommendedPlanId' not in ('silver','gold','platinum'))
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

create or replace function public.save_owner_decision(p_owner_token text, p_payload jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_owner_token !~ '^own_[A-Za-z0-9_-]{32}$'
    or not public.payload_is_safe(p_payload)
    or not (p_payload ?& array['id','requestId','outcome','decidedAt'])
    or p_payload - array['id','requestId','outcome','decidedAt','recommendedPlanId'] <> '{}'::jsonb
    or p_payload->>'outcome' not in ('recommend_plan','let_recipient_decide')
    or (p_payload->>'outcome' = 'recommend_plan'
      and p_payload->>'recommendedPlanId' not in ('silver','gold','platinum'))
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
