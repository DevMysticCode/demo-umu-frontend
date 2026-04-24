<template>
  <div class="claim-root">
    <!-- Sticky topbar -->
    <div class="cl-topbar">
      <button class="cl-back" @click="onBack" aria-label="Back">‹</button>
      <div class="cl-top-text">
        <div class="cl-top-title">Find your property</div>
        <div class="cl-top-sub">Step 1 of 2</div>
      </div>
      <div class="cl-spacer" />
    </div>
    <div class="cl-prog-strip">
      <span style="width: 50%" />
    </div>

    <!-- Search screen -->
    <div class="cl-screen">
      <div class="cl-icon-square">🏠</div>
      <h1 class="cl-h2 cl-center">Which property are you claiming?</h1>
      <p class="cl-body cl-center cl-mb-lg">
        Enter your postcode and select your address. We'll verify ownership via
        HM Land Registry.
      </p>

      <div class="cl-field-wrap">
        <div class="cl-field-label">Postcode or address</div>
        <PropertySearchInput
          placeholder="e.g. SK7 4BL"
          variant="light"
          @select="onPropertySelect"
        />
      </div>

      <div class="cl-lock-note">
        <div class="cl-lock-ic">🔒</div>
        <div class="cl-lock-body">
          We verify ownership via
          <strong>HM Land Registry</strong> — encrypted and never sold.
        </div>
      </div>

      <div v-if="resolving" class="cl-resolving">
        <div class="cl-resolving-spinner" />
        <div>Taking you to your property…</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'

definePageMeta({
  middleware: 'auth',
  title: 'Claim your Property Passport',
})

const router = useRouter()
const resolving = ref(false)

function onPropertySelect(property: any) {
  if (!property?.id) return
  resolving.value = true
  router.push(`/claim/${property.id}`)
}

function onBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/explore')
  }
}
</script>

<style scoped>
.claim-root {
  min-height: 100dvh;
  background: #fff;
  --brand: #00a19a;
  --brand-pale: #f0fdfa;
  --brand-soft: #99f6e4;
  --brand-dark: #007d78;
  --navy: #231d45;
  --ink: #1a1a2e;
  --ink-soft: #4a4a6a;
  --ink-faint: #9090a8;
  --line: #e8e8f0;
}

.cl-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 10px;
  background: #fff;
  border-bottom: 1px solid var(--line);
}
.cl-back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: #fff;
  font-size: 22px;
  line-height: 1;
  color: var(--navy);
  cursor: pointer;
  display: grid;
  place-items: center;
  padding-bottom: 3px;
}
.cl-top-text { flex: 1; min-width: 0; }
.cl-top-title { font-size: 14px; font-weight: 800; color: var(--navy); letter-spacing: -0.01em; }
.cl-top-sub { font-size: 11px; color: var(--ink-faint); margin-top: 1px; }
.cl-spacer { width: 32px; }

.cl-prog-strip {
  height: 3px;
  background: var(--line);
  overflow: hidden;
}
.cl-prog-strip span {
  display: block;
  height: 100%;
  background: var(--brand);
  transition: width 0.3s ease;
}

.cl-screen {
  padding: 24px 20px 40px;
  max-width: 520px;
  margin: 0 auto;
}

.cl-icon-square {
  width: 64px;
  height: 64px;
  background: var(--brand-pale);
  border: 2px solid var(--brand-soft);
  border-radius: 20px;
  display: grid;
  place-items: center;
  margin: 0 auto 18px;
  font-size: 30px;
}
.cl-h2 {
  font-size: 20px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.02em;
  margin: 0 0 6px;
  line-height: 1.25;
}
.cl-center { text-align: center; }
.cl-body {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.55;
  margin: 0 0 16px;
}
.cl-mb-lg { margin-bottom: 24px; }

.cl-field-wrap { margin-bottom: 16px; }
.cl-field-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-soft);
  margin-bottom: 6px;
  letter-spacing: 0.02em;
}

.cl-lock-note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  background: var(--brand-pale);
  border: 1px solid var(--brand-soft);
  border-radius: 12px;
}
.cl-lock-ic { font-size: 18px; flex-shrink: 0; }
.cl-lock-body {
  font-size: 12px;
  color: var(--ink-soft);
  line-height: 1.5;
}
.cl-lock-body strong { color: var(--ink); }

.cl-resolving {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--ink-soft);
  font-size: 13px;
  font-weight: 600;
}
.cl-resolving-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--line);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: cl-spin 0.7s linear infinite;
}
@keyframes cl-spin {
  to { transform: rotate(360deg); }
}
</style>
