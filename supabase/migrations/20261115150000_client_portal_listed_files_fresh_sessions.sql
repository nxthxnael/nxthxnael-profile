-- Two gaps closed at the database, the real auth boundary:
-- 1. A member could read any object under their project's folder, including
--    drafts never listed in project_resources. Now only listed files are readable.
-- 2. A refreshed token kept access alive past the 12-hour session limit the app
--    enforces. Now reads also require the session itself to be under 12 hours old.

-- True while the current session's sign-in (its earliest amr timestamp) is
-- under 12 hours old. Refreshing the token keeps amr, so it cannot extend this.
create function public.client_session_is_fresh()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (
      select min((entry ->> 'timestamp')::bigint)
      from jsonb_array_elements(
        case when jsonb_typeof(auth.jwt() -> 'amr') = 'array'
          then auth.jwt() -> 'amr' else '[]'::jsonb end
      ) as entry
      where jsonb_typeof(entry) = 'object'
    ) > extract(epoch from now()) - 43200,
    false
  );
$$;

drop policy "members read their project resources" on public.project_resources;
create policy "members read their project resources" on public.project_resources
  for select to authenticated
  using (
    public.client_session_is_fresh()
    and exists (
      select 1 from public.project_members m
      where m.project_slug = project_resources.project_slug
        and m.email = lower(auth.jwt() ->> 'email')
    )
  );

drop policy "members read their project files" on storage.objects;
create policy "members read their listed project files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'client-files'
    and public.client_session_is_fresh()
    and exists (
      select 1
      from public.project_resources r
      join public.project_members m on m.project_slug = r.project_slug
      where r.kind = 'file'
        and r.storage_path = storage.objects.name
        and m.email = lower(auth.jwt() ->> 'email')
    )
  );
