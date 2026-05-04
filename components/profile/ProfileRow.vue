<template>
  <component
    :is="to ? 'a' : 'button'"
    :href="to || undefined"
    class="prow"
    :class="{ 'prow--clickable': clickable }"
    :type="to ? undefined : 'button'"
    @click="onClick"
  >
    <div class="prow-icon" :class="iconTone ? `prow-icon--${iconTone}` : ''">
      <slot name="icon">
        <span v-if="emoji" class="prow-emoji">{{ emoji }}</span>
      </slot>
    </div>
    <div class="prow-body">
      <div class="prow-title">{{ title }}</div>
      <div v-if="meta || $slots.meta" class="prow-meta">
        <slot name="meta">{{ meta }}</slot>
      </div>
    </div>
    <div class="prow-right">
      <slot name="right">
        <span v-if="value" class="prow-value">{{ value }}</span>
        <span v-if="clickable" class="prow-chev">›</span>
      </slot>
    </div>
  </component>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  meta: { type: String, default: '' },
  value: { type: String, default: '' },
  emoji: { type: String, default: '' },
  iconTone: { type: String, default: '' }, // 'brand' | 'warn' | 'good' | ''
  to: { type: String, default: '' },
  clickable: { type: Boolean, default: true },
})
const emit = defineEmits(['click'])
const router = useRouter()
function onClick(e) {
  if (props.to) {
    e.preventDefault()
    router.push(props.to)
  }
  emit('click', e)
}
</script>

<style scoped>
.prow {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, transform 0.1s;
  font-family: inherit;
  text-decoration: none;
  color: inherit;
}
.prow:hover {
  border-color: #b2e8e6;
}
.prow:active {
  transform: scale(0.99);
}

.prow-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: #eafaf9;
  border: 1px solid #b2e8e6;
  color: #008c86;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.prow-icon--warn {
  background: #fef3c7;
  border-color: #fde68a;
  color: #92400e;
}
.prow-icon--good {
  background: #d1fae5;
  border-color: #a7f3d0;
  color: #065f46;
}
.prow-icon--neutral {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #4a5568;
}
.prow-emoji {
  font-size: 18px;
  line-height: 1;
}

.prow-body {
  flex: 1;
  min-width: 0;
}
.prow-title {
  font-size: 14px;
  font-weight: 700;
  color: #0e2840;
  letter-spacing: -0.2px;
  line-height: 1.25;
}
.prow-meta {
  font-size: 12px;
  color: #6b7c8e;
  margin-top: 2px;
  line-height: 1.4;
}

.prow-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.prow-value {
  font-size: 12.5px;
  color: #0e2840;
  font-weight: 600;
}
.prow-chev {
  color: #94a3b8;
  font-size: 18px;
  font-weight: 600;
}
</style>