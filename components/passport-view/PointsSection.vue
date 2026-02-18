<template>
  <div class="points-section">
    <div class="points-header">
      <div class="points-content">
        <div class="points-value">
          <div class="points-icon">
            <OPIcon name="pointsLock" class="w-[24px] h-[24px]" />
          </div>
          {{ points }}pts
        </div>
        <div class="points-label">{{ label }}</div>
        <p v-if="description" class="points-description">{{ description }}</p>
        <button v-if="showRewardsLink" class="rewards-link">
          See rewards you can claim →
        </button>
      </div>
      <div class="reward-icon">
        <OPIcon name="rewardBox" class="w-[80px] h-[80px]" />
      </div>
    </div>

    <div class="next-step-container">
      <button
        v-if="showNextTask"
        class="next-task-btn"
        @click="$emit('nextTask')"
      >
        Go To Next Task
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
.points-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 2px solid #e6f9f7;
}

.points-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.points-icon {
  display: inline;
  font-size: 20px;
  flex-shrink: 0;
}

.points-content {
  flex: 1;
}

.points-value {
  display: flex;
  align-items: center;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.points-label {
  font-size: 15px;
  color: #00a19a;
  margin-top: 8px;
  line-height: 20px;
  letter-spacing: -0.23px;
}

.reward-icon {
  font-size: 36px;
  flex-shrink: 0;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.points-description {
  font-size: 11px;
  line-height: 13px;
  color: #666;
  margin: 4px 0 0 0;
  letter-spacing: -0.06px;
}

.rewards-link {
  background: none;
  border: none;
  color: #00a19a;
  font-size: 13px;
  font-weight: 590;
  cursor: pointer;
  padding: 0;
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 13px;
  letter-spacing: -0.06px;
}

.next-step-container {
  display: flex;
  justify-content: flex-end;
}

.next-task-btn {
  width: 127px;
  padding: 8px 12px;
  background: #ffffff;
  color: #00a19a;
  border: 0.33px solid #3c3c432e;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s;
  margin-left: auto;
}

.next-task-btn:active {
  transform: scale(0.98);
}
</style>
