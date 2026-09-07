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
      <!-- Prototype-exact house illustration (auth-flow.html line 1212).
           Confetti is fired from the top of the viewport by a canvas
           overlay (see runConfetti below) so it falls down the whole
           screen rather than erupting from the chimney. -->
      <div class="welcome-house-wrap">
        <img
          class="welcome-house"
          src="/welcome-house.png"
          alt=""
          width="240"
          height="auto"
        />
      </div>

      <div class="welcome-eyebrow-big">You're all set</div>
      <div class="welcome-headline-big">Welcome, {{ firstName }}.</div>

      <!-- No CTA to tap — there's nowhere else useful to send someone
           mid-onboarding, and a dead "explore" destination just confuses.
           Instead: an engaging status line while we finish setting things
           up, then an automatic hand-off straight into the dashboard. -->
      <div class="welcome-status">
        <span class="welcome-status-dot" />
        {{ statusText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import { useTypewriterPlaceholder } from '~/composables/useTypewriterPlaceholder'

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

// Status line cycles through these while the hand-off timer runs — always
// active (never toggled off), so it just keeps typing/erasing until the
// page navigates away underneath it.
const statusActive = ref(true)
const { text: statusText } = useTypewriterPlaceholder(
  statusActive,
  [
    'Setting up your account…',
    'Preparing your dashboard…',
    'Getting your home ready…',
  ],
  '',
  { typeMs: 30, eraseMs: 16, holdMs: 750, pauseMs: 250 },
)

let navTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  // Fire the top-of-screen confetti shower once on mount. Same canvas
  // implementation we use after the onboarding-preferences flow — pieces
  // start above the viewport and fall straight down through the page,
  // so the celebration covers the whole screen instead of dribbling out
  // of the chimney.
  runConfetti()

  // Real background work: warm the profile fetch (for the firstName
  // above) while the status line plays. Deliberately NOT awaited before
  // scheduling the nav timer below — a slow network shouldn't push the
  // hand-off past its own ~2.4s window (it would if this were awaited
  // first: total delay = fetch time + 2.4s, not max(fetch time, 2.4s)).
  ;(async () => {
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        profile.value = await $fetch(`${config.public.apiBase}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch {
      // ignore — non-blocking decoration only
    }
  })()

  // Auto hand-off — no button to tap. There's no sensible "explore"
  // destination left post-onboarding; the dashboard is the destination,
  // so we just take the user there once the celebration's had its moment.
  navTimer = setTimeout(continueToApp, 2400)
})

onBeforeUnmount(() => {
  if (navTimer) clearTimeout(navTimer)
})

const continueToApp = async () => {
  const redirectPath = typeof localStorage !== 'undefined' ? localStorage.getItem('redirectAfterLogin') : null
  // replace: true — this whole onboarding detour (welcome/thank-you/etc.)
  // shouldn't be something a user can land back on by pressing back once
  // they're through it; see the matching note in signin.vue.
  if (redirectPath) {
    localStorage.removeItem('redirectAfterLogin')
    await navigateTo(redirectPath, { replace: true })
  } else {
    await navigateTo('/dashboard', { replace: true })
  }
}

// Top-of-screen confetti — ported verbatim from
// pages/onboarding/preferences.vue::runConfetti. Spawns 120 mixed
// rectangle/circle pieces above the viewport and lets them fall straight
// down with small horizontal drift + rotation. Honours
// prefers-reduced-motion (skips the animation entirely).
function runConfetti() {
  if (typeof window === 'undefined') return
  const reduce =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return

  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const colors = [
    '#00A19A',
    '#231d45',
    '#00b5ad',
    '#ffffff',
    '#e2f1ea',
    '#C18A38',
    '#6BD4CD',
  ]
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 120,
    w: 6 + Math.random() * 9,
    h: 5 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.18,
    vx: (Math.random() - 0.5) * 3,
    vy: 2.5 + Math.random() * 3,
    isCircle: Math.random() > 0.45,
    opacity: 1,
  }))

  let frame = 0
  const FRAMES = 160

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of pieces) {
      p.x += p.vx
      p.y += p.vy
      p.angle += p.spin
      if (frame > 90) p.opacity = Math.max(0, p.opacity - 0.015)
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.fillStyle = p.color
      if (p.isCircle) {
        ctx.beginPath()
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      ctx.restore()
    }
    frame++
    if (frame < FRAMES) {
      requestAnimationFrame(draw)
    } else {
      try { document.body.removeChild(canvas) } catch { /* already removed */ }
    }
  }
  requestAnimationFrame(draw)
}
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

/* House wrapper - prototype-exact 240 px container (auth-flow.html L582). */
.welcome-house-wrap {
  position: relative;
  width: 240px;
  margin: 36px auto 28px;
  animation: welcome-fade-up 0.65s 0.2s both;
}
.welcome-house {
  width: 100%;
  height: auto;
  display: block;
  position: relative;
  z-index: 1;
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
@keyframes welcome-fade-up {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Status line — replaces the old CTA button. No click target; the page
   navigates itself once the celebration's had its moment. Fixed min-height
   + monospace-ish tabular sizing isn't needed since it's short phrases,
   but a min-width keeps the pulsing dot from jittering left/right as the
   text beneath it types/erases at different lengths. */
.welcome-status {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 700;
  color: #4a5568;
  letter-spacing: -0.1px;
  min-height: 20px;
  animation: welcome-fade-up 0.55s 0.5s both;
}
.welcome-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00a19a;
  flex-shrink: 0;
  animation: welcome-status-pulse 1.2s ease-in-out infinite;
}
@keyframes welcome-status-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}
</style>
