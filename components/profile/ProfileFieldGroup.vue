<template>
  <div class="pi-section">
    <div class="pi-group">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.pi-section {
  padding: 0 22px;
}
.pi-group {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
}
</style>