// Smart title case for passport task + section names that come from
// the seed data in ALL-Word-Capital form ("Name Of Sellers And Address
// Of The Property"). Grammatical rule: short articles / conjunctions /
// prepositions stay lowercase unless they open the sentence.
//
// Kept liberal — better a "the" that should be capital than a "Of"
// that shouldn't. If a case appears where a task name genuinely
// starts with e.g. "OR" as an acronym, we can add exceptions.

const SMALL_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in',
  'nor', 'of', 'on', 'or', 'per', 'so', 'the', 'to', 'up', 'via',
  'vs', 'with', 'yet',
])

export function toSmartTitleCase(input: string | null | undefined): string {
  if (!input) return ''
  const words = input.trim().split(/\s+/)
  return words
    .map((word, i) => {
      const lower = word.toLowerCase()
      // Never lowercase the first or last word — that reads odd
      // ("Name of Sellers and Address of the Property" is fine;
      // "The Property Of" would look truncated at the end).
      if (i === 0 || i === words.length - 1) return capitaliseFirst(word)
      if (SMALL_WORDS.has(lower)) return lower
      return capitaliseFirst(word)
    })
    .join(' ')
}

function capitaliseFirst(word: string): string {
  if (!word) return word
  // Keep any all-caps tokens (acronyms like EPC / TA6 / HMLR) as-is.
  if (word.length > 1 && word === word.toUpperCase()) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}
