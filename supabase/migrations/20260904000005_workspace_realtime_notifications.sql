-- Push in-app notification events over Supabase Realtime broadcast topics.

create or replace function public.broadcast_workspace_help_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  handoff_external_id text;
  recipient_name text;
begin
  if NEW.status <> 'open' then
    return NEW;
  end if;

  select h.external_id, coalesce(h.payload->>'recipient', '')
  into handoff_external_id, recipient_name
  from public.handoffs h
  where h.id = NEW.handoff_id;

  perform realtime.send(
    jsonb_build_object(
      'requestId', NEW.external_id,
      'handoffId', handoff_external_id,
      'detail', coalesce(NEW.payload->>'detail', 'plan_unavailable'),
      'helpToken', NEW.public_token,
      'recipient', recipient_name
    ),
    'help_request_opened',
    'workspace:' || encode(NEW.owner_token_hash, 'hex'),
    false
  );

  return NEW;
end;
$$;

create or replace function public.broadcast_help_decision_ready()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_token text;
begin
  select r.public_token into request_token
  from public.helper_requests r
  where r.id = NEW.helper_request_id;

  if request_token is null then
    return NEW;
  end if;

  perform realtime.send(
    jsonb_build_object(
      'decisionId', NEW.external_id,
      'requestId', (NEW.payload->>'requestId'),
      'outcome', NEW.payload->>'outcome',
      'recommendedPlanId', NEW.payload->>'recommendedPlanId'
    ),
    'decision_ready',
    'help:' || request_token,
    false
  );

  return NEW;
end;
$$;

drop trigger if exists workspace_help_request_broadcast on public.helper_requests;
create trigger workspace_help_request_broadcast
after insert on public.helper_requests
for each row
execute function public.broadcast_workspace_help_request();

drop trigger if exists help_decision_ready_broadcast on public.helper_decisions;
create trigger help_decision_ready_broadcast
after insert on public.helper_decisions
for each row
execute function public.broadcast_help_decision_ready();
