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
      <!-- Celebration card — only for the customer side, mirrors the
           prototype's release-success beat (the supplier side gets a
           lighter hero without the funds copy). -->
      <div v-if="direction === 'customer_to_supplier'" class="rv-celebrate rv-anim-1">
        <div class="rv-celebrate-icon">🎉</div>
        <div class="rv-celebrate-head">Funds released!</div>
        <div class="rv-celebrate-amt">{{ formatMoney(payment.amount) }}</div>
        <div class="rv-celebrate-sub">
          {{ formatMoney(payment.platformFee) }} UProtect fee retained ·
          {{ formatMoney(payment.amount) }} paid to <b>{{ counterpartyName }}</b>.
        </div>
      </div>
      <div v-else class="rv-hero rv-anim-1">
        <div class="rv-hero-job">{{ job.categoryLabel }} · {{ job.title }}</div>
        <div class="rv-hero-prompt">How was the customer?</div>
      </div>

      <!-- Counterparty card -->
      <div class="rv-card rv-anim-2">
        <div class="rv-counter-row">
          <div class="rv-counter-avatar">{{ counterpartyInitials }}</div>
          <div class="rv-counter-info">
            <div class="rv-counter-name">{{ counterpartyName }}</div>
            <div class="rv-counter-sub">
              {{ job.title }} · {{ formatMoney(payment.amount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Overall star rating -->
      <div class="rv-card rv-anim-2">
        <div class="rv-card-h">Overall rating</div>
        <div class="rv-stars">
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
        <div class="rv-stars-label">{{ ratingLabel }}</div>
      </div>

      <!-- Category sliders — only when reviewing a supplier (no point
           rating customers on workmanship). -->
      <div
        v-if="direction === 'customer_to_supplier'"
        class="rv-card rv-anim-3"
      >
        <div class="rv-card-h">Rate by category</div>
        <div
          v-for="slider in SLIDERS"
          :key="slider.key"
          class="rv-slider-row"
        >
          <div class="rv-slider-head">
            <span class="rv-slider-label">
              {{ slider.icon }} {{ slider.label }}
            </span>
            <span class="rv-slider-stars">
              <span
                v-for="n in 5"
                :key="n"
                :class="{ empty: form[slider.key] < n }"
              >★</span>
            </span>
          </div>
          <div
            class="rv-slider-track"
            @click="onSliderClick($event, slider.key)"
            @pointermove="onSliderDrag($event, slider.key)"
          >
            <div
              class="rv-slider-fill"
              :style="{ width: (form[slider.key] / 5) * 100 + '%' }"
            />
            <!-- Click targets (invisible) so users can also tap a specific
                 star position on small screens. -->
            <button
              v-for="n in 5"
              :key="n"
              class="rv-slider-stop"
              type="button"
              :aria-label="`Set ${slider.label} to ${n}`"
              @click.stop="form[slider.key] = n"
            />
          </div>
        </div>
      </div>

      <!-- Tag chips — only when reviewing a supplier -->
      <div
        v-if="direction === 'customer_to_supplier'"
        class="rv-card rv-anim-3"
      >
        <div class="rv-card-h">What did they do well?</div>
        <div class="rv-tag-row">
          <button
            v-for="tag in TAGS"
            :key="tag"
            class="rv-tag"
            :class="{ selected: form.tags.includes(tag) }"
            type="button"
            @click="toggleTag(tag)"
          >
            <span v-if="form.tags.includes(tag)">✓ </span>{{ tag }}
          </button>
        </div>
      </div>

      <!-- Text body -->
      <div class="rv-field rv-anim-3">
        <div class="rv-field-label">A few words (optional)</div>
        <textarea
          v-model="form.body"
          class="rv-field-input"
          rows="4"
          maxlength="4000"
          placeholder="Tell other customers what they were like to work with…"
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
// Need fetchProfile too — the `direction` computed gates the entire
// form on profile.value.id, and useProfile doesn't auto-load. On a
// fresh refresh / deep-link, profile stayed null and the submit
// button silently broke (DF4 audit HIGH finding).
const { profile, fetchProfile } = useProfile()
const { fetchJob, fetchPaymentForJob, fetchContract, createReview } = useMarketplace()

const jobId = computed(() => String(route.params.id))

const loading = ref(true)
const job = ref<Awaited<ReturnType<typeof fetchJob>> | null>(null)
const payment = ref<Awaited<ReturnType<typeof fetchPaymentForJob>>>(null)
// Pulled in alongside job + payment so the celebration card can show
// the counterparty's name + initials without a second lookup.
const counterpartyName = ref('')
const counterpartyInitials = ref('')

// Slider state mirrors the prototype's 4 dimensions. Defaults to 5
// (matching the prototype's "all filled in" pre-state); the user
// adjusts down where they want to.
type SliderKey = 'punctuality' | 'communication' | 'workmanship' | 'reliability'
const SLIDERS: Array<{ key: SliderKey; label: string; icon: string }> = [
  { key: 'punctuality',   label: 'Punctuality',   icon: '⏰' },
  { key: 'communication', label: 'Communication', icon: '🤝' },
  { key: 'workmanship',   label: 'Workmanship',   icon: '🏆' },
  { key: 'reliability',   label: 'Reliability',   icon: '📅' },
]

const TAGS = [
  'Left it spotless',
  'Stuck to quote',
  'Finished on time',
  'Respectful',
  'Tidy worker',
  'Good comms',
  'Fair priced',
]

const form = ref({
  rating: 0,
  body: '',
  punctuality: 5,
  communication: 5,
  workmanship: 5,
  reliability: 5,
  tags: [] as string[],
})
const submitting = ref(false)
const submitError = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    const [j, p, c] = await Promise.all([
      fetchJob(jobId.value).catch(() => null),
      fetchPaymentForJob(jobId.value).catch(() => null),
      // Optional contract bundle — gives us the counterparty's name +
      // initials without a separate user lookup. If it fails (e.g. the
      // backend is older), we fall back to generic copy.
      fetchContract(jobId.value).catch(() => null),
      // Profile is the one that gates the entire form; load it
      // alongside everything else so refresh + deep-link work.
      profile.value ? Promise.resolve() : fetchProfile().catch(() => undefined),
    ])
    job.value = j
    payment.value = p
    if (c && profile.value) {
      const me = profile.value.id
      const other = c.parties.customer.id === me ? c.parties.supplier : c.parties.customer
      counterpartyName.value = other.name
      counterpartyInitials.value = other.initials
    }
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
    const isCustomer = direction.value === 'customer_to_supplier'
    await createReview(jobId.value, {
      rating: form.value.rating,
      body: form.value.body.trim() || undefined,
      // Only send the supplier-side dimensions when reviewing a supplier;
      // supplier-reviewing-customer reviews skip these.
      ...(isCustomer
        ? {
            punctuality: form.value.punctuality,
            communication: form.value.communication,
            workmanship: form.value.workmanship,
            reliability: form.value.reliability,
            tags: form.value.tags,
          }
        : {}),
    })
    showToast({ message: 'Review posted — thanks for the feedback', iconEmoji: '⭐' })
    router.replace(`/marketplace/jobs/${jobId.value}`)
  } catch (err: any) {
    submitError.value = err?.data?.message ?? 'Could not post review.'
  } finally {
    submitting.value = false
  }
}

function toggleTag(tag: string) {
  const i = form.value.tags.indexOf(tag)
  if (i === -1) form.value.tags.push(tag)
  else form.value.tags.splice(i, 1)
}

// Click anywhere on the track to set the value 1-5. Drag is supported
// via pointermove for a finer adjustment feel.
function sliderValueFromEvent(e: { clientX: number; currentTarget: EventTarget | null }): number {
  const track = e.currentTarget as HTMLElement | null
  if (!track) return 5
  const rect = track.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  return Math.max(1, Math.round(ratio * 5))
}
function onSliderClick(e: PointerEvent | MouseEvent, key: SliderKey) {
  form.value[key] = sliderValueFromEvent(e)
}
function onSliderDrag(e: PointerEvent, key: SliderKey) {
  // Only react to drags while a button is pressed — keeps hover from
  // accidentally rewriting the slider state.
  if (e.buttons === 0) return
  form.value[key] = sliderValueFromEvent(e)
}

function formatMoney(pence: number): string {
  const pounds = pence / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: pounds % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(pounds)
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

/* ── Celebrate card (funds released) ───────────────────────── */
.rv-celebrate {
  margin: 6px 20px 0;
  padding: 20px 18px;
  background: linear-gradient(135deg, #D5F0EE, #F2FAF8);
  border: 2px solid #00a19a;
  border-radius: 18px;
  text-align: center;
  box-shadow: 0 14px 32px -8px rgba(0, 161, 154, 0.3);
}
.rv-celebrate-icon {
  font-size: 40px;
  margin-bottom: 8px;
  animation: rvShimmer 1.8s ease-in-out infinite;
}
@keyframes rvShimmer {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}
.rv-celebrate-head {
  font-size: 18px;
  font-weight: 800;
  color: #008a84;
  letter-spacing: -0.3px;
  margin-bottom: 4px;
}
.rv-celebrate-amt {
  font-size: 34px;
  font-weight: 800;
  color: #008a84;
  letter-spacing: -1px;
  line-height: 1;
  margin: 6px 0 8px;
}
.rv-celebrate-sub {
  font-size: 12px;
  font-weight: 600;
  color: #6b7089;
  line-height: 1.5;
}
.rv-celebrate-sub b { color: #231d45; font-weight: 800; }

/* ── Generic review card (sliders/tags/stars frame) ──────── */
.rv-card {
  margin: 12px 20px 0;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.rv-card-h {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #6b7089;
  text-align: center;
  margin-bottom: 8px;
}

.rv-counter-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rv-counter-avatar {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #352D5C, #008A84);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
}
.rv-counter-name {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
}
.rv-counter-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 2px;
}

/* ── Star rating ────────────────────────────────────────────── */
.rv-stars {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 4px 0 0;
}
.rv-star {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 36px;
  color: #d8dae6;
  padding: 4px;
  transition: color 0.15s, transform 0.15s;
  line-height: 1;
}
.rv-star:hover { transform: scale(1.08); }
.rv-star.on {
  color: #f5a623;
  text-shadow: 0 2px 6px rgba(245, 166, 35, 0.4);
}
.rv-stars-label {
  text-align: center;
  font-size: 12.5px;
  font-weight: 700;
  color: #6b7089;
  margin-top: 6px;
}

/* ── Category sliders ─────────────────────────────────────── */
.rv-slider-row { padding: 11px 0; }
.rv-slider-row + .rv-slider-row { border-top: 1px solid #f0f1f5; }
.rv-slider-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.rv-slider-label {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
}
.rv-slider-stars {
  font-size: 14px;
  letter-spacing: 1px;
  color: #f5a623;
}
.rv-slider-stars .empty { color: #e4e5ed; }
.rv-slider-track {
  position: relative;
  height: 10px;
  border-radius: 100px;
  background: #f0f2f8;
  cursor: pointer;
  touch-action: none;
  overflow: hidden;
}
.rv-slider-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: linear-gradient(90deg, #00a19a, #5eead4);
  border-radius: 100px;
  transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.rv-slider-stop {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20%;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}
.rv-slider-stop:nth-child(2) { left: 0; }
.rv-slider-stop:nth-child(3) { left: 20%; }
.rv-slider-stop:nth-child(4) { left: 40%; }
.rv-slider-stop:nth-child(5) { left: 60%; }
.rv-slider-stop:nth-child(6) { left: 80%; }

/* ── Tag chips ────────────────────────────────────────────── */
.rv-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 4px;
}
.rv-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #231d45;
  background: #fff;
  border: 1.5px solid #e4e5ed;
  border-radius: 100px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.rv-tag:hover {
  border-color: #b6e2dd;
  background: #f2faf8;
  color: #008a84;
}
.rv-tag.selected {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border-color: #00a19a;
  box-shadow: 0 4px 10px rgba(0, 161, 154, 0.25);
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
