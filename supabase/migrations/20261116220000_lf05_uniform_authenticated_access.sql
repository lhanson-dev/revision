-- LF-05: align the existing authenticated learner feature with the Founder's
-- repeated instruction to have no per-account/question access allowlist.
-- This is NOT anonymous access: all written work remains identity-/owner-bound.
-- Publish only independently reviewed original training items, not PR #834 drafts.
-- Backend-ahead deployment must follow the separate Founder-approved PR release.
begin;

-- Existing RLS policies call this helper for questions, owner-private attempts
-- and post-submission guides. Keeping the identifier avoids changing/splitting
-- owner RLS policies or invalidating any saved attempt identities.
-- Remove unnecessary SECURITY DEFINER: no privileged membership lookup remains.
create or replace function lf05_private.lf05_is_authorised()
returns boolean language sql stable security invoker
set search_path = ''
as $$
  select auth.uid() is not null
     and coalesce((auth.jwt()->>'is_anonymous')::boolean,false) is false;
$$;
revoke all on function lf05_private.lf05_is_authorised() from public, anon, authenticated;
grant usage on schema lf05_private to authenticated;
grant execute on function lf05_private.lf05_is_authorised() to authenticated;
comment on function lf05_private.lf05_is_authorised() is
  'LF-05 standard signed-in permanent learner access. No per-account pilot allowlist; owner RLS and submission-before-guide remain separate.';

-- The former named cohort table is left private and inert to avoid destructive
-- changes to operational history. Membership no longer influences access.
-- The production readiness contract must explicitly prove the old gate is gone.
create or replace function public.revision_lf05_release_readiness()
returns jsonb language sql stable security invoker
set search_path = pg_catalog, public
as $readiness$
with entities as (
  select
    to_regclass('public.lf05_written_questions') as questions,
    to_regclass('public.lf05_written_guides') as guides,
    to_regclass('public.lf05_written_attempts') as attempts
), checks as (
  select
    coalesce((select relrowsecurity from pg_catalog.pg_class where oid=questions),false)
      and coalesce(has_table_privilege('authenticated',questions,'SELECT'),false)
      and not coalesce(has_table_privilege('anon',questions,'SELECT'),true)
      as question_rls,
    coalesce((select relrowsecurity from pg_catalog.pg_class where oid=guides),false)
      and coalesce(has_table_privilege('authenticated',guides,'SELECT'),false)
      and not coalesce(has_table_privilege('anon',guides,'SELECT'),true)
      as guide_rls,
    coalesce((select relrowsecurity from pg_catalog.pg_class where oid=attempts),false)
      and coalesce(has_table_privilege('authenticated',attempts,'INSERT'),false)
      and coalesce(has_table_privilege('authenticated',attempts,'SELECT'),false)
      and coalesce(has_table_privilege('authenticated',attempts,'UPDATE'),false)
      and not coalesce(has_table_privilege('anon',attempts,'SELECT'),true)
      as private_attempt_rls,
    exists (
      select 1 from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid=p.pronamespace
      where n.nspname='lf05_private'
        and p.proname='lf05_is_authorised'
        and p.pronargs=0
        and not p.prosecdef
        and pg_catalog.pg_get_functiondef(p.oid) not ilike '%lf05_test_memberships%'
    ) as open_signed_in_eligibility,
    to_regprocedure('public.guard_lf05_written_attempt()') is not null as server_guard,
    -- Public SECURITY INVOKER RPC may inspect pg_extension, not the private
    -- cron.job catalogue. Active schedule is separately verified by the
    -- privileged migration/release assurance (the original contract behaved so).
    exists(select 1 from pg_catalog.pg_extension where extname='pg_cron')
      as expiry_scheduler
  from entities
)
select jsonb_build_object(
  'contract','lf05-original-writing-open-v2',
  'ready', question_rls and guide_rls and private_attempt_rls
    and open_signed_in_eligibility and server_guard and expiry_scheduler,
  'checks',jsonb_build_object(
    'questions',question_rls,
    'guides',guide_rls,
    'ownerPrivateAttempts',private_attempt_rls,
    'uniformAuthenticatedAccess',open_signed_in_eligibility,
    'serverGuard',server_guard,
    'expiryScheduler',expiry_scheduler
  )
) from checks;
$readiness$;
revoke all on function public.revision_lf05_release_readiness() from public;
grant execute on function public.revision_lf05_release_readiness() to anon,authenticated;
comment on function public.revision_lf05_release_readiness() is
  'Public non-sensitive LF-05 standard authenticated writing capability report; does not certify learner identity, course coverage, mark reliability or data protection.';

commit;
