begin;

-- Explicit learner-confirmed reading. Separate from scored learning_evidence.
create table public.learner_learn_exposures (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (length(btrim(course_id)) between 1 and 200),
  module_id text not null check (length(btrim(module_id)) between 1 and 200),
  topic_id text not null check (length(btrim(topic_id)) between 1 and 200),
  page_id text not null check (length(btrim(page_id)) between 1 and 200),
  reviewed_at timestamptz not null default now(),
  primary key (user_id, course_id, module_id, page_id)
);
create index learner_learn_exposures_user_course_idx on public.learner_learn_exposures (user_id, course_id);
alter table public.learner_learn_exposures enable row level security;
create policy "users_select_own_learn_exposures" on public.learner_learn_exposures
  for select to authenticated using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "users_insert_own_learn_exposures" on public.learner_learn_exposures
  for insert to authenticated with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
revoke all on table public.learner_learn_exposures from anon;
revoke all on table public.learner_learn_exposures from authenticated;
revoke all on table public.learner_learn_exposures from service_role;
grant select, insert on table public.learner_learn_exposures to authenticated;
comment on table public.learner_learn_exposures is
  'Append-only, learner-confirmed Learn page review; never scored understanding or exam readiness.';
commit;
