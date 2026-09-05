<template>
  <div class="qpc" :class="{ 'qpc--saved': saved }">
    <transition name="qpc-fade" mode="out-in">
      <!-- Answer Saved (transient) state -->
      <div v-if="saved" key="saved" class="qpc-row qpc-row--saved">
        <img src="/op-icons/rewards/pointsCheck.png" alt="" class="qpc-icon qpc-icon--star" />
        <div class="qpc-saved-text">
          <div class="qpc-saved-title">SAVED!</div>
          <div class="qpc-saved-pts">+{{ savedPoints }} pts</div>
        </div>
      </div>

      <!-- Default (current question) state — icon sits beside the whole
           balance/heading/subtitle block (not just the balance line), per
           the prototype: the coin visually spans all three lines. -->
      <div v-else key="default" class="qpc-default">
        <img src="/op-icons/rewards/pointsStar.png" alt="" class="qpc-icon qpc-icon--star" />
        <div class="qpc-default-text">
          <div class="qpc-balance-row">
            <div class="qpc-balance">{{ balance }} <em>pts</em></div>
            <span v-if="questionPoints" class="qpc-pill">+{{ questionPoints }} pts</span>
          </div>
          <h3 class="qpc-h3">Answer Question {{ questionNumber }}</h3>
          <p class="qpc-sub">
            {{ questionPoints ? `Earn ${questionPoints} point${questionPoints === 1 ? '' : 's'} when you save your answer.` : 'Save your answer to continue.' }}
          </p>
        </div>
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
        {{ remaining > 0 ? `Great progress - ${remaining} question${remaining === 1 ? '' : 's'} to go` : 'All done - nice work!' }}
      </p>
    </template>
    <template v-else>
      <p class="qpc-footer">{{ questionNumber }} of {{ totalQuestions }} · Keep going - you're making progress</p>
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
    if (isSaved) startCountUp(props.balanceBefore, props.balance, 1600)
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
  gap: 12px;
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
}
.qpc-row--saved {
  margin-bottom: 6px;
}
.qpc-default {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
}
.qpc-default-text {
  flex: 1;
  min-width: 0;
}
.qpc-balance-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}
.qpc-icon--star {
  width: 84px;
  height: 84px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35));
}
.qpc-balance {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
}
.qpc-balance em {
  font-style: normal;
  color: #99f6e4;
  font-weight: 600;
  font-size: 16px;
  margin-left: 4px;
}
.qpc-pill {
  margin-left: auto;
  background: rgba(20, 184, 166, 0.18);
  color: #5eead4;
  border: 1px solid rgba(94, 234, 212, 0.35);
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}
.qpc-saved-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.qpc-saved-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.1;
}
.qpc-saved-pts {
  font-size: 24px;
  font-weight: 800;
  color: #5eead4;
  line-height: 1.1;
}

.qpc-h3 {
  margin: 8px 0 2px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  color: #fff;
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
  color: #5eead4;
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
