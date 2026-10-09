<template>
  <div class="qpc" :class="{ 'qpc--saved': saved }">
    <transition name="qpc-fade" mode="out-in">
      <!-- Answer Saved (transient) state -->
      <div v-if="saved" key="saved" class="qpc-row qpc-row--saved">
        <span class="qpc-badge qpc-badge--check">
          <img src="/op-icons/rewards/pointsCheck.png" alt="" class="qpc-badge-img" />
        </span>
        <div class="qpc-saved-text">
          <div class="qpc-saved-title">SAVED!</div>
          <div class="qpc-saved-pts">+{{ savedPoints }} pts</div>
        </div>
      </div>

      <!-- Default (current question) state — icon sits beside the whole
           balance/heading/subtitle block (not just the balance line), per
           the prototype: the badge visually spans all three lines. The
           app's existing glossy 3D points icon, same visual family as
           Rewards' passportPoints.png, rather than a flat SVG glyph. -->
      <div v-else key="default" class="qpc-default">
        <span class="qpc-badge">
          <img src="/op-icons/rewards/pointsStar.png" alt="" class="qpc-badge-img" />
        </span>
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
  background: #fff;
  border: 1.5px solid #e5e7eb;
  color: #231d45;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease;
}
.qpc--saved {
  border-color: #b8e0dc;
}
.qpc::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.12), transparent 60%);
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
/* Glossy 3D icon, no extra ring — the PNG already carries its own
   coin/ring rendering, so a flat background behind it would double up. */
.qpc-badge {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qpc-badge-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.qpc-badge--check .qpc-badge-img {
  width: 80%;
  height: 80%;
}
.qpc-balance {
  font-size: 1.875rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  color: #231d45;
}
.qpc-balance em {
  font-style: normal;
  color: #00817c;
  font-weight: 600;
  font-size: 1rem;
  margin-left: 4px;
}
.qpc-pill {
  margin-left: auto;
  background: #e5f4f2;
  color: #00817c;
  border: 1px solid #b8e0dc;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
}
.qpc-saved-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.qpc-saved-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.1;
  color: #231d45;
}
.qpc-saved-pts {
  font-size: 1.5rem;
  font-weight: 800;
  color: #00817c;
  line-height: 1.1;
}

.qpc-h3 {
  margin: 8px 0 2px;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.3;
  color: #231d45;
  position: relative;
  z-index: 1;
}
.qpc-sub {
  margin: 0 0 6px;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.5;
  color: #6b7089;
  position: relative;
  z-index: 1;
}

.qpc-divider {
  height: 1px;
  background: #f0f2f5;
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
  color: #94a3b8;
}
.qpc-before {
  font-size: 1rem;
  font-weight: 700;
}
.qpc-after {
  font-size: 1.125rem;
  font-weight: 800;
  color: #00817c;
}

.qpc-footer {
  margin: 6px 0 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #00817c;
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
