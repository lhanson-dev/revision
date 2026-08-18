-- Read-only verification queries for the protected Admin operations aggregate.
-- Run after applying the admin_operations_metrics migration.

-- 1. Aggregate function exists and returns JSONB.
select
  p.proname,
  pg_get_function_result(p.oid) as result_type,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'admin_operations_metrics';

-- 2. Browser roles cannot execute the cross-user aggregate; service_role can.
select
  has_function_privilege('anon', 'public.admin_operations_metrics()', 'execute') as anon_can_execute,
  has_function_privilege('authenticated', 'public.admin_operations_metrics()', 'execute') as authenticated_can_execute,
  has_function_privilege('service_role', 'public.admin_operations_metrics()', 'execute') as service_role_can_execute;

-- 3. Current account classifications used by the dashboard exclusion rule.
select
  count(*) filter (where not is_test_user and not is_admin) as learner_accounts,
  count(*) filter (where not is_test_user and is_admin) as admin_accounts,
  count(*) filter (where is_test_user) as test_accounts
from public.profiles;

-- 4. Service-side aggregate shape can be inspected by a privileged operator.
select public.admin_operations_metrics();
