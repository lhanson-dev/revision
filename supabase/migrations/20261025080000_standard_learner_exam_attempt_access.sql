-- #665: standard authenticated learner feature access.
-- Backend-ahead, backward-compatible: previous clients continue to work.
-- No per-account REC-10 claim; preserve owner isolation and all lifecycle guards.
-- Anonymous Auth sessions have the authenticated database role but are not ordinary learners.
begin;

drop policy if exists "learner_select_own_exam_attempts" on public.learner_exam_attempts;
drop policy if exists "learner_insert_own_exam_attempts" on public.learner_exam_attempts;
drop policy if exists "learner_update_own_exam_attempts" on public.learner_exam_attempts;
drop policy if exists "learner_delete_own_exam_attempts" on public.learner_exam_attempts;

create policy "learner_select_own_exam_attempts" on public.learner_exam_attempts
  for select to authenticated using ((select auth.uid()) = user_id and expires_at > now()
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true');
create policy "learner_insert_own_exam_attempts" on public.learner_exam_attempts
  for insert to authenticated with check ((select auth.uid()) = user_id
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true');
create policy "learner_update_own_exam_attempts" on public.learner_exam_attempts
  for update to authenticated
  using ((select auth.uid()) = user_id and expires_at > now()
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true')
  with check ((select auth.uid()) = user_id and expires_at > now()
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true');
create policy "learner_delete_own_exam_attempts" on public.learner_exam_attempts
  for delete to authenticated using ((select auth.uid()) = user_id
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true');

-- Do not change the existing v1 production contract: legacy Pages releases
-- must remain deployable after this backend-ahead migration.
create function public.revision_learner_feature_readiness()
returns jsonb language sql stable security invoker
set search_path = pg_catalog, public
as $readiness$
with policies as (
  select
    count(*) = 4
    and bool_and(roles = array['authenticated']::name[])
    and bool_and(coalesce(qual, '') not ilike '%revision_rec10_pilot%'
      and coalesce(with_check, '') not ilike '%revision_rec10_pilot%')
    and count(*) filter (where policyname = 'learner_select_own_exam_attempts'
       and cmd = 'SELECT' and qual ilike '%auth.uid%' and qual ilike '%is_anonymous%') = 1
    and count(*) filter (where policyname = 'learner_insert_own_exam_attempts'
       and cmd = 'INSERT' and with_check ilike '%auth.uid%' and with_check ilike '%is_anonymous%') = 1
    and count(*) filter (where policyname = 'learner_update_own_exam_attempts'
       and cmd = 'UPDATE' and qual ilike '%auth.uid%' and qual ilike '%is_anonymous%'
       and with_check ilike '%auth.uid%' and with_check ilike '%is_anonymous%') = 1
    and count(*) filter (where policyname = 'learner_delete_own_exam_attempts'
       and cmd = 'DELETE' and qual ilike '%auth.uid%' and qual ilike '%is_anonymous%') = 1
    as access_ready
  from pg_catalog.pg_policies
  where schemaname = 'public' and tablename = 'learner_exam_attempts'
)
select jsonb_build_object(
  'contract', 'r2-exam-attempt-open-v2',
  'ready', coalesce((public.revision_release_readiness() ->> 'ready')::boolean
    and (select access_ready from policies), false),
  'checks', jsonb_build_object(
    'existingBackend', coalesce((public.revision_release_readiness() ->> 'ready')::boolean, false),
    'examOwnerPolicies', coalesce((select access_ready from policies), false)
  )
);
$readiness$;
revoke all on function public.revision_learner_feature_readiness() from public;
grant execute on function public.revision_learner_feature_readiness() to anon, authenticated;
comment on function public.revision_learner_feature_readiness() is
  'New ordinary learner access capability contract, keeping old production release compatible.';
commit;
