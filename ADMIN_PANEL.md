# Admin panel (connected to Supabase)

The admin area at `/admin` now reads and writes the real database. Only users whose
`profiles.role` is `admin` can open it, and every action re-checks that on the server.

## One-time setup

1. **Run `supabase/admin-panel.sql`** in Supabase → SQL Editor → New query → Run.
   It gives admins permission to read/add/change/delete rows in the tables the panel manages.
   It only *adds* permissions; students and visitors can do exactly what they could before.
   If a button ever shows "The database refused this change", this step is the usual cause.
2. **(Optional) Add `SUPABASE_SERVICE_ROLE_KEY` to `.env`** (see `.env.local.example`), then restart.
   It is only needed for *adding* and *deleting* user accounts. Keep it secret.
   Everything else works without it.

## What each page does

| Page | What an admin can do |
| --- | --- |
| Dashboard | Live counts, opportunities by category, recent applications, latest opportunities, recent activity |
| Opportunities (+ category sub-menu) | Search, filter by status, add, edit, publish / unpublish / close, feature, delete |
| Opportunity → Edit | Title, organization, category, country, location, deadline, image link, description, status, featured, **programs, requirements, benefits** |
| Opportunity → Application form | Build the form students fill in: add / reorder / remove questions, choose answer types (text, email, number, date, long text, dropdown, radio, checkbox, file), mark required |
| Applications | List + filter (existing), **open one to read the student's answers**, change status (Sent / In review / Completed), delete |
| Users | Search and filter, edit profile and role, see a user's applications, add a user (needs the service key), delete a user (needs the service key) |
| Messages | Read messages from the Contact page, reply by email, delete |
| Settings | Manage the `admin_emails` list; shows whether account management is enabled |

Subscribers, Media and Consultations have no database tables yet, so they show a "not connected yet" page instead of a 404.

## Good to know

- **Categories** come from the `opportunities.category` column. The public site now uses it too
  (before, it only used `opportunity_programs`). Both are still honoured; "Scholarship" and "Scholarships" count as one category.
- **Deleting** an opportunity is refused if students have applied (it would erase their applications): close it instead.
  A form can't be deleted once applications exist, and a question students already answered can be renamed but not removed.
- **Deleting a user** keeps their applications (the link to the person is cleared).
- **Adding a user** creates the account with a temporary password you give to the person; they then go through the normal get-started questions.
- **Images** are a web address. Uploading images would need a Storage bucket (not set up).
- **File answers** on application forms only save the file name unless a Storage bucket is configured
  (`NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`); see the commented section 4 in `supabase/admin-panel.sql` for letting admins download them.
