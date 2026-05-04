<template>
  <header class="pn">
    <button class="pn-back" aria-label="Back" @click="onBack">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
    <div class="pn-title">{{ title }}</div>
    <div class="pn-action">
      <slot name="action">
        <span v-if="action" class="pn-action-text" @click="$emit('action')">
          {{ action }}
        </span>
      </slot>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  action: { type: String, default: '' },
  backTo: { type: String, default: '' },
})
const emit = defineEmits(['back', 'action'])

const router = useRouter()
function onBack() {
  emit('back')
  if (props.backTo) router.push(props.backTo)
  else router.back()
}
</script>

<style scoped>
.pn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px 10px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: #fff;
}
.pn-back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #0e2840;
  flex-shrink: 0;
}
.pn-back:hover { background: #e2e8f0; }
.pn-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}
.pn-action {
  min-width: 32px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.pn-action-text {
  font-size: 13px;
  font-weight: 700;
  color: #008c86;
  cursor: pointer;
  letter-spacing: -0.1px;
}
</style>