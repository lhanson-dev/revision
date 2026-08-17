-- PROPOSAL ONLY — NOT YET AN APPLIED MIGRATION
-- Revision first additive Supabase regularisation
-- Reviewed target: public.profiles + revision_progress.schema_version

begin;

-- Keep internal trigger code outside the exposed public schema.
create schema if not exists revision_private;
revoke all on schema revision_private from public;

-- Durable user classification. This is intentionally not client-editable.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_test_user boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Learners may read only their own profile classification.
create policy "users_select_own_profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

-- No INSERT / UPDATE / DELETE policies are granted to authenticated users.
-- Classification is controlled by trusted/admin processes, not browser state.
revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;

-- Automatically create a profile row for future auth users.
create or replace function revision_private.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function revision_private.handle_new_auth_user_profile() from public;

create trigger revision_create_profile_after_auth_user
  after insert on auth.users
  for each row
  execute function revision_private.handle_new_auth_user_profile();

-- Backfill profile rows for all existing users without changing auth data.
insert into public.profiles (user_id)
select id
from auth.users
on conflict (user_id) do nothing;

-- Version the existing opaque state without changing its contents or current key.
alter table public.revision_progress
  add column schema_version smallint not null default 1,
  add constraint revision_progress_schema_version_positive
    check (schema_version > 0);

comment on column public.revision_progress.schema_version is
  'Version of the revision_progress state payload contract. Existing prototype rows start at version 1.';

commit;
