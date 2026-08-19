begin;

-- The release-readiness RPC exposes only a non-sensitive contract identifier and
-- boolean capability presence. It does not need elevated execution privileges.
alter function public.revision_release_readiness() security invoker;

comment on function public.revision_release_readiness() is
  'Public, non-sensitive release-readiness contract used by deployment automation. Runs as SECURITY INVOKER and exposes only boolean capability presence plus a contract identifier.';

commit;
