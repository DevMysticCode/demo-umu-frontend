<template>
  <!-- Make Offer — ported from the prototype's `screen.makeOffer`.
       Step 3 of the rollout: lets any logged-in user submit an offer
       on someone else's job. Step 7 will gate this to verified
       Supplier accounts at signup. -->
  <div class="mo-page mobile-container">
    <div class="mo-header">
      <button class="mo-back-btn" type="button" aria-label="Back" @click="goBack">‹</button>
      <div class="mo-header-title">Make your offer</div>
      <span class="mo-header-spacer" />
    </div>

    <template v-if="pending">
      <div class="mo-loading">Loading job…</div>
    </template>

    <template v-else-if="!job">
      <div class="mo-empty">Couldn't load this job. Try again.</div>
    </template>

    <template v-else>
      <div class="mo-job-card mo-anim-1">
        <div class="mo-job-card-h">📋 Job</div>
        <div class="mo-job-card-title">{{ job.title }}</div>
        <div class="mo-job-card-meta">
          📍 {{ job.locationLabel }} · {{ job.categoryLabel }}
        </div>
      </div>

      <div class="mo-field-group mo-anim-1">
        <div class="mo-field-label">Your price (£)</div>
        <input
          v-model.number="form.price"
          class="mo-price-input"
          type="number"
          inputmode="numeric"
          min="1"
          step="1"
          :placeholder="placeholderPrice"
        />
        <div class="mo-field-help">
          Customer's budget:
          <b>{{ formatBudget(job.budgetMin) }}<span v-if="job.budgetMax">
            – {{ formatBudget(job.budgetMax) }}</span></b>
          <span v-if="otherOffersLine"> · {{ otherOffersLine }}</span>
        </div>
      </div>

      <div v-if="job.availableDates.length" class="mo-field-group mo-anim-2">
        <div class="mo-field-label">Available date</div>
        <div class="mo-chip-row">
          <button
            v-for="d in job.availableDates"
            :key="d"
            class="mo-chip"
            :class="{ selected: form.availableDate === d }"
            type="button"
            @click="form.availableDate = form.availableDate === d ? null : d"
          >
            {{ d }}
          </button>
        </div>
      </div>

      <div class="mo-field-group mo-anim-2">
        <div class="mo-field-label">Message to customer</div>
        <textarea
          v-model="form.message"
          class="mo-message-input"
          rows="5"
          maxlength="4000"
          placeholder="Hi, I'd love to take on this job. I have…"
        />
        <div class="mo-field-help">{{ form.message.length }} / 4000 chars</div>
      </div>

      <div class="mo-trust-strip mo-anim-3">
        <div class="mo-trust-strip-icon">🛡</div>
        <div class="mo-trust-strip-text">
          <b>The customer reviews your offer.</b>
          They decide whether to accept. Once they do, funds are held
          in UProtect escrow until the job's verified complete.
        </div>
      </div>

      <div v-if="submitError" class="mo-error">{{ submitError }}</div>

      <div class="mo-cta-row mo-anim-3">
        <button
          class="mo-cta-primary"
          type="button"
          :disabled="!canSubmit || submitting"
          @click="submit"
        >
          {{ submitting ? 'Submitting…' : 'Submit offer' }}
        </button>
      </div>

      <div style="height: 100px" />
    </template>

    <MarketplaceBottomNav active="browse" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type { CreateOfferPayload } from '~/composables/useMarketplace'

definePageMeta({ title: 'Make an offer - Marketplace', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { showToast } = useAppToast()
const { fetchJob, createOffer } = useMarketplace()

const jobId = computed(() => String(route.params.id))

const { data: job, pending } = await useAsyncData(
  () => `mp-make-offer-${jobId.value}`,
  async () => {
    try {
      return await fetchJob(jobId.value)
    } catch {
      return null
    }
  },
)

const form = ref<{ price: number | null; message: string; availableDate: string | null }>({
  price: null,
  message: '',
  availableDate: null,
})

// Suggest a price at the midpoint of the customer's budget so the
// input doesn't feel empty when the user lands on the page.
const placeholderPrice = computed(() => {
  if (!job.value) return '£0'
  if (job.value.budgetMax) {
    const mid = Math.round((job.value.budgetMin + job.value.budgetMax) / 2)
    return `£${mid.toLocaleString('en-GB')} · suggested`
  }
  return `£${job.value.budgetMin.toLocaleString('en-GB')} · suggested`
})

const otherOffersLine = computed(() => {
  if (!job.value) return ''
  const n = job.value.offerCount
  if (!n) return 'be the first to quote'
  return `${n} other supplier${n === 1 ? '' : 's'} have already quoted`
})

const canSubmit = computed(() => {
  return (form.value.price ?? 0) > 0 &&
         form.value.message.trim().length >= 20
})

const submitting = ref(false)
const submitError = ref<string | null>(null)

function formatBudget(amount: number): string {
  return `£${new Intl.NumberFormat('en-GB').format(amount)}`
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push(`/marketplace/jobs/${jobId.value}`)
}

async function submit() {
  if (!canSubmit.value || submitting.value || !job.value) return
  submitError.value = null
  submitting.value = true
  try {
    const payload: CreateOfferPayload = {
      price: form.value.price!,
      message: form.value.message.trim(),
      availableDate: form.value.availableDate ?? undefined,
    }
    await createOffer(jobId.value, payload)
    showToast({ message: 'Offer submitted', iconEmoji: '✅' })
    router.replace(`/marketplace/jobs/${jobId.value}`)
  } catch (err: any) {
    const msg = err?.data?.message
    submitError.value = Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Could not submit offer. Try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.mo-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

/* ── Header ──────────────────────────────────────────────────── */
.mo-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 8px;
}
.mo-back-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid #e4e5ed;
  background: #fff;
  color: #231d45;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.mo-header-title {
  flex: 1;
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  text-align: center;
}
.mo-header-spacer { width: 36px; flex-shrink: 0; }

.mo-loading, .mo-empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}

/* ── Job recap card ──────────────────────────────────────────── */
.mo-job-card {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.mo-job-card-h {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #6b7089;
  margin-bottom: 4px;
}
.mo-job-card-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.mo-job-card-meta {
  font-size: 11.5px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 4px;
}

/* ── Field groups ────────────────────────────────────────────── */
.mo-field-group { padding: 16px 20px 0; }
.mo-field-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #6b7089;
  margin-bottom: 6px;
}
.mo-field-help {
  font-size: 11.5px;
  font-weight: 500;
  color: #6b7089;
  margin-top: 6px;
  line-height: 1.5;
}
.mo-field-help b { font-weight: 800; color: #231d45; }

.mo-price-input {
  width: 100%;
  background: #fff;
  border: 1.5px solid #e4e5ed;
  border-radius: 14px;
  padding: 16px;
  font-family: inherit;
  font-size: 26px;
  font-weight: 800;
  color: #008a84;
  text-align: center;
  outline: none;
  letter-spacing: -0.6px;
}
.mo-price-input:focus { border-color: #00a19a; }
.mo-price-input::placeholder {
  color: #a8a9ad;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0;
}

.mo-message-input {
  width: 100%;
  background: #fff;
  border: 1px solid #e4e5ed;
  border-radius: 12px;
  padding: 11px 13px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: #231d45;
  outline: none;
  resize: vertical;
}
.mo-message-input:focus { border-color: #00a19a; }

.mo-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.mo-chip {
  padding: 7px 12px;
  background: #fff;
  border: 1px solid #e4e5ed;
  border-radius: 100px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #6b7089;
  cursor: pointer;
}
.mo-chip.selected {
  background: #e5f4f2;
  border-color: #00a19a;
  color: #00635E;
}

/* ── Trust strip ─────────────────────────────────────────────── */
.mo-trust-strip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 16px 20px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f2faf8, #fff);
  border: 1px solid #d4ece2;
  border-radius: 14px;
}
.mo-trust-strip-icon {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.mo-trust-strip-text {
  font-size: 11.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.5;
}
.mo-trust-strip-text b { font-weight: 800; color: #231d45; }

.mo-error {
  margin: 12px 20px 0;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #c43c3c;
}

/* ── CTA ─────────────────────────────────────────────────────── */
.mo-cta-row { padding: 18px 20px 0; }
.mo-cta-primary {
  width: 100%;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 15px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.32);
}
.mo-cta-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.mo-cta-primary:not(:disabled):hover { filter: brightness(1.05); }

/* ── Animations ──────────────────────────────────────────────── */
@keyframes moFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.mo-anim-1 { animation: moFadeUp 0.32s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.mo-anim-2 { animation: moFadeUp 0.32s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both; }
.mo-anim-3 { animation: moFadeUp 0.32s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .mo-anim-1, .mo-anim-2, .mo-anim-3 { animation: none; }
}
</style>
