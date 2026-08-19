begin;

-- revision_progress pre-dated the repository's migration history. Capture that
-- baseline so a fresh local Supabase database can replay every later migration.
-- All statements are idempotent against the existing production table.
create table if not exists public.revision_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table public.revision_progress enable row level security;

revoke all on table public.revision_progress from anon;
grant all on table public.revision_progress to authenticated;
grant all on table public.revision_progress to service_role;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'revision_progress'
      and policyname = 'users_select_own_revision_progress'
  ) then
    create policy "users_select_own_revision_progress"
      on public.revision_progress for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'revision_progress'
      and policyname = 'users_insert_own_revision_progress'
  ) then
    create policy "users_insert_own_revision_progress"
      on public.revision_progress for insert to authenticated
      with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'revision_progress'
      and policyname = 'users_update_own_revision_progress'
  ) then
    create policy "users_update_own_revision_progress"
      on public.revision_progress for update to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'revision_progress'
      and policyname = 'users_delete_own_revision_progress'
  ) then
    create policy "users_delete_own_revision_progress"
      on public.revision_progress for delete to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end
$$;

commit;
