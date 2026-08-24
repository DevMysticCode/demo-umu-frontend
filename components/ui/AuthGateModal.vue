<template>
  <Teleport to="body">
    <div v-if="modelValue" class="agm-overlay" @click.self="close">
      <div class="agm-card">
        <div class="agm-ic">
          <img src="/op-icons/claim/padlock.png" alt="" loading="lazy" />
        </div>
        <div class="agm-title">{{ title }}</div>
        <div class="agm-sub">{{ body }}</div>
        <button type="button" class="agm-primary" @click="go('signup')">
          Create free account
        </button>
        <button type="button" class="agm-secondary" @click="go('signin')">
          I already have an account
        </button>
        <button type="button" class="agm-ghost" @click="close">Not now</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
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
.agm-ic {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f0fdfa;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
  overflow: hidden;
}
.agm-ic img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  display: block;
}
.agm-title {
  font-size: 18px;
  font-weight: 800;
  color: #1f2024;
  margin-bottom: 6px;
}
.agm-sub {
  font-size: 15px;
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
  font-size: 14px;
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
  font-size: 14px;
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
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
</style>
