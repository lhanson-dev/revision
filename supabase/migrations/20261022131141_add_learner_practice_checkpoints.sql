begin;

-- R2: learner-owned, unscored checkpoint state for an interrupted scored Practice question session.
-- This table never counts as learning evidence, reviewed coverage, planner completion, or readiness.
create table public.learner_practice_checkpoints (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (length(btrim(course_id)) between 1 and 200),
  module_id text not null check (length(btrim(module_id)) between 1 and 200),
  topic_id text not null check (length(btrim(topic_id)) between 1 and 200),
  session_id uuid not null,
  revision bigint not null default 1 check (revision between 1 and 2147483647),
  content_fingerprint text not null check (content_fingerprint ~ '^[0-9a-f]{64}$'),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object' and octet_length(snapshot::text) <= 65536),
  expires_at timestamptz not null default (now() + interval '14 days'),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, module_id, topic_id)
);
create index learner_practice_checkpoints_expiry_idx on public.learner_practice_checkpoints (expires_at);
alter table public.learner_practice_checkpoints enable row level security;

create policy "learner_select_own_practice_checkpoints" on public.learner_practice_checkpoints
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "learner_insert_own_practice_checkpoints" on public.learner_practice_checkpoints
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "learner_update_own_practice_checkpoints" on public.learner_practice_checkpoints
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "learner_delete_own_practice_checkpoints" on public.learner_practice_checkpoints
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on table public.learner_practice_checkpoints from anon, authenticated, service_role;
grant select, insert, update, delete on public.learner_practice_checkpoints to authenticated;
comment on table public.learner_practice_checkpoints is
  'Owner-only, unscored Practice recovery state; exact source fingerprint, CAS revision, and expiry metadata. An unanswered or pending checkpoint is never evidence.';

commit;
