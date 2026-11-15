-- 1. Restores the folder check the listed-files policy dropped: a listed file must
--    also sit in its own project's folder, so a mistyped storage_path pointing at
--    another project's folder cannot expose that project's file.
-- 2. Reads amr timestamps only when they are JSON numbers, as numeric, so an
--    unexpected value counts as "not fresh" instead of making every read error.

create or replace function public.client_session_is_fresh()
returns boolean
language sql
stable
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
  );
$$;

drop policy "members read their listed project files" on storage.objects;
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
        and (storage.foldername(storage.objects.name))[1] = r.project_slug
        and m.email = lower(auth.jwt() ->> 'email')
    )
  );
