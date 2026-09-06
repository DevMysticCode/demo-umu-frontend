<template>
  <div class="sg-page mobile-container">
    <div v-if="loading" class="sg-loading">Loading inventory…</div>

    <div v-else-if="error" class="sg-error">
      <div class="sg-error-ic">!</div>
      <h2>Link unavailable</h2>
      <p>{{ error }}</p>
    </div>

    <template v-else-if="data">
      <div class="sg-hero">
        <div class="sg-brand">umovingu</div>
        <div class="sg-h1">Inventory &amp; Schedule of Condition</div>
        <div class="sg-meta">{{ data.propertyAddress }}</div>
      </div>

      <div v-if="alreadySigned" class="sg-done">
        <div class="sg-done-ic">✓</div>
        <div class="sg-done-t">You've already signed this inventory</div>
        <div class="sg-done-s">A copy is stored on the landlord's Property Passport.</div>
      </div>

      <template v-else>
        <div class="sg-doc">
          <h2>Details</h2>
          <div class="sg-kv"><span class="k">Type</span><span class="v">{{ inventoryTypeLabel }}</span></div>
          <div class="sg-kv"><span class="k">Furnishing</span><span class="v">{{ furnishingLabel }}</span></div>
          <div class="sg-kv"><span class="k">Completed</span><span class="v">{{ data.completedAt || '-' }}</span></div>

          <template v-for="room in data.rooms" :key="room.name">
            <h2>{{ room.name }}</h2>
            <div v-for="item in room.items" :key="item.name" class="sg-room-item">
              <div class="sg-room-item-n">{{ item.name }}</div>
              <div class="sg-room-item-cc">
                <span v-if="item.condition" class="sg-tag">{{ item.condition }}</span>
                <span v-if="item.cleanliness" class="sg-tag">{{ item.cleanliness }}</span>
              </div>
              <div v-if="item.note" class="sg-room-item-note">{{ item.note }}</div>
            </div>
          </template>

          <template v-if="data.photos?.length">
            <h2>Evidence photos</h2>
            <div class="sg-photo-grid">
              <a
                v-for="photo in data.photos"
                :key="photo.fileUrl"
                :href="photo.fileUrl"
                target="_blank"
                rel="noopener"
                class="sg-photo-tile"
              >
                <img :src="photo.fileUrl" :alt="photo.name" loading="lazy" />
              </a>
            </div>
          </template>
        </div>

        <div class="sg-signblock">
          <div class="mform-label">Your full name</div>
          <input v-model="signerName" type="text" class="mform-input" placeholder="e.g. Jordan Reeves" />

          <div class="mform-label" style="margin-top:16px">Your signature</div>
          <SignaturePad ref="padRef" />

          <label class="sg-consent">
            <input v-model="consent" type="checkbox" />
            <span>I, {{ signerName || 'the undersigned' }}, agree this is my signature and confirm this inventory record is accurate to the best of my knowledge.</span>
          </label>

          <p v-if="submitError" class="sg-err">{{ submitError }}</p>

          <button type="button" class="btn-primary" style="width:100%" :disabled="!canSubmit || submitting" @click="onSubmit">
            {{ submitting ? 'Signing…' : 'Sign inventory' }}
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import SignaturePad from '~/components/ui/SignaturePad.vue'

definePageMeta({ layout: false })

const route = useRoute()
const config = useRuntimeConfig()
const token = route.params.token as string

const loading = ref(true)
const error = ref('')
const data = ref<{
  tenantName: string
  propertyAddress: string
  inventoryType: string
  furnishing: string
  completedAt: string
  rooms: { name: string; items: { name: string; condition: string; cleanliness: string; note: string }[] }[]
  photos: { name: string; fileUrl: string }[]
  landlordSigned: boolean
  tenantSigned: boolean
} | null>(null)
const alreadySigned = ref(false)

const signerName = ref('')
const consent = ref(false)
const submitting = ref(false)
const submitError = ref('')
const padRef = ref<any>(null)

const canSubmit = computed(() => signerName.value.trim().length > 1 && consent.value && padRef.value && !padRef.value.isEmpty)

const INVENTORY_TYPE_LABELS: Record<string, string> = { checkin: 'Check-in', interim: 'Interim inspection', checkout: 'Check-out' }
const inventoryTypeLabel = computed(() => INVENTORY_TYPE_LABELS[data.value?.inventoryType ?? ''] ?? data.value?.inventoryType ?? '-')
const furnishingLabel = computed(() => {
  const f = data.value?.furnishing
  if (f === 'furnished') return 'Furnished'
  if (f === 'part') return 'Part-furnished'
  if (f === 'unfurnished') return 'Unfurnished'
  return f || '-'
})

onMounted(async () => {
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/questions/tenancy-sign/${token}`)
    data.value = res
    signerName.value = res.tenantName ?? ''
    alreadySigned.value = res.tenantSigned
  } catch (err: any) {
    error.value = err?.data?.message ?? 'This signing link is invalid or has expired.'
  } finally {
    loading.value = false
  }
})

async function onSubmit() {
  if (!canSubmit.value) return
  const signatureDataUrl = padRef.value?.getDataUrl()
  if (!signatureDataUrl) {
    submitError.value = 'Please draw your signature first.'
    return
  }
  submitting.value = true
  submitError.value = ''
  try {
    await $fetch(`${config.public.apiBase}/questions/tenancy-sign/${token}`, {
      method: 'POST',
      body: { signerName: signerName.value.trim(), signatureDataUrl },
    })
    alreadySigned.value = true
  } catch (err: any) {
    submitError.value = err?.data?.message ?? 'Something went wrong - please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.sg-page {
  min-height: 100dvh;
  background: #f4f4f8;
  padding-bottom: 40px;
}
.sg-loading, .sg-error {
  padding: 60px 24px;
  text-align: center;
  color: #6b7089;
}
.sg-error-ic {
  width: 48px; height: 48px; border-radius: 50%; background: #fdeef1; color: #e84c6a;
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 22px;
  margin: 0 auto 14px;
}
.sg-error h2 { font-size: 18px; color: #0e2840; margin-bottom: 6px; }

.sg-hero {
  padding: 28px 22px 20px;
  background: linear-gradient(135deg, #231d45, #15102e);
  color: #fff;
}
.sg-brand { font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #9d97c9; text-transform: uppercase; }
.sg-h1 { font-size: 22px; font-weight: 800; margin-top: 6px; letter-spacing: -0.3px; }
.sg-meta { font-size: 12.5px; font-weight: 600; color: #c5c0e8; margin-top: 4px; }

.sg-done { padding: 60px 24px; text-align: center; }
.sg-done-ic {
  width: 56px; height: 56px; border-radius: 50%; background: #e7f6ef; color: #0f8a6e;
  display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800;
  margin: 0 auto 16px;
}
.sg-done-t { font-size: 17px; font-weight: 800; color: #0e2840; }
.sg-done-s { font-size: 13px; color: #6b7089; margin-top: 6px; }

.sg-doc {
  margin: 16px 16px 0;
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 4px 18px rgba(35, 29, 69, 0.06);
}
.sg-doc h2 { font-size: 11px; font-weight: 800; color: #008a84; letter-spacing: 0.6px; text-transform: uppercase; margin: 16px 0 6px; border-bottom: 1px solid #f0f0f4; padding-bottom: 4px; }
.sg-doc h2:first-child { margin-top: 0; }
.sg-kv { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; font-size: 13px; }
.sg-kv .k { color: #6b7089; font-weight: 600; }
.sg-kv .v { color: #0e2840; font-weight: 700; text-align: right; }

.sg-room-item { padding: 8px 0; border-bottom: 1px solid #f4f4f8; }
.sg-room-item:last-child { border-bottom: none; }
.sg-room-item-n { font-size: 12.5px; font-weight: 700; color: #0e2840; }
.sg-room-item-cc { display: flex; gap: 6px; margin-top: 4px; }
.sg-tag { font-size: 10px; font-weight: 700; text-transform: capitalize; background: #f4f4f8; color: #6b7089; padding: 3px 8px; border-radius: 100px; }
.sg-room-item-note { font-size: 11.5px; color: #6b7089; margin-top: 4px; font-style: italic; }

.sg-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.sg-photo-tile {
  display: block;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  background: #f4f4f8;
}
.sg-photo-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }

.mform-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-bottom: 8px;
}
.mform-input {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  color: #0e2840;
  outline: none;
  transition: all 0.18s;
}
.mform-input:focus { border-color: #00a19a; box-shadow: 0 0 0 3px rgba(61, 189, 163, 0.18); }
.btn-primary {
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 13px 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(61, 189, 163, 0.32);
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.sg-signblock { margin: 20px 16px 0; }
.sg-consent {
  display: flex; align-items: flex-start; gap: 10px; margin: 16px 0 18px;
  font-size: 12px; font-weight: 500; color: #3a3f52; line-height: 1.5; cursor: pointer;
}
.sg-consent input { margin-top: 2px; flex-shrink: 0; }
.sg-err { color: #c0364a; font-size: 12.5px; font-weight: 600; margin-bottom: 10px; }
</style>
