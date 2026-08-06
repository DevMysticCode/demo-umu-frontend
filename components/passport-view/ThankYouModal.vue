<template>
  <Transition name="cong">
    <div v-if="modelValue" class="cong-page">
      <div class="cong-inner">
        <!-- Headline (fixed height, no overflow) -->
        <div class="cong-header">
          <h1 class="cong-title">Congratulations!</h1>
          <p class="cong-sub">
            You've earned <b class="cong-points">{{ points }} points</b>
            by completing the {{ stepName || 'this' }} section
          </p>
        </div>

        <!-- Gift illustration — flexes to fill remaining space -->
        <div class="cong-gift-wrap">
          <img
            src="/op-icons/congratulations/gift.png"
            alt=""
            class="cong-gift"
            loading="lazy"
          />
        </div>

        <!-- Reward card — two-column flex, no absolute positioning -->
        <div class="cong-reward">
          <div class="cong-reward-body">
            <h3 class="cong-reward-title">Your Rewards Await</h3>
            <div class="cong-reward-num">{{ balance }}</div>
            <div class="cong-reward-label">Points balance</div>
            <p class="cong-reward-text">
              Redeem points for property services and premium features
            </p>
            <button class="cong-reward-btn" type="button" @click="onGoRewards">
              Go to Rewards
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          <img
            src="/op-icons/congratulations/star.png"
            alt=""
            class="cong-reward-star"
            loading="lazy"
          />
        </div>

        <!-- Finish CTA — always visible -->
        <button class="cong-finish" type="button" @click="handleContinue">
          Finish
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  stepName: { type: String, default: '' },
  balance: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue', 'continue', 'go-rewards'])

const handleContinue = () => {
  emit('continue')
  emit('update:modelValue', false)
}
const onGoRewards = () => {
  emit('go-rewards')
}
</script>

<style scoped>
.cong-page {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: linear-gradient(180deg, #F0F6F6 0%, #F5F9F9 100%);
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #231D45;
  display: flex;
  justify-content: center;
  overflow: hidden;
}
.cong-inner {
  width: 100%;
  max-width: 28rem;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  padding:
    calc(24px + env(safe-area-inset-top))
    22px
    calc(16px + env(safe-area-inset-bottom));
  gap: 14px;
  min-height: 0;
}

/* ── Header ──────────────────────────────────────────────────── */
.cong-header {
  flex-shrink: 0;
  text-align: center;
  animation: congPop 0.5s cubic-bezier(0.22, 1.36, 0.32, 1);
}
@keyframes congPop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.cong-title {
  font-size: clamp(26px, 7vw, 32px);
  font-weight: 800;
  letter-spacing: -0.6px;
  color: #231D45;
  margin: 0 0 8px;
  line-height: 1.1;
}
.cong-sub {
  font-size: clamp(13px, 3.6vw, 15px);
  font-weight: 500;
  color: #4A5876;
  line-height: 1.45;
  margin: 0 4px;
}
.cong-points {
  color: #00A19A;
  font-weight: 800;
}

/* ── Gift (flexes to fill remaining vertical space) ─────────── */
.cong-gift-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.cong-gift {
  max-width: min(260px, 60%);
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  animation: congFloat 3.4s ease-in-out infinite;
  filter: drop-shadow(0 12px 24px rgba(0, 161, 154, 0.18));
}
@keyframes congFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@media (prefers-reduced-motion: reduce) {
  .cong-gift, .cong-header { animation: none; }
}

/* ── Reward card ─────────────────────────────────────────────── */
.cong-reward {
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 20px 20px 18px;
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(31, 44, 76, 0.06);
}
.cong-reward-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.cong-reward-title {
  font-size: 17px;
  font-weight: 800;
  color: #231D45;
  letter-spacing: -0.3px;
  margin: 0 0 10px;
  line-height: 1.15;
}
.cong-reward-num {
  font-size: clamp(34px, 10vw, 42px);
  font-weight: 800;
  color: #00A19A;
  letter-spacing: -1.3px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.cong-reward-label {
  font-size: 14px;
  font-weight: 700;
  color: #231D45;
  margin-top: 6px;
}
.cong-reward-text {
  font-size: 12.5px;
  font-weight: 500;
  color: #4A5876;
  line-height: 1.4;
  margin: 8px 0 12px;
}
.cong-reward-btn {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding: 10px 16px;
  background: #E9F6F5;
  color: #00817C;
  border: 0;
  border-radius: 100px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.2px;
  transition: transform 0.15s ease, background 0.15s;
}
.cong-reward-btn:hover { background: #DCF0EE; }
.cong-reward-btn:active { transform: scale(0.97); }
.cong-reward-btn svg { width: 15px; height: 15px; }

.cong-reward-star {
  align-self: center;
  width: 34%;
  max-width: 130px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 6px 14px rgba(0, 161, 154, 0.22));
}

/* ── Finish CTA ──────────────────────────────────────────────── */
.cong-finish {
  flex-shrink: 0;
  width: 100%;
  padding: 18px;
  background: #00817C;
  color: #FFFFFF;
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.2px;
  box-shadow: 0 8px 20px rgba(0, 129, 124, 0.28);
  transition: transform 0.15s ease;
}
.cong-finish:active { transform: scale(0.98); }

/* ── Enter/leave ─────────────────────────────────────────────── */
.cong-enter-active, .cong-leave-active {
  transition: opacity 0.25s ease;
}
.cong-enter-from, .cong-leave-to { opacity: 0; }
</style>
