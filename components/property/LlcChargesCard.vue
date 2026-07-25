<template>
  <div class="llc-card">
    <!-- Header -->
    <div class="llc-header">
      <img
        src="/op-icons/property/landCharges.png"
        alt=""
        class="llc-header-ic"
        loading="lazy"
      />
      <div class="llc-header-body">
        <div class="llc-header-title">Local Land Charges</div>
        <div class="llc-header-sub">HM Land Registry · indicative search</div>
      </div>
      <button
        v-if="data && !loading"
        class="llc-refresh"
        type="button"
        :disabled="refreshing"
        aria-label="Refresh"
        @click="onRefresh"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="llc-empty">
      <div class="llc-empty-ic">⏳</div>
      <div class="llc-empty-title">Checking HM Land Registry…</div>
    </div>

    <!-- Signed-out / auth error -->
    <div v-else-if="!data" class="llc-empty">
      <div class="llc-empty-ic"><img src="/op-icons/investment/padlock.png" alt="" loading="lazy" /></div>
      <div class="llc-empty-title">Sign in to see LLC data</div>
      <div class="llc-empty-sub">Local Land Charges are shown to signed-in users only.</div>
    </div>

    <!-- Empty (200 OK, no charges) — a positive signal -->
    <div v-else-if="data.status === 'OK_EMPTY'" class="llc-empty llc-empty--good">
      <div class="llc-empty-ic">✓</div>
      <div class="llc-empty-title">No active Local Land Charges</div>
      <div class="llc-empty-sub">
        HM Land Registry has no charges registered against this property
        or its boundary.
      </div>
    </div>

    <!-- Council not migrated (E435) -->
    <div v-else-if="data.status === 'NOT_MIGRATED'" class="llc-empty llc-empty--warn">
      <div class="llc-empty-ic"><img src="/op-icons/investment/landmarks.png" alt="" loading="lazy" /></div>
      <div class="llc-empty-title">This council hasn't moved to HM Land Registry yet</div>
      <div class="llc-empty-sub">
        LLC data for this area is still held by the local authority.
        Your solicitor will run the official LLC1 search there during
        conveyancing.
      </div>
    </div>

    <!-- Ambiguous parcel (E425) -->
    <div v-else-if="data.status === 'MULTI_GEOMETRY'" class="llc-empty llc-empty--warn">
      <div class="llc-empty-ic">🗺️</div>
      <div class="llc-empty-title">Parcel boundary is ambiguous</div>
      <div class="llc-empty-sub">
        HM Land Registry couldn't resolve a single parcel for this
        address. The official search on
        <a href="https://search-local-land-charges.service.gov.uk"
           target="_blank" rel="noopener">gov.uk</a>
        can still be run manually.
      </div>
    </div>

    <!-- Generic error -->
    <div v-else-if="data.status === 'ERROR'" class="llc-empty llc-empty--warn">
      <div class="llc-empty-ic">⚠️</div>
      <div class="llc-empty-title">Couldn't fetch LLC data right now</div>
      <div class="llc-empty-sub">{{ data.errorMessage || 'Try again in a moment.' }}</div>
    </div>

    <!-- Charges present -->
    <template v-else-if="data.status === 'OK_WITH_CHARGES'">
      <!-- Summary strip -->
      <div class="llc-summary">
        <div class="llc-summary-tile">
          <div class="llc-summary-num">{{ directCharges.length }}</div>
          <div class="llc-summary-lbl">Direct charge{{ directCharges.length === 1 ? '' : 's' }}</div>
        </div>
        <div class="llc-summary-tile">
          <div class="llc-summary-num">{{ boundaryCharges.length }}</div>
          <div class="llc-summary-lbl">On neighbour{{ boundaryCharges.length === 1 ? '' : 's' }}</div>
        </div>
      </div>

      <!-- Direct charges -->
      <template v-if="directCharges.length">
        <div class="llc-section-title">On this property</div>
        <div class="llc-charge-list">
          <div v-for="c in directCharges" :key="c.id" class="llc-charge">
            <div class="llc-charge-head">
              <span class="llc-charge-cat" :class="categoryClass(c.category)">
                {{ categoryIcon(c.category) }} {{ c.category }}
                <template v-if="c.subCategory"> · {{ c.subCategory }}</template>
              </span>
              <span v-if="c.registrationDate" class="llc-charge-date">
                {{ formatYear(c.registrationDate) }}
              </span>
            </div>
            <div v-if="c.description" class="llc-charge-desc" :class="{ 'llc-redacted': isRedacted(c.description) }">
              {{ isRedacted(c.description) ? '🔒 Full text available on the official search result only.' : c.description }}
            </div>
            <div class="llc-charge-meta">
              <span v-if="c.legalDocument">{{ c.legalDocument }}</span>
              <span v-if="c.law" class="llc-charge-law">{{ c.law }}</span>
            </div>
            <div v-if="c.authorityReference" class="llc-charge-ref">
              Council ref: <b>{{ c.authorityReference }}</b>
            </div>
          </div>
        </div>
      </template>

      <!-- Boundary (neighbour) charges -->
      <template v-if="boundaryCharges.length">
        <div class="llc-section-title llc-section-title--muted">
          On neighbouring properties
        </div>
        <div class="llc-charge-list">
          <div v-for="c in boundaryCharges" :key="c.id" class="llc-charge llc-charge--boundary">
            <div class="llc-charge-head">
              <span class="llc-charge-cat" :class="categoryClass(c.category)">
                {{ categoryIcon(c.category) }} {{ c.category }}
                <template v-if="c.subCategory"> · {{ c.subCategory }}</template>
              </span>
              <span v-if="c.registrationDate" class="llc-charge-date">
                {{ formatYear(c.registrationDate) }}
              </span>
            </div>
            <div v-if="c.location" class="llc-charge-loc">📍 {{ c.location }}</div>
            <div v-if="c.description" class="llc-charge-desc" :class="{ 'llc-redacted': isRedacted(c.description) }">
              {{ isRedacted(c.description) ? '🔒 Full text available on the official search result only.' : c.description }}
            </div>
          </div>
        </div>
      </template>

      <!-- Warnings from HMLR (e.g. near non-migrated border) -->
      <div v-if="data.warnings.length" class="llc-warnings">
        <div v-for="(w, i) in data.warnings" :key="i" class="llc-warning">⚠️ {{ w }}</div>
      </div>
    </template>

    <!-- Disclaimer + attribution — required for all non-error states,
         so it renders as long as we have any HMLR response. -->
    <div v-if="data" class="llc-footer">
      <div class="llc-disclaimer">
        <b>Indicative only.</b> This is not an official Local Land Charges
        search. Your solicitor will run the official LLC1 &amp; CON29
        during conveyancing.
      </div>
      <div class="llc-attribution">
        Data © Crown copyright and database right, HM Land Registry
        <template v-if="data.searchedAt">
          · checked {{ formatWhen(data.searchedAt) }}
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLlc, type LlcSearch, type LlcCharge } from '~/composables/useLlc'

const props = defineProps<{ propertyId: string }>()

const { fetchLlc, refreshLlc } = useLlc()
const data = ref<LlcSearch | null>(null)
const loading = ref(false)
const refreshing = ref(false)

async function load() {
  loading.value = true
  data.value = await fetchLlc(props.propertyId)
  loading.value = false
}

async function onRefresh() {
  refreshing.value = true
  const next = await refreshLlc(props.propertyId)
  if (next) data.value = next
  refreshing.value = false
}

watch(() => props.propertyId, () => { if (props.propertyId) load() }, { immediate: true })

const directCharges = computed<LlcCharge[]>(
  () => data.value?.charges.filter((c) => !c.boundary) ?? [],
)
const boundaryCharges = computed<LlcCharge[]>(
  () => data.value?.charges.filter((c) => c.boundary) ?? [],
)

// HMLR pre-redacts Housing Grant / LON / Pipeline descriptions with
// this literal string. We render it as a lock icon + explainer rather
// than pretending it's a real description (fabricating substitute text
// would violate the license terms).
function isRedacted(description: string | null) {
  return !!description && description.trim() === 'Viewable on official search result'
}

function categoryIcon(cat: string): string {
  const c = (cat ?? '').toLowerCase()
  if (c.includes('planning')) return '🏗️'
  if (c.includes('housing') || c.includes('building')) return '🏠'
  if (c.includes('financial')) return '💷'
  if (c.includes('light')) return '💡'
  if (c.includes('other')) return '📌'
  return '📄'
}

function categoryClass(cat: string): string {
  const c = (cat ?? '').toLowerCase()
  if (c.includes('planning')) return 'llc-cat--planning'
  if (c.includes('financial')) return 'llc-cat--financial'
  if (c.includes('housing') || c.includes('building')) return 'llc-cat--housing'
  if (c.includes('light')) return 'llc-cat--light'
  return 'llc-cat--other'
}

function formatYear(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : String(d.getFullYear())
}

function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const diffDays = Math.round((Date.now() - d.getTime()) / 86400000)
  if (diffDays < 1) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.llc-card {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(35, 29, 69, 0.06);
  border: 1px solid #eaeaef;
  margin: 16px 0;
  font-family: inherit;
  color: #231d45;
}

/* header */
.llc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0eff5;
}
.llc-header-ic {
  width: 48px;
  height: 48px;
  object-fit: contain;
  flex-shrink: 0;
}
.llc-header-body { flex: 1; min-width: 0 }
.llc-header-title {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.llc-header-sub {
  font-size: 11.5px;
  color: #6b6880;
  font-weight: 500;
  margin-top: 2px;
}
.llc-refresh {
  background: #f5f4fa;
  border: none;
  width: 34px; height: 34px;
  border-radius: 10px;
  cursor: pointer;
  color: #4a4665;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.14s;
}
.llc-refresh:hover { background: #ebeaf3 }
.llc-refresh:disabled { opacity: 0.5; cursor: not-allowed }
.llc-refresh svg { width: 16px; height: 16px }

/* empty / status states */
.llc-empty {
  text-align: center;
  padding: 22px 12px 6px;
}
.llc-empty-ic { width: 42px; height: 42px; margin: 0 auto; }
.llc-empty-ic img { width: 100%; height: 100%; object-fit: contain; display: block; }
.llc-empty-title {
  font-size: 14.5px;
  font-weight: 800;
  margin-top: 8px;
  color: #231d45;
}
.llc-empty-sub {
  font-size: 12.5px;
  color: #6b6880;
  font-weight: 500;
  margin-top: 6px;
  line-height: 1.5;
}
.llc-empty-sub a { color: #00857f; font-weight: 700 }
.llc-empty--good .llc-empty-ic {
  color: #2e9e6b;
  background: #e4f4ec;
  width: 46px; height: 46px;
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 22px;
  margin: 0 auto;
}
.llc-empty--warn .llc-empty-title { color: #7a5b1a }

/* summary strip */
.llc-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}
.llc-summary-tile {
  background: #fafaff;
  border: 1px solid #eeecf5;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}
.llc-summary-num {
  font-size: 22px;
  font-weight: 800;
  color: #231d45;
}
.llc-summary-lbl {
  font-size: 11px;
  color: #6b6880;
  font-weight: 700;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* section titles */
.llc-section-title {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #4a4665;
  margin: 18px 0 10px;
}
.llc-section-title--muted { color: #8a86a3 }

/* charges */
.llc-charge-list { display: flex; flex-direction: column; gap: 10px }
.llc-charge {
  border: 1px solid #ecebf3;
  border-radius: 13px;
  padding: 13px 14px;
  background: #fff;
}
.llc-charge--boundary { background: #fafaff }
.llc-charge-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.llc-charge-cat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 800;
  padding: 4px 9px;
  border-radius: 8px;
  letter-spacing: 0.02em;
}
.llc-cat--planning  { background: #eef4ff; color: #3350a6 }
.llc-cat--financial { background: #fff2e6; color: #a35a12 }
.llc-cat--housing   { background: #e4f4ec; color: #256b45 }
.llc-cat--light     { background: #fff8e0; color: #8a6a10 }
.llc-cat--other     { background: #f3effb; color: #5a4790 }
.llc-charge-date {
  margin-left: auto;
  font-size: 11.5px;
  color: #6b6880;
  font-weight: 700;
}
.llc-charge-loc {
  font-size: 12px;
  color: #6b6880;
  font-weight: 600;
  margin-top: 8px;
}
.llc-charge-desc {
  font-size: 13px;
  color: #2f2a4a;
  line-height: 1.5;
  margin-top: 8px;
  font-weight: 500;
}
.llc-charge-desc.llc-redacted {
  color: #6b6880;
  font-style: italic;
  background: #faf8f2;
  border: 1px dashed #e8dfc4;
  border-radius: 8px;
  padding: 8px 10px;
}
.llc-charge-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
  font-size: 11.5px;
  color: #6b6880;
  font-weight: 600;
}
.llc-charge-law { color: #8a86a3; font-style: italic; font-weight: 500 }
.llc-charge-ref {
  font-size: 11.5px;
  color: #6b6880;
  font-weight: 500;
  margin-top: 6px;
}
.llc-charge-ref b { color: #231d45; font-weight: 700 }

/* warnings from HMLR */
.llc-warnings { margin-top: 14px; display: flex; flex-direction: column; gap: 8px }
.llc-warning {
  background: #fff8e0;
  border: 1px solid #f0e2a8;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12.5px;
  color: #7a5b1a;
  font-weight: 600;
  line-height: 1.4;
}

/* footer — required for approved-user display terms */
.llc-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0eff5;
}
.llc-disclaimer {
  font-size: 11.5px;
  color: #6b6880;
  font-weight: 500;
  line-height: 1.5;
}
.llc-disclaimer b { color: #231d45 }
.llc-attribution {
  font-size: 10.5px;
  color: #8a86a3;
  font-weight: 500;
  margin-top: 6px;
  letter-spacing: 0.02em;
}
</style>
