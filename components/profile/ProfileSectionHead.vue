<template>
  <div class="psh">
    <span class="psh-label">{{ label }}</span>
    <span
      v-if="action"
      class="psh-action"
      :class="{ disabled: actionDisabled }"
      @click="!actionDisabled && $emit('action')"
    >
      {{ action }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  action: { type: String, default: '' },
  actionDisabled: { type: Boolean, default: false },
})
defineEmits(['action'])
</script>

<style scoped>
/* Matches prototype `.section-heading` */
.psh {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 22px 22px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.psh-action {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  color: #1f7a66;
  cursor: pointer;
  letter-spacing: -0.1px;
  text-transform: none;
}
.psh-action.disabled {
  color: #8a95a0;
  cursor: default;
}
</style>