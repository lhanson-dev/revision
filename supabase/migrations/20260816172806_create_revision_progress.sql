create table if not exists public.revision_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table public.revision_progress enable row level security;

grant select, insert, update, delete on table public.revision_progress to authenticated;
revoke all on table public.revision_progress from anon;

create policy "users_select_own_revision_progress"
on public.revision_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users_insert_own_revision_progress"
on public.revision_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users_update_own_revision_progress"
on public.revision_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users_delete_own_revision_progress"
on public.revision_progress
for delete
to authenticated
using ((select auth.uid()) = user_id);
