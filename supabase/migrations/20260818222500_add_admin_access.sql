begin;

-- Admin access is explicit database-owned profile state. Browser clients may read
-- their own value through the existing profile SELECT policy but cannot mutate it.
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is
  'Whether this authenticated user may access Revision internal administration capabilities. This value is database-owned and is not client-editable.';

-- Initial Founder administrator. The update is intentionally conditional so fresh
-- development databases without production auth users can still apply the migration.
update public.profiles p
set is_admin = true,
    updated_at = now()
from auth.users u
where p.user_id = u.id
  and lower(u.email) = lower('leehanson@hotmail.com');

commit;
