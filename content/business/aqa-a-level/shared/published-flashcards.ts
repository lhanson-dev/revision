import { flashcards as authoredFlashcards } from './flashcards'
import { fastPathFlashcards } from './fast-path-flashcards'

// Both author-authored and generated Practice assets enter the ordinary validated
// course pack. The learner app must not need to know a course's asset source.
export const publishedFlashcards = [...authoredFlashcards, ...fastPathFlashcards]
