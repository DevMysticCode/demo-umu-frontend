<template>
  <div v-if="loading || properties.length" class="dash-section">
    <div class="dash-eyebrow">Recently viewed</div>
    <div v-if="loading" class="skeletons">
      <div v-for="n in 3" :key="n" class="skeleton-card" />
    </div>
    <div v-else class="horiz-feed">
      <div
        v-for="prop in properties"
        :key="prop.id"
        class="rv-card"
        @click="navigateTo('/property/' + prop.id)"
      >
        <div class="rv-img-wrap">
          <PropertyImage
            :src="prop.imageUrl || prop.image"
            :alt="prop.addressLine1 || prop.address"
            :show-caption="false"
            class="rv-img"
          />
        </div>
        <div class="rv-body">
          <div class="rv-address">{{ prop.addressLine1 || prop.address }}</div>
          <div class="rv-area">
            {{ prop.city ? prop.city + ', ' + prop.postcode : prop.postcode || '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PropertyImage from '~/components/property/PropertyImage.vue'

defineProps<{
  properties: any[]
  loading: boolean
}>()
</script>

<style scoped>
.dash-section {
  margin-bottom: 20px;
}
.dash-eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 10px;
}
.skeletons {
  display: flex;
  gap: 12px;
  overflow-x: hidden;
}
.skeleton-card {
  min-width: 150px;
  height: 130px;
  border-radius: 16px;
  background: linear-gradient(90deg, #eef0f6 25%, #f6f7fb 37%, #eef0f6 63%);
  background-size: 400% 100%;
  animation: rv-shimmer 1.4s ease infinite;
  flex-shrink: 0;
}
@keyframes rv-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.horiz-feed {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
}
.horiz-feed::-webkit-scrollbar {
  display: none;
}
.rv-card {
  min-width: 150px;
  max-width: 150px;
  flex-shrink: 0;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}
.rv-img-wrap {
  height: 84px;
  background: #f1f5f9;
}
.rv-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rv-body {
  padding: 8px 10px 10px;
}
.rv-address {
  font-size: 12.5px;
  font-weight: 700;
  color: #231d45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rv-area {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
