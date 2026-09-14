<template>
  <Teleport to="body">
    <div v-if="modelValue" class="agm-overlay" @click.self="close">
      <div
        ref="cardEl"
        class="agm-card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        @keydown="onKeydown"
      >
        <div class="agm-ic">
          <img src="/op-icons/claim/padlock.png" alt="" loading="lazy" />
        </div>
        <div :id="titleId" class="agm-title">{{ title }}</div>
        <div class="agm-sub">{{ body }}</div>
        <button type="button" class="agm-primary" @click="go('signup')">
          Create free account
        </button>
        <button type="button" class="agm-secondary" @click="go('signin')">
          I already have an account
        </button>
        <button type="button" class="agm-ghost" @click="close" aria-label="Not now, close dialog">Not now</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, useId } from 'vue'

// Shared "Create account / Sign in" gate — same overlay pattern already
// used inline on pages/homescore/[id].vue (.hs-authgate-*) and
// components/property/PassportClaimBox.vue (.authd-*), factored out so
// new call sites (starting with discover.vue) don't copy-paste a third
// inline version. Those two existing flows are left untouched — this is
// additive, not a refactor of working code.
const props = defineProps<{
  modelValue: boolean
  title: string
  body: string
  // Where to send the user after they authenticate — stored the same
  // way the existing auth-gate flows already do (redirectAfterLogin),
  // consumed by onboarding/signin.vue, welcome.vue and thank-you.vue.
  redirectTarget?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const titleId = `agm-title-${useId()}`
const cardEl = ref<HTMLElement | null>(null)
let triggerEl: HTMLElement | null = null

function focusables() {
  if (!cardEl.value) return []
  return Array.from(
    cardEl.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    close()
    return
  }
  if (e.key !== 'Tab') return
  const items = focusables()
  if (!items.length) {
    e.preventDefault()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      triggerEl = document.activeElement as HTMLElement
      nextTick(() => {
        const items = focusables()
        ;(items[0] || cardEl.value)?.focus()
      })
    } else if (triggerEl && typeof triggerEl.focus === 'function') {
      triggerEl.focus()
      triggerEl = null
    }
  },
)

function close() {
  emit('update:modelValue', false)
}

function go(mode: 'signup' | 'signin') {
  if (props.redirectTarget && typeof localStorage !== 'undefined') {
    localStorage.setItem('redirectAfterLogin', props.redirectTarget)
  }
  emit('update:modelValue', false)
  navigateTo(mode === 'signup' ? '/onboarding/signup' : '/onboarding/signin')
}
</script>

<style scoped>
.agm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  padding: 20px;
}
.agm-card {
  width: 100%;
  max-width: 24rem;
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}
.agm-card:focus-visible {
  outline: 2px solid #00726c;
  outline-offset: -2px;
}
.agm-ic {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: #f0fdfa;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
  overflow: hidden;
}
.agm-ic img {
  width: 65px;
  height: 65px;
  object-fit: contain;
  display: block;
}
.agm-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: #1f2024;
  margin-bottom: 6px;
}
.agm-sub {
  font-size: 0.9375rem;
  color: #64748b;
  line-height: 1.55;
  margin-bottom: 18px;
}
.agm-primary {
  width: 100%;
  border: none;
  padding: 14px;
  border-radius: 12px;
  background: #00a19a;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 8px;
}
.agm-secondary {
  width: 100%;
  border: 1.5px solid #e4e5ed;
  padding: 13px;
  border-radius: 12px;
  background: #fff;
  color: #231d45;
  font-size: 0.875rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 8px;
  transition: background 0.15s;
}
.agm-secondary:hover {
  background: #f5f6fa;
}
.agm-ghost {
  width: 100%;
  border: none;
  padding: 12px;
  border-radius: 12px;
  background: transparent;
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
</style>
