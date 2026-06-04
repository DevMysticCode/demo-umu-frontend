<template>
  <!-- Post Job wizard — 5 steps, ported from the prototype's `screen.postJob`
       block. Each step validates locally; the final POST happens on the
       review step. Photos upload immediately as the user picks them so the
       previews are real, not blob URLs that vanish on refresh. -->
  <div class="pj-page mobile-container">
    <!-- Custom header so the back chevron can step the wizard back
         instead of navigating away. On step 1 it exits to /marketplace. -->
    <div class="pj-header">
      <button class="pj-back-btn" type="button" aria-label="Back" @click="onBack">‹</button>
      <div class="pj-header-title">{{ stepTitle }}</div>
      <span class="pj-header-pill">Free</span>
    </div>

    <div class="pj-stepper">
      <div
        v-for="i in TOTAL_STEPS"
        :key="i"
        class="pj-stepper-step"
        :class="{ done: i < step, active: i === step }"
      />
    </div>

    <!-- ═════════════ STEP 1 · CATEGORY ═════════════ -->
    <template v-if="step === 1">
      <div class="pj-section-h">
        <div class="pj-section-title">Step 1 · Choose category</div>
      </div>
      <div class="pj-field-help">
        What kind of work do you need done? You can change this later.
      </div>

      <div class="pj-cat-grid pj-anim-1">
        <button
          v-for="cat in (categories ?? [])"
          :key="cat.slug"
          class="pj-cat-tile"
          :class="{ sel: form.categorySlug === cat.slug }"
          :style="{ background: cat.background }"
          type="button"
          @click="form.categorySlug = cat.slug"
        >
          <span class="pj-cat-emoji">{{ cat.emoji }}</span>
          <span class="pj-cat-name">{{ cat.name }}</span>
        </button>
      </div>
    </template>

    <!-- ═════════════ STEP 2 · PHOTOS ═════════════ -->
    <template v-else-if="step === 2">
      <div class="pj-section-h">
        <div class="pj-section-title">Step 2 · Upload photos</div>
      </div>
      <div class="pj-field-help">
        Clear photos from different angles help suppliers quote accurately.
        <b>Minimum 3 photos.</b>
      </div>

      <div class="pj-photo-checklist pj-anim-1">
        <div class="pj-photo-checklist-h">📸 Photo checklist</div>
        <div
          v-for="(c, idx) in PHOTO_CHECKLIST"
          :key="idx"
          class="pj-photo-checklist-row"
          :class="{ done: idx < uploadedPhotos.length }"
        >
          <span class="pj-checklist-tick">{{ idx < uploadedPhotos.length ? '✓' : '○' }}</span>
          {{ c }}
        </div>
      </div>

      <div class="pj-photo-grid pj-anim-2">
        <div
          v-for="(url, idx) in uploadedPhotos"
          :key="url"
          class="pj-photo-tile filled"
          :style="{ backgroundImage: `url(${resolvePhotoUrl(url)})` }"
        >
          <button
            class="pj-photo-remove"
            type="button"
            aria-label="Remove photo"
            @click="removePhoto(idx)"
          >
            ×
          </button>
        </div>

        <label
          v-if="uploadedPhotos.length < MAX_PHOTOS"
          class="pj-photo-tile"
          :class="{ uploading: photoUploading }"
        >
          <input
            type="file"
            accept="image/*"
            multiple
            class="pj-photo-input"
            @change="onPhotoPicked"
          />
          <span v-if="photoUploading">…</span>
          <span v-else>+</span>
        </label>
      </div>

      <div v-if="photoError" class="pj-error">{{ photoError }}</div>
    </template>

    <!-- ═════════════ STEP 3 · DETAILS ═════════════ -->
    <template v-else-if="step === 3">
      <div class="pj-section-h">
        <div class="pj-section-title">Step 3 · Job details</div>
      </div>

      <div class="pj-field-group pj-anim-1">
        <div class="pj-field-label">Job title</div>
        <input
          v-model="form.title"
          class="pj-field-input"
          type="text"
          maxlength="120"
          placeholder="e.g. Full bathroom replumb & refit"
        />
      </div>

      <div class="pj-field-group">
        <div class="pj-field-label">Detailed description</div>
        <textarea
          v-model="form.description"
          class="pj-field-input"
          rows="5"
          maxlength="4000"
          placeholder="Describe the work, access details, materials provided, etc."
        />
        <div class="pj-field-help-inline">
          {{ form.description.length }} / 4000 chars
        </div>
      </div>

      <div class="pj-field-row">
        <div>
          <div class="pj-field-label">Location</div>
          <input
            v-model="form.locationLabel"
            class="pj-field-input"
            type="text"
            placeholder="Bristol BS1"
          />
        </div>
        <div>
          <div class="pj-field-label">Urgency</div>
          <select v-model="form.urgency" class="pj-field-input pj-field-select">
            <option value="urgent">Urgent</option>
            <option value="standard">Standard</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>

      <div class="pj-field-group">
        <div class="pj-field-label">Available dates</div>
        <div class="pj-field-help-inline">
          Pick the dates you'd like the supplier to start.
        </div>
        <div class="pj-chip-row">
          <button
            v-for="d in DATE_CHIPS"
            :key="d"
            class="pj-chip"
            :class="{ selected: form.availableDates.includes(d) }"
            type="button"
            @click="toggleDate(d)"
          >
            {{ d }}
          </button>
        </div>
      </div>
    </template>

    <!-- ═════════════ STEP 4 · BUDGET ═════════════ -->
    <template v-else-if="step === 4">
      <div class="pj-section-h">
        <div class="pj-section-title">Step 4 · Set your budget</div>
      </div>
      <div class="pj-field-help">
        Suppliers will offer within this range. You're not committed until
        you accept.
      </div>

      <div class="pj-budget-row pj-anim-1">
        <label class="pj-budget-pill">
          <div class="pj-budget-pill-label">Minimum (£)</div>
          <input
            v-model.number="form.budgetMin"
            class="pj-budget-pill-input"
            type="number"
            inputmode="numeric"
            min="1"
            step="1"
            placeholder="0"
          />
        </label>
        <label class="pj-budget-pill">
          <div class="pj-budget-pill-label">Maximum (£) · optional</div>
          <input
            v-model.number="form.budgetMax"
            class="pj-budget-pill-input"
            type="number"
            inputmode="numeric"
            min="1"
            step="1"
            placeholder="-"
          />
        </label>
      </div>

      <div class="pj-insight-card pj-anim-2">
        <div class="pj-insight-icon">💡</div>
        <div class="pj-insight-text">
          <b>Posting is free.</b>
          You're only charged when you accept an offer — funds held in
          UProtect escrow until the job's complete.
        </div>
      </div>
    </template>

    <!-- ═════════════ STEP 5 · REVIEW ═════════════ -->
    <template v-else-if="step === 5">
      <div class="pj-section-h">
        <div class="pj-section-title">Step 5 · Review &amp; post</div>
      </div>

      <div class="pj-review-card pj-anim-1">
        <div class="pj-review-cat" v-if="selectedCategory">
          {{ selectedCategory.emoji }} {{ selectedCategory.name }}
        </div>
        <div class="pj-review-title">{{ form.title || '(no title)' }}</div>
        <div class="pj-review-meta">
          📍 {{ form.locationLabel || '(no location)' }} ·
          {{ urgencyLabel(form.urgency) }}
        </div>

        <div class="pj-review-photos">
          <div
            v-for="url in uploadedPhotos"
            :key="url"
            class="pj-review-photo"
            :style="{ backgroundImage: `url(${resolvePhotoUrl(url)})` }"
          />
        </div>

        <div class="pj-review-row">
          <span>Budget</span>
          <b>{{ budgetDisplay }}</b>
        </div>
        <div v-if="form.availableDates.length" class="pj-review-row">
          <span>Available</span>
          <b>{{ form.availableDates.join(' · ') }}</b>
        </div>

        <div class="pj-review-desc">{{ form.description }}</div>
      </div>

      <div v-if="submitError" class="pj-error">{{ submitError }}</div>
    </template>

    <!-- ═════════════ FOOTER · CONTINUE / POST ═════════════ -->
    <div class="pj-cta-row">
      <button
        v-if="step < TOTAL_STEPS"
        class="pj-cta-primary"
        type="button"
        :disabled="!canContinue"
        @click="goNext"
      >
        Continue →
      </button>
      <button
        v-else
        class="pj-cta-primary"
        type="button"
        :disabled="!canSubmit || submitting"
        @click="submit"
      >
        {{ submitting ? 'Posting…' : 'Post job — Free' }}
      </button>
    </div>

    <div style="height: 100px" />
    <MarketplaceBottomNav active="post" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type {
  CreateJobPayload,
  MarketplaceUrgency,
} from '~/composables/useMarketplace'

definePageMeta({ title: 'Post a job — Marketplace', middleware: 'auth' })

const router = useRouter()
const { showToast } = useAppToast()
const { fetchCategories, uploadPhoto, createJob, resolvePhotoUrl } = useMarketplace()

// ── Step machine ──────────────────────────────────────────────────
const TOTAL_STEPS = 5
const step = ref<number>(1)
const stepTitle = computed(() => {
  switch (step.value) {
    case 1: return 'Choose category'
    case 2: return 'Upload photos'
    case 3: return 'Job details'
    case 4: return 'Your budget'
    case 5: return 'Review & post'
    default: return 'Post a job'
  }
})

// ── Form state ────────────────────────────────────────────────────
interface FormState {
  categorySlug: string | null
  title: string
  description: string
  locationLabel: string
  urgency: MarketplaceUrgency
  availableDates: string[]
  budgetMin: number | null
  budgetMax: number | null
}
const form = ref<FormState>({
  categorySlug: null,
  title: '',
  description: '',
  locationLabel: '',
  urgency: 'standard',
  availableDates: [],
  budgetMin: null,
  budgetMax: null,
})

// Static date chips for now — Step 3+ will replace with a real
// date picker rooted at "today".
const DATE_CHIPS = ['25 Apr', '28 Apr', '2 May', '9 May', '16 May', '23 May']

const PHOTO_CHECKLIST = [
  'Overall view of work area',
  'Close-up of problem areas',
  'Access points / surrounding area',
  'Existing damage or issues',
]

const MAX_PHOTOS = 12

// ── Photos ────────────────────────────────────────────────────────
const uploadedPhotos = ref<string[]>([]) // URLs returned from /upload-photo
const photoUploading = ref(false)
const photoError = ref<string | null>(null)

async function onPhotoPicked(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = '' // allow re-picking the same file
  if (!files.length) return

  photoError.value = null
  photoUploading.value = true
  try {
    for (const f of files) {
      if (uploadedPhotos.value.length >= MAX_PHOTOS) break
      try {
        const { url } = await uploadPhoto(f)
        uploadedPhotos.value.push(url)
      } catch (err: any) {
        photoError.value = err?.data?.message ?? `Couldn't upload ${f.name}`
        // keep going so a single bad file doesn't drop the batch
      }
    }
  } finally {
    photoUploading.value = false
  }
}

function removePhoto(idx: number) {
  uploadedPhotos.value.splice(idx, 1)
}

// ── Categories (loaded once for step 1) ───────────────────────────
const { data: categories } = await useAsyncData('mp-post-categories', () =>
  fetchCategories(),
)
const selectedCategory = computed(() =>
  (categories.value ?? []).find((c) => c.slug === form.value.categorySlug) ?? null,
)

// ── Step validation ───────────────────────────────────────────────
const canContinue = computed(() => {
  switch (step.value) {
    case 1: return !!form.value.categorySlug
    case 2: return uploadedPhotos.value.length >= 3
    case 3:
      return form.value.title.trim().length >= 4 &&
             form.value.description.trim().length >= 20 &&
             form.value.locationLabel.trim().length >= 2
    case 4:
      return (form.value.budgetMin ?? 0) > 0 &&
             (form.value.budgetMax == null || form.value.budgetMax >= (form.value.budgetMin ?? 0))
    default: return false
  }
})

const canSubmit = computed(() =>
  !!form.value.categorySlug &&
  uploadedPhotos.value.length >= 3 &&
  form.value.title.trim().length >= 4 &&
  form.value.description.trim().length >= 20 &&
  form.value.locationLabel.trim().length >= 2 &&
  (form.value.budgetMin ?? 0) > 0,
)

// ── Step nav ──────────────────────────────────────────────────────
function goNext() {
  if (step.value < TOTAL_STEPS) step.value++
}
function onBack() {
  if (step.value > 1) step.value--
  else router.push('/marketplace')
}

// ── Helpers ───────────────────────────────────────────────────────
function toggleDate(d: string) {
  const idx = form.value.availableDates.indexOf(d)
  if (idx === -1) form.value.availableDates.push(d)
  else form.value.availableDates.splice(idx, 1)
}
function urgencyLabel(u: MarketplaceUrgency) {
  return u === 'urgent' ? 'Urgent' : u === 'flexible' ? 'Flexible' : 'Standard'
}
const budgetDisplay = computed(() => {
  const min = form.value.budgetMin ?? 0
  const max = form.value.budgetMax
  if (max != null) return `£${min.toLocaleString('en-GB')} – £${max.toLocaleString('en-GB')}`
  return `£${min.toLocaleString('en-GB')}+`
})

// ── Submit ────────────────────────────────────────────────────────
const submitting = ref(false)
const submitError = ref<string | null>(null)

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitError.value = null
  submitting.value = true
  try {
    const payload: CreateJobPayload = {
      categorySlug: form.value.categorySlug!,
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      locationLabel: form.value.locationLabel.trim(),
      urgency: form.value.urgency,
      availability: form.value.availableDates[0]
        ? `Available ${form.value.availableDates[0]}`
        : undefined,
      availableDates: form.value.availableDates,
      budgetMin: form.value.budgetMin!,
      budgetMax: form.value.budgetMax ?? undefined,
      photos: uploadedPhotos.value,
    }
    const job = await createJob(payload)
    showToast({ message: 'Job posted', iconEmoji: '✅' })
    router.replace(`/marketplace/jobs/${job.id}`)
  } catch (err: any) {
    const msg = err?.data?.message
    submitError.value = Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Could not post job. Try again.'
  } finally {
    submitting.value = false
  }
}

</script>

<style scoped>
.pj-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

/* ── Wizard header ───────────────────────────────────────────── */
.pj-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 8px;
}
.pj-back-btn {
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
.pj-header-title {
  flex: 1;
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  text-align: center;
}
.pj-header-pill {
  flex-shrink: 0;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 5px 10px;
  border-radius: 100px;
  background: #e5f4f2;
  color: #00635E;
}

/* ── Stepper ─────────────────────────────────────────────────── */
.pj-stepper {
  display: flex;
  gap: 6px;
  padding: 10px 20px 0;
}
.pj-stepper-step {
  flex: 1;
  height: 4px;
  border-radius: 100px;
  background: #d8dae6;
  transition: background 0.2s;
}
.pj-stepper-step.done { background: #00a19a; }
.pj-stepper-step.active {
  background: linear-gradient(90deg, #00a19a, #008a84);
}

/* ── Section heading + helper text ───────────────────────────── */
.pj-section-h {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 18px 20px 4px;
}
.pj-section-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.pj-field-help {
  padding: 0 20px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.5;
  margin-bottom: 6px;
}
.pj-field-help b { color: #231d45; }
.pj-field-help-inline {
  font-size: 11px;
  font-weight: 500;
  color: #6b7089;
  margin-top: 4px;
}

/* ── Step 1: category grid ───────────────────────────────────── */
.pj-cat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 6px 20px 0;
}
.pj-cat-tile {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  border: 2px solid transparent;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  box-shadow: 0 4px 10px rgba(35, 29, 69, 0.1);
}
.pj-cat-tile.sel {
  border-color: #00a19a;
  box-shadow: 0 8px 18px rgba(0, 161, 154, 0.35);
}
.pj-cat-emoji { font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.18)); }
.pj-cat-name { font-size: 12px; font-weight: 800; text-align: left; text-shadow: 0 1px 2px rgba(0,0,0,0.25); }

/* ── Step 2: photo checklist + grid ──────────────────────────── */
.pj-photo-checklist {
  margin: 8px 20px 0;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.pj-photo-checklist-h {
  font-size: 11px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 6px;
}
.pj-photo-checklist-row {
  font-size: 12px;
  font-weight: 600;
  color: #6b7089;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pj-photo-checklist-row.done { color: #00635E; }
.pj-checklist-tick {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f0f2f8;
  color: #6b7089;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.pj-photo-checklist-row.done .pj-checklist-tick {
  background: #00a19a;
  color: #fff;
}

.pj-photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 14px 20px 0;
}
.pj-photo-tile {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  background: #fff;
  border: 2px dashed #d8dae6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  color: #a8a9ad;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
.pj-photo-tile.filled {
  border: none;
  background-color: #352D5C;
}
.pj-photo-tile.uploading { color: #00a19a; }
.pj-photo-input { display: none; }
.pj-photo-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px; height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
}

/* ── Step 3: text fields ─────────────────────────────────────── */
.pj-field-group {
  padding: 12px 20px 0;
}
.pj-field-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  color: #6b7089;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.pj-field-input {
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
.pj-field-input:focus { border-color: #00a19a; }
.pj-field-select { padding-right: 30px; cursor: pointer; }
.pj-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px 20px 0;
}

.pj-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.pj-chip {
  padding: 7px 12px;
  background: #fff;
  border: 1px solid #e4e5ed;
  border-radius: 100px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #6b7089;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.pj-chip.selected {
  background: #e5f4f2;
  border-color: #00a19a;
  color: #00635E;
}

/* ── Step 4: budget pills ────────────────────────────────────── */
.pj-budget-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px 20px 0;
}
.pj-budget-pill {
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
  display: block;
}
.pj-budget-pill-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #6b7089;
}
.pj-budget-pill-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  margin-top: 4px;
}

.pj-insight-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f2faf8, #fff);
  border: 1px solid #d4ece2;
  border-radius: 14px;
}
.pj-insight-icon {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.pj-insight-text {
  font-size: 11.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.5;
}
.pj-insight-text b { font-weight: 800; color: #231d45; }

/* ── Step 5: review card ─────────────────────────────────────── */
.pj-review-card {
  margin: 12px 20px 0;
  padding: 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(35, 29, 69, 0.08);
}
.pj-review-cat {
  font-size: 11px;
  font-weight: 800;
  color: #00635E;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.pj-review-title {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  margin-top: 4px;
}
.pj-review-meta {
  font-size: 12px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 4px;
}
.pj-review-photos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin: 12px 0;
}
.pj-review-photo {
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background-color: #352D5C;
  background-size: cover;
  background-position: center;
}
.pj-review-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
  border-top: 1px solid #f0f1f5;
  margin-top: 4px;
}
.pj-review-row b { color: #231d45; font-weight: 800; }
.pj-review-desc {
  margin-top: 10px;
  font-size: 12.5px;
  font-weight: 500;
  color: #4a4566;
  line-height: 1.55;
  white-space: pre-wrap;
}

/* ── CTA row ─────────────────────────────────────────────────── */
.pj-cta-row {
  padding: 18px 20px 0;
}
.pj-cta-primary {
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
  transition: filter 0.15s;
}
.pj-cta-primary:hover:not(:disabled) { filter: brightness(1.05); }
.pj-cta-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.pj-error {
  margin: 12px 20px 0;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #c43c3c;
}

/* ── Animations ──────────────────────────────────────────────── */
@keyframes pjFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.pj-anim-1 { animation: pjFadeUp 0.32s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.pj-anim-2 { animation: pjFadeUp 0.32s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .pj-anim-1, .pj-anim-2 { animation: none; }
}
</style>
