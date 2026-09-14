<template>
  <div class="ppt">
    <div v-if="eyebrow" class="ppt-eyebrow">{{ eyebrow }}</div>
    <h1 class="ppt-h1">
      {{ title }}<span v-if="count != null" class="ppt-count">{{ count }}</span>
    </h1>
    <div v-if="$slots.stats || statsHtml" class="ppt-stats">
      <slot name="stats">
        <span v-html="statsHtml" />
      </slot>
    </div>
    <p v-else-if="subtitle" class="ppt-sub">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  count: { type: [Number, String], default: null },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  statsHtml: { type: String, default: '' },
})
</script>

<style scoped>
/* Matches prototype `.cl-hero` + `.h1` + `.hero-greeting` + `.hero-stats` */
.ppt {
  padding: 8px 22px 14px;
  position: relative;
  z-index: 1;
}
.ppt-eyebrow {
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #008a84;
  margin-bottom: 6px;
}
.ppt-h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -1.2px;
  line-height: 1;
  margin: 0 0 10px;
}
.ppt-count {
  display: inline-block;
  font-size: 1.375rem;
  font-weight: 700;
  color: #00726c;
  vertical-align: 8px;
  margin-left: 6px;
  letter-spacing: -0.5px;
}
.ppt-stats {
  display: inline-flex;
  align-items: center;
  font-size: 0.7813rem;
  font-weight: 700;
  color: #4a5868;
  letter-spacing: -0.2px;
  flex-wrap: wrap;
}
.ppt-stats :deep(.stat-num) {
  color: #0e2840;
  font-weight: 800;
  font-feature-settings: 'tnum';
  margin-right: 4px;
}
.ppt-stats :deep(.stat-num.teal) {
  color: #008a84;
}
.ppt-stats :deep(.stat-num.gold) {
  color: #b07a1f;
}
.ppt-stats :deep(.stat-sep) {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #b5bdc4;
  margin: 0 8px;
  display: inline-block;
}
.ppt-sub {
  font-size: 0.8125rem;
  color: #6b7c8e;
  margin: 0;
  line-height: 1.5;
}
</style>