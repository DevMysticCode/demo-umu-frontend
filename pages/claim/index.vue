<template>
  <div class="claim-root mobile-container min-h-screen">
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
      <img src="/op-icons/landing/homeScoreCard.png" alt="" class="cl-search-hero-img" loading="lazy" />
      <h1 class="cl-h2 cl-center">Which property are you claiming?</h1>
      <p class="cl-body cl-center cl-mb-lg">
        Enter your postcode and select your address. We'll verify ownership via
        HM Land Registry.
      </p>

      <div class="cl-field-wrap">
        <div class="cl-field-label">Postcode or address</div>
        <PropertySearchInput
          placeholder="e.g. CV1 2EH or 123 High Street"
          variant="light"
          @select="onPropertySelect"
        />
      </div>

      <div class="cl-lock-note">
        <div class="cl-lock-ic"><img src="/op-icons/claim/padlock.png" alt="" loading="lazy" /></div>
        <div class="cl-lock-body">
          We verify ownership via
          <strong>HM Land Registry</strong> — encrypted and never sold.
        </div>
      </div>

      <div class="cl-private-bar">
        <img src="/op-icons/claim/padlock.png" alt="" loading="lazy" />
        Your data is private and secure
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

// No auth gate — guests can search for a property here too. The actual
// sign-in ask happens on /claim/[id], right when "Yes, this is my
// property" is tapped (the first point the flow needs to know who the
// user is).
definePageMeta({
  title: 'Claim your Property Passport',
})

const router = useRouter()
const resolving = ref(false)

function onPropertySelect(property: any) {
  if (!property?.id) return
  resolving.value = true
  router.push(`/claim/${property.id}`)
}

const onBack = useGoBack('/dashboard')
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

.cl-search-hero-img {
  width: 168px;
  height: 168px;
  object-fit: contain;
  display: block;
  margin: 8px auto 18px;
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
.cl-lock-ic {
  width: 65px;
  height: 65px;
  flex-shrink: 0;
}
.cl-lock-ic img { width: 100%; height: 100%; object-fit: contain; display: block; }
.cl-lock-body {
  font-size: 12px;
  color: var(--ink-soft);
  line-height: 1.5;
}
.cl-lock-body strong { color: var(--ink); }

.cl-private-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
  padding: 12px 14px;
  background: #f5f6fa;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--navy);
}
.cl-private-bar img {
  width: 25px;
  height: 25px;
  object-fit: contain;
}

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
