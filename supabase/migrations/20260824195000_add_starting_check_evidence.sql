create table public.starting_check_evidence (
  user_id uuid not null references auth.users(id) on delete cascade,
  evidence_id text not null,
  module_id text not null,
  topic_id text not null,
  question_id text not null,
  occurred_at timestamptz not null,
  payload jsonb not null,
  schema_version smallint not null default 1 check (schema_version = 1),
  created_at timestamptz not null default now(),
  primary key (user_id, evidence_id),
  constraint starting_check_evidence_nonempty_ids check (
    length(btrim(evidence_id)) > 0
    and length(btrim(module_id)) > 0
    and length(btrim(topic_id)) > 0
    and length(btrim(question_id)) > 0
  )
);

comment on table public.starting_check_evidence is
  'Append-only FI-006 directional starting-check observations. These rows are intentionally separate from ordinary learning_evidence and must not contribute to coverage, mastery, readiness or grade claims.';

create index starting_check_evidence_user_module_occurred_idx
  on public.starting_check_evidence (user_id, module_id, occurred_at asc);

alter table public.starting_check_evidence enable row level security;

create policy "users_select_own_starting_check_evidence"
  on public.starting_check_evidence
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "users_insert_own_starting_check_evidence"
  on public.starting_check_evidence
  for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

revoke all on table public.starting_check_evidence from anon;
revoke all on table public.starting_check_evidence from authenticated;
grant select, insert on table public.starting_check_evidence to authenticated;
