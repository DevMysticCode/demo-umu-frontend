<template>
  <div class="pd-page mobile-container">
    <div class="pd-topbar">
      <button class="pd-back" @click="goBack" aria-label="Back">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="pd-top-title">Passport complete</div>
      <div class="pd-top-spacer" />
    </div>

    <!-- Hero -->
    <div class="pd-hero">
      <div class="pd-burst" aria-hidden="true">
        <span v-for="i in 12" :key="i" :class="`burst-${i}`" />
      </div>
      <div class="pd-emoji">🎉</div>
      <h1 class="pd-h1">Your Passport is complete</h1>
      <p class="pd-sub">
        Every section answered, every document attached. Your home now has a
        verified record buyers, agents and conveyancers can trust.
      </p>
      <div class="pd-pill">
        <span class="pd-pill-dot" />Verified · ready to share
      </div>
    </div>

    <!-- Primary actions -->
    <div class="pd-cta-stack">
      <button
        class="pd-cta pd-cta--primary"
        type="button"
        :disabled="!passportId"
        @click="viewPassport"
      >
        <span class="pd-cta-emoji">📄</span>
        <span class="pd-cta-body">
          <span class="pd-cta-title">View your Passport</span>
          <span class="pd-cta-sub">See it the way a buyer would</span>
        </span>
        <span class="pd-cta-chev">›</span>
      </button>

      <button
        class="pd-cta pd-cta--share"
        type="button"
        :disabled="!passportId"
        @click="shareWithAgent"
      >
        <span class="pd-cta-emoji">🤝</span>
        <span class="pd-cta-body">
          <span class="pd-cta-title">Share with my agent</span>
          <span class="pd-cta-sub">A secure link they can open in one tap</span>
        </span>
        <span class="pd-cta-chev">›</span>
      </button>

      <button class="pd-cta pd-cta--outline" type="button" @click="goExplore">
        <span class="pd-cta-emoji">🏠</span>
        <span class="pd-cta-body">
          <span class="pd-cta-title">Back to Explore</span>
          <span class="pd-cta-sub">Continue browsing properties</span>
        </span>
        <span class="pd-cta-chev">›</span>
      </button>
    </div>

    <!-- Stats card (only when we know the passport id) -->
    <div v-if="passportId && stats" class="pd-stats">
      <div class="pd-stat">
        <div class="pd-stat-num">{{ stats.tasksDone }}</div>
        <div class="pd-stat-lbl">tasks completed</div>
      </div>
      <div class="pd-stat-div" />
      <div class="pd-stat">
        <div class="pd-stat-num">{{ stats.docsAttached }}</div>
        <div class="pd-stat-lbl">documents attached</div>
      </div>
      <div class="pd-stat-div" />
      <div class="pd-stat">
        <div class="pd-stat-num">{{ stats.sections }}</div>
        <div class="pd-stat-lbl">sections verified</div>
      </div>
    </div>

    <!-- What happens next -->
    <div class="pd-next">
      <div class="pd-next-eyebrow">What happens next</div>
      <ul class="pd-next-list">
        <li><strong>Your agent</strong> can use the Passport in marketing — properties with Passports sell ~12 weeks faster on average.</li>
        <li><strong>Buyers</strong> get instant access to all the data they'd otherwise wait weeks for — title, surveys, EPC, planning history.</li>
        <li><strong>You</strong> can update or unshare at any time from <NuxtLink to="/passport/collections" class="pd-link">your Passport collection</NuxtLink>.</li>
      </ul>
    </div>

    <div style="height: 100px" />
    <BottomNav active="passport" />

    <Toast
      v-if="toastState.visible"
      :message="toastState.message"
      :icon-emoji="toastState.iconEmoji"
      @close="hideToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BottomNav from '~/components/core/BottomNav.vue'
import Toast from '~/components/ui/Toast.vue'
import { useAppToast } from '~/composables/useCustomToast'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { toastState, showToast, hideToast } = useAppToast()

// The passport id can be supplied via query (?passportId=...) or referrer state.
const passportId = computed<string | null>(
  () => (route.query.passportId as string) || null,
)

interface DoneStats {
  tasksDone: number
  docsAttached: number
  sections: number
}
const stats = ref<DoneStats | null>(null)

onMounted(async () => {
  // Best-effort: load section/task counts so the stat row isn't blank.
  if (!passportId.value) return
  try {
    const sections = await $fetch<any[]>(
      `${config.public.apiBase}/passport/${passportId.value}/sections`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
      },
    )
    const allTasks = sections.flatMap((s) => s.tasks ?? [])
    const done = allTasks.filter((t) => t.status === 'COMPLETED').length
    // Documents counted as completed tasks of type UPLOAD; falls back to 0.
    const docs = allTasks.filter(
      (t) =>
        t.status === 'COMPLETED' &&
        (t.questions ?? []).some((q: any) => q.type === 'UPLOAD'),
    ).length
    stats.value = {
      tasksDone: done,
      docsAttached: docs,
      sections: sections.length,
    }
  } catch {
    /* non-fatal — hide the stats card */
  }
})

function viewPassport() {
  if (!passportId.value) return
  router.push(`/passportview/${passportId.value}`)
}

function shareWithAgent() {
  if (!passportId.value) return
  router.push(`/passportview/${passportId.value}?share=agent`)
}

function goExplore() {
  router.push('/explore')
}

function goBack() {
  if (passportId.value) router.push(`/passportview/${passportId.value}`)
  else router.back()
}
</script>

<style scoped>
.pd-page {
  min-height: 100vh;
  background: #fafafa;
  padding-bottom: 24px;
}
.pd-topbar {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background: #fff;
  border-bottom: 1px solid #f1efee;
}
.pd-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ececef;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.pd-back svg {
  width: 16px;
  height: 16px;
  color: #231d45;
}
.pd-top-title {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.pd-top-spacer {
  width: 36px;
}

.pd-hero {
  position: relative;
  padding: 36px 22px 22px;
  text-align: center;
  overflow: hidden;
}
.pd-burst {
  position: absolute;
  inset: 0 0 50% 0;
  pointer-events: none;
}
.pd-burst span {
  position: absolute;
  top: 64px;
  left: 50%;
  width: 6px;
  height: 14px;
  border-radius: 2px;
  background: #00a19a;
  opacity: 0;
  transform-origin: 50% 100%;
  animation: pd-burst 1.6s 0.1s ease-out forwards;
}
.pd-burst .burst-1  { background: #00a19a; transform: rotate(0deg) translateY(0); }
.pd-burst .burst-2  { background: #e6a23c; transform: rotate(30deg) translateY(0); }
.pd-burst .burst-3  { background: #c73e36; transform: rotate(60deg) translateY(0); }
.pd-burst .burst-4  { background: #2eab55; transform: rotate(90deg) translateY(0); }
.pd-burst .burst-5  { background: #00b6ae; transform: rotate(120deg) translateY(0); }
.pd-burst .burst-6  { background: #e6a23c; transform: rotate(150deg) translateY(0); }
.pd-burst .burst-7  { background: #c73e36; transform: rotate(180deg) translateY(0); }
.pd-burst .burst-8  { background: #00514d; transform: rotate(210deg) translateY(0); }
.pd-burst .burst-9  { background: #2eab55; transform: rotate(240deg) translateY(0); }
.pd-burst .burst-10 { background: #00a19a; transform: rotate(270deg) translateY(0); }
.pd-burst .burst-11 { background: #e6a23c; transform: rotate(300deg) translateY(0); }
.pd-burst .burst-12 { background: #00b6ae; transform: rotate(330deg) translateY(0); }
@keyframes pd-burst {
  0%   { opacity: 0; transform: translate(-50%, 0) rotate(var(--r, 0deg)) translateY(0); }
  20%  { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -120px) rotate(var(--r, 0deg)) translateY(-90px); }
}
.pd-emoji {
  font-size: 56px;
  margin-bottom: 14px;
  animation: pd-pop 0.6s cubic-bezier(0.2, 0.8, 0.2, 1.2) both;
  position: relative;
  z-index: 1;
}
@keyframes pd-pop {
  0%   { transform: scale(0.3); opacity: 0; }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
.pd-h1 {
  font-size: 26px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.5px;
  line-height: 1.15;
  margin: 0 0 10px;
}
.pd-sub {
  font-size: 14.5px;
  color: #4a4566;
  line-height: 1.5;
  max-width: 320px;
  margin: 0 auto 16px;
}
.pd-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  color: #007e78;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.pd-pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00a19a;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.25);
}

.pd-cta-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px 0;
}
.pd-cta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.15s;
}
.pd-cta:active {
  transform: scale(0.98);
}
.pd-cta:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.pd-cta--primary {
  background: #00a19a;
  border: none;
  color: #fff;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.28);
}
.pd-cta--share {
  background: #fff;
  border: 1.5px solid #00a19a;
  color: #007e78;
}
.pd-cta--outline {
  background: #fff;
  border: 1.5px solid #ececef;
  color: #231d45;
}
.pd-cta-emoji {
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
}
.pd-cta-body {
  flex: 1;
  min-width: 0;
}
.pd-cta-title {
  display: block;
  font-size: 14.5px;
  font-weight: 800;
  letter-spacing: -0.1px;
}
.pd-cta-sub {
  display: block;
  font-size: 12.5px;
  margin-top: 2px;
  opacity: 0.85;
}
.pd-cta-chev {
  font-size: 18px;
  flex-shrink: 0;
  opacity: 0.6;
}

.pd-stats {
  display: flex;
  align-items: stretch;
  margin: 18px 18px 0;
  padding: 16px;
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 16px;
}
.pd-stat {
  flex: 1;
  text-align: center;
}
.pd-stat-num {
  font-size: 24px;
  font-weight: 800;
  color: #00514d;
  letter-spacing: -0.5px;
  line-height: 1;
}
.pd-stat-lbl {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b6783;
}
.pd-stat-div {
  width: 1px;
  background: #ececef;
}

.pd-next {
  margin: 22px 18px 0;
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 16px;
  padding: 18px 18px 8px;
}
.pd-next-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6b6783;
  margin-bottom: 10px;
}
.pd-next-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pd-next-list li {
  font-size: 13.5px;
  color: #4a4566;
  line-height: 1.55;
  position: relative;
  padding-left: 22px;
}
.pd-next-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  top: 0;
  color: #00a19a;
  font-weight: 800;
}
.pd-next-list li strong {
  color: #231d45;
}
.pd-link {
  color: #007e78;
  font-weight: 700;
  text-decoration: underline;
}
</style>
