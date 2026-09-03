-- Map a unique workspace username to the derived owner capability hash.

create table if not exists public.workspace_usernames (
  username text primary key,
  owner_token_hash bytea not null unique,
  created_at timestamptz not null default pg_catalog.now(),
  constraint workspace_username_format check (username ~ '^[a-z0-9_-]{2,32}$')
);

alter table public.workspace_usernames enable row level security;

create function public.claim_workspace_username(p_owner_token text, p_username text)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  normalized text;
  token_hash bytea;
  existing_hash bytea;
begin
  if p_owner_token !~ '^own_[A-Za-z0-9_-]{32}$' then
    raise exception 'Invalid workspace session';
  end if;
  normalized := lower(trim(p_username));
  if normalized !~ '^[a-z0-9_-]{2,32}$' then
    raise exception 'Invalid username';
  end if;
  token_hash := public.owner_hash(p_owner_token);
  select owner_token_hash into existing_hash
  from public.workspace_usernames
  where username = normalized;
  if existing_hash is null then
    insert into public.workspace_usernames (username, owner_token_hash)
    values (normalized, token_hash);
  elsif existing_hash <> token_hash then
    raise exception 'Username already taken';
  end if;
end;
$$;

grant execute on function public.claim_workspace_username(text, text) to anon;
