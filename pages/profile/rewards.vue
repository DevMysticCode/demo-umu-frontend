<template>
  <div class="rw-page mobile-container">
    <div class="rw-nav-bar">
      <button class="rw-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="rw-nav-title">Rewards</div>
      <div class="rw-nav-icon-btn" aria-hidden="true" />
    </div>

    <main class="rw-body">
      <div class="rw-hero">
        <div class="rw-hero-lab">Points balance</div>
        <div v-if="loadingBalance" class="rw-hero-skel" />
        <div v-else class="rw-hero-num">{{ balance.toLocaleString('en-GB') }}</div>
        <p class="rw-hero-sub">Earned by completing your Property Passport. Redeemable in the Marketplace once it's live.</p>
      </div>

      <div class="rw-sec-title">History</div>

      <div v-if="loadingHistory && entries.length === 0" class="rw-loading">
        <div class="rw-spinner" />
      </div>

      <div v-else-if="entries.length === 0" class="rw-empty">
        <div class="rw-empty-ic">🎁</div>
        <div class="rw-empty-title">No points yet</div>
        <p class="rw-empty-sub">Answer questions in your Property Passport to start earning.</p>
      </div>

      <div v-else class="rw-list">
        <div v-for="entry in entries" :key="entry.id" class="rw-row">
          <div class="rw-row-icon" :class="entry.amount >= 0 ? 'rw-row-icon--credit' : 'rw-row-icon--debit'">
            {{ entry.amount >= 0 ? '+' : '−' }}
          </div>
          <div class="rw-row-body">
            <div class="rw-row-desc">{{ entry.description }}</div>
            <div class="rw-row-date">{{ formatDate(entry.createdAt) }}</div>
          </div>
          <div class="rw-row-right">
            <div class="rw-row-amount" :class="entry.amount >= 0 ? 'rw-amount--credit' : 'rw-amount--debit'">
              {{ entry.amount >= 0 ? '+' : '' }}{{ entry.amount.toLocaleString('en-GB') }}
            </div>
            <div class="rw-row-balance">balance {{ entry.balanceAfter.toLocaleString('en-GB') }}</div>
          </div>
        </div>

        <button v-if="nextCursor" class="rw-loadmore" :disabled="loadingHistory" @click="loadMore">
          {{ loadingHistory ? 'Loading…' : 'Load more' }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const goBack = useGoBack('/profile')

const balance = ref(0)
const loadingBalance = ref(true)
const entries = ref<any[]>([])
const nextCursor = ref<string | null>(null)
const loadingHistory = ref(true)

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null
}
function authHeaders() {
  return { Authorization: `Bearer ${token()}` }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function loadBalance() {
  try {
    const res: any = await $fetch(`${config.public.apiBase}/rewards/balance`, { headers: authHeaders() })
    balance.value = res?.balance ?? 0
  } catch {
    /* stays at 0 */
  } finally {
    loadingBalance.value = false
  }
}

async function loadHistory(cursor?: string) {
  loadingHistory.value = true
  try {
    const res: any = await $fetch(`${config.public.apiBase}/rewards/history`, {
      headers: authHeaders(),
      query: { limit: 20, ...(cursor ? { cursor } : {}) },
    })
    entries.value = cursor ? [...entries.value, ...(res?.entries ?? [])] : (res?.entries ?? [])
    nextCursor.value = res?.nextCursor ?? null
  } catch {
    /* history just stays empty/stale on failure */
  } finally {
    loadingHistory.value = false
  }
}

function loadMore() {
  if (nextCursor.value) loadHistory(nextCursor.value)
}

onMounted(() => {
  loadBalance()
  loadHistory()
})
</script>

<style scoped>
.rw-page { --navy: #231d45; --teal: #00a19a; --muted: #6e6879; --line: #e7e4ec; }
.rw-nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; }
.rw-nav-icon-btn { width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid var(--line); background: #fff; display: grid; place-items: center; cursor: pointer; color: var(--navy); }
.rw-nav-title { font-size: 17px; font-weight: 700; color: var(--navy); }

.rw-body { padding: 0 16px 40px; }

.rw-hero { background: var(--navy); border-radius: 24px; padding: 26px 22px; color: #fff; text-align: center; box-shadow: 0 12px 28px rgba(35, 29, 69, 0.25); }
.rw-hero-lab { font-size: 11.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.8; }
.rw-hero-num { font-size: 40px; font-weight: 800; letter-spacing: -1.5px; margin: 10px 0 6px; color: #99f6e4; }
.rw-hero-skel { height: 44px; width: 140px; margin: 12px auto 6px; border-radius: 10px; background: rgba(255,255,255,0.12); }
.rw-hero-sub { font-size: 13px; opacity: 0.75; line-height: 1.45; margin: 0; }

.rw-sec-title { font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); margin: 24px 4px 10px; }

.rw-loading { display: flex; justify-content: center; padding: 40px 0; }
.rw-spinner { width: 28px; height: 28px; border: 3px solid var(--line); border-top-color: var(--teal); border-radius: 50%; animation: rw-spin 0.8s linear infinite; }
@keyframes rw-spin { to { transform: rotate(360deg); } }

.rw-empty { text-align: center; padding: 50px 20px; }
.rw-empty-ic { font-size: 34px; margin-bottom: 10px; }
.rw-empty-title { font-weight: 700; font-size: 16px; color: var(--navy); }
.rw-empty-sub { font-size: 13.5px; color: var(--muted); margin-top: 6px; line-height: 1.45; }

.rw-list { display: flex; flex-direction: column; gap: 10px; }
.rw-row { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 14px; }
.rw-row-icon { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 16px; flex-shrink: 0; }
.rw-row-icon--credit { background: #dff2e9; color: #186b48; }
.rw-row-icon--debit { background: #f7eaea; color: #8a3a3a; }
.rw-row-body { flex: 1; min-width: 0; }
.rw-row-desc { font-size: 13.5px; font-weight: 600; color: var(--navy); line-height: 1.35; }
.rw-row-date { font-size: 11.5px; color: var(--muted); margin-top: 3px; }
.rw-row-right { text-align: right; flex-shrink: 0; }
.rw-row-amount { font-weight: 800; font-size: 15px; }
.rw-amount--credit { color: #1f8f62; }
.rw-amount--debit { color: #a13a3a; }
.rw-row-balance { font-size: 10.5px; color: var(--muted); margin-top: 2px; }

.rw-loadmore { width: 100%; padding: 13px; border-radius: 14px; border: 1.5px solid var(--line); background: #fff; color: var(--navy); font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 4px; }
.rw-loadmore:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
