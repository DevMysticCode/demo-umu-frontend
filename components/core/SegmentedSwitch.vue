<template>
  <div class="switch-container">
    <div
      v-for="(option, index) in options"
      :key="index"
      class="switch-btn"
      :class="{ active: modelValue === option.value }"
      @click="selectOption(option.value)"
    >
      <span class="btn-icon" v-if="option.icon">
        <OPIcon :name="option.icon" class="w-[16px] h-[16px]" />
      </span>
      <span class="label">{{ option.label }}</span>
    </div>
  </div>
</template>

<script setup>
import OPIcon from '@/components/ui/OPIcon.vue'

const props = defineProps({
  options: Array,
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

const selectOption = (value) => emit('update:modelValue', value)
</script>

<style scoped>
.switch-container {
  display: flex;
  width: 100%;
  padding: 4px;
  border-radius: 40px;
  background: white;
  border: 2px solid #e0e0e0;
}

.switch-btn:first-child {
  border-bottom-left-radius: 36px;
  border-top-left-radius: 36px;
}

.switch-btn:last-child {
  border-bottom-right-radius: 36px;
  border-top-right-radius: 36px;
}

.switch-btn {
  flex: 1;
  padding: 7px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.25s ease;
  color: #00a89a;
}

/* Inactive Button Matches Your Light Aqua Toggle */
.switch-btn:not(.active) {
  background: #e6f8f7; /* exact soft aqua like your screenshot */
}

/* Active Button Matches Your Teal Filled State */
.switch-btn.active {
  background: #00b8a9;
  color: #ffffff;
}

/* Icon styling */
.btn-icon {
  display: flex;
  align-items: center;
}
</style>
