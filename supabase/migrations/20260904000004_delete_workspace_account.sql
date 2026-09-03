-- Remove all persisted data for a workspace owner and release their username.

create function public.delete_workspace_account(p_owner_token text)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  owner_hash bytea;
begin
  if p_owner_token !~ '^own_[A-Za-z0-9_-]{32}$' then
    raise exception 'Invalid workspace session';
  end if;
  owner_hash := public.owner_hash(p_owner_token);

  delete from public.handoffs where owner_token_hash = owner_hash;
  delete from public.shared_activity_events where owner_token_hash = owner_hash;
  delete from public.procedures where owner_token_hash = owner_hash;

  if to_regclass('public.workspace_usernames') is not null then
    delete from public.workspace_usernames where owner_token_hash = owner_hash;
  end if;
end;
$$;

grant execute on function public.delete_workspace_account(text) to anon;
