<template>
  <div class="hs-idx-page">
    <!-- ── Top bar ──────────────────────────────────────── -->
    <div class="hs-idx-topbar">
      <button class="hs-idx-back" @click="router.back()" aria-label="Back">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="hs-idx-topbar-spacer"></div>
      <div class="hs-idx-topbar-spacer"></div>
    </div>

    <!-- ── Body ─────────────────────────────────────────── -->
    <div class="hs-idx-screen">
      <div class="hs-idx-brand-pill">
        <span class="hs-idx-pulse"></span>HealthScore™
      </div>

      <div class="hs-idx-headline">
        How energy efficient is any UK property?
      </div>
      <div class="hs-idx-subhead">
        Instantly scored from public EPC data. If it's your home, a 2-minute
        quiz refines it into your real number.
      </div>

      <div class="hs-idx-search-block">
        <PropertySearchInput
          placeholder="Postcode or address…"
          variant="light"
          :show-passport-status="true"
          @select="goToScore($event.id)"
          @enter="onSearchEnter"
        />
      </div>

      <button class="hs-idx-cta" @click="onCheckClick">
        Check HealthScore™
        <span class="hs-idx-cta-arrow">→</span>
      </button>

      <div class="hs-idx-trust-row">
        <span>Free</span>
        <span>Instant</span>
        <span>No account needed</span>
      </div>

      <div class="hs-idx-source-badge">
        <div class="hs-idx-source-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M2 22 L22 22 M4 22 L4 11 M20 22 L20 11 M8 22 L8 11 M16 22 L16 11 M12 22 L12 11 M2 11 L22 11 L12 4 Z"
            />
          </svg>
        </div>
        <div class="hs-idx-source-text">
          <span class="hs-idx-source-lbl">Powered by</span>
          <strong>EPC</strong> &amp; <strong>HM Land Registry</strong>
        </div>
      </div>

      <div class="hs-idx-how">
        <div class="hs-idx-how-label">How it works</div>
        <div class="hs-idx-step">
          <div class="hs-idx-step-num">1</div>
          <div class="hs-idx-step-body">
            <div class="hs-idx-step-title">Search any UK address</div>
            <div class="hs-idx-step-meta">
              Type a postcode and we'll match it to the right property
            </div>
          </div>
        </div>
        <div class="hs-idx-step">
          <div class="hs-idx-step-num">2</div>
          <div class="hs-idx-step-body">
            <div class="hs-idx-step-title">Get your real number</div>
            <div class="hs-idx-step-meta">
              Owners can refine it with a 2-minute quiz
            </div>
          </div>
        </div>
        <div class="hs-idx-step">
          <div class="hs-idx-step-num">3</div>
          <div class="hs-idx-step-body">
            <div class="hs-idx-step-title">See running costs &amp; risks</div>
            <div class="hs-idx-step-meta">
              £/year breakdown · flood, mining, planning
            </div>
          </div>
        </div>
      </div>

      <div style="height: 32px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'

const router = useRouter()

const lastQuery = ref('')

function goToScore(id: string) {
  router.push(`/homescore/${id}`)
}

function onSearchEnter(q: string) {
  lastQuery.value = q
}

function onCheckClick() {
  const input = document.querySelector<HTMLInputElement>(
    '.hs-idx-search-block input',
  )
  if (input) input.focus()
}
</script>

<style scoped>
.hs-idx-page {
  min-height: 100dvh;
  background: #fff;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.hs-idx-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 8px;
  padding-top: calc(14px + env(safe-area-inset-top));
  flex-shrink: 0;
  background: #fff;
}
.hs-idx-back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  display: grid;
  place-items: center;
  color: #00a19a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.hs-idx-topbar-spacer {
  width: 32px;
}

.hs-idx-screen {
  flex: 1;
  padding: 20px 24px 24px;
  background: #fff;
}

/* Brand pill */
.hs-idx-brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #00a19a;
  text-transform: uppercase;
  margin-bottom: 24px;
}
.hs-idx-pulse {
  width: 6px;
  height: 6px;
  background: #00a19a;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #e2f1ea;
}

/* Headline */
.hs-idx-headline {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #231d45;
  margin-bottom: 14px;
}
.hs-idx-subhead {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.55;
  margin-bottom: 28px;
  max-width: 320px;
}

/* Search */
.hs-idx-search-block {
  margin-bottom: 12px;
}

/* Primary CTA */
.hs-idx-cta {
  width: 100%;
  background: #00a19a;
  color: #fff;
  border: none;
  padding: 15px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.28);
  transition:
    transform 0.12s,
    box-shadow 0.15s;
  margin-bottom: 14px;
}
.hs-idx-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(0, 161, 154, 0.34);
}
.hs-idx-cta:active {
  transform: translateY(0);
}
.hs-idx-cta-arrow {
  font-size: 16px;
}

/* Trust pills */
.hs-idx-trust-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 18px;
}
.hs-idx-trust-row span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.hs-idx-trust-row span::before {
  content: '·';
  color: #94a3b8;
}
.hs-idx-trust-row span:first-child::before {
  display: none;
}

/* Source badge */
.hs-idx-source-badge {
  display: flex;
  align-items: center;
  gap: 11px;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 13px;
  color: #231d45;
  margin-bottom: 32px;
  font-weight: 600;
  letter-spacing: -0.01em;
  box-shadow: 0 1px 2px rgba(0, 140, 134, 0.04);
}
.hs-idx-source-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #00b5ad, #00a19a);
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 140, 134, 0.32);
}
.hs-idx-source-icon svg {
  width: 15px;
  height: 15px;
}
.hs-idx-source-text {
  flex: 1;
  line-height: 1.35;
}
.hs-idx-source-lbl {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #00a19a;
  display: block;
  margin-bottom: 1px;
}
.hs-idx-source-text strong {
  color: #231d45;
  font-weight: 800;
}

/* How it works */
.hs-idx-how {
  padding-top: 20px;
  border-top: 1px solid #eef0f6;
}
.hs-idx-how-label {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 14px;
}
.hs-idx-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 10px 0;
}
.hs-idx-step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 800;
}
.hs-idx-step-body {
  flex: 1;
}
.hs-idx-step-title {
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
}
.hs-idx-step-meta {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
  line-height: 1.4;
}
</style>
