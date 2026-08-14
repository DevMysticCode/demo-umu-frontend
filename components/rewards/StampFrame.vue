<template>
  <div
    class="sf-badge"
    :style="{ width: size + 'px', height: size + 'px', '--sf-size': size + 'px' }"
  >
    <div class="sf-ring-outer">
      <div class="sf-ring-inner">
        <img v-if="iconAsset" :src="iconAsset" alt="" class="sf-icon" loading="lazy" />
        <svg v-else class="sf-icon sf-icon--fallback" viewBox="0 0 24 24" fill="none">
          <path
            d="m5 12 5 5L20 7"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <template v-if="title">
          <div class="sf-title">{{ title }}</div>
          <div class="sf-divider">
            <span class="sf-divider-line" /><span class="sf-divider-dot" /><span class="sf-divider-line" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Generic reusable "ink stamp" face — a CSS/SVG double-ring circle in the
// app's teal palette with a centered icon + title, used as the impression
// left on the Passport page for any achievement that doesn't (yet) have
// bespoke baked stamp art. Deliberately not a raster image: crisp at any
// size, recolourable, and every achievement renders through the exact
// same path rather than mixing photo-quality art with vector fallbacks.
withDefaults(
  defineProps<{
    title?: string | null
    iconAsset?: string | null
    size?: number
  }>(),
  { title: null, iconAsset: null, size: 160 },
)
</script>

<style scoped>
.sf-badge {
  position: relative;
  border-radius: 50%;
  flex-shrink: 0;
}
.sf-ring-outer {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #00817c;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8%;
}
.sf-ring-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1.5px dashed #00817c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6%;
  padding: 10%;
  text-align: center;
}
.sf-icon {
  width: calc(var(--sf-size) * 0.26);
  height: calc(var(--sf-size) * 0.26);
  object-fit: contain;
  color: #00817c;
}
.sf-icon--fallback {
  stroke: #00817c;
}
.sf-title {
  font-size: calc(var(--sf-size) * 0.1);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #00817c;
  line-height: 1.2;
}
.sf-divider {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 55%;
}
.sf-divider-line {
  flex: 1;
  height: 1px;
  background: #00817c;
  opacity: 0.6;
}
.sf-divider-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #00817c;
  flex-shrink: 0;
}
</style>
