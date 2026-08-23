begin;

-- Supabase production default privileges give service_role broader table ACLs than
-- the local isolated stack. FI-020 requires protected operations to inspect course
-- membership and telemetry without introducing a separate service-level mutation path.
revoke all on table public.learner_courses from service_role;
revoke all on table public.learner_course_events from service_role;

grant select on table public.learner_courses to service_role;
grant select on table public.learner_course_events to service_role;

commit;
