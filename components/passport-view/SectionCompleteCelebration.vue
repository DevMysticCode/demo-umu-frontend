<template>
  <Transition name="scc-fade">
    <div v-if="modelValue" class="scc-page">
      <button class="scc-back" type="button" @click="finish">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div class="scc-card">
        <div class="scc-confetti" aria-hidden="true">
          <span v-for="(c, i) in confetti" :key="i" class="scc-confetti-piece" :class="c.shape" :style="c.style" />
        </div>

        <img src="/op-icons/rewards/pointsStar.png" alt="" class="scc-icon" />

        <h1 class="scc-title">Congratulations!</h1>
        <p class="scc-sub">You've completed this <span class="scc-sub-accent">section</span>.</p>

        <div class="scc-divider" />

        <div class="scc-stats">
          <div class="scc-stat">
            <span class="scc-stat-badge scc-stat-badge--bonus">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.9 6.3 6.9.8-5.1 4.8 1.4 6.8L12 17.3 5.9 20.7l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
              </svg>
            </span>
            <div class="scc-stat-label">Section bonus</div>
            <div class="scc-stat-value">+{{ sectionBonusPoints }} pts</div>
          </div>

          <div class="scc-stat-sep" />

          <div class="scc-stat">
            <span class="scc-stat-badge scc-stat-badge--total">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4h10v4.5a5 5 0 0 1-10 0V4Z" />
                <path d="M7 5.5H4.5a1 1 0 0 0-1 1.1c.2 1.8 1.2 3.6 3.5 4.1M17 5.5h2.5a1 1 0 0 1 1 1.1c-.2 1.8-1.2 3.6-3.5 4.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />
                <path d="M10.5 20h3M12 17v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M12 6.3l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z" fill="#fff" />
              </svg>
            </span>
            <div class="scc-stat-label">Total points</div>
            <div class="scc-stat-value scc-stat-value--total">{{ totalPointsAfter }} pts</div>
            <div class="scc-stat-was">(was {{ totalPointsBefore }} pts)</div>
          </div>
        </div>

        <div class="scc-divider" />

        <p class="scc-tip">
          <span class="scc-tip-icon">✦</span>
          Great progress - another section complete.
        </p>
      </div>

      <div class="scc-redirect">
        <span class="scc-spinner" />
        <div>
          <div class="scc-redirect-title">Taking you back to your Passport...</div>
          <div class="scc-redirect-sub">You'll be back at your dashboard in a moment.</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  sectionBonusPoints: { type: Number, default: 0 },
  totalPointsBefore: { type: Number, default: 0 },
  totalPointsAfter: { type: Number, default: 0 },
  // Delay before auto-navigating away — long enough to read the numbers,
  // short enough not to feel stuck on a screen with no button.
  autoContinueMs: { type: Number, default: 2800 },
})

const emit = defineEmits(['update:modelValue', 'continue'])

// Fixed (not random-per-render) so the layout is stable/testable — a mix
// of small rotated rounded-rect "confetti" pieces and sparkle characters
// scattered around the coin icon, matching the prototype.
const confetti = [
  { shape: 'rect', style: 'left:8%; top:18%; background:#14b8a6; transform:rotate(-18deg);' },
  { shape: 'rect', style: 'left:22%; top:6%; background:#a78bfa; transform:rotate(24deg);' },
  { shape: 'spark', style: 'left:16%; top:34%; color:#5eead4;' },
  { shape: 'rect', style: 'left:6%; top:48%; background:#38bdf8; transform:rotate(10deg);' },
  { shape: 'spark', style: 'left:30%; top:50%; color:#fbbf24;' },
  { shape: 'rect', style: 'right:8%; top:20%; background:#38bdf8; transform:rotate(16deg);' },
  { shape: 'rect', style: 'right:20%; top:6%; background:#f8fafc; transform:rotate(-20deg);' },
  { shape: 'spark', style: 'right:12%; top:36%; color:#5eead4;' },
  { shape: 'rect', style: 'right:6%; top:50%; background:#a78bfa; transform:rotate(-12deg);' },
  { shape: 'spark', style: 'right:28%; top:52%; color:#fbbf24;' },
]

let timer = null

function finish() {
  if (timer) clearTimeout(timer)
  emit('update:modelValue', false)
  emit('continue')
}

watch(
  () => props.modelValue,
  (v) => {
    if (timer) clearTimeout(timer)
    if (v) timer = setTimeout(finish, props.autoContinueMs)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.scc-page {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: #f5f9f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(20px + env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom));
  overflow-y: auto;
}
.scc-fade-enter-active,
.scc-fade-leave-active {
  transition: opacity 0.25s ease;
}
.scc-fade-enter-from,
.scc-fade-leave-to {
  opacity: 0;
}

.scc-back {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #00817c;
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  padding: 6px 0 18px;
}

.scc-card {
  position: relative;
  width: 100%;
  max-width: 28rem;
  background: linear-gradient(160deg, #0a0f2c, #131a3a);
  border-radius: 28px;
  padding: 36px 26px 28px;
  overflow: hidden;
  text-align: center;
}

.scc-confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.scc-confetti-piece {
  position: absolute;
}
.scc-confetti-piece.rect {
  width: 9px;
  height: 15px;
  border-radius: 3px;
  opacity: 0.9;
}
.scc-confetti-piece.spark {
  font-size: 14px;
  color: inherit;
}
.scc-confetti-piece.spark::before {
  content: '✦';
}

.scc-icon {
  /* Tailwind Preflight sets img { display: block }, which makes the
     ancestor's text-align: center a no-op for this element (block boxes
     don't center themselves via text-align) - margin-inline:auto is what
     actually centers it. */
  display: block;
  width: 132px;
  height: auto;
  object-fit: contain;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.35));
  margin: 4px auto 18px;
}

.scc-title {
  position: relative;
  z-index: 1;
  font-size: 34px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  margin: 0 0 8px;
  line-height: 1.1;
}
.scc-sub {
  position: relative;
  z-index: 1;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 20px;
}
.scc-sub-accent {
  color: #5eead4;
  font-weight: 700;
}

.scc-divider {
  position: relative;
  z-index: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.14);
  margin: 4px 0;
}

.scc-stats {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  padding: 22px 0;
}
.scc-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.scc-stat-sep {
  width: 1px;
  background: rgba(255, 255, 255, 0.14);
  margin: 0 8px;
}
.scc-stat-badge {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  margin-bottom: 4px;
}
.scc-stat-badge--bonus {
  background: rgba(251, 191, 36, 0.14);
  color: #fbbf24;
}
.scc-stat-badge--total {
  background: rgba(20, 184, 166, 0.16);
  color: #5eead4;
}
.scc-stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}
.scc-stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #5eead4;
}
.scc-stat-value--total {
  font-size: 24px;
}
.scc-stat-was {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
}

.scc-tip {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  margin: 4px 0 0;
}
.scc-tip-icon {
  color: #5eead4;
}

.scc-redirect {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 28rem;
  width: 100%;
  padding: 24px 8px 0;
}
.scc-spinner {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid #d7e9e8;
  border-top-color: #00817c;
  flex-shrink: 0;
  animation: scc-spin 0.9s linear infinite;
}
@keyframes scc-spin {
  to {
    transform: rotate(360deg);
  }
}
.scc-redirect-title {
  font-size: 15px;
  font-weight: 700;
  color: #231d45;
}
.scc-redirect-sub {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-top: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .scc-spinner {
    animation: none;
  }
}
</style>
