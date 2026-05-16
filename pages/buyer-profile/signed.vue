<template>
  <div class="sn-page">
    <!-- Celebration hero -->
    <div class="sn-hero">
      <div class="sn-emoji">✍️</div>
      <h2 class="sn-title">Profile signed</h2>
      <p class="sn-sub">
        Your digital signature has been embedded. The PDF is now ready to share
        or download.
      </p>
    </div>

    <!-- Signed document preview (teal-bordered card) -->
    <div class="sn-doc-card">
      <div class="sn-doc-eyebrow">SIGNED DOCUMENT</div>
      <div class="sn-doc-title">UMU Buyer Profile — {{ displayName }}</div>

      <!-- Signature — image OR typed -->
      <div class="sn-sig-wrap">
        <div v-if="passport?.signatureData" class="sn-sig-img-frame">
          <img :src="passport.signatureData" alt="Signature" class="sn-sig-img" />
        </div>
        <div v-else class="sn-sig-typed">
          {{ passport?.signedName || displayName }}
        </div>
      </div>

      <div class="sn-doc-meta">
        Signed {{ formatSignedAt(passport?.signedAt) }} · eIDAS compliant · UMU
        ref: {{ publicRef }}-SIG
      </div>
      <div class="sn-doc-hash">
        sig:sha256·umu·{{ publicRef }}·{{ sigStamp }}·eidas·verified
      </div>
    </div>

    <!-- Actions -->
    <div class="sn-actions">
      <button class="cta-btn" @click="goPdf">📄 Download signed PDF</button>
      <button class="cta-btn outline" @click="goSendAgent">
        ⤴ Share with agent
      </button>
      <button class="sn-ghost" @click="goView">Back to my profile</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  useBuyerProfile,
  type BuyerProfile,
} from '~/composables/useBuyerProfile'
import { useProfile } from '~/composables/useProfile'

definePageMeta({ title: 'Profile Signed — UmovingU', middleware: 'auth' })

const router = useRouter()
const { getBuyerProfile } = useBuyerProfile()
const { fetchProfile, profile } = useProfile()

const passport = ref<BuyerProfile | null>(null)

onMounted(async () => {
  fetchProfile?.().catch(() => {})
  try {
    const p = await getBuyerProfile()
    passport.value = p
    if (!p?.signedAt) {
      router.replace('/buyer-profile/sign')
    }
  } catch {
    router.replace('/buyer-profile')
  }
})

const displayName = computed(() => {
  const first = profile.value?.firstName?.trim()
  const last = profile.value?.lastName?.trim()
  if (first || last) return [first, last].filter(Boolean).join(' ')
  return passport.value?.signedName || 'Buyer'
})
const publicRef = computed(
  () => (passport.value as any)?.publicRef || '—',
)
const sigStamp = computed(() => {
  if (!passport.value?.signedAt) return ''
  const d = new Date(passport.value.signedAt)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}Z`
})

function formatSignedAt(iso: string | null | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' GMT'
}

function goPdf() { router.push('/buyer-profile/pdf') }
function goSendAgent() { router.push('/buyer-profile/send-agent') }
function goView() { router.push('/buyer-profile/view') }
</script>

<style scoped>
.sn-page {
  min-height: 100dvh;
  background: #fafafa;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-top: calc(20px + env(safe-area-inset-top));
  padding-bottom: 32px;
}

.sn-hero {
  padding: 48px 22px 0;
  text-align: center;
}
.sn-emoji {
  font-size: 56px;
  line-height: 1;
  margin-bottom: 14px;
  display: inline-block;
  animation: sn-pop 0.5s ease-out 0.05s both;
}
@keyframes sn-pop {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
.sn-title {
  font-size: 22px; font-weight: 800; color: #231d45;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
  animation: sn-fadeUp 0.4s 0.15s both;
}
.sn-sub {
  font-size: 13px; color: #6b6783; line-height: 1.5;
  animation: sn-fadeUp 0.4s 0.2s both;
}
@keyframes sn-fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Signed document card — teal border, white bg */
.sn-doc-card {
  margin: 24px 22px 0;
  background: white;
  border: 2px solid #00a19a;
  border-radius: 16px;
  padding: 16px;
  animation: sn-fadeUp 0.4s 0.25s both;
}
.sn-doc-eyebrow {
  font-size: 10px; font-weight: 800; letter-spacing: 1px;
  color: #007e78;
  margin-bottom: 10px;
}
.sn-doc-title {
  font-size: 13px; font-weight: 800; color: #231d45;
  margin-bottom: 4px;
}
.sn-sig-wrap {
  border-top: 1px solid #f5f5f7;
  border-bottom: 1px solid #f5f5f7;
  padding: 12px 0;
  margin: 10px 0;
  text-align: left;
}
.sn-sig-typed {
  font-family: Georgia, serif;
  font-size: 20px; font-style: italic;
  color: #231d45;
}
.sn-sig-img-frame {
  display: inline-block;
  background: white;
  border-radius: 8px;
}
.sn-sig-img {
  max-width: 240px;
  max-height: 80px;
  display: block;
}
.sn-doc-meta {
  font-size: 10px; color: #9c98ad;
}
.sn-doc-hash {
  margin-top: 10px;
  background: #f2faf8;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 9.5px;
  font-family: 'SF Mono', Menlo, monospace;
  color: #007e78;
  word-break: break-all;
}

/* Actions */
.sn-actions {
  padding: 16px 22px;
  display: flex; flex-direction: column;
  gap: 8px;
  animation: sn-fadeUp 0.4s 0.3s both;
}
.cta-btn {
  width: 100%;
  background: #00a19a; color: white; border: none;
  border-radius: 14px;
  padding: 16px;
  font-family: inherit; font-size: 14px; font-weight: 800;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.35);
  cursor: pointer; transition: all 0.15s;
}
.cta-btn:hover { background: #00b6ae; }
.cta-btn.outline {
  background: white; color: #231d45;
  border: 1.5px solid #231d45;
  box-shadow: none;
  font-size: 13px; padding: 13px;
}
.sn-ghost {
  background: none; border: none;
  font-family: inherit;
  font-size: 12px; font-weight: 700;
  color: #6b6783;
  cursor: pointer;
  padding: 8px;
}
</style>
