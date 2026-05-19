<template>
  <div class="sh-page">
    <!-- Top nav -->
    <div class="sh-top-nav">
      <button class="sh-back" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div class="sh-nav-centre">Share Profile</div>
      <span class="sh-nav-right" @click="goView">Done</span>
    </div>

    <!-- Tab switcher -->
    <div class="sh-tabs-wrap">
      <div class="how-tabs">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="how-tab"
          :class="{ active: activeTab === t.id }"
          @click="activeTab = t.id"
        >
          <template v-if="t.id === 'active' && activeCount > 0">
            Active ●
          </template>
          <template v-else-if="t.id === 'link'">Link &amp; QR</template>
          <template v-else>{{ t.label }}</template>
        </button>
      </div>
    </div>

    <!-- ── SEND tab ── -->
    <div v-if="activeTab === 'people'" class="sh-pane">
      <!-- Scope disclosure -->
      <div class="scope-panel">
        <div class="scope-title">📋 THEY WILL SEE</div>
        <div class="scope-row">
          <div class="scope-check"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></div>
          ID Verified (Onfido / DVS)
        </div>
        <div v-if="passport?.fundsAmount" class="scope-row">
          <div class="scope-check"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></div>
          Budget — up to {{ fundsShort }}
        </div>
        <div class="scope-row">
          <div class="scope-check"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></div>
          {{ chainShort }}{{ passport?.solicitorStatus === 'yes' ? ' · solicitor instructed' : '' }}
        </div>
        <div v-if="passport?.statement" class="scope-row">
          <div class="scope-check"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></div>
          Your story (optional)
        </div>
        <div class="scope-hidden">
          🔒 Not shared: personal address, full name, date of birth, account numbers
        </div>
      </div>

      <span class="sec-label">SEND TO AGENT</span>
      <div class="recipient-card">
        <div
          v-for="a in agentSuggestions"
          :key="a.id"
          class="recipient-row"
        >
          <div class="avatar" :style="{ background: sentSet.has(a.id) ? '#00a19a' : '#231d45' }">
            {{ a.initials }}
          </div>
          <div class="recipient-meta">
            <div class="recipient-firm">{{ a.firm }}</div>
            <div class="recipient-name">{{ a.name }}</div>
          </div>
          <button
            v-if="!sentSet.has(a.id)"
            class="send-btn"
            :disabled="sending"
            @click="onSend(a)"
          >
            ⤴ Send
          </button>
          <span v-else class="sent-badge">✓ Sent</span>
        </div>
      </div>

      <button
        class="sh-link-instead"
        @click="activeTab = 'link'"
      >
        Or share a link instead →
      </button>
    </div>

    <!-- ── ACTIVE tab ── -->
    <div v-else-if="activeTab === 'active'" class="sh-pane">
      <span class="sec-label">WHO HAS ACCESS</span>
      <div v-if="loadingShares" class="sh-empty">Loading…</div>
      <div v-else-if="shares.length === 0" class="sh-empty">
        No active shares yet. Send a link from the Send tab.
      </div>
      <div v-else class="teal-card sh-list">
        <div
          v-for="s in shares"
          :key="s.id"
          class="share-entry"
          :class="{ revoked: !!s.revokedAt }"
        >
          <div class="avatar" :style="{ background: s.revokedAt ? '#9c98ad' : '#00a19a' }">
            {{ initialsFor(s.recipientName) }}
          </div>
          <div class="share-meta">
            <div class="share-name">{{ s.recipientName || 'Unnamed share' }}</div>
            <div class="share-scope">{{ scopeShort(s.scope) }}</div>
            <div class="share-expiry">
              <template v-if="s.revokedAt">Revoked</template>
              <template v-else-if="isExpired(s)">⏱ Expired</template>
              <template v-else>⏱ Expires in {{ daysUntil(s.expiresAt) }} days</template>
            </div>
          </div>
          <button
            v-if="!s.revokedAt && !isExpired(s)"
            class="revoke-btn"
            @click="onRevoke(s.id)"
          >
            Revoke
          </button>
          <span v-else class="revoke-disabled">—</span>
        </div>
      </div>
      <p class="sh-expires-note">
        Access expires automatically after 30 days.<br />
        You can revoke at any time.
      </p>
      <div class="sh-cta-wrap">
        <button class="cta-btn outline" @click="activeTab = 'people'">
          + Send to another agent
        </button>
      </div>
    </div>

    <!-- ── LINK & QR tab ── -->
    <div v-else-if="activeTab === 'link'" class="sh-pane">
      <span class="sec-label">YOUR UNIQUE LINK</span>
      <div class="teal-card sh-link-card">
        <div class="sh-link-url">
          {{ canonicalShareLink }}
        </div>
        <button class="sh-link-copy" @click="copyLink">Copy link</button>
      </div>

      <!-- QR code -->
      <div class="navy-card sh-qr-card">
        <div class="sh-qr-frame">
          <div class="sh-qr-canvas" ref="qrCanvasEl">
            <!-- Skeleton until the QR resolves -->
            <div class="sh-qr-skeleton" />
          </div>
        </div>
        <div class="sh-qr-meta">Scan to verify</div>
        <button class="sh-qr-save" type="button" @click="downloadQr">
          📥 Save QR
        </button>
      </div>
      <p class="sh-expires-note">
        Valid for 30 days · Share only with trusted parties
      </p>
    </div>

    <!-- ── PDF tab ── -->
    <div v-else-if="activeTab === 'pdf'" class="sh-pane">
      <span class="sec-label">DOWNLOAD YOUR PROFILE</span>
      <!-- Preview card -->
      <div class="sh-pdf-preview">
        <div class="sh-pdf-eyebrow">UMU BUYER PROFILE</div>
        <div class="sh-pdf-tagline">"Trusted, ready, chain-free."</div>
        <div class="sh-pdf-name">{{ displayName }}</div>
        <div class="sh-pdf-pills">
          <span class="sh-pdf-pill">🪪 ID Verified</span>
          <span v-if="fundsShort" class="sh-pdf-pill">{{ fundsShort }} Funds</span>
          <span class="sh-pdf-pill">{{ chainShort }}</span>
        </div>
      </div>
      <div class="sh-cta-wrap">
        <button class="cta-btn" @click="goPdf">📄 Preview & Download PDF</button>
      </div>
      <button class="sh-sign-link" @click="goSign">✍️ Add digital signature</button>
      <p class="sh-pdf-note">
        PDF includes your verified badge and is digitally signed by UMU
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import {
  useBuyerProfile,
  type BuyerProfile,
  type BuyerProfileShare,
} from '~/composables/useBuyerProfile'
import { useProfile } from '~/composables/useProfile'
import { useAppToast } from '~/composables/useCustomToast'

definePageMeta({ title: 'Share Profile — UmovingU', middleware: 'auth' })

const router = useRouter()
const { getBuyerProfile, listShares, createShare, revokeShare } = useBuyerProfile()
const { fetchProfile, profile } = useProfile()
const { showToast } = useAppToast()

type TabId = 'people' | 'active' | 'link' | 'pdf'
const tabs: { id: TabId; label: string }[] = [
  { id: 'people', label: 'Send' },
  { id: 'active', label: 'Active' },
  { id: 'link', label: 'Link' },
  { id: 'pdf', label: 'PDF' },
]
const activeTab = ref<TabId>('people')

const passport = ref<BuyerProfile | null>(null)
const shares = ref<BuyerProfileShare[]>([])
const loadingShares = ref(false)
const sending = ref(false)
const sentSet = ref(new Set<string>())

const agentSuggestions = [
  { id: 'JC', initials: 'JC', firm: 'Savills – Notting Hill', name: 'James Cooper' },
  { id: 'SM', initials: 'SM', firm: 'Knight Frank', name: 'Sarah Mitchell' },
  { id: 'DC', initials: 'DC', firm: 'Foxtons', name: 'David Chen' },
]

onMounted(async () => {
  fetchProfile?.().catch(() => {})
  await Promise.all([
    refreshProfile(),
    refreshShares(),
  ])
})
async function refreshProfile() {
  try {
    const p = await getBuyerProfile()
    passport.value = p
    if (!p) router.replace('/buyer-profile')
  } catch {
    router.replace('/buyer-profile')
  }
}

async function refreshShares() {
  loadingShares.value = true
  try {
    shares.value = await listShares()
    sentSet.value = new Set(
      shares.value
        .filter((s) => !s.revokedAt)
        .map((s) => initialsFor(s.recipientName || '').toUpperCase()),
    )
  } finally {
    loadingShares.value = false
  }
}

const activeCount = computed(
  () => shares.value.filter((s) => !s.revokedAt && !isExpired(s)).length,
)

// ── Display helpers ────────────────────────────────────────
const displayName = computed(() => {
  const first = profile.value?.firstName?.trim()
  const last = profile.value?.lastName?.trim()
  if (first || last) return [first, last].filter(Boolean).join(' ')
  return 'Verified buyer'
})

const fundsShort = computed(() => {
  const amt = passport.value?.fundsAmount
  if (!amt) return ''
  if (amt >= 1_000_000) return `£${(amt / 1_000_000).toFixed(1)}M`
  if (amt >= 1000) return `£${Math.round(amt / 1000)}K`
  return `£${amt}`
})
const chainShort = computed(() => {
  const c = passport.value?.chainPosition
  if (c === 'sold') return 'Chain free'
  if (c === 'selling') return 'Selling'
  if (c === 'ftb') return 'First-time'
  return 'Add chain'
})

const canonicalShareLink = computed(() => {
  const ref = (passport.value as any)?.publicRef
  if (!ref) return 'umu.co/profile/—'
  return `umu.co/profile/${ref}`
})

function initialsFor(name: string | null | undefined): string {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '??'
}
function isExpired(s: BuyerProfileShare) {
  return new Date(s.expiresAt).getTime() < Date.now()
}
function daysUntil(iso: string) {
  return Math.max(
    0,
    Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000),
  )
}
function scopeShort(scope: any): string {
  if (!Array.isArray(scope)) return 'ID · Budget · Chain · Story'
  const map: Record<string, string> = {
    identity: 'ID',
    deposit: 'Budget',
    sof: 'SoF',
    afford: 'Afford',
    credit: 'Credit',
    story: 'Story',
  }
  return scope.map((s) => map[s] || s).join(' · ')
}

// ── Send ──────────────────────────────────────────────────
async function onSend(a: { id: string; firm: string; name: string }) {
  if (!passport.value) return
  if (!passport.value.published) {
    showToast({
      message: 'Publish your profile before sharing',
      iconEmoji: '⚠️',
    })
    return
  }
  sending.value = true
  try {
    await createShare({
      recipientName: `${a.name} · ${a.firm}`,
      expiresInDays: 30,
      scope: ['identity', 'deposit', 'sof', 'afford', 'story'],
    })
    sentSet.value.add(a.id)
    showToast({ message: `Sent to ${a.name}`, iconEmoji: '✓' })
    await refreshShares()
  } catch (e: any) {
    showToast({
      message: e?.data?.message || 'Could not send',
      iconEmoji: '⚠️',
    })
  } finally {
    sending.value = false
  }
}

async function onRevoke(id: string) {
  try {
    await revokeShare(id)
    await refreshShares()
    showToast({ message: 'Share revoked', iconEmoji: '🚫' })
  } catch (e: any) {
    showToast({
      message: e?.data?.message || 'Could not revoke',
      iconEmoji: '⚠️',
    })
  }
}

async function copyLink() {
  const text = canonicalShareLink.value
  try {
    await navigator.clipboard.writeText(text)
    showToast({ message: 'Link copied', iconEmoji: '🔗' })
  } catch {
    showToast({ message: text, iconEmoji: '🔗' })
  }
}

// ── QR ────────────────────────────────────────────────────
// Cached data URL so we can re-render synchronously on tab switches.
const qrCanvasEl = ref<HTMLElement | null>(null)
const qrDataUrl = ref<string>('')

async function buildQrDataUrl(text: string): Promise<string> {
  const { default: QRCode } = await import('qrcode')
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 220,
    errorCorrectionLevel: 'M',
    color: { dark: '#231d45', light: '#ffffff' },
  })
}

async function drawQr() {
  if (!qrCanvasEl.value) return
  // Use a fully-qualified URL so a scan opens the real site, not "umu.co/..."
  // as a search query. Falls back to the canonical short form if window
  // isn't available (SSR).
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://umu.co'
  const publicRef = (passport.value as any)?.publicRef
  const target = publicRef
    ? `${origin}/profile/${publicRef}`
    : canonicalShareLink.value
  try {
    qrDataUrl.value = await buildQrDataUrl(target)
    qrCanvasEl.value.innerHTML = `<img src="${qrDataUrl.value}" alt="Share QR code" width="220" height="220" />`
  } catch {
    qrCanvasEl.value.innerHTML =
      '<div style="font-size:11px;color:#6b6783;padding:24px;text-align:center;">QR library missing — run <code>npm i qrcode</code></div>'
  }
}

// Re-draw whenever the user lands on the Link & QR tab, or when the
// public ref arrives async from the profile load.
watch(activeTab, async (t) => {
  if (t === 'link') {
    await nextTick()
    drawQr()
  }
})
watch(
  () => (passport.value as any)?.publicRef,
  async (ref) => {
    if (ref && activeTab.value === 'link') {
      await nextTick()
      drawQr()
    }
  },
)

// Save the QR to the camera roll / downloads folder.
async function downloadQr() {
  if (!qrDataUrl.value) {
    try {
      const target =
        typeof window !== 'undefined' && window.location?.origin
          ? `${window.location.origin}/profile/${
              (passport.value as any)?.publicRef ?? ''
            }`
          : canonicalShareLink.value
      qrDataUrl.value = await buildQrDataUrl(target)
    } catch {
      showToast({ message: 'Could not generate QR', iconEmoji: '⚠️' })
      return
    }
  }
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = `umu-buyer-profile-qr-${
    (passport.value as any)?.publicRef ?? 'share'
  }.png`
  a.click()
  showToast({ message: 'QR saved', iconEmoji: '📥' })
}

// ── Navigation ────────────────────────────────────────────
const goBack = useGoBack('/buyer-profile/view')
function goView() { router.push('/buyer-profile/view') }
function goPdf() { router.push('/buyer-profile/pdf') }
function goSign() { router.push('/buyer-profile/sign') }
</script>

<style scoped>
.sh-page {
  min-height: 100dvh;
  background: #fafafa;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-bottom: 32px;
}

.sh-top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 6px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.sh-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 1px solid #ececef;
  display: flex; align-items: center; justify-content: center;
  color: #231d45; cursor: pointer; flex-shrink: 0;
}
.sh-nav-centre {
  flex: 1; text-align: center;
  font-size: 15px; font-weight: 800; color: #231d45;
}
.sh-nav-right {
  font-size: 13px; font-weight: 700; color: #00a19a;
  cursor: pointer; padding: 8px 4px; white-space: nowrap;
}

/* Tab switcher */
.sh-tabs-wrap {
  display: flex; justify-content: center;
  margin: 14px 22px 0;
  animation: sh-fadeDown 0.4s 0.05s both;
}
@keyframes sh-fadeDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.how-tabs {
  display: inline-flex;
  background: #fafafa; border: 1px solid #ececef;
  border-radius: 100px; padding: 4px; gap: 4px;
}
.how-tab {
  font-family: inherit;
  font-size: 12px; font-weight: 700;
  color: #6b6783; background: transparent; border: none;
  padding: 8px 14px; border-radius: 100px;
  cursor: pointer; transition: all 0.15s;
}
.how-tab.active {
  background: #00a19a; color: white;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.3);
}

.sh-pane {
  animation: sh-fadeUp 0.4s 0.1s both;
}
@keyframes sh-fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scope panel */
.scope-panel {
  background: #f2faf8;
  border: 1.5px solid #e5f4f2;
  border-radius: 14px;
  padding: 12px 14px;
  margin: 14px 22px 0;
}
.scope-title {
  font-size: 11px; font-weight: 800;
  color: #007e78; letter-spacing: 0.5px;
  margin-bottom: 7px;
}
.scope-row {
  display: flex; align-items: center; gap: 7px;
  font-size: 11.5px; font-weight: 700; color: #231d45;
  margin-bottom: 4px;
}
.scope-row:last-of-type { margin-bottom: 0; }
.scope-check {
  width: 14px; height: 14px; border-radius: 50%;
  background: #00a19a;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.scope-hidden {
  font-size: 10px; font-weight: 700; color: #9c98ad;
  margin-top: 7px;
  padding-top: 7px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Section label */
.sec-label {
  font-size: 11px; font-weight: 800;
  color: #6b6783; letter-spacing: 1px;
  text-transform: uppercase;
  padding: 16px 22px 8px;
  display: block;
}

/* Recipient card */
.recipient-card {
  background: white; border: 2px solid #00a19a;
  border-radius: 14px; overflow: hidden;
  margin: 0 22px;
}
.recipient-row {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 14px;
  border-bottom: 1px solid #f5f5f7;
}
.recipient-row:last-child { border-bottom: none; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #231d45; color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; flex-shrink: 0;
}
.recipient-meta { flex: 1; min-width: 0; }
.recipient-firm {
  font-size: 12px; font-weight: 800; color: #231d45;
}
.recipient-name {
  font-size: 11px; color: #6b6783;
}
.send-btn {
  background: #00a19a; color: white; border: none;
  border-radius: 100px;
  padding: 7px 13px;
  font-family: inherit; font-size: 11px; font-weight: 800;
  cursor: pointer; white-space: nowrap;
}
.send-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.sent-badge {
  background: #e8f5ee; color: #2eab55;
  border: 1px solid #b8e8c8; border-radius: 100px;
  padding: 6px 12px;
  font-size: 11px; font-weight: 800; white-space: nowrap;
}

.sh-link-instead {
  display: block; text-align: center;
  margin: 14px auto;
  background: none; border: none;
  font-family: inherit;
  font-size: 12px; font-weight: 700;
  color: #007e78;
  cursor: pointer; padding: 8px 22px;
}

/* Active shares */
.teal-card {
  background: white;
  border: 2px solid #00a19a;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.08);
}
.sh-list {
  margin: 0 22px;
  overflow: hidden;
}
.share-entry {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 14px;
  border-bottom: 1px solid #f5f5f7;
}
.share-entry:last-child { border-bottom: none; }
.share-entry.revoked { opacity: 0.55; }
.share-meta { flex: 1; min-width: 0; }
.share-name {
  font-size: 12px; font-weight: 800; color: #231d45;
}
.share-scope {
  font-size: 10.5px; color: #6b6783; margin-top: 1px;
}
.share-expiry {
  font-size: 10px; font-weight: 700; color: #c4821a;
  margin-top: 2px;
}
.revoke-btn {
  background: #fcebea; color: #c73e36;
  border: 1px solid #f5c6c4; border-radius: 100px;
  padding: 6px 12px;
  font-family: inherit; font-size: 10.5px; font-weight: 800;
  cursor: pointer;
}
.revoke-disabled {
  color: #c0bdcc; font-size: 14px; font-weight: 800;
  padding: 0 8px;
}
.sh-empty {
  padding: 28px 22px; text-align: center;
  color: #6b6783; font-size: 12.5px; font-weight: 600;
}
.sh-expires-note {
  padding: 14px 22px 0;
  font-size: 11px; color: #9c98ad;
  text-align: center; line-height: 1.5;
}
.sh-cta-wrap { margin: 14px 22px 0; }

/* Link tab */
.sh-link-card {
  margin: 0 22px;
  overflow: hidden;
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
}
.sh-link-url {
  flex: 1; min-width: 0;
  font-size: 13px; font-weight: 700; color: #231d45;
  font-family: 'SF Mono', Menlo, monospace;
  word-break: break-all;
}
.sh-link-copy {
  background: #00a19a; color: white; border: none;
  border-radius: 100px;
  padding: 8px 14px;
  font-family: inherit; font-size: 11px; font-weight: 800;
  cursor: pointer; flex-shrink: 0;
}
.navy-card {
  background: white;
  border: 2px solid #231d45;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(35, 29, 69, 0.08);
}
.sh-qr-card {
  margin: 16px 22px 0;
  padding: 20px; text-align: center;
}
.sh-qr-frame {
  display: inline-block;
  padding: 12px;
  background: #fff;
  border-radius: 14px;
  box-shadow: inset 0 0 0 2px #f1efee;
}
.sh-qr-canvas {
  display: inline-block;
  width: 220px;
  height: 220px;
}
.sh-qr-canvas img { display: block; }
.sh-qr-skeleton {
  width: 220px;
  height: 220px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    #f1efee 0%,
    #fafafa 50%,
    #f1efee 100%
  );
  background-size: 200% 100%;
  animation: sh-qr-shimmer 1.4s ease-in-out infinite;
}
@keyframes sh-qr-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.sh-qr-meta {
  font-size: 11px; color: #6b6783;
  margin-top: 10px; font-weight: 600;
}
.sh-qr-save {
  margin-top: 14px;
  border: 1.5px solid #231d45;
  background: #fff;
  color: #231d45;
  border-radius: 999px;
  padding: 8px 18px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.sh-qr-save:active { transform: scale(0.98); }

/* PDF tab */
.sh-pdf-preview {
  margin: 0 22px;
  background: #231d45; border-radius: 16px;
  padding: 20px; color: white;
}
.sh-pdf-eyebrow {
  font-size: 9px; font-weight: 800; letter-spacing: 1.5px;
  opacity: 0.5; text-transform: uppercase;
  margin-bottom: 8px;
}
.sh-pdf-tagline {
  font-size: 16px; font-weight: 800; font-style: italic;
  margin-bottom: 10px;
}
.sh-pdf-name {
  font-size: 12px; font-weight: 700;
  margin-bottom: 10px;
}
.sh-pdf-pills {
  display: flex; flex-wrap: wrap; gap: 5px;
}
.sh-pdf-pill {
  font-size: 9px; font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 100px;
  padding: 4px 8px;
  white-space: nowrap;
}
.sh-sign-link {
  display: block; text-align: center;
  margin-top: 12px;
  background: none; border: none;
  font-family: inherit;
  font-size: 13px; font-weight: 800; color: #007e78;
  cursor: pointer; padding: 8px 22px; width: 100%;
}
.sh-pdf-note {
  text-align: center;
  font-size: 11px; color: #9c98ad;
  padding: 10px 22px;
}

/* CTA buttons */
.cta-btn {
  width: 100%;
  background: #00a19a; color: white; border: none;
  border-radius: 14px; padding: 16px;
  font-family: inherit; font-size: 14px; font-weight: 800;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.35);
  cursor: pointer; transition: all 0.15s;
}
.cta-btn:hover { background: #00b6ae; }
.cta-btn.outline {
  background: white; color: #231d45;
  border: 1.5px solid #231d45;
  box-shadow: none;
}
</style>
