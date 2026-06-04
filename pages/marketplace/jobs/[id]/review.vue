<template>
  <!-- Leave Review — ported from the prototype's leave-review screen.
       The page derives whether the viewer is reviewing the supplier or
       the customer from job ownership; both directions land here. -->
  <div class="rv-page mobile-container">
    <div class="rv-header">
      <button class="rv-back-btn" type="button" aria-label="Back" @click="goBack">‹</button>
      <div class="rv-header-title">Leave a review</div>
      <span class="rv-header-spacer" />
    </div>

    <template v-if="loading">
      <div class="rv-loading">Loading job…</div>
    </template>

    <template v-else-if="!job || !payment">
      <div class="rv-empty">Couldn't load this job.</div>
    </template>

    <template v-else-if="payment.status !== 'released'">
      <div class="rv-empty">
        <div class="rv-empty-emoji">🛡</div>
        <div class="rv-empty-title">Funds still in escrow</div>
        <div class="rv-empty-sub">
          You can leave a review once you've released the payment.
        </div>
        <button class="rv-empty-btn" type="button" @click="goToReceipt">
          View receipt
        </button>
      </div>
    </template>

    <template v-else>
      <div class="rv-hero rv-anim-1">
        <div class="rv-hero-job">{{ job.categoryLabel }} · {{ job.title }}</div>
        <div class="rv-hero-prompt">
          How was the {{ direction === 'customer_to_supplier' ? 'supplier' : 'customer' }}?
        </div>
      </div>

      <!-- Star rating -->
      <div class="rv-stars rv-anim-2">
        <button
          v-for="n in 5"
          :key="n"
          class="rv-star"
          :class="{ on: form.rating >= n }"
          type="button"
          :aria-label="`${n} stars`"
          @click="form.rating = n"
        >
          ★
        </button>
      </div>
      <div class="rv-stars-label">
        {{ ratingLabel }}
      </div>

      <!-- Text body -->
      <div class="rv-field rv-anim-3">
        <div class="rv-field-label">Tell others what they should know</div>
        <textarea
          v-model="form.body"
          class="rv-field-input"
          rows="5"
          maxlength="4000"
          placeholder="Was the work clean? Did they communicate? Show up on time?"
        />
        <div class="rv-field-help">{{ form.body.length }} / 4000 chars</div>
      </div>

      <div v-if="submitError" class="rv-error">{{ submitError }}</div>

      <div class="rv-cta-row rv-anim-4">
        <button
          class="rv-cta-primary"
          type="button"
          :disabled="!canSubmit || submitting"
          @click="submit"
        >
          {{ submitting ? 'Posting…' : 'Post review' }}
        </button>
      </div>

      <div style="height: 100px" />
    </template>

    <MarketplaceBottomNav active="projects" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'

definePageMeta({ title: 'Leave a review — Marketplace', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { showToast } = useAppToast()
const { profile } = useProfile()
const { fetchJob, fetchPaymentForJob, createReview } = useMarketplace()

const jobId = computed(() => String(route.params.id))

const loading = ref(true)
const job = ref<Awaited<ReturnType<typeof fetchJob>> | null>(null)
const payment = ref<Awaited<ReturnType<typeof fetchPaymentForJob>>>(null)

const form = ref({ rating: 0, body: '' })
const submitting = ref(false)
const submitError = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    const [j, p] = await Promise.all([
      fetchJob(jobId.value).catch(() => null),
      fetchPaymentForJob(jobId.value).catch(() => null),
    ])
    job.value = j
    payment.value = p
  } finally {
    loading.value = false
  }
}
await load()

// Derived from the job's customer + payment.supplier — keeps the
// reviewer honest about which side they're on.
const direction = computed<'customer_to_supplier' | 'supplier_to_customer' | null>(() => {
  if (!job.value || !payment.value || !profile.value) return null
  if (job.value.customerId === profile.value.id) return 'customer_to_supplier'
  if (payment.value.supplierId === profile.value.id) return 'supplier_to_customer'
  return null
})

const ratingLabel = computed(() => {
  switch (form.value.rating) {
    case 5: return 'Excellent · would use again'
    case 4: return 'Good · mostly happy'
    case 3: return 'OK · some issues'
    case 2: return 'Poor · would not use again'
    case 1: return 'Bad · avoid'
    default: return 'Tap a star'
  }
})

const canSubmit = computed(() => form.value.rating >= 1 && form.value.rating <= 5)

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitError.value = null
  submitting.value = true
  try {
    await createReview(jobId.value, {
      rating: form.value.rating,
      body: form.value.body.trim() || undefined,
    })
    showToast({ message: 'Review posted — thanks for the feedback', iconEmoji: '⭐' })
    router.replace(`/marketplace/jobs/${jobId.value}`)
  } catch (err: any) {
    submitError.value = err?.data?.message ?? 'Could not post review.'
  } finally {
    submitting.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push(`/marketplace/jobs/${jobId.value}`)
}
function goToReceipt() {
  if (payment.value) router.push(`/marketplace/payments/${payment.value.id}`)
}
</script>

<style scoped>
.rv-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

.rv-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 8px;
}
.rv-back-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid #e4e5ed;
  background: #fff;
  color: #231d45;
  font-size: 22px; font-weight: 800; line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.rv-header-title {
  flex: 1;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  text-align: center;
}
.rv-header-spacer { width: 36px; flex-shrink: 0; }

.rv-loading {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}

.rv-empty {
  padding: 60px 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}
.rv-empty-emoji { font-size: 40px; margin-bottom: 8px; }
.rv-empty-title { font-size: 16px; font-weight: 800; color: #231d45; margin-bottom: 4px; }
.rv-empty-sub { margin-bottom: 16px; }
.rv-empty-btn {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff; border: none; border-radius: 12px;
  padding: 12px 18px; font-family: inherit; font-size: 13px; font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.32);
}

/* ── Hero ────────────────────────────────────────────────────── */
.rv-hero {
  margin: 6px 20px 0;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.rv-hero-job {
  font-size: 12px;
  font-weight: 700;
  color: #6b7089;
  letter-spacing: -0.1px;
}
.rv-hero-prompt {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  margin-top: 4px;
}

/* ── Star rating ────────────────────────────────────────────── */
.rv-stars {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin: 22px 20px 4px;
}
.rv-star {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 40px;
  color: #d8dae6;
  padding: 4px;
  transition: color 0.15s, transform 0.15s;
  line-height: 1;
}
.rv-star:hover { transform: scale(1.06); }
.rv-star.on {
  color: #f5a623;
  text-shadow: 0 2px 6px rgba(245, 166, 35, 0.4);
}
.rv-stars-label {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #6b7089;
  letter-spacing: 0.2px;
  margin-bottom: 4px;
}

/* ── Field ──────────────────────────────────────────────────── */
.rv-field { padding: 14px 20px 0; }
.rv-field-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #6b7089;
  margin-bottom: 6px;
}
.rv-field-input {
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
.rv-field-input:focus { border-color: #00a19a; }
.rv-field-help {
  font-size: 11px;
  font-weight: 500;
  color: #6b7089;
  margin-top: 4px;
}

.rv-error {
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
.rv-cta-row { padding: 16px 20px 0; }
.rv-cta-primary {
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
.rv-cta-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  background: linear-gradient(135deg, #c8cad6, #aaadbe);
}
.rv-cta-primary:not(:disabled):hover { filter: brightness(1.05); }

/* ── Animations ──────────────────────────────────────────────── */
@keyframes rvFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.rv-anim-1 { animation: rvFadeUp 0.32s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.rv-anim-2 { animation: rvFadeUp 0.32s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both; }
.rv-anim-3 { animation: rvFadeUp 0.32s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both; }
.rv-anim-4 { animation: rvFadeUp 0.32s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .rv-anim-1, .rv-anim-2, .rv-anim-3, .rv-anim-4 { animation: none; }
}
</style>
