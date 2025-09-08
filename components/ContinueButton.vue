<template>
  <button
    @click="$emit('continue')"
    :disabled="disabled"
    class="continue-button"
    :class="{
      'continue-button--disabled': disabled,
    }"
  >
    {{ text }}
  </button>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: 'Continue',
  },
})

defineEmits(['continue'])
</script>

<style scoped>
.continue-button {
  width: 100%;
  /* height: 3.5rem; */
  background-color: #00a19a;
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 17px;
  font-size: 17px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px; /* 129.412% */
  letter-spacing: -0.43px;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 14px 20px;
}

.continue-button:hover:not(:disabled) {
  background-color: rgba(0, 161, 154, 0.9);
}

.continue-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
