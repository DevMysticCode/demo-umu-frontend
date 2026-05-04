<template>
  <div class="pi-row" :class="{ 'verified-row': verified }" @click="onClick">
    <div v-if="verified" class="pir-verified-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>

    <div class="pir-content">
      <div
        class="pir-label"
        :style="verified ? 'color: #1f7a66;' : ''"
      >
        {{ label }}
      </div>
      <div
        class="pir-value"
        :class="{ empty }"
        :style="meta ? 'font-size:11.5px; color:#4a5868; font-weight:600;' : ''"
      >
        <slot>{{ value || '—' }}</slot>
      </div>
    </div>

    <!-- Toggle mode -->
    <div
      v-if="toggle != null"
      class="pir-toggle"
      :class="{ on: toggle }"
      @click.stop="$emit('toggle', !toggle)"
    />

    <!-- Edit pencil / plus -->
    <div
      v-else-if="!hideEdit"
      class="pir-edit"
      @click.stop="$emit('edit')"
    >
      <slot name="edit-icon">
        <svg
          v-if="empty"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path
            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
          />
        </svg>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '' },
  empty: { type: Boolean, default: false },
  meta: { type: Boolean, default: false },
  hideEdit: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  toggle: { type: Boolean, default: null },
})
const emit = defineEmits(['edit', 'toggle', 'click'])
function onClick(e) {
  emit('click', e)
}
</script>

<style scoped>
.pi-row {
  padding: 13px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f2f1;
  cursor: pointer;
  transition: background 0.15s;
  background: transparent;
}
.pi-row:last-child {
  border-bottom: none;
}
.pi-row:hover {
  background: #f5f4f0;
}
.pir-content {
  flex: 1;
  min-width: 0;
}
.pir-label {
  font-size: 11px;
  font-weight: 700;
  color: #8a95a0;
  letter-spacing: 0.2px;
  margin-bottom: 1px;
  text-transform: uppercase;
}
.pir-value {
  font-size: 13.5px;
  font-weight: 700;
  color: #0e2840;
  letter-spacing: -0.2px;
  line-height: 1.3;
}
.pir-value.empty {
  color: #1f7a66;
  font-weight: 700;
}
.pir-edit {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f2f1;
  color: #4a5868;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}
.pir-edit svg {
  width: 12px;
  height: 12px;
}
.pir-toggle {
  width: 38px;
  height: 22px;
  background: #e8eceb;
  border-radius: 100px;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.pir-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.pir-toggle.on {
  background: #3dbda3;
}
.pir-toggle.on::after {
  transform: translateX(16px);
}

/* Verified-row gradient */
.pi-row.verified-row {
  background: linear-gradient(135deg, #f1f9f4 0%, #e2f1ea 100%);
  border-bottom: 1px solid rgba(61, 189, 163, 0.25);
}
.pir-verified-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3dbda3;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pir-verified-icon svg {
  width: 14px;
  height: 14px;
}
</style>