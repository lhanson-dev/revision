begin;
-- Additive public/non-sensitive capability report. It confirms the secured
-- original-written-question backend exists before the revised Pages build
-- can be published; never reveals accounts, essay text or private marking.
create or replace function public.revision_lf05_release_readiness()
returns jsonb language sql stable security invoker
set search_path = pg_catalog, public
as $$
with entities as (
  select
    to_regclass('public.lf05_written_questions') as questions,
    to_regclass('public.lf05_written_guides') as guides,
    to_regclass('public.lf05_written_attempts') as attempts
), checks as (
  select
    coalesce((select relrowsecurity from pg_catalog.pg_class
      where oid=questions),false) and
      coalesce(has_table_privilege('authenticated',questions,'SELECT'),false) and
      not coalesce(has_table_privilege('anon',questions,'SELECT'),true)
      as question_rls,
    coalesce((select relrowsecurity from pg_catalog.pg_class
      where oid=guides),false) and
      coalesce(has_table_privilege('authenticated',guides,'SELECT'),false) and
      not coalesce(has_table_privilege('anon',guides,'SELECT'),true)
      as guide_rls,
    coalesce((select relrowsecurity from pg_catalog.pg_class
      where oid=attempts),false) and
      coalesce(has_table_privilege('authenticated',attempts,'INSERT'),false) and
      coalesce(has_table_privilege('authenticated',attempts,'SELECT'),false) and
      coalesce(has_table_privilege('authenticated',attempts,'UPDATE'),false) and
      not coalesce(has_table_privilege('anon',attempts,'SELECT'),true)
      as private_attempt_rls,
    exists (
      select 1 from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid=c.relnamespace
      where n.nspname='lf05_private'
        and c.relname='lf05_test_memberships'
        and c.relrowsecurity
    ) as private_membership,
    exists(select 1 from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid=p.pronamespace
      where n.nspname='lf05_private' and p.proname='lf05_is_authorised')
      and to_regprocedure('public.guard_lf05_written_attempt()') is not null
      as server_guards,
    exists(select 1 from pg_catalog.pg_extension where extname='pg_cron')
      as expiry_scheduler_extension
  from entities
)
select jsonb_build_object(
  'contract','lf05-original-writing-v1',
  'ready', question_rls and guide_rls and private_attempt_rls
    and private_membership and server_guards and expiry_scheduler_extension,
  'checks',jsonb_build_object(
    'questions',question_rls,
    'guides',guide_rls,
    'ownerPrivateAttempts',private_attempt_rls,
    'privateMembership',private_membership,
    'serverGuards',server_guards,
    'cronExtension',expiry_scheduler_extension
  )
) from checks;
$$;
revoke all on function public.revision_lf05_release_readiness() from public;
grant execute on function public.revision_lf05_release_readiness() to anon,authenticated;
comment on function public.revision_lf05_release_readiness() is
'Non-sensitive LF-05 schema/RLS/guard/scheduler capability report for staged private learner release; does not approve child-data processing, verify original question content counts, or enrol accounts.';
commit;
