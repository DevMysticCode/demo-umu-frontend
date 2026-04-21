<template>
  <div
    class="mobile-container"
    style="
      background: #f8f7fc;
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      overflow: hidden;
    "
  >
    <!-- Scrollable content -->
    <div style="flex: 1; overflow-y: auto; padding-bottom: 128px">
      <!-- White hero section -->
      <div
        style="
          background: #fff;
          padding: 28px 24px 24px;
          border-bottom: 1px solid #eef0f6;
        "
      >
        <!-- Header row: logo + name + Beta badge -->
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
          "
        >
          <div style="display: flex; align-items: center; gap: 10px">
            <OPIcon name="logo" class="w-10 h-10" />
            <span
              style="
                font-size: 17px;
                font-weight: 800;
                color: #231d45;
                letter-spacing: -0.02em;
              "
              >UmovingU</span
            >
          </div>
          <div
            style="
              font-size: 10px;
              font-weight: 700;
              color: #008c86;
              background: #eafaf9;
              border: 1px solid #b2e8e6;
              padding: 5px 11px;
              border-radius: 999px;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            "
          >
            Beta
          </div>
        </div>

        <!-- Headline -->
        <div style="margin-bottom: 18px">
          <h1
            style="
              font-size: 34px;
              font-weight: 900;
              color: #231d45;
              line-height: 1.15;
              letter-spacing: -0.03em;
              margin-bottom: 10px;
            "
          >
            Move home<br />in <span style="color: #00a19a">14 days.</span
            ><br />Not 179.
          </h1>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.6">
            The UK's property system is broken. We built the fix — free for
            buyers and sellers.
          </p>
        </div>

        <!-- Stat pills -->
        <div style="display: flex; gap: 6px; flex-wrap: wrap">
          <div
            v-for="stat in statPills"
            :key="stat"
            style="
              display: flex;
              align-items: center;
              gap: 5px;
              background: #eafaf9;
              border: 1px solid #b2e8e6;
              border-radius: 999px;
              padding: 5px 10px;
            "
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#008c86"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style="font-size: 13px; font-weight: 700; color: #008c86">{{
              stat
            }}</span>
          </div>
        </div>
      </div>

      <!-- Cards section -->
      <div style="padding: 20px 20px 0">
        <div
          style="
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #94a3b8;
            margin-bottom: 12px;
          "
        >
          Why it matters — tap any card
        </div>

        <!-- 2-column flip card grid -->
        <div
          id="card-grid"
          style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            perspective: 1000px;
          "
        >
          <div
            v-for="(card, i) in cards"
            :key="i"
            class="card-wrap"
            :class="{ entered: entered[i] }"
            @click="flipCard(i)"
          >
            <div
              class="card-inner"
              :class="{
                flipped: flippedCards.has(i),
                'pulse-first': i === 0,
              }"
            >
              <!-- Front face -->
              <div
                class="card-face card-front"
                :style="{ background: card.frontGradient, boxShadow: card.shadow }"
              >
                <!-- Corner radial glow -->
                <div
                  class="card-glow"
                  :style="{ background: card.glowColor }"
                ></div>
                <!-- Bottom shimmer line -->
                <div class="card-shine"></div>

                <div class="pc-top">
                  <div
                    class="pc-stat"
                    :class="{ 'stat-landed': statLanded[i] }"
                    :style="card.statColor ? { color: card.statColor } : {}"
                  >{{ displayStats[i] }}</div>
                  <div class="pc-unit">{{ card.unit }}</div>
                </div>
                <div class="pc-bot">
                  <div class="pc-label">{{ card.label }}</div>
                  <div class="pc-sub">{{ card.sub }}</div>
                </div>
              </div>

              <!-- Back face -->
              <div class="card-face card-back">
                <div class="card-glow" style="background: radial-gradient(circle,rgba(255,255,255,0.15),transparent 70%)"></div>
                <div style="font-size: 26px; margin-bottom: 7px; position: relative; z-index: 1;">
                  {{ card.backIcon }}
                </div>
                <div class="back-title">{{ card.backTitle }}</div>
                <div class="back-sub">{{ card.backSub }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tap hint -->
        <div
          class="tap-hint"
          :class="{ visible: tapHintVisible }"
          style="
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
            margin: 12px 0 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
          "
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path
              d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"
            />
          </svg>
          Tap a card to see how we fix it
        </div>
      </div>
    </div>

    <!-- Fixed CTA bar -->
    <div class="cta-bar">
      <button @click="navigateTo('/onboarding/signup')" class="cta-btn">
        Get started — it's free
      </button>
      <p style="text-align: center; font-size: 14px; color: #94a3b8; margin: 0">
        Already have an account?
        <span
          @click="navigateTo('/onboarding/signin')"
          style="font-weight: 700; color: #00a19a; cursor: pointer"
          >Sign in</span
        >
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import OPIcon from '~/components/ui/OPIcon.vue'

definePageMeta({ middleware: 'guest' })

const flippedCards = reactive(new Set())
const entered = reactive([])
const statLanded = reactive([])
const displayStats = reactive([])
const tapHintVisible = ref(false)

const flipCard = (index) => {
  if (flippedCards.has(index)) {
    flippedCards.delete(index)
  } else {
    flippedCards.add(index)
  }
}

const statPills = [
  '1 in 3 sales collapse',
  '£2,700 lost per consumer',
  '£900m lost by consumers',
]

const cards = [
  {
    frontGradient: 'linear-gradient(150deg, #131129, #1e1842)',
    shadow: '0 8px 28px rgba(0,0,0,0.4)',
    glowColor: 'radial-gradient(circle,rgba(0,200,190,0.35),transparent 70%)',
    statColor: '#f87171',
    target: 179, prefix: '', suffix: '',
    unit: '→ 14 days',
    label: '12× slower',
    sub: 'UK avg. vs. with Passport',
    backIcon: '⚡',
    backTitle: 'We cut it to 14 days',
    backSub: 'Your Passport is pre-verified. Solicitors get everything in one tap.',
  },
  {
    frontGradient: 'linear-gradient(150deg, #00504e, #007a74)',
    shadow: '0 8px 28px rgba(0,80,78,0.5)',
    glowColor: 'radial-gradient(circle,rgba(255,255,255,0.15),transparent 70%)',
    target: 33, prefix: '', suffix: '%',
    unit: 'sales collapse',
    label: 'No safety net',
    sub: 'Fees lost, nothing to show',
    backIcon: '🛡️',
    backTitle: 'Your deal stays intact',
    backSub: 'Verified sellers close. Buyers see full risk before they offer.',
  },
  {
    frontGradient: 'linear-gradient(150deg, #1e1650, #2d2268)',
    shadow: '0 8px 28px rgba(30,22,80,0.5)',
    glowColor: 'radial-gradient(circle,rgba(0,180,170,0.3),transparent 70%)',
    target: 2700, prefix: '£', suffix: '',
    unit: 'lost per consumer',
    label: 'Per fall-through',
    sub: 'Legal & survey fees gone',
    backIcon: '💷',
    backTitle: 'Keep your money',
    backSub: "Passport users abort earlier, cheaper. Or don't abort at all.",
  },
  {
    frontGradient: 'linear-gradient(150deg, #003836, #005f5b)',
    shadow: '0 8px 28px rgba(0,56,54,0.5)',
    glowColor: 'radial-gradient(circle,rgba(255,255,255,0.15),transparent 70%)',
    target: 30, prefix: '', suffix: '%',
    unit: 'of buyers',
    label: 'Gazumped',
    sub: 'Offer accepted, then stolen',
    backIcon: '🔒',
    backTitle: 'Lock in your offer',
    backSub: 'Passport buyers move faster. Less time exposed to gazumping.',
  },
  {
    frontGradient: 'linear-gradient(150deg, #0d0b1e, #231d45)',
    shadow: '0 8px 28px rgba(13,11,30,0.6)',
    glowColor: 'radial-gradient(circle,rgba(0,161,154,0.28),transparent 70%)',
    target: 60, prefix: '', suffix: '%',
    unit: 'of surveys',
    label: 'Hidden defects',
    sub: 'Found too late to act',
    backIcon: '🔍',
    backTitle: 'See it before you offer',
    backSub: 'HomeScore™ surfaces defects upfront — not months in.',
  },
  {
    frontGradient: 'linear-gradient(150deg, #008c86, #00b5ad)',
    shadow: '0 8px 28px rgba(0,140,134,0.4)',
    glowColor: 'radial-gradient(circle,rgba(255,255,255,0.15),transparent 70%)',
    target: 900, prefix: '£', suffix: 'm',
    unit: 'lost by consumers',
    label: 'Every year',
    sub: 'On aborted transactions',
    backIcon: '🏡',
    backTitle: 'Transactions that close',
    backSub: 'Every Passport in the system means one less aborted sale.',
  },
]

// Initialise display stats to "0" with correct prefix/suffix
cards.forEach((c, i) => { displayStats[i] = c.prefix + '0' + c.suffix })

function runCountUp(i) {
  const { target, prefix, suffix } = cards[i]
  const STEPS = 28
  const DURATION = 900
  const interval = DURATION / STEPS
  let step = 0
  const easeOut = (t) => 1 - Math.pow(1 - t, 3)
  const fmt = (n) => target >= 1000 ? n.toLocaleString('en-GB') : String(n)
  const timer = setInterval(() => {
    step++
    const current = Math.round(easeOut(step / STEPS) * target)
    displayStats[i] = prefix + fmt(current) + suffix
    if (step >= STEPS) {
      clearInterval(timer)
      displayStats[i] = prefix + fmt(target) + suffix
      statLanded[i] = true
    }
  }, interval)
}

onMounted(() => {
  // Stagger card entrance — 600ms base + 110ms per card
  cards.forEach((_, i) => {
    setTimeout(() => {
      entered[i] = true
      runCountUp(i)
    }, 600 + i * 110)
  })

  // Tap hint fades in after cards have appeared
  setTimeout(() => {
    tapHintVisible.value = true
  }, 1600)

  // Auto-flip first card as a teaser, then flip back
  setTimeout(() => {
    flippedCards.add(0)
    setTimeout(() => {
      flippedCards.delete(0)
    }, 2200)
  }, 2800)
})
</script>

<style scoped>
/* ── Card wrapper (starts invisible, slides up on enter) ── */
.card-wrap {
  cursor: pointer;
  opacity: 0;
  transform: translateY(24px);
  min-height: 130px;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.card-wrap.entered {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ── 3D flip inner ── */
.card-inner {
  position: relative;
  width: 100%;
  min-height: 130px;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 18px;
  will-change: transform;
}

.card-inner.flipped {
  -webkit-transform: rotateY(180deg);
  transform: rotateY(180deg);
}

/* Pulse glow on first card (red-ish ring, matches prototype) */
.pulse-first {
  animation: pulseGlow 2.8s ease-in-out 2.5s infinite;
}

/* ── Card faces ── */
.card-face {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  padding: 16px 15px 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* iOS Safari requires an explicit rotateY(0) on the front face —
   without it, backface-visibility: hidden is ignored and the front
   bleeds through as reversed text when the card is flipped. */
.card-front {
  -webkit-transform: rotateY(0deg);
  transform: rotateY(0deg);
}

/* Corner radial glow (replaces ::before) */
.card-glow {
  position: absolute;
  right: -28px;
  top: -28px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

/* Bottom shimmer line (replaces ::after) */
.card-shine {
  position: absolute;
  left: 15px;
  right: 15px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.12),
    transparent
  );
  pointer-events: none;
}

.card-back {
  -webkit-transform: rotateY(180deg);
  transform: rotateY(180deg);
  background: linear-gradient(150deg, #008c86, #00b5ad);
  box-shadow: 0 8px 28px rgba(0, 161, 154, 0.4);
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* ── Card text elements ── */
.pc-top,
.pc-bot {
  position: relative;
  z-index: 1;
}

.pc-stat {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
  color: #fff;
  margin-bottom: 3px;
}

.pc-unit {
  font-size: 9.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pc-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  line-height: 1.25;
  margin-bottom: 3px;
}

.pc-sub {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.45;
}

.back-title {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 5px;
  position: relative;
  z-index: 1;
}

.back-sub {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.45;
  position: relative;
  z-index: 1;
}

/* ── Tap hint ── */
.tap-hint {
  opacity: 0;
}

.tap-hint.visible {
  animation: fadeUpIn 0.5s ease 0s forwards;
}

/* ── CTA bar ── */
.cta-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 448px;
  padding: 14px 20px 32px;
  background: #fff;
  border-top: 1px solid #eef0f6;
  box-shadow: 0 -4px 16px rgba(35, 29, 69, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cta-btn {
  width: 100%;
  border: none;
  padding: 16px 18px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  background: #00a19a;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 161, 154, 0.35);
  letter-spacing: -0.01em;
  font-family: inherit;
}

.cta-btn:active {
  transform: scale(0.98);
}

/* ── Keyframes ── */
@keyframes pulseGlow {
  0%,
  100% {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4),
      0 0 0 4px rgba(248, 113, 113, 0.22);
  }
}

@keyframes statLand {
  0% {
    opacity: 0.3;
    transform: scale(0.85);
  }
  60% {
    transform: scale(1.08);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.stat-landed {
  animation: statLand 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes fadeUpIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
