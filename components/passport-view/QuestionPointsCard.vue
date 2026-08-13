<template>
  <div class="qpc" :class="{ 'qpc--saved': saved }">
    <transition name="qpc-fade" mode="out-in">
      <!-- Answer Saved (transient) state -->
      <div v-if="saved" key="saved" class="qpc-row qpc-row--saved">
        <span class="qpc-icon qpc-icon--saved">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <div class="qpc-saved-text">
          <div class="qpc-saved-title">SAVED! <span class="qpc-saved-pts">+{{ savedPoints }} pts</span></div>
        </div>
      </div>

      <!-- Default (current question) state -->
      <div v-else key="default" class="qpc-row">
        <span class="qpc-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.9 6.3 6.9.8-5.1 4.8 1.4 6.8L12 17.3 5.9 20.7l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
          </svg>
        </span>
        <div class="qpc-balance">{{ balance }} <em>pts</em></div>
        <span v-if="questionPoints" class="qpc-pill">+{{ questionPoints }} pts</span>
      </div>
    </transition>

    <template v-if="saved">
      <div class="qpc-divider" />
      <div class="qpc-transition">
        <span class="qpc-before">{{ balanceBefore }}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        <span class="qpc-after">{{ animatedBalance }} pts</span>
      </div>
      <p class="qpc-footer">
        {{ questionNumber }} of {{ totalQuestions }} ·
        {{ remaining > 0 ? `Great progress — ${remaining} question${remaining === 1 ? '' : 's'} to go` : 'All done — nice work!' }}
      </p>
    </template>
    <template v-else>
      <h3 class="qpc-h3">Answer Question {{ questionNumber }}</h3>
      <p class="qpc-sub">
        {{ questionPoints ? `Earn ${questionPoints} point${questionPoints === 1 ? '' : 's'} when you save your answer.` : 'Save your answer to continue.' }}
      </p>
      <p class="qpc-footer">{{ questionNumber }} of {{ totalQuestions }} · Keep going</p>
    </template>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useCountUp } from '~/composables/useCountUp'

const props = defineProps({
  balance: { type: Number, required: true },
  questionPoints: { type: Number, default: 0 },
  questionNumber: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  saved: { type: Boolean, default: false },
  savedPoints: { type: Number, default: 0 },
  balanceBefore: { type: Number, default: 0 },
})

const remaining = computed(() => Math.max(props.totalQuestions - props.questionNumber, 0))

const { value: animatedBalance, start: startCountUp } = useCountUp(props.balance)

watch(
  () => props.saved,
  (isSaved) => {
    if (isSaved) startCountUp(props.balanceBefore, props.balance, 900)
  },
)
</script>

<style scoped>
.qpc {
  margin-bottom: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #0a0f2c, #131a3a);
  color: #fff;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease;
}
.qpc::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.35), transparent 60%);
  pointer-events: none;
}

.qpc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
  margin-bottom: 8px;
}
.qpc-row--saved {
  margin-bottom: 4px;
}
.qpc-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #14b8a6;
  color: #0a0f2c;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.qpc-icon--saved {
  color: #fff;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.25);
}
.qpc-balance {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
}
.qpc-balance em {
  font-style: normal;
  color: #99f6e4;
  font-weight: 600;
  font-size: 14px;
  margin-left: 4px;
}
.qpc-pill {
  margin-left: auto;
  background: rgba(20, 184, 166, 0.18);
  color: #5eead4;
  border: 1px solid rgba(94, 234, 212, 0.35);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.qpc-saved-text {
  display: flex;
  flex-direction: column;
}
.qpc-saved-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.qpc-saved-pts {
  color: #5eead4;
  margin-left: 6px;
}

.qpc-h3 {
  margin: 8px 0 2px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  color: #99f6e4;
  position: relative;
  z-index: 1;
}
.qpc-sub {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  z-index: 1;
}

.qpc-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 10px 0;
  position: relative;
  z-index: 1;
}
.qpc-transition {
  display: flex;
  align-items: baseline;
  gap: 8px;
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.5);
}
.qpc-before {
  font-size: 16px;
  font-weight: 700;
}
.qpc-after {
  font-size: 18px;
  font-weight: 800;
  color: #5eead4;
}

.qpc-footer {
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  z-index: 1;
}

.qpc-fade-enter-active,
.qpc-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.qpc-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.qpc-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
