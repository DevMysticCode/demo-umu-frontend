<template>
  <Teleport to="body">
    <div v-if="open" class="sd-overlay" @click.self="close">
      <div class="sd-sheet">
        <div class="sd-handle" />

        <div class="sd-eyebrow">Share your buyer profile</div>
        <div class="sd-title">Send to an agent or seller</div>

        <!-- Tabs -->
        <div class="sd-tabs">
          <button
            v-for="t in tabs"
            :key="t.id"
            class="sd-tab"
            :class="{ active: activeTab === t.id }"
            @click="activeTab = t.id"
          >
            {{ t.label }}
            <span v-if="t.id === 'active' && shares.length > 0" class="sd-tab-count">
              {{ shares.filter((s) => !s.revokedAt).length }}
            </span>
          </button>
        </div>

        <!-- ── Send tab ── -->
        <div v-if="activeTab === 'send'" class="sd-pane">
          <div v-if="!published" class="sd-publish-warn">
            ⚠️ Publish your profile before sharing. Until then, the link will
            show a placeholder.
          </div>

          <div class="sd-field">
            <label class="sd-label">Recipient name (optional)</label>
            <input
              v-model="form.recipientName"
              class="sd-input"
              placeholder="e.g. Hamilton Court Estates"
            />
          </div>

          <div class="sd-field">
            <label class="sd-label">Recipient email (optional)</label>
            <input
              v-model="form.recipientEmail"
              type="email"
              class="sd-input"
              placeholder="agent@example.com"
            />
            <div class="sd-hint">
              If provided, we'll email the link directly. Otherwise you can copy
              it from the Active tab once created.
            </div>
          </div>

          <div class="sd-field">
            <label class="sd-label">Access window</label>
            <div class="sd-chip-row">
              <button
                v-for="opt in expiryOptions"
                :key="opt.days"
                class="sd-chip"
                :class="{ active: form.expiresInDays === opt.days }"
                @click="form.expiresInDays = opt.days"
              >
                {{ opt.label }}
              </button>
              <div class="sd-chip-custom">
                <input
                  v-model.number="customDays"
                  type="number"
                  min="1"
                  max="365"
                  class="sd-input sd-input--small"
                  placeholder="e.g. 14"
                />
                <button
                  class="sd-chip sd-chip--apply"
                  :disabled="!isCustomValid"
                  @click="applyCustomDays"
                >
                  Custom
                </button>
              </div>
            </div>
            <div class="sd-hint">
              Link will auto-expire after <b>{{ form.expiresInDays }} day{{ form.expiresInDays === 1 ? '' : 's' }}</b>.
              You can revoke earlier from the Active tab.
            </div>
          </div>

          <div class="sd-field">
            <label class="sd-label">What to share</label>
            <div class="sd-scope-rows">
              <label
                v-for="s in scopeOptions"
                :key="s.id"
                class="sd-scope-row"
              >
                <input
                  v-model="form.scope"
                  type="checkbox"
                  :value="s.id"
                />
                <div>
                  <div class="sd-scope-title">{{ s.label }}</div>
                  <div class="sd-scope-sub">{{ s.sub }}</div>
                </div>
              </label>
            </div>
          </div>

          <div v-if="errorMsg" class="sd-err">{{ errorMsg }}</div>
          <button
            class="sd-cta"
            :disabled="creating || !published"
            @click="onCreate"
          >
            <template v-if="creating">Creating link…</template>
            <template v-else>Generate share link →</template>
          </button>
        </div>

        <!-- ── Active tab ── -->
        <div v-else-if="activeTab === 'active'" class="sd-pane">
          <div v-if="loadingList" class="sd-empty">Loading shares…</div>
          <div v-else-if="shares.length === 0" class="sd-empty">
            No share links yet. Create one from the Send tab.
          </div>
          <div v-else class="sd-share-list">
            <div
              v-for="s in shares"
              :key="s.id"
              class="sd-share-row"
              :class="{ revoked: !!s.revokedAt, expired: isExpired(s) }"
            >
              <div class="sd-share-head">
                <div class="sd-share-name">
                  {{ s.recipientName || 'Unnamed share' }}
                </div>
                <div class="sd-share-status">
                  <span v-if="s.revokedAt" class="sd-pill sd-pill--err">Revoked</span>
                  <span v-else-if="isExpired(s)" class="sd-pill sd-pill--err">Expired</span>
                  <span v-else class="sd-pill sd-pill--ok">Active</span>
                </div>
              </div>
              <div v-if="s.recipientEmail" class="sd-share-meta">
                {{ s.recipientEmail }}
              </div>
              <div class="sd-share-meta">
                Expires {{ formatDate(s.expiresAt) }} ·
                {{ s.viewCount }} view{{ s.viewCount === 1 ? '' : 's' }}
              </div>
              <div class="sd-share-actions">
                <button
                  class="sd-link-btn"
                  @click="copyLink(s.token)"
                >
                  🔗 Copy link
                </button>
                <button
                  v-if="!s.revokedAt && !isExpired(s)"
                  class="sd-link-btn sd-link-btn--danger"
                  @click="onRevoke(s.id)"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Link & QR tab ── -->
        <div v-else-if="activeTab === 'link'" class="sd-pane">
          <div v-if="!latestActive" class="sd-empty">
            Generate a link from the Send tab to see it here.
          </div>
          <div v-else class="sd-qr-block">
            <div class="sd-qr-canvas" ref="qrCanvasEl" />
            <div class="sd-qr-url">
              {{ shareUrl(latestActive.token) }}
            </div>
            <div class="sd-qr-meta">
              For {{ latestActive.recipientName || 'unnamed recipient' }} ·
              expires {{ formatDate(latestActive.expiresAt) }}
            </div>
            <button class="sd-cta" @click="copyLink(latestActive.token)">
              🔗 Copy link
            </button>
          </div>
        </div>

        <button class="sd-cancel" @click="close">Close</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useBuyerProfile, type BuyerProfileShare } from '~/composables/useBuyerProfile'
import { useAppToast } from '~/composables/useCustomToast'

const props = defineProps<{ open: boolean; published: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { listShares, createShare, revokeShare } = useBuyerProfile()
const { showToast } = useAppToast()
const config = useRuntimeConfig()

type TabId = 'send' | 'active' | 'link'
const tabs: { id: TabId; label: string }[] = [
  { id: 'send', label: 'Send' },
  { id: 'active', label: 'Active' },
  { id: 'link', label: 'Link & QR' },
]
const activeTab = ref<TabId>('send')

const shares = ref<BuyerProfileShare[]>([])
const loadingList = ref(false)
const creating = ref(false)
const errorMsg = ref('')

const scopeOptions = [
  { id: 'identity', label: 'Identity', sub: 'DVS-verified name + ID type' },
  { id: 'deposit', label: 'Deposit', sub: 'Bank-verified deposit + max budget' },
  { id: 'sof', label: 'Source of funds', sub: 'Breakdown + AML status' },
  { id: 'afford', label: 'Affordability', sub: 'Score + stress-test result' },
  { id: 'credit', label: 'Credit file', sub: 'Score + key risk markers (Premium)' },
  { id: 'story', label: 'Your story', sub: 'Free-text intro to the seller' },
]

const expiryOptions = [
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
  { days: 60, label: '60 days' },
]

const form = ref({
  recipientName: '',
  recipientEmail: '',
  expiresInDays: 30,
  scope: ['identity', 'deposit', 'sof', 'afford', 'story'] as string[],
})
const customDays = ref<number | null>(null)
const isCustomValid = computed(
  () =>
    typeof customDays.value === 'number' &&
    customDays.value >= 1 &&
    customDays.value <= 365,
)
function applyCustomDays() {
  if (isCustomValid.value && customDays.value) {
    form.value.expiresInDays = customDays.value
  }
}

const latestActive = computed(() => {
  const live = shares.value.filter(
    (s) => !s.revokedAt && new Date(s.expiresAt).getTime() > Date.now(),
  )
  return live[0] || null
})

function isExpired(s: BuyerProfileShare) {
  return new Date(s.expiresAt).getTime() < Date.now()
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
function shareUrl(token: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/shared-buyer/${token}`
}

async function refreshList() {
  loadingList.value = true
  try {
    shares.value = await listShares()
  } finally {
    loadingList.value = false
  }
}

watch(
  () => props.open,
  async (v) => {
    if (!v) return
    activeTab.value = 'send'
    errorMsg.value = ''
    await refreshList()
  },
)

watch(activeTab, async (t) => {
  if (t === 'active') await refreshList()
  if (t === 'link') {
    await refreshList()
    await nextTick()
    drawQr()
  }
})

async function onCreate() {
  errorMsg.value = ''
  creating.value = true
  try {
    const created = await createShare({
      recipientName: form.value.recipientName.trim() || undefined,
      recipientEmail: form.value.recipientEmail.trim() || undefined,
      expiresInDays: form.value.expiresInDays,
      scope: form.value.scope,
    })
    shares.value = [created, ...shares.value]
    showToast({ message: 'Share link created', iconEmoji: '✓' })
    activeTab.value = 'link'
    await nextTick()
    drawQr()
    form.value.recipientName = ''
    form.value.recipientEmail = ''
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? 'Could not create share link.'
  } finally {
    creating.value = false
  }
}

async function onRevoke(id: string) {
  try {
    const updated = await revokeShare(id)
    const idx = shares.value.findIndex((s) => s.id === id)
    if (idx >= 0) shares.value[idx] = updated
    showToast({ message: 'Share revoked', iconEmoji: '🚫' })
  } catch (e: any) {
    showToast({
      message: e?.data?.message || 'Could not revoke',
      iconEmoji: '⚠️',
    })
  }
}

async function copyLink(token: string) {
  const url = shareUrl(token)
  try {
    await navigator.clipboard.writeText(url)
    showToast({ message: 'Link copied to clipboard', iconEmoji: '🔗' })
  } catch {
    showToast({ message: url, iconEmoji: '🔗' })
  }
}

// ── QR code rendering (lazy import to avoid bundling on first paint) ──
const qrCanvasEl = ref<HTMLElement | null>(null)
async function drawQr() {
  if (!latestActive.value || !qrCanvasEl.value) return
  try {
    const { default: QRCode } = await import('qrcode')
    const dataUrl = await QRCode.toDataURL(shareUrl(latestActive.value.token), {
      margin: 1,
      width: 220,
      color: { dark: '#231d45', light: '#ffffff' },
    })
    qrCanvasEl.value.innerHTML = `<img src="${dataUrl}" alt="Share QR code" width="220" height="220" />`
  } catch {
    // qrcode library not installed yet — show a fallback message.
    qrCanvasEl.value.innerHTML =
      '<div style="font-size:11px;color:#6b6783;padding:24px 12px;text-align:center;">QR code library not installed. Run <code>npm i qrcode</code>.</div>'
  }
}

function close() { emit('close') }
</script>

<style scoped>
.sd-overlay {
  position: fixed; inset: 0; z-index: 9990;
  background: rgba(35, 29, 69, 0.45);
  display: flex; align-items: flex-end; justify-content: center;
  font-family: inherit;
}
.sd-sheet {
  background: #fff;
  width: 100%; max-width: 480px;
  border-radius: 22px 22px 0 0;
  padding: 12px 22px 28px;
  max-height: 92vh; overflow-y: auto;
}
.sd-handle {
  width: 44px; height: 5px;
  background: #ececef; border-radius: 100px;
  margin: 0 auto 14px;
}
.sd-eyebrow {
  font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
  color: #00a19a; text-transform: uppercase;
}
.sd-title {
  font-size: 20px; font-weight: 900; color: #231d45;
  letter-spacing: -0.5px; margin: 2px 0 14px;
}

/* Tabs */
.sd-tabs {
  display: flex; gap: 6px; margin-bottom: 14px;
  background: #f5f5f7; border-radius: 12px; padding: 4px;
}
.sd-tab {
  flex: 1; background: transparent; border: none; cursor: pointer;
  padding: 9px 10px; border-radius: 10px;
  font-family: inherit; font-size: 12px; font-weight: 800;
  color: #6b6783; letter-spacing: -0.1px;
}
.sd-tab.active { background: #fff; color: #00a19a; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.sd-tab-count {
  display: inline-block; min-width: 16px; padding: 0 5px; margin-left: 4px;
  background: #00a19a; color: #fff; border-radius: 100px;
  font-size: 10px; font-weight: 800; line-height: 16px;
}

.sd-pane { display: flex; flex-direction: column; gap: 14px; }
.sd-field { display: flex; flex-direction: column; gap: 6px; }
.sd-label { font-size: 11px; font-weight: 800; color: #231d45; letter-spacing: 0.3px; }
.sd-input {
  border: 1.5px solid #ececef; border-radius: 12px;
  padding: 12px 14px; font-family: inherit; font-size: 14px;
  background: #fafafa;
}
.sd-input:focus { outline: none; border-color: #00a19a; background: #fff; }
.sd-input--small { padding: 8px 10px; font-size: 13px; max-width: 80px; }
.sd-hint { font-size: 11px; font-weight: 500; color: #6b6783; line-height: 1.5; }
.sd-hint b { color: #231d45; font-weight: 800; }

.sd-chip-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.sd-chip {
  background: #fff; border: 1.5px solid #ececef; border-radius: 100px;
  padding: 7px 13px; font-family: inherit; font-size: 12px; font-weight: 700;
  color: #4a4560; cursor: pointer;
}
.sd-chip.active { background: #00a19a; border-color: #00a19a; color: #fff; }
.sd-chip-custom { display: flex; gap: 6px; align-items: center; }
.sd-chip--apply { background: #f5f5f7; border-color: #f5f5f7; color: #6b6783; }
.sd-chip--apply:disabled { opacity: 0.55; cursor: not-allowed; }

.sd-scope-rows { display: flex; flex-direction: column; gap: 8px; }
.sd-scope-row {
  display: flex; gap: 10px; align-items: flex-start;
  background: #fafafa; border: 1px solid #ececef; border-radius: 12px;
  padding: 10px 12px; cursor: pointer;
}
.sd-scope-row input { margin-top: 2px; accent-color: #00a19a; }
.sd-scope-title { font-size: 13px; font-weight: 800; color: #231d45; }
.sd-scope-sub { font-size: 11px; font-weight: 500; color: #6b6783; }

.sd-publish-warn {
  background: #fef3c7; color: #92400e;
  border: 1px solid #fcd34d; border-radius: 10px;
  padding: 10px 12px; font-size: 12px; font-weight: 600; line-height: 1.5;
}
.sd-err { color: #c73e36; font-size: 12px; font-weight: 600; }

.sd-cta {
  width: 100%; padding: 14px 18px; border-radius: 100px;
  background: #00a19a; color: #fff; border: none;
  font-family: inherit; font-size: 14px; font-weight: 800;
  cursor: pointer; margin-top: 4px;
}
.sd-cta:disabled { opacity: 0.55; cursor: not-allowed; }
.sd-cancel {
  width: 100%; background: transparent; border: none;
  color: #6b6783; font-size: 12.5px; font-weight: 700;
  padding: 12px; cursor: pointer; margin-top: 8px;
  font-family: inherit;
}

.sd-empty {
  text-align: center; padding: 28px 12px;
  color: #6b6783; font-size: 12.5px; font-weight: 600;
}

.sd-share-list { display: flex; flex-direction: column; gap: 10px; }
.sd-share-row {
  background: #fff; border: 1px solid #ececef; border-radius: 12px;
  padding: 12px 14px;
}
.sd-share-row.revoked,
.sd-share-row.expired { opacity: 0.6; }
.sd-share-head { display: flex; justify-content: space-between; align-items: center; }
.sd-share-name { font-size: 13px; font-weight: 800; color: #231d45; }
.sd-share-meta { font-size: 11px; color: #6b6783; margin-top: 2px; }
.sd-share-actions { display: flex; gap: 8px; margin-top: 10px; }
.sd-link-btn {
  background: #f5f5f7; border: none; padding: 7px 12px; border-radius: 100px;
  font-family: inherit; font-size: 11.5px; font-weight: 800; color: #231d45;
  cursor: pointer;
}
.sd-link-btn--danger { background: #fee2e2; color: #991b1b; }
.sd-pill { font-size: 9px; font-weight: 800; padding: 3px 9px; border-radius: 100px; letter-spacing: 0.5px; }
.sd-pill--ok { background: #e6f7f6; color: #00857f; }
.sd-pill--err { background: #fee2e2; color: #991b1b; }

.sd-qr-block {
  text-align: center;
  background: #fafafa; border-radius: 14px; padding: 18px;
}
.sd-qr-canvas { display: inline-block; }
.sd-qr-url {
  font-family: 'SF Mono', Menlo, monospace; font-size: 11px;
  color: #6b6783; word-break: break-all;
  background: #fff; border: 1px solid #ececef; border-radius: 8px;
  padding: 8px 10px; margin: 10px 0;
}
.sd-qr-meta { font-size: 11px; color: #6b6783; margin-bottom: 14px; }
</style>
