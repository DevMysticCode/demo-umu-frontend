<template>
  <div class="verify-page mobile-container min-h-screen bg-umu-gradient">
    <!-- Header with back button -->
    <AppHeader :show-back="true" />

    <!-- VERIFIED STATE -->
    <template v-if="verificationState === 'verified'">
      <HeroSection
        icon-name="ownershipVerified"
        icon-class="w-32 h-32"
        hero-class="w-28 h-28"
        main-title="Property Ownership Verified"
        :sub-title="propertyAddress"
        sub-colored="Successfully verified through GOV.UK One Login"
      />
      <div class="verify-body">
        <!-- <span class="status-badge badge-verified">Verified Owner</span> -->

        <!-- <p class="verify-subtext">
          Your ownership of this property has been confirmed. You can now build
          your full Property Passport.
        </p> -->

        <button
          class="btn-primary mt-8"
          @click="buildPassport"
          :disabled="building"
        >
          <span v-if="building">Building Passport...</span>
          <span v-else>Start building your Property Passport</span>
        </button>

        <!-- GOV.UK Info card -->
        <div class="info-card">
          <div class="info-card-header">
            <OPIcon name="governmentLogo" class="w-[56px] h-[56px]" />
            <!-- Status badge -->
            <span class="status-badge badge-verified">Verified Owner</span>
            <span class="info-card-title">Powered by GOV.UK One Login</span>
          </div>
          <p class="info-card-body">
            The UK Government's Official Identity Service
          </p>
          <div class="info-card-steps">
            <div class="info-step">
              <span>Your verification is complete and secure</span>
            </div>
            <div class="info-step">
              <OPIcon name="nothingSaved" class="w-[15px] h-[15px]" />
              <span>Certificate stored in government systems</span>
            </div>
            <div class="info-step">
              <OPIcon name="verifiedFilled" class="w-[15px] h-[15px]" />
              <span>Valid for lifetime (unless ownership changes)</span>
            </div>
            <div class="info-step">
              <OPIcon name="successfulProcess" class="w-[15px] h-[15px]" />
              <span>Verified on: March 15, 2024</span>
            </div>
          </div>

          <div class="verified-document-container"></div>

          <div class="flex justify-content-end gap-4 support-buttons">
            <button class="btn-primary-outline">Report an Issue</button>
            <!-- <button class="btn-primary-outline">Contact Support</button> -->
          </div>
        </div>

        <div class="notif-row">
          <div>
            <p class="notif-label">Email Notifications</p>
            <!-- <p class="notif-sub">Receive updates about your passport</p> -->
          </div>
          <button
            class="toggle-btn"
            :class="{ 'toggle-on': emailNotifications }"
            @click="emailNotifications = !emailNotifications"
            role="switch"
            :aria-checked="emailNotifications"
          >
            <span class="toggle-thumb" />
          </button>
        </div>
      </div>
    </template>

    <!-- IDLE / SUBMITTED / IN_PROGRESS STATE -->
    <template v-else>
      <HeroSection
        icon-name="verifyOwnership"
        icon-class="w-[144px] h-[144px]"
        hero-class="w-[144px] h-[144px]"
        main-title="Verify Your Property Ownership"
        sub-colored="Secure government verification through GOV.UK One Login"
        :sub-title="propertyAddress"
      />

      <div class="verify-body">
        <!-- Status badge -->
        <!-- <span
          class="status-badge"
          :class="{
            'badge-not-started': verificationState === 'idle',
            'badge-under-review':
              verificationState === 'submitted' ||
              verificationState === 'inProgress',
          }"
        >
          {{ verificationState === 'idle' ? 'Not Started' : 'Under Review' }}
        </span> -->

        <!-- GOV.UK Info card -->
        <div class="info-card">
          <div class="info-card-header">
            <OPIcon name="governmentLogo" class="w-[56px] h-[56px]" />
            <!-- Status badge -->
            <span
              class="status-badge"
              :class="{
                'badge-not-started': verificationState === 'idle',
                'badge-under-review':
                  verificationState === 'submitted' ||
                  verificationState === 'inProgress',
              }"
            >
              {{
                verificationState === 'idle' ? 'Not Started' : 'Under Review'
              }}
            </span>
            <span class="info-card-title">Powered by GOV.UK One Login</span>
          </div>
          <p class="info-card-body">
            The UK Government's Official Identity Service
          </p>
          <div class="info-card-steps">
            <div class="info-step">
              <span>Same security as your online tax returns</span>
            </div>
            <div class="info-step">
              <OPIcon name="nothingSaved" class="w-[15px] h-[15px]" />
              <span>Nothing saved on your device after verification</span>
            </div>
            <div class="info-step">
              <OPIcon name="verifiedFilled" class="w-[15px] h-[15px]" />
              <span>Purpose-built for UK citizens by UK government</span>
            </div>
            <div class="info-step">
              <OPIcon name="successfulProcess" class="w-[15px] h-[15px]" />
              <span>Successfully processes 2M+ verifications monthly</span>
            </div>
          </div>

          <!-- Action button -->
          <button
            class="btn-primary"
            :class="{
              'btn-disabled':
                verificationState === 'submitted' ||
                verificationState === 'inProgress',
            }"
            :disabled="
              verificationState === 'submitted' ||
              verificationState === 'inProgress'
            "
            @click="startVerification"
          >
            <template v-if="verificationState === 'idle'">
              <OPIcon
                name="startVerification"
                class="w-[16px] h-[16px] inline mr-2"
              />
              Start Verification
            </template>
            <template v-else> Request Submitted </template>
          </button>
        </div>

        <!-- Verification progress (shown after submit) -->
        <div
          v-if="
            verificationState === 'submitted' ||
            verificationState === 'inProgress'
          "
          class="progress-card"
        >
          <div class="progress-card-header-info">
            <p class="progress-card-header-info-title">
              Your property verification is under review
            </p>
            <p class="progress-card-header-info-date">
              SUBMITTED: 24 March 2025
            </p>
            <p class="progress-card-header-info-subheading">
              We're reviewing your documents and GOV.UK verification results
            </p>
          </div>
          <div class="progress-card-header">
            <span class="progress-card-title">Verification Progress</span>
            <span class="progress-pct">{{ progressValue }}%</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: progressValue + '%' }"
            />
          </div>

          <div class="progress-steps">
            <div class="progress-step">
              <div
                class="step-check"
                :class="{ checked: verificationState === 'inProgress' }"
              >
                <svg
                  v-if="verificationState === 'inProgress'"
                  viewBox="0 0 16 16"
                  fill="none"
                  width="10"
                  height="10"
                >
                  <path
                    d="M3 8l4 4 6-6"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span :class="{ 'step-done': verificationState === 'inProgress' }"
                >Identity verified (GOV.UK)</span
              >
            </div>
            <div class="progress-step">
              <div
                class="step-check"
                :class="{ checked: verificationState === 'inProgress' }"
              >
                <svg
                  v-if="verificationState === 'inProgress'"
                  viewBox="0 0 16 16"
                  fill="none"
                  width="10"
                  height="10"
                >
                  <path
                    d="M3 8l4 4 6-6"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span :class="{ 'step-done': verificationState === 'inProgress' }"
                >Documents uploaded</span
              >
            </div>
            <div class="progress-step">
              <div class="step-check" />
              <span>Ownership validation</span>
            </div>
            <div class="progress-step">
              <div class="step-check" />
              <span>Final review</span>
            </div>
          </div>

          <div class="flex gap-4 support-buttons">
            <button class="btn-primary-outline">Check Status</button>
            <button class="btn-primary-outline">Contact Support</button>
          </div>
        </div>

        <!-- Email Notifications toggle -->
        <div class="notif-row">
          <div>
            <p class="notif-label">Email Notifications</p>
            <!-- <p class="notif-sub">Get notified when verification is complete</p> -->
          </div>
          <button
            class="toggle-btn"
            :class="{ 'toggle-on': emailNotifications }"
            @click="emailNotifications = !emailNotifications"
            role="switch"
            :aria-checked="emailNotifications"
          >
            <span class="toggle-thumb" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePropertySearch } from '~/composables/usePropertySearch'
import OPIcon from '~/components/ui/OPIcon.vue'
import AppHeader from '~/components/core/AppHeader.vue'
import HeroSection from '~/components/HeroSection.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const base = config.public.apiBase

const propertyId = route.params.id as string

const { getPropertyDetails } = usePropertySearch()

const property = ref<any>(null)
const verificationState = ref<'idle' | 'submitted' | 'inProgress' | 'verified'>(
  'idle',
)
const progressValue = ref(0)
const emailNotifications = ref(true)
const building = ref(false)

const propertyAddress = computed(() => {
  if (!property.value) return ''
  const parts = [
    property.value.addressLine1,
    property.value.city,
    property.value.postcode,
  ].filter(Boolean)
  return parts.join(', ')
})

const token = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null

const authHeaders = () => ({
  Authorization: `Bearer ${token()}`,
  'Content-Type': 'application/json',
})

let progressInterval: ReturnType<typeof setInterval> | null = null

function animateProgress(targetValue: number, durationMs: number) {
  if (progressInterval) clearInterval(progressInterval)
  const start = progressValue.value
  const steps = 30
  const stepSize = (targetValue - start) / steps
  const stepDelay = durationMs / steps
  let currentStep = 0
  progressInterval = setInterval(() => {
    currentStep++
    progressValue.value = Math.round(start + stepSize * currentStep)
    if (currentStep >= steps) {
      progressValue.value = targetValue
      if (progressInterval) clearInterval(progressInterval)
    }
  }, stepDelay)
}

async function startVerification() {
  if (verificationState.value !== 'idle') return
  try {
    await $fetch(`${base}/property/${propertyId}/start-verification`, {
      method: 'POST',
      headers: authHeaders(),
    })
  } catch (err) {
    console.error('Start verification error:', err)
  }

  verificationState.value = 'submitted'
  progressValue.value = 0

  setTimeout(() => {
    verificationState.value = 'inProgress'
    animateProgress(67, 1500)
  }, 3000)

  setTimeout(() => {
    verificationState.value = 'verified'
    progressValue.value = 100
  }, 8000)
}

async function buildPassport() {
  building.value = true
  try {
    const result = await $fetch<{ passportId: string }>(
      `${base}/property/${propertyId}/complete-verification`,
      {
        method: 'POST',
        headers: authHeaders(),
      },
    )
    if (result?.passportId) {
      router.push(`/passportview/${result.passportId}`)
    }
  } catch (err) {
    console.error('Complete verification error:', err)
  } finally {
    building.value = false
  }
}

onMounted(async () => {
  property.value = await getPropertyDetails(propertyId)

  try {
    const status = await $fetch<{ status: string; passportId?: string } | null>(
      `${base}/property/${propertyId}/verification-status`,
      { headers: authHeaders() },
    )
    if (status) {
      if (status.status === 'VERIFIED') {
        verificationState.value = 'verified'
      } else if (
        status.status === 'SUBMITTED' ||
        status.status === 'IN_PROGRESS'
      ) {
        verificationState.value = 'submitted'
      }
    }
  } catch {
    // No existing verification — stays idle
  }
})
</script>

<style scoped>
.progress-card-header-info {
  margin-bottom: 20px;
}
.progress-card-header-info-title {
  font-weight: 590;
  font-style: Semibold;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  vertical-align: middle;
  color: #000000;
}

.progress-card-header-info-date {
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  vertical-align: middle;
  color: #00a19a;
}

.progress-card-header-info-subheading {
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  vertical-align: middle;
  color: #3c3c4399;
}

.support-buttons {
  margin-top: 16px;
}

.btn-primary-outline {
  border-radius: 40px;
  padding-top: 7px;
  padding-right: 14px;
  padding-bottom: 7px;
  padding-left: 14px;
  border: 0.33px solid #3c3c432e;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  color: #00a19a;
  width: 100%;
}

.verify-page {
  min-height: 100vh;
  /* background: #f2f6f6; */
  padding-bottom: 40px;
}

/* Make the subColored text in HeroSection underlined for this page */
:deep(.hero-title__subColored) {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.verify-body {
  padding: 0 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.verify-subtext {
  font-size: 14px;
  color: #555;
  text-align: center;
  line-height: 1.6;
  max-width: 300px;
  margin: 0;
}

/* ── Badges ──────────────────────────────────────────────────────────────── */
.status-badge {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
}

.badge-not-started {
  background: #f2f2f7;
  color: #8e8e93;
}

.badge-under-review {
  background: rgba(255, 180, 0, 0.15);
  color: #d4820a;
}

.badge-verified {
  background: rgba(0, 161, 154, 0.15);
  color: #00a19a;
}

/* ── Info card ───────────────────────────────────────────────────────────── */
.info-card {
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 18px;
}

.info-card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.info-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.info-card-body {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 14px;
  text-align: center;
}

.info-card-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  vertical-align: middle;
  color: #00a19a;
}

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  /* background: rgba(0, 161, 154, 0.12); */
  color: #00a19a;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-step span {
  font-size: 15px;
  color: #00a19a;
}

/* ── Progress card ───────────────────────────────────────────────────────── */
.progress-card {
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 18px;
}

.progress-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.progress-pct {
  font-size: 14px;
  font-weight: 700;
  color: #00a19a;
}

.progress-track {
  height: 8px;
  background: #e8e8ee;
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 100px;
  transition: width 0.3s ease;
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #d0d0d8;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.step-check.checked {
  background: #00a19a;
  border-color: #00a19a;
}

.progress-step span {
  font-size: 13px;
  color: #888;
}

.progress-step span.step-done {
  color: #1a1a1a;
  font-weight: 500;
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.btn-primary {
  width: 100%;
  padding: 7px 14px;
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 20px;
}

.btn-primary:active {
  opacity: 0.85;
}

.btn-primary.btn-disabled,
.btn-primary:disabled {
  background: #c7c7cc;
  color: #8e8e93;
  cursor: not-allowed;
}

/* ── Email notifications ─────────────────────────────────────────────────── */
.notif-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 18px;
  background: white;
  border-radius: 14px;
  gap: 12px;
}

.notif-label {
  color: #000000;
  margin: 0 0 3px;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  vertical-align: middle;
}

.notif-sub {
  font-size: 12px;
  color: #8e8e93;
  margin: 0;
}

.toggle-btn {
  width: 51px;
  height: 31px;
  border-radius: 100px;
  background: #e0e0e8;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.25s;
  flex-shrink: 0;
  padding: 0;
}

.toggle-btn.toggle-on {
  background: #00a19a;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s;
  display: block;
}

.toggle-btn.toggle-on .toggle-thumb {
  transform: translateX(20px);
}
</style>
