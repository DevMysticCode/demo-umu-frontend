import { ref, watch, onBeforeUnmount, type Ref } from 'vue'

/**
 * Cycles a placeholder through a list of words with a type-then-erase
 * animation, e.g. "Type postcode" → "Type address" → "Type street name"
 * → back to "Type postcode", looping. Used to make it obvious a focused,
 * empty search field is for exploring properties - see dashboard.vue's
 * search bar, the first (and so far only) consumer.
 *
 * `active` (typically `isFocused && !modelValue`) controls the whole
 * animation: turning it off freezes/resets to the static full first word
 * so the field doesn't look like it's stuck mid-type when the user
 * clicks away or starts typing their own query.
 */
export function useTypewriterPlaceholder(
  active: Ref<boolean>,
  words: string[] = ['postcode', 'address', 'street name'],
  prefix = 'Type ',
  opts: { typeMs?: number; eraseMs?: number; holdMs?: number; pauseMs?: number } = {},
) {
  const { typeMs = 55, eraseMs = 35, holdMs = 1100, pauseMs = 300 } = opts

  const text = ref(prefix + (words[0] ?? ''))
  let timer: ReturnType<typeof setTimeout> | null = null
  let wordIndex = 0

  function clear() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  function schedule(fn: () => void, ms: number) {
    clear()
    timer = setTimeout(fn, ms)
  }

  function typeWord(word: string, charIndex: number) {
    text.value = prefix + word.slice(0, charIndex)
    if (charIndex < word.length) {
      schedule(() => typeWord(word, charIndex + 1), typeMs)
    } else {
      schedule(() => eraseWord(word, word.length), holdMs)
    }
  }

  function eraseWord(word: string, charIndex: number) {
    text.value = prefix + word.slice(0, charIndex)
    if (charIndex > 0) {
      schedule(() => eraseWord(word, charIndex - 1), eraseMs)
    } else {
      wordIndex = (wordIndex + 1) % words.length
      schedule(() => typeWord(words[wordIndex], 0), pauseMs)
    }
  }

  watch(
    active,
    (isActive) => {
      clear()
      if (isActive) {
        wordIndex = 0
        typeWord(words[0] ?? '', 0)
      } else {
        // Reset to the full first word so a re-focus always starts clean,
        // and so nothing looks "cut off" while inactive.
        text.value = prefix + (words[0] ?? '')
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(clear)

  return { text }
}
