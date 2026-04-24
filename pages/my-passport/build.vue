<template>
  <div class="bp-page">
    <!-- Sticky header -->
    <div class="bp-header">
      <button class="bp-back" @click="goBack" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <polyline
            points="15 18 9 12 15 6"
            stroke="#231d45"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <div class="bp-header-body">
        <div class="bp-header-title">Build your Passport</div>
        <div class="bp-header-sub">Step {{ step }} of 5</div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="bp-progress">
      <div
        v-for="n in 5"
        :key="n"
        class="bp-progress-seg"
        :class="{ 'bp-progress-seg-filled': n <= step }"
      />
    </div>

    <div class="bp-scroll">
      <!-- ── STEP 1: ID ── -->
      <div v-if="step === 1" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-teal">🪪</div>
          <div class="bp-step-title">Verify your identity</div>
          <div class="bp-step-body">
            This is done once and automatically included in every Passport you share.
          </div>
        </div>
        <div class="bp-option-list">
          <button
            v-for="opt in idOptions"
            :key="opt.value"
            class="bp-option-card"
            :class="{ selected: idDocumentType === opt.value }"
            @click="idDocumentType = opt.value"
          >
            <span class="bp-option-emoji">{{ opt.emoji }}</span>
            <div class="bp-option-body">
              <div class="bp-option-title">{{ opt.title }}</div>
              <div class="bp-option-sub">{{ opt.sub }}</div>
            </div>
            <div class="bp-option-check" :class="{ filled: idDocumentType === opt.value }" />
          </button>
        </div>
        <button
          class="bp-next"
          :class="{ disabled: !canContinue }"
          :disabled="!canContinue"
          @click="goNext"
        >
          {{ saving ? 'Saving…' : 'Scan ID document →' }}
        </button>
      </div>

      <!-- ── STEP 2: Funds ── -->
      <div v-if="step === 2" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-green">🏦</div>
          <div class="bp-step-title">Proof of funds</div>
          <div class="bp-step-body">
            Show sellers you're financially ready. Choose what applies to you.
          </div>
        </div>
        <div class="bp-option-list">
          <button
            v-for="opt in fundsOptions"
            :key="opt.value"
            class="bp-option-card"
            :class="{ selected: fundsType === opt.value }"
            @click="fundsType = opt.value"
          >
            <div class="bp-option-boxic">
              <span style="font-size: 20px">{{ opt.emoji }}</span>
            </div>
            <div class="bp-option-body">
              <div class="bp-option-title">{{ opt.title }}</div>
              <div class="bp-option-sub">{{ opt.sub }}</div>
            </div>
            <div class="bp-option-check" :class="{ filled: fundsType === opt.value }" />
          </button>
        </div>
        <div class="bp-field-label">Maximum budget</div>
        <div class="bp-budget-wrap">
          <span class="bp-budget-sign">£</span>
          <input
            type="number"
            v-model.number="fundsAmount"
            placeholder="350,000"
            class="bp-budget-input"
            inputmode="numeric"
          />
        </div>
        <button
          class="bp-next"
          :class="{ disabled: !canContinue }"
          :disabled="!canContinue"
          @click="goNext"
        >
          {{ saving ? 'Saving…' : 'Continue →' }}
        </button>
      </div>

      <!-- ── STEP 3: Chain ── -->
      <div v-if="step === 3" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-amber">🔗</div>
          <div class="bp-step-title">Your chain position</div>
          <div class="bp-step-body">
            This tells sellers how straightforward a sale with you would be.
          </div>
        </div>
        <div class="bp-option-list">
          <button
            v-for="opt in chainOptions"
            :key="opt.value"
            class="bp-option-card"
            :class="{ selected: chainPosition === opt.value }"
            @click="chainPosition = opt.value"
          >
            <span class="bp-option-emoji">{{ opt.emoji }}</span>
            <div class="bp-option-body">
              <div class="bp-option-title">{{ opt.title }}</div>
              <div class="bp-option-sub">{{ opt.sub }}</div>
            </div>
            <div class="bp-option-check" :class="{ filled: chainPosition === opt.value }" />
          </button>
        </div>
        <button
          class="bp-next"
          :class="{ disabled: !canContinue }"
          :disabled="!canContinue"
          @click="goNext"
        >
          {{ saving ? 'Saving…' : 'Continue →' }}
        </button>
      </div>

      <!-- ── STEP 4: Solicitor + timeline ── -->
      <div v-if="step === 4" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-purple">⚖️</div>
          <div class="bp-step-title">A few quick questions</div>
          <div class="bp-step-body">
            This helps sellers and agents understand how ready you are to move.
          </div>
        </div>
        <div class="bp-field-label">Have you instructed a solicitor?</div>
        <div class="bp-tile-row">
          <button
            v-for="opt in solicitorOptions"
            :key="opt.value"
            class="bp-tile"
            :class="{ selected: solicitorStatus === opt.value }"
            @click="solicitorStatus = opt.value"
          >
            <div class="bp-tile-emoji">{{ opt.emoji }}</div>
            <div class="bp-tile-label">{{ opt.label }}</div>
          </button>
        </div>
        <div class="bp-field-label">When are you looking to move?</div>
        <div class="bp-tile-row">
          <button
            v-for="opt in timelineOptions"
            :key="opt.value"
            class="bp-tile bp-tile-small"
            :class="{ selected: timeline === opt.value }"
            @click="timeline = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
        <button
          class="bp-next"
          :class="{ disabled: !canContinue }"
          :disabled="!canContinue"
          @click="goNext"
        >
          {{ saving ? 'Saving…' : 'Continue →' }}
        </button>
      </div>

      <!-- ── STEP 5: Statement ── -->
      <div v-if="step === 5" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-amber">✍️</div>
          <div class="bp-step-title">
            Tell your story
            <span class="bp-optional">(optional)</span>
          </div>
          <div class="bp-step-body">
            A short personal note can make a real difference — sellers often choose buyers they connect with.
          </div>
        </div>
        <div class="bp-prompts">
          <div
            v-for="p in prompts"
            :key="p"
            class="bp-prompt"
            @click="appendPrompt(p)"
          >
            + {{ p }}
          </div>
        </div>
        <textarea
          v-model="statement"
          class="bp-textarea"
          rows="6"
          placeholder="e.g. We're a young family looking to put down roots in a community we love. We're chain-free, financially ready, and flexible on completion..."
        />
        <button class="bp-generate" @click="submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ publishing ? 'Generating…' : 'Generate my Passport' }}
        </button>
        <button class="bp-skip" @click="submit">Skip this step</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBuyerPassport } from '~/composables/useBuyerPassport'
import { useAppToast } from '~/composables/useCustomToast'

const router = useRouter()
const { getBuyerPassport, updateBuyerPassport, publishBuyerPassport } =
  useBuyerPassport()
const { showToast } = useAppToast()

const step = ref<1 | 2 | 3 | 4 | 5>(1)
const saving = ref(false)
const publishing = ref(false)

// Form state
const idDocumentType = ref<string | null>(null)
const fundsType = ref<string | null>(null)
const fundsAmount = ref<number | null>(null)
const chainPosition = ref<string | null>(null)
const solicitorStatus = ref<string | null>(null)
const timeline = ref<string | null>(null)
const statement = ref('')

// Option lists
const idOptions = [
  { value: 'passport', emoji: '📘', title: 'Passport', sub: 'Any country' },
  { value: 'drivingLicence', emoji: '🪪', title: 'Driving licence', sub: 'UK full or provisional' },
  { value: 'nationalId', emoji: '🪪', title: 'National ID card', sub: 'EU / EEA' },
]
const fundsOptions = [
  { value: 'mortgage', emoji: '💳', title: 'Mortgage in principle', sub: 'Upload your DIP document' },
  { value: 'cash', emoji: '💷', title: 'Cash buyer', sub: 'Bank statement showing available funds' },
  { value: 'help', emoji: '🏛️', title: 'Help to Buy / Shared ownership', sub: 'Government scheme with mortgage' },
]
const chainOptions = [
  { value: 'ftb', emoji: '🌟', title: 'First time buyer', sub: 'No property to sell — chain-free' },
  { value: 'selling', emoji: '🏠', title: 'Have a property to sell', sub: 'Currently on the market' },
  { value: 'sold', emoji: '✅', title: 'Property sold / chain-free', sub: 'Sale agreed or renting while I buy' },
  { value: 'renting', emoji: '🏢', title: 'Currently renting', sub: 'Flexible on completion date' },
]
const solicitorOptions = [
  { value: 'yes', emoji: '✅', label: 'Yes' },
  { value: 'looking', emoji: '🔍', label: 'Looking' },
  { value: 'notsure', emoji: '❓', label: 'Not yet' },
]
const timelineOptions = [
  { value: 'asap', label: 'ASAP' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '6 months' },
  { value: 'flex', label: 'Flexible' },
]
const prompts = [
  'Why I want this type of home',
  'My timeline and flexibility',
  'What matters most to me',
]

const canContinue = computed(() => {
  switch (step.value) {
    case 1:
      return !!idDocumentType.value
    case 2:
      return !!fundsType.value && !!fundsAmount.value && fundsAmount.value > 0
    case 3:
      return !!chainPosition.value
    case 4:
      return !!solicitorStatus.value && !!timeline.value
    case 5:
      return true
    default:
      return false
  }
})

function appendPrompt(text: string) {
  const sep = statement.value.trim() ? '\n\n' : ''
  statement.value = `${statement.value}${sep}${text}: `
}

function goBack() {
  if (step.value > 1) {
    step.value = (step.value - 1) as any
    return
  }
  router.push('/my-passport')
}

async function saveCurrentStep() {
  saving.value = true
  try {
    const patch: any = { completedSteps: Math.max(step.value, 1) }
    if (step.value === 1) patch.idDocumentType = idDocumentType.value
    if (step.value === 2) {
      patch.fundsType = fundsType.value
      patch.fundsAmount = fundsAmount.value
    }
    if (step.value === 3) patch.chainPosition = chainPosition.value
    if (step.value === 4) {
      patch.solicitorStatus = solicitorStatus.value
      patch.timeline = timeline.value
    }
    if (step.value === 5) patch.statement = statement.value
    await updateBuyerPassport(patch)
  } catch {
    showToast({ message: 'Could not save — check your connection', iconEmoji: '⚠️' })
  } finally {
    saving.value = false
  }
}

async function goNext() {
  if (!canContinue.value) return
  await saveCurrentStep()
  if (step.value < 5) {
    step.value = (step.value + 1) as any
  }
}

async function submit() {
  publishing.value = true
  try {
    // Save the statement (step 5) first
    await updateBuyerPassport({
      statement: statement.value,
      completedSteps: 5,
    })
    await publishBuyerPassport()
    showToast({ message: 'Passport published', iconEmoji: '✅' })
    router.replace('/my-passport/view')
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Could not publish passport'
    showToast({ message: msg, iconEmoji: '⚠️' })
  } finally {
    publishing.value = false
  }
}

onMounted(async () => {
  try {
    const data = await getBuyerPassport()
    if (data) {
      idDocumentType.value = data.idDocumentType ?? null
      fundsType.value = data.fundsType ?? null
      fundsAmount.value = data.fundsAmount ?? null
      chainPosition.value = data.chainPosition ?? null
      solicitorStatus.value = data.solicitorStatus ?? null
      timeline.value = data.timeline ?? null
      statement.value = data.statement ?? ''
    }
  } catch {}
})
</script>

<style scoped>
.bp-page {
  min-height: 100dvh;
  background: #fff;
  color: #1f2024;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Header ────────────────────────────────────────────── */
.bp-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px 12px;
  padding-top: calc(16px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.bp-back {
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
}
.bp-header-body {
  flex: 1;
}
.bp-header-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.bp-header-sub {
  font-size: 11px;
  color: #94a3b8;
}

/* ── Progress ──────────────────────────────────────────── */
.bp-progress {
  position: sticky;
  top: 57px;
  z-index: 19;
  display: flex;
  gap: 3px;
  padding: 12px 20px 12px;
  background: #fff;
}
.bp-progress-seg {
  flex: 1;
  height: 3px;
  background: #e5e7eb;
  border-radius: 999px;
  transition: background 0.3s;
}
.bp-progress-seg-filled {
  background: #00a19a;
}

/* ── Scroll ────────────────────────────────────────────── */
.bp-scroll {
  flex: 1;
  padding: 0 20px 40px;
  overflow-y: auto;
}

/* ── Step hero ─────────────────────────────────────────── */
.bp-step-hero {
  text-align: center;
  margin-bottom: 24px;
}
.bp-step-ic {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
  font-size: 30px;
  border: 2px solid transparent;
}
.bp-ic-teal {
  background: #f0fdfa;
  border-color: #99f6e4;
}
.bp-ic-green {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.bp-ic-amber {
  background: #fef9f0;
  border-color: #fde68a;
}
.bp-ic-purple {
  background: #f5f3ff;
  border-color: #ddd6fe;
}
.bp-step-title {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}
.bp-optional {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
}
.bp-step-body {
  font-size: 12.5px;
  color: #334155;
  line-height: 1.6;
}

/* ── Option cards (radio list) ─────────────────────────── */
.bp-option-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.bp-option-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 16px;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: inherit;
  width: 100%;
}
.bp-option-card.selected {
  border-color: #00a19a;
  background: #f0fdfa;
}
.bp-option-emoji {
  font-size: 26px;
  flex-shrink: 0;
}
.bp-option-boxic {
  width: 40px;
  height: 40px;
  background: #f0fdf4;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.bp-option-body {
  flex: 1;
  min-width: 0;
}
.bp-option-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #1f2024;
}
.bp-option-sub {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
}
.bp-option-check {
  width: 22px;
  height: 22px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  transition: all 0.15s;
  flex-shrink: 0;
  position: relative;
}
.bp-option-check.filled {
  border-color: #00a19a;
  background: #00a19a;
}
.bp-option-check.filled::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  transform: translate(-50%, -50%);
}

/* ── Field label ───────────────────────────────────────── */
.bp-field-label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ── Budget input ──────────────────────────────────────── */
.bp-budget-wrap {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px 16px;
  gap: 8px;
  margin-bottom: 20px;
}
.bp-budget-sign {
  font-size: 18px;
  font-weight: 800;
  color: #334155;
}
.bp-budget-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 700;
  color: #1f2024;
  font-family: inherit;
  background: transparent;
}

/* ── Tile row (solicitor / timeline) ───────────────────── */
.bp-tile-row {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.bp-tile {
  flex: 1;
  min-width: 80px;
  padding: 14px 8px;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: #1f2024;
}
.bp-tile-small {
  padding: 12px 8px;
  font-size: 12px;
}
.bp-tile.selected {
  border-color: #00a19a;
  background: #f0fdfa;
}
.bp-tile-emoji {
  font-size: 20px;
  margin-bottom: 4px;
}
.bp-tile-label {
  font-size: 12.5px;
}

/* ── Prompts & textarea ────────────────────────────────── */
.bp-prompts {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.bp-prompt {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #00a19a;
  cursor: pointer;
}
.bp-textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  color: #1f2024;
  background: #fff;
  line-height: 1.65;
  box-sizing: border-box;
  margin-bottom: 16px;
}
.bp-textarea:focus {
  border-color: #00a19a;
}

/* ── Buttons ───────────────────────────────────────────── */
.bp-next {
  width: 100%;
  border: none;
  padding: 15px;
  border-radius: 14px;
  background: #00a19a;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.bp-next:active {
  background: #008c86;
}
.bp-next.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}
.bp-generate {
  width: 100%;
  border: none;
  padding: 15px;
  border-radius: 14px;
  background: #00a19a;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}
.bp-skip {
  width: 100%;
  border: none;
  padding: 12px;
  border-radius: 14px;
  background: transparent;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
</style>
