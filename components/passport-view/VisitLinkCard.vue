<template>
  <div class="link-card">
    <div class="link-header">
      <div class="link-content">
        <h4 class="link-title">{{ title }}</h4>
        <p class="link-url">{{ url }}</p>
      </div>
      <div class="link-icon">
        <OPIcon name="deskIcon" class="w-[80px] h-[80px]" />
      </div>
    </div>

    <div class="link-footer">
      <button class="visit-link-btn" @click="$emit('visitLink')">
        <span class="check-icon">✓</span>
        Visit Link
      </button>
    </div>
  </div>
</template>

<script setup>
import OPIcon from '~/components/ui/OPIcon.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
})

defineEmits(['visitLink'])
</script>

<style scoped>
.link-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 2px solid #e6f9f7;
}

.link-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.link-content {
  flex: 1;
}

.link-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}

.link-url {
  font-size: 13px;
  color: #00a19a;
  margin: 8px 0 0 0;
  line-height: 16px;
  letter-spacing: -0.06px;
  word-break: break-all;
  text-decoration: none;
}

.link-icon {
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

.link-footer {
  display: flex;
  justify-content: center;
}

.visit-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.23px;
}

.visit-link-btn:active {
  transform: scale(0.98);
}

.check-icon {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}
</style>
