// Light / dark / auto theme switcher.
// Persists choice to localStorage; resolves "auto" via prefers-color-scheme.
// Toggling adds the `dark` class to <html>, which Tailwind picks up via
// `darkMode: 'class'` (set in tailwind.config). Pages that haven't been
// dark-mode-styled yet just stay light by default — adoption is gradual.

import type { Ref } from 'vue'

type Theme = 'light' | 'dark' | 'auto'
const STORAGE_KEY = 'umu_theme_v1'

// Lazy singletons — created on first useTheme() call so we never invoke
// ref() at module-load time (which can fire before Nuxt's Vue context is
// ready and trip Nitropack SSR).
let themeRef: Ref<Theme> | null = null
let resolvedRef: Ref<'light' | 'dark'> | null = null
let mql: MediaQueryList | null = null

function applyResolved() {
  if (!themeRef || !resolvedRef) return
  if (typeof document === 'undefined') return
  const next =
    themeRef.value === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : themeRef.value
  resolvedRef.value = next
  document.documentElement.classList.toggle('dark', next === 'dark')
}

function bindAutoListener() {
  if (!themeRef) return
  if (typeof window === 'undefined') return
  if (mql) mql.removeEventListener?.('change', applyResolved)
  if (themeRef.value === 'auto') {
    mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener?.('change', applyResolved)
  }
}

export function useTheme() {
  if (!themeRef) themeRef = ref<Theme>('auto')
  if (!resolvedRef) resolvedRef = ref<'light' | 'dark'>('light')

  function init() {
    if (typeof localStorage === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      themeRef!.value = saved
    }
    applyResolved()
    bindAutoListener()
  }

  function setTheme(next: Theme) {
    themeRef!.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
    applyResolved()
    bindAutoListener()
  }

  return {
    theme: themeRef,
    resolved: resolvedRef,
    setTheme,
    init,
  }
}
