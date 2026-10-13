-- =============================================================================
-- 1M Scholars admin panel: database permissions
-- Run this ONCE in Supabase -> SQL Editor -> New query -> Run.
-- It is safe to run again. It only ADDS permissions for people whose
-- profiles.role is 'admin'; it does not change what visitors or students can do.
-- =============================================================================

-- 1. Helper: "is the signed-in user an admin?" (SECURITY DEFINER so policies on
--    the profiles table can use it without recursing into themselves).
create or replace function public.app_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.app_is_admin() from public;
grant execute on function public.app_is_admin() to authenticated;

-- 2. Admins can read, add, change and delete rows in these tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'opportunities',
    'opportunity_programs',
    'opportunity_requirements',
    'opportunity_benefits',
    'application_forms',
    'application_fields',
    'applications',
    'application_answers',
    'contact_messages',
    'admin_emails'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', 'Admin panel: manage ' || t, t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.app_is_admin()) with check (public.app_is_admin())',
      'Admin panel: manage ' || t, t
    );
  end loop;
end $$;

-- 3. Profiles: admins can see everyone and edit anyone (role, phone, etc.).
--    Creating/deleting accounts is done with the service-role key on the server.
alter table public.profiles enable row level security;

drop policy if exists "Admin panel: read profiles" on public.profiles;
create policy "Admin panel: read profiles"
  on public.profiles for select to authenticated
  using (public.app_is_admin());

drop policy if exists "Admin panel: update profiles" on public.profiles;
create policy "Admin panel: update profiles"
  on public.profiles for update to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- 4. OPTIONAL (only if applicants upload files to a Storage bucket):
--    let admins download those files. Replace 'application-files' with your bucket name.
-- drop policy if exists "Admin panel: read application files" on storage.objects;
-- create policy "Admin panel: read application files"
--   on storage.objects for select to authenticated
--   using (bucket_id = 'application-files' and public.app_is_admin());
