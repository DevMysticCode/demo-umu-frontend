<template>
  <div class="reward">
    <div class="reward-top">
      <span class="reward-lock">
        <OPIcon name="pointsLock" class="w-[14px] h-[14px]" />
      </span>
      <div class="reward-pts">{{ points }} pts <em>locked</em></div>
    </div>
    <h3 class="reward-h3">Next: {{ label }}</h3>
    <p class="reward-p">
      {{ description || `A total of ${points} points are available in this section.` }}
      Complete tasks to unlock rewards and move to the next section.
    </p>
    <div class="reward-actions">
      <a v-if="showRewardsLink" href="#" class="reward-link" @click.prevent>
        See rewards you can claim
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
      <button
        v-if="showNextTask"
        class="reward-cta"
        @click="$emit('nextTask')"
      >
        Go to Next Task
      </button>
    </div>
  </div>
</template>

<script setup>
import OPIcon from '~/components/ui/OPIcon.vue'

defineProps({
  points: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    default: 'Available for completing this question.',
  },
  description: {
    type: String,
    default: '',
  },
  showRewardsLink: {
    type: Boolean,
    default: false,
  },
  showNextTask: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['nextTask'])
</script>

<style scoped>
.reward {
  margin-bottom: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #0a0f2c, #131a3a);
  color: #fff;
  padding: 20px;
  position: relative;
  overflow: hidden;
}
.reward::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.35), transparent 60%);
  pointer-events: none;
}
.reward-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
}
.reward-lock {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #99f6e4;
  flex-shrink: 0;
}
.reward-pts {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
}
.reward-pts em {
  font-style: normal;
  color: #99f6e4;
  font-weight: 600;
  font-size: 14px;
  margin-left: 4px;
}
.reward-h3 {
  margin: 8px 0 2px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  color: #99f6e4;
  position: relative;
  z-index: 1;
}
.reward-p {
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  z-index: 1;
}
.reward-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}
.reward-link {
  color: #99f6e4;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.reward-cta {
  margin-left: auto;
  background: #14b8a6;
  color: #0a0f2c;
  border: 0;
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.12s ease;
}
.reward-cta:active {
  transform: scale(0.97);
}
</style>


