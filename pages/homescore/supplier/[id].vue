<template>
  <div v-if="supplier" class="mp-supplier">
    <div class="app-header">
      <button class="back-btn" type="button" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">Supplier</div>
        <div class="app-header-sub">UProtect verified</div>
      </div>
      <div class="app-header-right">
        <button class="app-icon-btn" type="button" aria-label="Bookmark">🔖</button>
      </div>
    </div>

    <!-- Hero -->
    <div class="mp-sup-hero anim-1">
      <div class="mp-sup-hero-top">
        <div class="mp-sup-hero-avatar" :style="{ background: `linear-gradient(135deg, ${supplier.gradient[0]}, ${supplier.gradient[1]})` }">
          {{ supplier.initial }}
        </div>
        <div class="mp-sup-hero-info">
          <div class="mp-sup-hero-name">{{ supplier.name }}</div>
          <div class="mp-sup-hero-meta">
            ★ <b>{{ supplier.rating }}</b> · {{ supplier.reviews }} reviews ·
            {{ supplier.jobsDone }} jobs done<template v-if="supplier.respondsIn"> · responds {{ supplier.respondsIn }}</template>
          </div>
          <span class="mp-sup-verified">✓ Verified · {{ supplier.cert }}<template v-if="supplier.tier"> · {{ tierLabel(supplier.tier) }}</template></span>
        </div>
      </div>
      <div class="mp-sup-stats">
        <div class="mp-sup-stat">
          <div class="mp-sup-stat-num">{{ supplier.onTime ?? '—' }}%</div>
          <div class="mp-sup-stat-label">On time</div>
        </div>
        <div class="mp-sup-stat">
          <div class="mp-sup-stat-num">{{ supplier.onBudget ?? '—' }}%</div>
          <div class="mp-sup-stat-label">On budget</div>
        </div>
        <div class="mp-sup-stat">
          <div class="mp-sup-stat-num">{{ supplier.quality ?? '—' }}★</div>
          <div class="mp-sup-stat-label">Quality</div>
        </div>
      </div>
    </div>

    <!-- Reviews -->
    <div v-if="supplier.reviewQuotes?.length" class="mp-sup-section anim-2">
      <div class="mp-sup-section-h">What customers say</div>
      <div
        v-for="(r, i) in supplier.reviewQuotes"
        :key="i"
        class="mp-sup-review"
      >
        <div class="mp-sup-review-head">
          <span class="mp-sup-review-stars">{{ stars(r.stars) }}</span> {{ r.by }}
        </div>
        <div class="mp-sup-review-body">{{ r.body }}</div>
      </div>
    </div>

    <!-- Certifications -->
    <div v-if="supplier.certifications?.length" class="mp-sup-section anim-2">
      <div class="mp-sup-section-h">Qualifications &amp; insurance</div>
      <div class="mp-sup-cert-list">
        <div
          v-for="(cert, i) in supplier.certifications"
          :key="i"
          class="mp-sup-cert-row"
        >
          <span class="check">✓</span>
          <span v-html="formatCert(cert)" />
        </div>
      </div>
    </div>

    <!-- Highlights -->
    <div v-if="supplier.qualities?.length" class="mp-sup-section anim-2">
      <div class="mp-sup-section-h">Why customers rate them highly</div>
      <div class="mp-sup-qual-chips">
        <span v-for="q in supplier.qualities" :key="q" class="match-chip">{{ q }}</span>
      </div>
    </div>

    <!-- CTA -->
    <div class="bottom-cta">
      <button class="bottom-cta-btn" type="button" @click="goPostJob">
        💷 Request a quote · free
      </button>
      <button class="bottom-cta-secondary" type="button" @click="goMessages">
        💬 Message {{ supplier.name.split(' ')[0] }}
      </button>
    </div>

    <div style="height: 32px" />
  </div>
  <div v-else class="mp-supplier-empty">Supplier not found.</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMarketplaceMock } from '~/composables/useMarketplaceMock'

const route = useRoute()
const router = useRouter()
const { getSupplier } = useMarketplaceMock()

const supplier = computed(() => getSupplier(String(route.params.id)))

function tierLabel(tier: string) {
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} tier`
}

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function formatCert(text: string) {
  // Bold the part before the first " · " — usually the cert name.
  const parts = text.split(' · ')
  if (parts.length === 1) return `<b>${text}</b>`
  return `<b>${parts[0]}</b> · ${parts.slice(1).join(' · ')}`
}

function goPostJob() {
  router.push('/homescore/jobs/new')
}
function goMessages() {
  router.push('/homescore/messages')
}
</script>

<style scoped>
.mp-supplier {
  --primary: #231d45;
  --primary-2: #352d5c;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --page: #f0f2f8;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.mp-supplier-empty {
  padding: 80px 24px;
  text-align: center;
  color: #6b7089;
  font-weight: 600;
}

@keyframes mpFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.anim-1 { animation: mpFadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-2 { animation: mpFadeUp 0.35s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* Header */
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: var(--card);
  border-bottom: 1px solid var(--border);
}
.back-btn,
.app-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  flex-shrink: 0;
  font-family: inherit;
}
.back-btn svg { width: 16px; height: 16px; }
.app-header-info { flex: 1; min-width: 0; }
.app-header-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
}
.app-header-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
}

/* Hero */
.mp-sup-hero {
  margin: 14px 20px 0;
  padding: 18px;
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  border-radius: 14px;
  color: white;
  box-shadow: 0 10px 28px rgba(35, 29, 69, 0.22);
}
.mp-sup-hero-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mp-sup-hero-avatar {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
}
.mp-sup-hero-info { flex: 1; min-width: 0; }
.mp-sup-hero-name {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.3px;
  line-height: 1.1;
}
.mp-sup-hero-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 3px;
  flex-wrap: wrap;
}
.mp-sup-hero-meta b {
  color: white;
  font-weight: 800;
}
.mp-sup-verified {
  display: inline-block;
  margin-top: 6px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.3px;
  padding: 3px 9px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 100px;
}
.mp-sup-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}
.mp-sup-stat { text-align: center; }
.mp-sup-stat-num {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1;
}
.mp-sup-stat-label {
  font-size: 9.5px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-top: 3px;
}

/* Section */
.mp-sup-section {
  padding: 14px 16px;
  margin: 14px 20px 0;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
}
.mp-sup-section-h {
  font-size: 10.5px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.mp-sup-review { padding: 10px 0; }
.mp-sup-review + .mp-sup-review { border-top: 1px solid var(--border-soft); }
.mp-sup-review-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}
.mp-sup-review-stars { color: #f5a623; font-size: 12px; letter-spacing: 0.5px; }
.mp-sup-review-body {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
  font-style: italic;
}
.mp-sup-cert-list { display: flex; flex-direction: column; gap: 6px; }
.mp-sup-cert-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
}
.mp-sup-cert-row .check {
  color: var(--accent-dark);
  font-weight: 800;
}
.mp-sup-cert-row :deep(b) {
  color: var(--text);
  font-weight: 800;
}
.mp-sup-qual-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.match-chip {
  font-size: 10.5px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 100px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  color: var(--accent-dark);
}

/* Bottom CTAs */
.bottom-cta { padding: 16px 20px 24px; }
.bottom-cta-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.3);
}
.bottom-cta-secondary {
  width: 100%;
  padding: 14px;
  background: var(--card);
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}
</style>
