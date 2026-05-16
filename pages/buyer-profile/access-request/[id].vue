<template>
  <div class="ar-page">
    <!-- Top nav -->
    <div class="ar-top-nav">
      <button class="ar-back" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div class="ar-nav-centre">Access Request</div>
      <span class="ar-nav-right" />
    </div>

    <!-- Loading / error -->
    <div v-if="loading" class="ar-loading">Loading request…</div>
    <div v-else-if="error" class="ar-error">{{ error }}</div>

    <template v-else-if="request">
      <!-- Notification card -->
      <div class="ar-notif-wrap">
        <div class="notif-card">
          <div class="notif-header">
            <div class="notif-logo">{{ request.org.logoEmoji || '🏦' }}</div>
            <div class="notif-meta">
              <div class="notif-title">{{ request.org.name }}</div>
              <div class="notif-sub">
                {{ request.org.description || 'Verifier organisation' }}
              </div>
            </div>
            <div
              class="notif-badge"
              :class="{
                pending: request.status === 'PENDING',
                approved: request.status === 'APPROVED',
                declined: request.status === 'DECLINED',
                expired: request.status === 'EXPIRED',
              }"
            >
              {{ statusBadgeLabel }}
            </div>
          </div>
          <div class="notif-body">
            <template v-if="request.reason">"{{ request.reason }}"</template>
            <template v-else>
              "We'd like to access your verified financial data to speed up
              your application. You control exactly what we can see — approve
              or decline below."
            </template>
          </div>
          <div class="notif-pills">
            <div class="notif-pill notif-pill--teal">
              ⏱ {{ expiresLabel }}
            </div>
            <div class="notif-pill notif-pill--navy">🔒 Read-only access</div>
            <div class="notif-pill notif-pill--teal">30 day max</div>
          </div>
        </div>
      </div>

      <!-- Status banner — already decided -->
      <div
        v-if="request.status !== 'PENDING'"
        class="ar-status-banner"
        :class="`ar-status-banner--${request.status.toLowerCase()}`"
      >
        <span class="ar-status-emoji">{{ statusBannerEmoji }}</span>
        {{ statusBannerText }}
      </div>

      <!-- Per-scope toggles -->
      <span class="sec-label">THEY ARE REQUESTING</span>
      <div class="ar-scope-card">
        <div
          v-for="s in displayScopes"
          :key="s.id"
          class="scope-approve-row"
        >
          <div class="scope-approve-body">
            <div class="scope-approve-title">{{ s.title }}</div>
            <div class="scope-approve-sub">{{ s.sub }}</div>
          </div>
          <button
            type="button"
            class="scope-toggle"
            :class="{ on: scopesOn[s.id] }"
            :disabled="request.status !== 'PENDING'"
            @click="toggleScope(s.id)"
            :aria-pressed="scopesOn[s.id]"
          >
            <span class="scope-toggle-knob" />
          </button>
        </div>
      </div>
      <div class="ar-revoke-note">
        You can revoke access at any time from your profile
      </div>

      <!-- Actions (only when pending) -->
      <div v-if="request.status === 'PENDING'" class="ar-actions">
        <button
          class="cta-btn"
          :disabled="approving || selectedScopes.length === 0"
          @click="onApprove"
        >
          {{ approving ? 'Approving…' : 'Approve selected access →' }}
        </button>
        <button
          class="cta-btn outline"
          :disabled="declining"
          @click="onDecline"
        >
          {{ declining ? 'Declining…' : 'Decline request' }}
        </button>
      </div>

      <!-- Actions (post-decision) -->
      <div v-else class="ar-actions">
        <button class="cta-btn" @click="goView">Back to my profile</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  useVerifierAccess,
  SCOPE_DEFINITIONS,
  type AccessRequest,
  type AccessScope,
} from '~/composables/useVerifierAccess'
import { useAppToast } from '~/composables/useCustomToast'

definePageMeta({
  title: 'Access Request — UmovingU',
  middleware: 'auth',
})

const router = useRouter()
const route = useRoute()
const { getRequest, approveRequest, declineRequest } = useVerifierAccess()
const { showToast } = useAppToast()

const requestId = route.params.id as string
const loading = ref(true)
const error = ref('')
const request = ref<AccessRequest | null>(null)

const scopesOn = ref<Record<AccessScope, boolean>>({} as any)
const approving = ref(false)
const declining = ref(false)

onMounted(async () => {
  await load()
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const r = await getRequest(requestId)
    request.value = r
    // Seed toggles: requested + defaultOn → on. Story off by default.
    const seed: Record<string, boolean> = {}
    for (const def of SCOPE_DEFINITIONS) {
      seed[def.id] = r.requestedScopes.includes(def.id) && def.defaultOn
    }
    // If the request has already been approved, mirror the approvedScopes
    // so the UI reflects what was granted.
    if (r.status === 'APPROVED') {
      for (const def of SCOPE_DEFINITIONS) {
        seed[def.id] = r.approvedScopes.includes(def.id)
      }
    }
    scopesOn.value = seed as any
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Could not load request'
  } finally {
    loading.value = false
  }
}

// Only show scopes the requester actually asked for.
const displayScopes = computed(() => {
  if (!request.value) return []
  const requested = new Set(request.value.requestedScopes)
  return SCOPE_DEFINITIONS.filter((s) => requested.has(s.id))
})

const selectedScopes = computed<AccessScope[]>(() =>
  displayScopes.value
    .filter((s) => scopesOn.value[s.id])
    .map((s) => s.id),
)

const expiresLabel = computed(() => {
  if (!request.value) return ''
  const ms = new Date(request.value.expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'Request expired'
  const hours = Math.round(ms / 3_600_000)
  if (hours <= 1) return `Request expires in ${Math.max(1, Math.round(ms / 60_000))}m`
  if (hours < 24) return `Request expires in ${hours}h`
  return `Request expires in ${Math.round(hours / 24)}d`
})

const statusBadgeLabel = computed(() => {
  switch (request.value?.status) {
    case 'PENDING': return 'NEW REQUEST'
    case 'APPROVED': return 'APPROVED'
    case 'DECLINED': return 'DECLINED'
    case 'EXPIRED': return 'EXPIRED'
    default: return ''
  }
})
const statusBannerEmoji = computed(() => {
  switch (request.value?.status) {
    case 'APPROVED': return '🔓'
    case 'DECLINED': return '🚫'
    case 'EXPIRED': return '⏱'
    default: return 'ℹ️'
  }
})
const statusBannerText = computed(() => {
  if (!request.value) return ''
  if (request.value.status === 'APPROVED') {
    return `Access granted on ${formatDate(request.value.decidedAt)}.`
  }
  if (request.value.status === 'DECLINED') {
    return `You declined this request on ${formatDate(request.value.decidedAt)}.`
  }
  if (request.value.status === 'EXPIRED') {
    return 'This request expired before you decided.'
  }
  return ''
})

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function toggleScope(id: AccessScope) {
  if (request.value?.status !== 'PENDING') return
  scopesOn.value = { ...scopesOn.value, [id]: !scopesOn.value[id] }
}

async function onApprove() {
  if (!request.value || selectedScopes.value.length === 0) return
  approving.value = true
  try {
    const updated = await approveRequest(request.value.id, {
      scopes: selectedScopes.value,
      expiresInDays: 30,
    })
    request.value = updated
    showToast({ message: 'Access granted', iconEmoji: '🔓' })
    router.replace(`/buyer-profile/access-granted/${updated.id}`)
  } catch (e: any) {
    showToast({
      message: e?.data?.message ?? 'Could not approve',
      iconEmoji: '⚠️',
    })
  } finally {
    approving.value = false
  }
}

async function onDecline() {
  if (!request.value) return
  declining.value = true
  try {
    const updated = await declineRequest(request.value.id)
    request.value = updated
    showToast({ message: 'Request declined', iconEmoji: '🚫' })
    // Stay on this screen so the buyer sees the new status banner.
  } catch (e: any) {
    showToast({
      message: e?.data?.message ?? 'Could not decline',
      iconEmoji: '⚠️',
    })
  } finally {
    declining.value = false
  }
}

const goBack = useGoBack('/buyer-profile/view')
function goView() { router.push('/buyer-profile/view') }
</script>

<style scoped>
.ar-page {
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

.ar-top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 6px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.ar-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 1px solid #ececef;
  display: flex; align-items: center; justify-content: center;
  color: #231d45; cursor: pointer; flex-shrink: 0;
}
.ar-nav-centre {
  flex: 1; text-align: center;
  font-size: 14px; font-weight: 800; color: #231d45;
}
.ar-nav-right { width: 36px; }

.ar-loading, .ar-error {
  padding: 60px 22px; text-align: center;
  font-size: 13px; color: #6b6783; font-weight: 600;
}
.ar-error { color: #c73e36; }

/* Notification card */
.ar-notif-wrap {
  padding: 8px 22px 0;
  animation: ar-fadeUp 0.4s 0.05s both;
}
@keyframes ar-fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.notif-card {
  background: white;
  border: 1.5px solid #ececef;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.notif-header {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 12px;
}
.notif-logo {
  width: 40px; height: 40px; border-radius: 12px;
  background: #f2faf8;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.notif-meta { flex: 1; min-width: 0; }
.notif-title {
  font-size: 14px; font-weight: 800; color: #231d45;
}
.notif-sub {
  font-size: 11px; color: #6b6783; margin-top: 1px;
}
.notif-badge {
  font-size: 9px; font-weight: 800; letter-spacing: 0.8px;
  padding: 4px 8px; border-radius: 6px;
  white-space: nowrap;
}
.notif-badge.pending { background: #fef3c7; color: #c4821a; }
.notif-badge.approved { background: #e8f5ee; color: #2eab55; }
.notif-badge.declined { background: #fcebea; color: #c73e36; }
.notif-badge.expired { background: #ececef; color: #6b6783; }

.notif-body {
  background: #fafafa;
  border-radius: 10px;
  padding: 12px;
  font-size: 12px; color: #231d45;
  font-weight: 600; line-height: 1.5;
  border: 1px solid #ececef;
}
.notif-pills {
  display: flex; gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.notif-pill {
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 10px; font-weight: 700;
  white-space: nowrap;
}
.notif-pill--teal { background: #f2faf8; color: #007e78; }
.notif-pill--navy { background: #f6f5fb; color: #4a4566; }

/* Status banner — when not pending */
.ar-status-banner {
  display: flex; align-items: center; gap: 10px;
  margin: 12px 22px 0;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 12.5px; font-weight: 700;
  line-height: 1.4;
}
.ar-status-banner--approved {
  background: #e8f5ee;
  border: 1px solid #b8e8c8;
  color: #166534;
}
.ar-status-banner--declined {
  background: #fcebea;
  border: 1px solid #f5c6c4;
  color: #c73e36;
}
.ar-status-banner--expired {
  background: #ececef;
  border: 1px solid #c0bdcc;
  color: #6b6783;
}
.ar-status-emoji { font-size: 18px; }

/* Section label */
.sec-label {
  font-size: 11px; font-weight: 800;
  color: #6b6783; letter-spacing: 1px;
  text-transform: uppercase;
  padding: 16px 22px 8px;
  display: block;
}

/* Scope toggle card */
.ar-scope-card {
  margin: 0 22px;
  background: white;
  border: 2px solid #231d45;
  border-radius: 14px;
  padding: 8px 16px;
}
.scope-approve-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f7;
}
.scope-approve-row:last-child { border-bottom: none; }
.scope-approve-body { flex: 1; min-width: 0; }
.scope-approve-title {
  font-size: 13px; font-weight: 800; color: #231d45;
}
.scope-approve-sub {
  font-size: 11px; color: #6b6783; margin-top: 1px;
}

/* Toggle — pill switch */
.scope-toggle {
  width: 42px; height: 24px; border-radius: 100px;
  background: #ececef; border: none;
  position: relative; cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.scope-toggle.on { background: #00a19a; }
.scope-toggle:disabled { opacity: 0.55; cursor: not-allowed; }
.scope-toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px;
  background: white; border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s cubic-bezier(.34, 1.56, .64, 1);
}
.scope-toggle.on .scope-toggle-knob { transform: translateX(18px); }

.ar-revoke-note {
  margin: 10px 22px 0;
  font-size: 11px; color: #9c98ad;
  text-align: center;
}

/* Actions */
.ar-actions {
  padding: 12px 22px 0;
  display: flex; flex-direction: column; gap: 8px;
  animation: ar-fadeUp 0.4s 0.2s both;
}
.cta-btn {
  width: 100%;
  background: #00a19a; color: white; border: none;
  border-radius: 14px; padding: 16px;
  font-family: inherit; font-size: 14px; font-weight: 800;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.35);
  cursor: pointer; transition: all 0.15s;
}
.cta-btn:hover:not(:disabled) { background: #00b6ae; }
.cta-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.cta-btn.outline {
  background: white; color: #231d45;
  border: 1.5px solid #231d45;
  box-shadow: none;
  font-size: 13px; padding: 13px;
}
</style>
