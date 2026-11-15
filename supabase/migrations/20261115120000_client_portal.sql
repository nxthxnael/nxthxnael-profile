-- Client portal: who may see which project, and what they see.
-- Rows are managed from the Supabase dashboard; the site only reads them.

create extension if not exists citext with schema extensions;

create table public.project_members (
  project_slug text not null,
  email extensions.citext not null,
  created_at timestamptz not null default now(),
  primary key (project_slug, email)
);

create table public.project_resources (
  id uuid primary key default gen_random_uuid(),
  project_slug text not null,
  label text not null,
  kind text not null check (kind in ('link', 'file')),
  url text,
  storage_path text,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  check ((kind = 'link' and url is not null) or (kind = 'file' and storage_path is not null))
);

create index project_resources_slug_idx on public.project_resources (project_slug, sort);

alter table public.project_members enable row level security;
alter table public.project_resources enable row level security;

-- A signed-in client sees only their own memberships...
create policy "members read own rows" on public.project_members
  for select to authenticated
  using (email = (auth.jwt() ->> 'email'));

-- ...and only the resources of projects they are a member of.
create policy "members read their project resources" on public.project_resources
  for select to authenticated
  using (exists (
    select 1 from public.project_members m
    where m.project_slug = project_resources.project_slug
      and m.email = (auth.jwt() ->> 'email')
  ));

-- Private files live under client-files/<project slug>/...
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do nothing;

create policy "members read their project files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'client-files'
    and exists (
      select 1 from public.project_members m
      where m.project_slug = (storage.foldername(name))[1]
        and m.email = (auth.jwt() ->> 'email')
    )
  );

-- Lets the sign-in form check an email before sending a link, without
-- exposing the member list: it answers only yes or no for one pair.
create function public.can_access_project(project text, address text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.project_members m
    where m.project_slug = project and m.email = address::extensions.citext
  );
$$;

revoke execute on function public.can_access_project(text, text) from public;
grant execute on function public.can_access_project(text, text) to anon, authenticated;
