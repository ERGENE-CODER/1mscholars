-- =============================================================================
-- 1M Scholars: live numbers for the home page
-- Run ONCE in Supabase -> SQL Editor (safe to run again).
-- Needs supabase/admin-panel.sql to have been run first (uses app_is_admin()).
--
-- The four numbers on the home page, and exactly what each one counts:
--   Active Opportunities = published opportunities with no deadline or a deadline that has not passed
--   Youth Supported      = applications an admin has marked completed
--   Colleges Covered     = rows in the partner_colleges table below
--   Training Programs    = published opportunities in the Training category
-- To change what a number means, edit the matching line inside get_site_stats().
-- =============================================================================

-- 1. Colleges: add one row per college you work with (Table Editor -> partner_colleges).
create table if not exists public.partner_colleges (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists partner_colleges_name_key
  on public.partner_colleges (lower(name));

alter table public.partner_colleges enable row level security;

drop policy if exists "Admin panel: manage partner_colleges" on public.partner_colleges;
create policy "Admin panel: manage partner_colleges" on public.partner_colleges
  for all to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- 2. The counts. SECURITY DEFINER so signed-out visitors can see the totals
--    without being able to read any rows (names, applicants, etc.).
create or replace function public.get_site_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'active_opportunities',
      (select count(*) from public.opportunities
        where status::text = 'published'
          and (deadline is null or deadline::date >= current_date)),
    'youth_supported',
      (select count(*) from public.applications
        where status::text = 'completed'),
    'colleges_covered',
      (select count(*) from public.partner_colleges),
    'training_programs',
      (select count(*) from public.opportunities
        where status::text = 'published'
          and lower(trim(category)) like 'training%')
  );
$$;

revoke all on function public.get_site_stats() from public;
grant execute on function public.get_site_stats() to anon, authenticated;

-- 3. Last statement: shows the numbers the home page will display.
select public.get_site_stats() as stats;
