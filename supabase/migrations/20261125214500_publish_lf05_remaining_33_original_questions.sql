-- Governed full LF-05 original question-bank activation: PR #854.
-- IMPORTANT: This is executable and will publish 33 questions to ALL
-- authenticated learners once installed. Never apply or merge before the
-- exact-source independent A3 context/rights acceptance, controller/access
-- decision, all tests and specific Founder approval for PR #854.
-- Source SQL blobs 7f6304f49f4d736fb49387b7b11d6accdd2f7f3c and
-- b663a10f509e9009185329f23d44470b6f12c734 (six and 27 held).
-- Published original first six and all saved learner evidence remain unchanged.
BEGIN;
DO $guard$
DECLARE
  affected integer;
  expected_ids text[] := ARRAY[
    'BUS-LF05-01-16',
    'BUS-LF05-03-16',
    'BUS-LF05-04-16',
    'BUS-LF05-04-25',
    'BUS-LF05-05-16',
    'BUS-LF05-05-25',
    'BUS-LF05-06-16',
    'BUS-LF05-06-25',
    'BUS-LF05-07-16',
    'BUS-LF05-07-25',
    'BUS-LF05-08-16',
    'BUS-LF05-08-25',
    'BUS-LF05-09-16',
    'BUS-LF05-09-25',
    'BUS-LF05-10-16',
    'PSY-LF05-01',
    'PSY-LF05-02',
    'PSY-LF05-02-S1',
    'PSY-LF05-03',
    'PSY-LF05-04',
    'PSY-LF05-05',
    'PSY-LF05-06',
    'PSY-LF05-07',
    'PSY-LF05-08',
    'PSY-LF05-09',
    'PSY-LF05-10',
    'PSY-LF05-11',
    'PSY-LF05-12',
    'PSY-LF05-13',
    'PSY-LF05-14',
    'PSY-LF05-15',
    'PSY-LF05-16',
    'PSY-LF05-17'
  ];
BEGIN
  IF (SELECT count(*) FROM public.lf05_written_questions) <> 39
    OR (SELECT count(*) FROM public.lf05_written_guides) <> 39
    OR (SELECT count(*) FROM public.lf05_written_questions WHERE status='published') <> 6
    OR (SELECT count(*) FROM public.lf05_written_questions WHERE status='held') <> 33
  THEN
    RAISE EXCEPTION 'LF-05 promotion rejected: expected 39 sources, six published, 33 held';
  END IF;

  IF (SELECT count(*) FROM public.lf05_written_questions WHERE id = ANY(expected_ids)) <> 33
    OR (SELECT count(*) FROM public.lf05_written_questions WHERE status='held' AND id=ANY(expected_ids)) <> 33
    OR (SELECT count(*) FROM public.lf05_written_questions WHERE status='held' AND NOT id=ANY(expected_ids)) <> 0
  THEN
    RAISE EXCEPTION 'LF-05 promotion rejected: held item identity mismatch';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.lf05_written_questions q
    LEFT JOIN public.lf05_written_guides g ON g.question_id=q.id
    WHERE q.id = ANY(expected_ids) AND (
      g.question_id IS NULL
      OR NOT q.original_training_only
      OR q.content_fingerprint IS NULL
      OR q.content_fingerprint <> g.content_fingerprint
      OR q.content_fingerprint <> encode(sha256(convert_to(
        q.id || chr(31) || q.question_prompt || chr(31) ||
        coalesce(q.stimulus, '') || chr(31) || g.guidance::text,
      'UTF8')), 'hex')
      OR jsonb_array_length(g.guidance) < 5
    )
  ) THEN
    RAISE EXCEPTION 'LF-05 promotion rejected: question/guide content-version mismatch';
  END IF;

  -- Metadata reflects FINAL accepted approval only after the source-rights
  -- and separate reviewer-method decisions; no rubric or question bytes change.
  UPDATE public.lf05_written_guides
  SET approved_review_ref = 'LF05 independent A3 2026-11-25; Founder PR854 release acceptance; audits/2026-11-25-lf05-33-rights-and-review-release-ledger.md'
  WHERE question_id = ANY(expected_ids);
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 33 THEN
    RAISE EXCEPTION 'LF-05 release rejected: guide review identity update count %', affected;
  END IF;

  UPDATE public.lf05_written_questions
  SET status = 'published'
  WHERE id = ANY(expected_ids) AND status = 'held';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 33 THEN
    RAISE EXCEPTION 'LF-05 release rejected: changed question count %', affected;
  END IF;

  IF (SELECT count(*) FROM public.lf05_written_questions WHERE status='published') <> 39
    OR (SELECT count(*) FROM public.lf05_written_questions WHERE status='held') <> 0
    OR (SELECT count(*) FROM public.lf05_written_questions WHERE status='published'
        AND course_id='aqa:aqa-a-level:7132') <> 20
    OR (SELECT count(*) FROM public.lf05_written_questions WHERE status='published'
        AND course_id='aqa:aqa-a-level:7182') <> 19
  THEN
    RAISE EXCEPTION 'LF-05 promotion rejected: final catalogue totals mismatch';
  END IF;
END
$guard$;
COMMIT;
