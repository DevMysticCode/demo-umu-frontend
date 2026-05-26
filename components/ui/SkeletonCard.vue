<template>
  <!-- Composed shimmer card that mirrors the real property-card layout
       so swapping it in for `v-if="loading"` doesn't shift the page
       when data arrives.

         <SkeletonCard />              ← default property-card shape
         <SkeletonCard variant="row" />  ← horizontal row card (passport list)
         <SkeletonCard :count="3" />   ← render N stacked cards
   -->
  <template v-if="count > 1">
    <div
      v-for="i in count"
      :key="i"
      class="umu-skel-card"
      :class="[`umu-skel-card--${variant}`]"
      aria-hidden="true"
    >
      <slot>
        <template v-if="variant === 'row'">
          <div class="umu-skel umu-skel--row-img" />
          <div class="umu-skel-card-body">
            <div class="umu-skel umu-skel--line" style="width: 60%" />
            <div class="umu-skel umu-skel--line" style="width: 40%; margin-top: 8px" />
            <div class="umu-skel umu-skel--line" style="width: 80%; margin-top: 12px; height: 8px" />
          </div>
        </template>
        <template v-else>
          <div class="umu-skel umu-skel--card-img" />
          <div class="umu-skel-card-body">
            <div class="umu-skel umu-skel--line" style="width: 70%" />
            <div class="umu-skel umu-skel--line" style="width: 45%; margin-top: 8px" />
            <div class="umu-skel-card-pills">
              <div class="umu-skel umu-skel--pill" />
              <div class="umu-skel umu-skel--pill" style="width: 70px" />
            </div>
          </div>
        </template>
      </slot>
    </div>
  </template>
  <div
    v-else
    class="umu-skel-card"
    :class="[`umu-skel-card--${variant}`]"
    aria-hidden="true"
  >
    <slot>
      <template v-if="variant === 'row'">
        <div class="umu-skel umu-skel--row-img" />
        <div class="umu-skel-card-body">
          <div class="umu-skel umu-skel--line" style="width: 60%" />
          <div class="umu-skel umu-skel--line" style="width: 40%; margin-top: 8px" />
          <div class="umu-skel umu-skel--line" style="width: 80%; margin-top: 12px; height: 8px" />
        </div>
      </template>
      <template v-else>
        <div class="umu-skel umu-skel--card-img" />
        <div class="umu-skel-card-body">
          <div class="umu-skel umu-skel--line" style="width: 70%" />
          <div class="umu-skel umu-skel--line" style="width: 45%; margin-top: 8px" />
          <div class="umu-skel-card-pills">
            <div class="umu-skel umu-skel--pill" />
            <div class="umu-skel umu-skel--pill" style="width: 70px" />
          </div>
        </div>
      </template>
    </slot>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** card = vertical property card, row = horizontal list row */
    variant?: 'card' | 'row'
    /** Render N stacked cards */
    count?: number
  }>(),
  { variant: 'card', count: 1 },
)
</script>

<style scoped>
.umu-skel-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 12px;
}
.umu-skel-card--row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
}
.umu-skel {
  background: linear-gradient(90deg, #f0f0f8 25%, #e8e8f0 50%, #f0f0f8 75%);
  background-size: 200% 100%;
  animation: umu-skel-shimmer 1.4s infinite;
  display: block;
}
.umu-skel--card-img {
  width: 100%;
  height: 160px;
  border-radius: 0;
}
.umu-skel--row-img {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  flex-shrink: 0;
}
.umu-skel--line {
  height: 12px;
  border-radius: 6px;
}
.umu-skel--pill {
  width: 60px;
  height: 22px;
  border-radius: 999px;
}
.umu-skel-card-body {
  padding: 14px 16px 16px;
  flex: 1;
  min-width: 0;
}
.umu-skel-card--row .umu-skel-card-body {
  padding: 0;
}
.umu-skel-card-pills {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}
@keyframes umu-skel-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .umu-skel {
    animation: none;
    background: #f0f0f8;
  }
}
</style>
