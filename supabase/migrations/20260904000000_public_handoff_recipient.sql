-- The recipient name is a free-text story detail the sender types in when
-- creating a handoff (e.g. "Mom", "Alex"), not a fixed product value. It was
-- already stored on handoffs.payload but never surfaced to the public/
-- recipient-facing view, so the recipient page had to hardcode a name. Add
-- it to the public JSON projection so the UI can render it dynamically.

create or replace function public.public_handoff_json(h public.handoffs)
returns jsonb language sql stable set search_path = ''
as $$
  -- jsonb_strip_nulls drops the "recipient" key entirely when it was never
  -- set (older handoffs), so the client sees it as absent rather than a
  -- JSON null it would otherwise have to special-case.
  select jsonb_strip_nulls(jsonb_build_object(
    'publicToken', h.public_token, 'title', h.title, 'status', h.status,
    'expiresAt', extract(epoch from h.expires_at) * 1000,
    'createdAt', extract(epoch from h.created_at) * 1000,
    'policy', h.payload->'policy',
    'recipient', h.payload->'recipient',
    'procedure', jsonb_build_object(
      'title', p.title,
      'steps', coalesce((
        select jsonb_agg(step - 'id')
        from jsonb_array_elements(p.payload->'steps') as steps(step)
      ), '[]'::jsonb)
    )
  ))
  from public.procedures p where p.id = h.procedure_id;
$$;
