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


-- =============================================================================
-- LIMITED ADMINS  (role 'sub_admin')            -- run this part once as well
-- Full admin  = profiles.role 'admin'      -> can do everything.
-- Limited admin = profiles.role 'sub_admin' -> same as admin EXCEPT:
--   * cannot add/remove admins or change anyone's role
--   * cannot delete users
--   * can only delete opportunities (and their forms) that THEY created
-- The app enforces this too, but these policies make the database refuse it
-- even if someone calls the API directly.
-- =============================================================================

-- Any admin (full or limited)
create or replace function public.app_is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','sub_admin')); $$;

-- Full admin only
create or replace function public.app_is_full_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

revoke all on function public.app_is_full_admin() from public;
grant execute on function public.app_is_full_admin() to authenticated;

-- Tables everyone-admin may fully manage (delete stays allowed, as before)
-- (applications, application_answers, contact_messages keep the policy from step 2.)

-- Admin emails: only FULL admins can read/add/remove
drop policy if exists "Admin panel: manage admin_emails" on public.admin_emails;
create policy "Admin panel: manage admin_emails" on public.admin_emails
  for all to authenticated using (public.app_is_full_admin()) with check (public.app_is_full_admin());

-- Opportunities and their children: split "for all" into select/insert/update (any admin)
-- and delete (full admin, or the limited admin who created it).
do $$
declare t text;
begin
  foreach t in array array['opportunities','opportunity_programs','opportunity_requirements','opportunity_benefits','application_forms','application_fields']
  loop
    execute format('drop policy if exists %I on public.%I', 'Admin panel: manage ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'Admin panel: read ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'Admin panel: insert ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'Admin panel: update ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'Admin panel: delete ' || t, t);
    execute format('create policy %I on public.%I for select to authenticated using (public.app_is_admin())', 'Admin panel: read ' || t, t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.app_is_admin())', 'Admin panel: insert ' || t, t);
    execute format('create policy %I on public.%I for update to authenticated using (public.app_is_admin()) with check (public.app_is_admin())', 'Admin panel: update ' || t, t);
  end loop;
end $$;

create policy "Admin panel: delete opportunities" on public.opportunities
  for delete to authenticated
  using (public.app_is_full_admin() or (public.app_is_admin() and created_by = auth.uid()));

create policy "Admin panel: delete opportunity_programs" on public.opportunity_programs
  for delete to authenticated using (public.app_is_admin());   -- needed when editing lists; the parent delete is what's protected
create policy "Admin panel: delete opportunity_requirements" on public.opportunity_requirements
  for delete to authenticated using (public.app_is_admin());
create policy "Admin panel: delete opportunity_benefits" on public.opportunity_benefits
  for delete to authenticated using (public.app_is_admin());
create policy "Admin panel: delete application_fields" on public.application_fields
  for delete to authenticated using (public.app_is_admin());
create policy "Admin panel: delete application_forms" on public.application_forms
  for delete to authenticated using (
    public.app_is_full_admin()
    or exists (select 1 from public.opportunities o where o.id = opportunity_id and o.created_by = auth.uid())
  );

-- Profiles: any admin may read and edit details, but only a FULL admin may change roles.
drop policy if exists "Admin panel: update profiles" on public.profiles;
create policy "Admin panel: update profiles" on public.profiles
  for update to authenticated
  using (public.app_is_admin())
  with check (
    public.app_is_full_admin()
    or role = (select p.role from public.profiles p where p.id = profiles.id)
  );

-- Deleting users is done with the service-role key from the server, and the app
-- only allows it for full admins.
