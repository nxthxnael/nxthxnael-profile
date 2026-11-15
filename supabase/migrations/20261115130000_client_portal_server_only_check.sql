-- With the publishable key, anyone could call can_access_project directly and
-- test whether an email is a client of a project. Only the site's server, using
-- the secret key, needs it.

revoke execute on function public.can_access_project(text, text) from anon, authenticated;
grant execute on function public.can_access_project(text, text) to service_role;
