<template>
  <div class="review-section">
    <div class="review-status">
      <span class="status-badge"
        ><OPIcon name="infoCircle" class="w-[11px] h-[11px]" /> Under
        Review</span
      >
    </div>

    <div class="review-header">
      <div class="review-content">
        <h3 class="review-title">{{ title }}</h3>
        <p class="review-description">{{ description }}</p>
        <p class="review-time">Minimum Time: {{ minimumTime }}</p>
      </div>
      <div class="review-icon">
        <OPIcon name="underReview" class="w-[80px] h-[80px]" />
      </div>
    </div>

    <div class="review-footer">
      <button class="view-profile-btn" @click="$emit('viewProfile')">
        <span class="btn-icon"
          ><OPIcon name="expertIcon" class="w-[20px] h-[20px]"
        /></span>
        View Expert Profile
      </button>
    </div>
  </div>
</template>

<script setup>
import OPIcon from '~/components/ui/OPIcon.vue'

defineProps({
  title: {
    type: String,
    default: 'Your Expert Guidance',
  },
  description: {
    type: String,
    default: 'You have 3 questions under review by an expert.',
  },
  minimumTime: {
    type: String,
    default: '3 Days',
  },
})

defineEmits(['viewProfile'])
</script>

<style scoped>
.review-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 2px solid #e6f9f7;
}

.review-status {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e6f9f7;
  color: #00a19a;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.06px;
}

.review-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 4px;
}

.review-content {
  flex: 1;
}

.review-title {
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
  font-weight: 400;
  font-size: 15px;
  line-height: 18px;
  letter-spacing: -0.08px;
}

.review-description {
  color: #000000;
  margin: 8px 0 0 0;
  font-weight: 400;
  color: #00a19a;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.06px;
}

.review-time {
  color: #666;
  margin: 8px 0 0 0;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.06px;
}

.review-icon {
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

.review-footer {
  display: flex;
  justify-content: center;
}

.view-profile-btn {
  /* width: 127px; */
  display: flex;
  align-items: center;
  justify-self: center;
  gap: 4px;
  padding: 8px 12px;
  background: #00a19a;
  color: #ffffff;
  border: 0.33px solid #3c3c432e;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  margin-top: 4px;
  transition: all 0.2s;
  margin-left: auto;
}

.view-profile-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 16px;
}
</style>
