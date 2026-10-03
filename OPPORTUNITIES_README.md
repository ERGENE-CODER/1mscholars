# 1M Scholars Opportunities Flow (Supabase)

Data now comes from Supabase (`https://mzagbpvgaescuuegicpy.supabase.co`) instead of static sample content.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase dashboard → Project Settings → API).
3. `npm run dev`

`NEXT_PUBLIC_*` values are inlined at build time, so restart `next dev` / rebuild after changing them. Without the key, pages show a "Supabase is not configured" error state instead of crashing.

## Routes

- `/opportunities` — published opportunities (`opportunities.status = 'published'`)
- `/opportunities/<category>` — category filter, e.g. `/opportunities/scholarships`
- `/opportunities/<id>` or `/opportunities/<id>-<title-slug>` — detail page
- `/opportunities/assistance?opportunity=<id>` — application form

## How the data maps

| UI | Source |
| --- | --- |
| Categories / filter pills | distinct `opportunity_programs.program_name` of published opportunities (matched loosely, so "Scholarship" and "Scholarships" are one category) |
| Card/detail title, provider, description | `title`, `organization`, `description` |
| Location | `location` + `country` |
| Image | `image_url` (falls back to `/hero.png`) |
| "Featured" badge | `featured` |
| Eligibility / Benefits | `opportunity_requirements`, `opportunity_benefits` (by `position`) |
| Application form | latest `application_forms` row for the opportunity + its `application_fields` (by `position`) |
| Submission | one `applications` row (`status = 'submitted'`) + one `application_answers` row per answered field |

Field types: `text`, `email`, `number`, `date`, `textarea`, `select`, `radio`, `checkbox`, `file`.
`application_fields.options` may be `["A","B"]` or `[{"label":"A","value":"a"}]`. A `checkbox` with options is a multi-select (saved as an array in `answer_json`); without options it is a single yes/no checkbox.
If the visitor has a Supabase auth session, `applications.applicant_id` is set to that user; otherwise it is `null`.

## Row Level Security

The browser uses the anon key, so RLS decides what works. The app needs:

- `select` on `opportunities` (published/closed) and on `opportunity_programs`, `opportunity_requirements`, `opportunity_benefits`, `application_forms`, `application_fields`
- `insert` on `applications` and `application_answers`
- `select` on the inserted `applications` row — the app uses `insert(...).select('id')` to get the new id. For anonymous applicants this needs a policy that lets that row be read back; design it so applicants cannot read each other's applications.

## File uploads

The schema has no storage for files. File fields always save the file's name/size/type in `answer_json`. To also upload the file, create a Storage bucket, allow inserts for your applicants, and set `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.

## Not carried over from the demo

The sample payment-preference block was removed (its answer had no field to be stored in). To collect it, add a field to `application_fields`. The declaration checkboxes remain as required client-side confirmations and aren't stored.
