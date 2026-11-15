-- 1. Functions are executable by PUBLIC by default, and an earlier copy of the
--    first migration never revoked that, so revoke it here for any database that
--    ran that copy: only the site's server may test project membership.
-- 2. Membership rows follow the same rule as resources and files: only a fresh,
--    still-signed-in session can read them.
-- 3. Restrictive policies (ANDed with every permissive one) keep client-files
--    limited to listed files, even if a broader read policy on storage.objects
--    is added later, for example from the dashboard.

revoke execute on function public.can_access_project(text, text) from public, anon, authenticated;
grant execute on function public.can_access_project(text, text) to service_role;

drop policy "members read own rows" on public.project_members;
create policy "members read own rows" on public.project_members
  for select to authenticated
  using (
    email = lower(auth.jwt() ->> 'email')
    and public.client_session_is_fresh()
  );

create policy "client files only for listed members" on storage.objects
  as restrictive
  for select to authenticated
  using (
    bucket_id <> 'client-files'
    or (
      public.client_session_is_fresh()
      and exists (
        select 1
        from public.project_resources r
        join public.project_members m on m.project_slug = r.project_slug
        where r.kind = 'file'
          and r.storage_path = storage.objects.name
          and (storage.foldername(storage.objects.name))[1] = r.project_slug
          and m.email = lower(auth.jwt() ->> 'email')
      )
    )
  );

create policy "client files never anonymous" on storage.objects
  as restrictive
  for select to anon
  using (bucket_id <> 'client-files');
