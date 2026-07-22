<template>
  <Transition name="cong">
    <div v-if="modelValue" class="cong-page">
      <div class="cong-inner">
        <!-- Headline -->
        <h1 class="cong-title">Congratulations!</h1>
        <p class="cong-sub">
          You've earned <b class="cong-points">{{ points || 475 }} points</b>
          by completing the {{ stepName || 'Boundaries' }} section
        </p>

        <!-- Gift illustration -->
        <img
          src="/op-icons/congratulations/gift.png"
          alt=""
          class="cong-gift"
          loading="lazy"
        />

        <!-- Rewards card -->
        <div class="cong-reward">
          <div class="cong-reward-body">
            <h3 class="cong-reward-title">Your Rewards Await</h3>
            <div class="cong-reward-num">{{ balance || 1500 }}</div>
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

        <!-- Finish CTA -->
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
  points: { type: Number, default: 475 },
  stepName: { type: String, default: 'Boundaries' },
  balance: { type: Number, default: 1500 },
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
  overflow-y: auto;
  padding: env(safe-area-inset-top) 22px calc(24px + env(safe-area-inset-bottom));
}
.cong-inner {
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding-top: 40px;
}

/* Headline */
.cong-title {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: #231D45;
  margin: 0 0 12px;
  text-align: center;
  line-height: 1.1;
  animation: congPop 0.6s cubic-bezier(0.22, 1.36, 0.32, 1);
}
@keyframes congPop {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.cong-sub {
  font-size: 16px;
  font-weight: 500;
  color: #4A5876;
  text-align: center;
  line-height: 1.5;
  margin: 0 8px;
}
.cong-points {
  color: #00A19A;
  font-weight: 800;
}

/* Gift illustration */
.cong-gift {
  width: 84%;
  max-width: 340px;
  height: auto;
  align-self: center;
  margin: 22px auto 24px;
  animation: congFloat 3.4s ease-in-out infinite;
  filter: drop-shadow(0 12px 24px rgba(0, 161, 154, 0.18));
}
@keyframes congFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@media (prefers-reduced-motion: reduce) {
  .cong-gift { animation: none; }
  .cong-title { animation: none; }
}

/* Reward card */
.cong-reward {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 26px 22px;
  background: #FFFFFF;
  border-radius: 22px;
  box-shadow: 0 12px 26px rgba(31, 44, 76, 0.06);
  overflow: hidden;
}
.cong-reward-body { flex: 1; min-width: 0; }
.cong-reward-title {
  font-size: 20px;
  font-weight: 800;
  color: #231D45;
  letter-spacing: -0.3px;
  margin: 0 0 14px;
}
.cong-reward-num {
  font-size: 46px;
  font-weight: 800;
  color: #00A19A;
  letter-spacing: -1.5px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.cong-reward-label {
  font-size: 16px;
  font-weight: 600;
  color: #231D45;
  margin-top: 8px;
}
.cong-reward-text {
  font-size: 14px;
  font-weight: 500;
  color: #4A5876;
  line-height: 1.45;
  margin: 12px 0 0;
  max-width: 68%;
}
.cong-reward-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 12px 18px;
  background: #E9F6F5;
  color: #00817C;
  border: 0;
  border-radius: 100px;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
  transition: transform 0.15s ease, background 0.15s;
}
.cong-reward-btn:hover { background: #DCF0EE; }
.cong-reward-btn:active { transform: scale(0.97); }
.cong-reward-btn svg { width: 16px; height: 16px; }
.cong-reward-star {
  position: absolute;
  right: 18px;
  bottom: 20px;
  width: 42%;
  max-width: 170px;
  height: auto;
  pointer-events: none;
  filter: drop-shadow(0 8px 18px rgba(0, 161, 154, 0.2));
}

/* Finish CTA */
.cong-finish {
  width: 100%;
  margin-top: auto;
  padding: 20px;
  background: #00817C;
  color: #FFFFFF;
  border: 0;
  border-radius: 18px;
  cursor: pointer;
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
  box-shadow: 0 10px 24px rgba(0, 129, 124, 0.28);
  transition: transform 0.15s ease;
}
.cong-finish:active { transform: scale(0.98); }

/* Enter/leave */
.cong-enter-active, .cong-leave-active {
  transition: opacity 0.28s ease;
}
.cong-enter-from, .cong-leave-to { opacity: 0; }
</style>
