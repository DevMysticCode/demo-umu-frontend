<template>
  <div class="mobile-container welcome-screen">

    <!-- Topbar -->
    <div class="auth-topbar">
      <div class="auth-spacer" />
      <div class="auth-brand-mini">
        <OPIcon name="logo" class="w-[26px] h-[26px]" />
      </div>
    </div>

    <!-- Top banner -->
    <div class="welcome-top-banner">
      Congratulations<span class="dot" />you're in
    </div>

    <div class="welcome-celebration">
      <!-- Illustrated house with chimney spewing confetti -->
      <div class="welcome-house-wrap">
        <svg class="welcome-house" viewBox="0 0 240 220" xmlns="http://www.w3.org/2000/svg">
          <!-- Sky halo -->
          <ellipse cx="120" cy="100" rx="110" ry="80" fill="#f2faf8" opacity="0.6" />

          <!-- Ground -->
          <ellipse cx="120" cy="200" rx="100" ry="10" fill="#231d45" opacity="0.10" />

          <!-- Chimney with confetti source -->
          <rect x="160" y="40" width="18" height="34" rx="2" fill="#231d45" />
          <rect x="158" y="38" width="22" height="6" rx="1" fill="#231d45" />

          <!-- Roof -->
          <polygon points="60,90 120,40 180,90" fill="#00a19a" />
          <polygon points="60,90 120,40 180,90" fill="#fff" opacity="0.08" />

          <!-- Body -->
          <rect x="70" y="90" width="100" height="100" fill="#fffefb" stroke="#231d45" stroke-width="2" />

          <!-- Door -->
          <rect x="108" y="138" width="24" height="52" rx="1" fill="#c18a38" />
          <circle cx="127" cy="165" r="1.5" fill="#231d45" />

          <!-- Windows -->
          <rect x="80" y="106" width="22" height="22" fill="#6bd4cd" />
          <line x1="91" y1="106" x2="91" y2="128" stroke="#231d45" stroke-width="1.5" />
          <line x1="80" y1="117" x2="102" y2="117" stroke="#231d45" stroke-width="1.5" />
          <rect x="80" y="106" width="22" height="22" fill="none" stroke="#231d45" stroke-width="2" />

          <rect x="138" y="106" width="22" height="22" fill="#6bd4cd" />
          <line x1="149" y1="106" x2="149" y2="128" stroke="#231d45" stroke-width="1.5" />
          <line x1="138" y1="117" x2="160" y2="117" stroke="#231d45" stroke-width="1.5" />
          <rect x="138" y="106" width="22" height="22" fill="none" stroke="#231d45" stroke-width="2" />

          <!-- Path -->
          <path d="M118 190 L 100 215 L 140 215 L 122 190 Z" fill="#c18a38" opacity="0.55" />
        </svg>

        <!-- Confetti — 14 pieces erupting from chimney -->
        <div class="confetti-source">
          <span
            v-for="(c, i) in confettiPieces"
            :key="i"
            :class="['confetto', c.shape, c.color]"
            :style="{
              '--peak-x': c.peakX,
              '--peak-y': c.peakY,
              '--dur': c.dur,
              '--delay': c.delay,
            }"
          />
        </div>

        <!-- Person walking dog -->
        <svg class="welcome-figures" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="36" cy="56" rx="12" ry="1.6" fill="#231d45" opacity="0.18" />
          <ellipse cx="63" cy="56" rx="9" ry="1.4" fill="#231d45" opacity="0.18" />
          <g fill="#231d45">
            <circle cx="36" cy="14" r="5" />
            <path d="M 30 19 Q 30 30 31 38 L 41 38 Q 42 30 42 19 Q 42 17 36 17 Q 30 17 30 19 Z" />
            <path d="M 32 38 L 30 54 L 33 54 L 35 38 Z" />
            <path d="M 39 38 L 41 54 L 38 54 L 37 38 Z" />
            <path d="M 30 22 L 27 33 L 29 33 L 32 22 Z" />
            <path d="M 42 22 L 47 31 L 45 32 L 40 23 Z" />
          </g>
          <path d="M 47 32 Q 53 36 58 38" fill="none" stroke="#231d45" stroke-width="0.7" opacity="0.75" />
          <g fill="#231d45">
            <ellipse cx="63" cy="49" rx="8.5" ry="3.6" />
            <circle cx="71.5" cy="46" r="3.3" />
            <ellipse cx="74.5" cy="47" rx="2.2" ry="1.4" />
            <path d="M 70 43 L 71.5 40 L 73 43 Z" />
            <rect x="56" y="51" width="1.8" height="6" rx="0.6" />
            <rect x="60" y="51" width="1.8" height="6" rx="0.6" />
            <rect x="65" y="51" width="1.8" height="6" rx="0.6" />
            <rect x="69" y="51" width="1.8" height="6" rx="0.6" />
            <path d="M 55 47 Q 51 43 53 39" fill="none" stroke="#231d45" stroke-width="2" stroke-linecap="round" />
          </g>
        </svg>
      </div>

      <div class="welcome-eyebrow-big">You're all set</div>
      <div class="welcome-headline-big">Welcome, {{ firstName }}.</div>
      <div class="welcome-sub-big">
        Your home's already telling us things. Tap below to see what we found.
      </div>

      <button class="welcome-cta" @click="continueToApp">
        Let's start exploring
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OPIcon from '~/components/ui/OPIcon.vue'

definePageMeta({
  title: 'Welcome - UmovingU',
})

// Best-effort first name from profile (falls back gracefully)
const profile = ref<any>(null)
const config = useRuntimeConfig()

const firstName = computed(() => {
  const raw = profile.value?.firstName || profile.value?.name || ''
  if (!raw) return 'friend'
  const first = String(raw).trim().split(/\s+/)[0]
  return first || 'friend'
})

onMounted(async () => {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return
    profile.value = await $fetch(`${config.public.apiBase}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    // ignore — non-blocking decoration only
  }
})

const continueToApp = async () => {
  const redirectPath = typeof localStorage !== 'undefined' ? localStorage.getItem('redirectAfterLogin') : null
  if (redirectPath) {
    localStorage.removeItem('redirectAfterLogin')
    await navigateTo(redirectPath)
  } else {
    await navigateTo('/explore')
  }
}

// Confetti pieces — 14 colourful shards, deterministic so the layout is stable
const colors = ['gold', 'cream', 'navy', 'tealLight', 'tealBright', 'teal']
const shapes = ['', 'circle', 'thin', 'square']
const confettiPieces = Array.from({ length: 14 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280
  const r = (n: number) => ((seed * (n + 1)) % 1000) / 1000
  const dir = i % 2 === 0 ? 1 : -1
  return {
    shape: shapes[i % shapes.length],
    color: colors[i % colors.length],
    peakX: `${dir * (60 + r(1) * 110)}px`,
    peakY: `${-(140 + r(2) * 90)}px`,
    dur: `${2.6 + r(3) * 1.6}s`,
    delay: `${r(4) * 1.5}s`,
  }
})
</script>

<style scoped>
.welcome-screen {
  background: #fff;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
}
.welcome-screen::before {
  content: '';
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  height: 320px;
  background: radial-gradient(ellipse, #f2faf8 0%, rgba(242, 250, 248, 0.5) 40%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.welcome-screen::after {
  content: '';
  position: absolute;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 420px;
  height: 220px;
  background: radial-gradient(ellipse, rgba(247, 242, 232, 0.55) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* Topbar */
.auth-topbar {
  display: flex;
  align-items: center;
  padding: 16px 22px 4px;
  position: relative;
  z-index: 5;
}
.auth-spacer { flex: 1; }
.auth-brand-mini {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Top banner */
.welcome-top-banner {
  position: relative;
  z-index: 5;
  text-align: center;
  padding: 24px 28px 12px;
  font-size: 13px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  animation: welcome-fade-up 0.55s 0.1s both;
}
.welcome-top-banner .dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00a19a;
  margin: 0 10px 2px;
  vertical-align: middle;
  animation: welcome-banner-pulse 1.6s ease-in-out infinite;
}
@keyframes welcome-banner-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.7; }
}

/* Centered celebration */
.welcome-celebration {
  position: relative;
  z-index: 3;
  padding: 14px 28px 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.welcome-house-wrap {
  position: relative;
  width: 240px;
  margin: 16px auto 28px;
  animation: welcome-fade-up 0.65s 0.2s both;
}
.welcome-house {
  width: 100%;
  height: auto;
  display: block;
  position: relative;
  z-index: 1;
}

.confetti-source {
  position: absolute;
  left: 73%;
  top: 17%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 3;
}
.confetto {
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 14px;
  border-radius: 1.5px;
  opacity: 0;
  animation: chimney-eruption var(--dur, 3.2s) var(--delay, 0s) cubic-bezier(0.4, 0.05, 0.5, 1) infinite;
  will-change: transform, opacity;
}
.confetto.circle { border-radius: 50%; width: 8px; height: 8px; }
.confetto.thin { width: 3px; height: 16px; }
.confetto.square { width: 9px; height: 9px; border-radius: 1px; }
.confetto.gold { background: #c18a38; }
.confetto.cream { background: #f7f2e8; border: 1px solid #e8dec2; }
.confetto.navy { background: #231d45; }
.confetto.tealLight { background: #6bd4cd; }
.confetto.tealBright { background: #00b6ae; }
.confetto.teal { background: #00a19a; }
@keyframes chimney-eruption {
  0% { transform: translate(0, 0) rotate(0deg) scale(0.6); opacity: 0; }
  4% { opacity: 1; transform: translate(calc(var(--peak-x) * 0.1), calc(var(--peak-y) * 0.15)) rotate(20deg) scale(1); }
  22% { transform: translate(calc(var(--peak-x) * 0.45), var(--peak-y)) rotate(110deg) scale(1); opacity: 1; }
  38% { transform: translate(calc(var(--peak-x) * 0.7), calc(var(--peak-y) * 0.7)) rotate(220deg) scale(1); opacity: 1; }
  100% { transform: translate(var(--peak-x), 360px) rotate(720deg) scale(1); opacity: 0; }
}

.welcome-figures {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: auto;
  z-index: 4;
  pointer-events: none;
  animation: welcome-figures-fade 0.55s 0.75s both;
}
@keyframes welcome-figures-fade {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.welcome-eyebrow-big {
  font-size: 11px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 14px;
  animation: welcome-fade-up 0.55s 0.25s both;
}
.welcome-headline-big {
  font-size: 40px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -1.4px;
  line-height: 1;
  margin-bottom: 14px;
  max-width: 300px;
  animation: welcome-fade-up 0.65s 0.35s both;
}
.welcome-sub-big {
  font-size: 14.5px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.5;
  letter-spacing: -0.05px;
  max-width: 260px;
  margin-bottom: 32px;
  animation: welcome-fade-up 0.55s 0.5s both;
}
@keyframes welcome-fade-up {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.welcome-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  background: #00a19a;
  border: none;
  padding: 17px 32px;
  border-radius: 100px;
  cursor: pointer;
  letter-spacing: -0.2px;
  box-shadow: 0 12px 30px rgba(0, 161, 154, 0.30), 0 2px 6px rgba(0, 161, 154, 0.14);
  transition: all 0.18s;
  animation:
    welcome-fade-up 0.55s 0.65s both,
    welcome-cta-pulse 2.4s 1.4s ease-in-out infinite;
}
.welcome-cta:hover {
  transform: translateY(-2px);
  background: #00b6ae;
}
.welcome-cta svg { width: 14px; height: 14px; }
@keyframes welcome-cta-pulse {
  0%, 100% { box-shadow: 0 12px 30px rgba(0, 161, 154, 0.30), 0 2px 6px rgba(0, 161, 154, 0.14), 0 0 0 0 rgba(0, 161, 154, 0); }
  50% { box-shadow: 0 12px 30px rgba(0, 161, 154, 0.30), 0 2px 6px rgba(0, 161, 154, 0.14), 0 0 0 14px rgba(0, 161, 154, 0.08); }
}
</style>
