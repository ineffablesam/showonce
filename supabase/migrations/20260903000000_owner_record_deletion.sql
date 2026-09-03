-- Lets an owner delete their own procedures and handoffs so the workspace
-- stays easy to clean up. Deleting a procedure also deletes any handoffs
-- created from it (handoffs.procedure_id is "on delete restrict", so those
-- rows are removed explicitly first); deleting a handoff cascades to its
-- helper requests, decisions, activity, and confirmations via existing
-- foreign keys.

create function public.delete_owner_handoff(p_owner_token text, p_external_id text)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare deleted_count int;
begin
  if p_owner_token !~ '^own_[A-Za-z0-9_-]{32}$' then
    raise exception 'Invalid owner token';
  end if;
  delete from public.handoffs
  where owner_token_hash = public.owner_hash(p_owner_token)
    and external_id = p_external_id;
  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

create function public.delete_owner_procedure(p_owner_token text, p_external_id text)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare deleted_count int; owner_hash bytea;
begin
  if p_owner_token !~ '^own_[A-Za-z0-9_-]{32}$' then
    raise exception 'Invalid owner token';
  end if;
  owner_hash := public.owner_hash(p_owner_token);
  delete from public.handoffs h
  using public.procedures p
  where h.procedure_id = p.id
    and p.owner_token_hash = owner_hash
    and p.external_id = p_external_id;
  delete from public.procedures
  where owner_token_hash = owner_hash
    and external_id = p_external_id;
  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

grant execute on function public.delete_owner_handoff(text, text) to anon;
grant execute on function public.delete_owner_procedure(text, text) to anon;
