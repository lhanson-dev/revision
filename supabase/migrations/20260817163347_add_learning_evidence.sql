create table public.learning_evidence (
  user_id uuid not null references auth.users(id) on delete cascade,
  evidence_id text not null,
  module_id text not null,
  topic_id text not null,
  source text not null check (source in ('flashcard', 'multiple_choice', 'exam_question', 'exam_attempt')),
  occurred_at timestamptz not null,
  content_id text not null,
  payload jsonb not null,
  schema_version smallint not null default 1 check (schema_version > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, evidence_id),
  constraint learning_evidence_nonempty_ids check (
    length(btrim(evidence_id)) > 0
    and length(btrim(module_id)) > 0
    and length(btrim(topic_id)) > 0
    and length(btrim(content_id)) > 0
  )
);

comment on table public.learning_evidence is
  'Append-only learner evidence used by Revision readiness/confidence calculations. Legacy revision_progress remains unchanged.';

create index learning_evidence_user_module_occurred_idx
  on public.learning_evidence (user_id, module_id, occurred_at desc);

create index learning_evidence_user_module_topic_occurred_idx
  on public.learning_evidence (user_id, module_id, topic_id, occurred_at desc);

alter table public.learning_evidence enable row level security;

create policy "users_select_own_learning_evidence"
  on public.learning_evidence
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "users_insert_own_learning_evidence"
  on public.learning_evidence
  for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

revoke all on table public.learning_evidence from anon;
revoke all on table public.learning_evidence from authenticated;
grant select, insert on table public.learning_evidence to authenticated;
