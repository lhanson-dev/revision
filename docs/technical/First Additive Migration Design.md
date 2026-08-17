# First Additive Migration Design

Status: proposed for Founder review. Nothing in this document has been applied to Supabase.

## Purpose
Create the smallest safe database regularisation needed before automated test accounts, structured learner data and later reporting are introduced.

## Proposed changes
### 1. Add `public.profiles`
One row per Supabase Auth user:
- `user_id uuid` — primary key and foreign key to `auth.users(id)` with cascade delete
- `is_test_user boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Why now:
- Revision has an approved rule that automated test identities must be distinguishable from real learners.
- Test classification belongs at user level, not inside each module-progress JSON document.
- Future admin/reporting queries need a durable way to exclude test activity by default.

### 2. Protect classification from browser edits
`profiles` has RLS enabled.

Authenticated learners receive SELECT access only to their own row. They do not receive INSERT, UPDATE or DELETE access. In particular, `is_test_user` is not a browser-editable preference.

Future privileged/admin tooling can manage the classification through a trusted path.

### 3. Create profiles automatically
A trigger on `auth.users` creates the corresponding `profiles` row for future sign-ups.

The trigger function lives in a non-exposed `revision_private` schema, uses a fixed empty `search_path`, and is not executable by public roles.

The migration also backfills a profile row for every existing auth user. It does not modify the auth user itself.

### 4. Version existing `revision_progress` state
Add:

`schema_version smallint not null default 1`

with a positive-value check constraint.

Existing rows therefore become version 1 automatically without altering the current JSON `state` value or the `(user_id, module_id)` primary key.

## What this migration deliberately does not do
- does not remove or rewrite `revision_progress.state`
- does not create question-attempt tables
- does not create exam-attempt tables
- does not create readiness/evidence tables
- does not create subject-catalogue persistence
- does not alter current learner auth behaviour
- does not mark either existing user as test automatically
- does not enable leaked-password protection

Those changes should be independently designed and approved.

## Expected effect on current users
The current two users and two progress records remain valid. The existing app can continue reading and writing `revision_progress` exactly as it does now because the new column has a default and no existing column is removed or made incompatible.

## Verification required before any live application
After the eventual migration is applied, verify automatically/read-only that:
1. every `auth.users.id` has exactly one matching `profiles.user_id`;
2. the two existing `revision_progress` rows still exist unchanged apart from `schema_version = 1`;
3. all `schema_version` values are positive;
4. RLS is enabled on `profiles`;
5. authenticated users can SELECT only their own profile;
6. authenticated users cannot INSERT, UPDATE or DELETE profile classification;
7. existing `revision_progress` ownership policies remain unchanged and effective;
8. Supabase security and performance advisors are re-run.

## Rollback shape
If this migration must be reversed before application code depends on it:
- drop the auth-user profile trigger;
- drop the private trigger function;
- drop `public.profiles`;
- drop the `revision_progress` schema-version constraint and column;
- optionally remove `revision_private` if empty.

No rollback step needs to restore or reconstruct existing learner JSON state because this migration does not alter it.

## Migration-file rule
The SQL in `supabase/proposals/first-additive-regularisation.sql` is a review proposal, not migration history. After Founder approval and immediately before live application, create the real migration file using the Supabase CLI migration command so the repository receives the correct generated migration filename, then copy the approved SQL into it unchanged except for any review corrections.
