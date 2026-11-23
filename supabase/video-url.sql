-- Run ONCE in Supabase -> SQL Editor -> New query -> Run.
-- Adds the optional YouTube video link shown as a "Watch video" button on opportunity cards.
alter table public.opportunities add column if not exists video_url text;
