-- Sign-out deletes the session row from auth.sessions, but its access token stays
-- valid until it expires (up to an hour). Requiring the token's session to still
-- exist makes the database refuse a signed-out token straight away. Both client
-- portal policies call this function, so they pick the check up unchanged.
-- security definer: the authenticated role cannot read auth.sessions itself; the
-- function only looks up the caller's own session.

create or replace function public.client_session_is_fresh()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select min((entry ->> 'timestamp')::numeric)
      from jsonb_array_elements(
        case when jsonb_typeof(auth.jwt() -> 'amr') = 'array'
          then auth.jwt() -> 'amr' else '[]'::jsonb end
      ) as entry
      where jsonb_typeof(entry) = 'object'
        and jsonb_typeof(entry -> 'timestamp') = 'number'
    ) > extract(epoch from now()) - 43200, -- 12 hours; matches SESSION_MAX_AGE_MS in src/lib/session.ts
    false
  )
  and exists (
    select 1
    from auth.sessions s
    -- case, not and: guarantees a malformed id is never cast (and never errors)
    where s.id = case when auth.jwt() ->> 'session_id' ~ '^[0-9a-fA-F-]{36}$'
                   then (auth.jwt() ->> 'session_id')::uuid end
      and (s.not_after is null or s.not_after > now())
  );
$$;

revoke execute on function public.client_session_is_fresh() from public, anon;
grant execute on function public.client_session_is_fresh() to authenticated;
