-- citext lost its case-insensitivity whenever it was compared with plain text
-- (the JWT email, or the function argument under search_path = ''), so
-- "Client@Example.com" never matched "client@example.com". Store emails
-- lowercased instead and compare against lower(...).

drop policy "members read own rows" on public.project_members;
drop policy "members read their project resources" on public.project_resources;
drop policy "members read their project files" on storage.objects;

alter table public.project_members alter column email type text;
update public.project_members set email = lower(email);
alter table public.project_members
  add constraint project_members_email_lowercase check (email = lower(email));

create policy "members read own rows" on public.project_members
  for select to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

create policy "members read their project resources" on public.project_resources
  for select to authenticated
  using (exists (
    select 1 from public.project_members m
    where m.project_slug = project_resources.project_slug
      and m.email = lower(auth.jwt() ->> 'email')
  ));

create policy "members read their project files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'client-files'
    and exists (
      select 1 from public.project_members m
      where m.project_slug = (storage.foldername(name))[1]
        and m.email = lower(auth.jwt() ->> 'email')
    )
  );

create or replace function public.can_access_project(project text, address text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.project_members m
    where m.project_slug = project and m.email = lower(address)
  );
$$;

drop extension if exists citext;
