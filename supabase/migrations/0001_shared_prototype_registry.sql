-- =====================================================================
-- Shared prototype registry — initial schema
-- Repo: six7/atlas-exam-demo-1
--
-- Paste this whole file into the Supabase SQL editor and run it.
-- It is idempotent: running it twice is safe and changes nothing.
--
-- Model: every branch's CI pushes its prototypes into `prototypes`.
-- The web app only ever READS prototypes (as `anon`, via RLS).
-- All prototype writes are service-role only, i.e. CI.
--
-- Key generations: a new-style publishable key (`sb_publishable_…`) resolves
-- to the same `anon` role the legacy anon JWT did, and a secret key
-- (`sb_secret_…`) resolves to `service_role`. The policies below are therefore
-- correct for both, and need no change when you migrate off the legacy keys.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- prototypes
-- One row per (repo, branch, slug). CI upserts on that constraint.
-- ---------------------------------------------------------------------
create table if not exists public.prototypes (
  id             uuid        primary key default gen_random_uuid(),

  -- identity: the natural key CI upserts against
  repo           text        not null,
  branch         text        not null,
  slug           text        not null,

  -- authoring metadata, mirrored from registry.json
  name           text        not null,
  description    text        not null default '',
  path           text        not null,

  -- deployment metadata, filled in by CI
  preview_url    text,
  screenshot_url text,
  commit_sha     text,
  author         text,
  pr_number      integer,

  status         text        not null default 'open'
                 check (status in ('open', 'merged', 'closed')),

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint prototypes_repo_branch_slug_key unique (repo, branch, slug)
);

-- ---------------------------------------------------------------------
-- feedback
-- Anyone can read and post. Deleting a prototype takes its thread with it.
-- ---------------------------------------------------------------------
create table if not exists public.feedback (
  id           uuid        primary key default gen_random_uuid(),
  prototype_id uuid        not null
               references public.prototypes (id) on delete cascade,
  body         text        not null
               check (char_length(btrim(body)) between 1 and 4000),
  author_name  text        not null default 'Anonymous'
               check (char_length(btrim(author_name)) between 1 and 80),
  commit_sha   text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------
create index if not exists prototypes_repo_branch_idx
  on public.prototypes (repo, branch);

create index if not exists prototypes_updated_at_idx
  on public.prototypes (updated_at desc);

create index if not exists prototypes_status_idx
  on public.prototypes (status);

create index if not exists feedback_prototype_created_idx
  on public.feedback (prototype_id, created_at desc);

-- ---------------------------------------------------------------------
-- updated_at is maintained by the database, not by callers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at := now();
  return new;
end;
$fn$;

drop trigger if exists prototypes_set_updated_at on public.prototypes;
create trigger prototypes_set_updated_at
  before update on public.prototypes
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Row Level Security
--
--   prototypes : anon may SELECT. Nothing else. No INSERT/UPDATE/DELETE
--                policy exists, so those are denied for every role that
--                is subject to RLS. `service_role` has BYPASSRLS, which
--                is how CI writes — reached with a secret key
--                (`sb_secret_…`) or a legacy service_role key.
--   feedback   : anon may SELECT and INSERT. No UPDATE/DELETE policy,
--                so comments cannot be edited or removed by the public.
-- =====================================================================

alter table public.prototypes enable row level security;
alter table public.feedback   enable row level security;

-- Make the intent explicit at the GRANT layer too, so a future policy
-- added by mistake still cannot open up writes.
revoke all on public.prototypes from anon, authenticated;
grant  select on public.prototypes to anon, authenticated;

revoke all on public.feedback from anon, authenticated;
grant  select, insert on public.feedback to anon, authenticated;

drop policy if exists prototypes_select_public on public.prototypes;
create policy prototypes_select_public
  on public.prototypes
  for select
  to anon, authenticated
  using (true);

drop policy if exists feedback_select_public on public.feedback;
create policy feedback_select_public
  on public.feedback
  for select
  to anon, authenticated
  using (true);

drop policy if exists feedback_insert_public on public.feedback;
create policy feedback_insert_public
  on public.feedback
  for insert
  to anon, authenticated
  with check (true);

-- =====================================================================
-- Storage: screenshot bucket
--
-- Public bucket so the hub can render <img src> straight from the CDN
-- without signing URLs. Objects are keyed repo/branch/slug.png and
-- uploaded with upsert, so re-runs overwrite instead of accumulating.
-- Writes need a secret / service_role key (BYPASSRLS); reads are public.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('prototype-screenshots', 'prototype-screenshots', true)
on conflict (id) do update set public = excluded.public;

-- Public read policy. Wrapped because some projects restrict DDL on the
-- storage schema; a public bucket already serves reads without it.
do $storage$
begin
  drop policy if exists prototype_screenshots_public_read on storage.objects;
  create policy prototype_screenshots_public_read
    on storage.objects
    for select
    to anon, authenticated
    using (bucket_id = 'prototype-screenshots');
exception
  when insufficient_privilege then
    raise notice 'Skipped storage.objects policy (insufficient privilege). '
                 'The bucket is public, so reads still work.';
end;
$storage$;
