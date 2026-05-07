<template>
  <!-- HealthScore free card -->
  <div class="hs-free-card">
    <div class="hs-free-top">
      <div class="eyebrow-label teal">Healthscore™</div>
      <div class="badge-free">Free</div>
    </div>
    <div class="card-title navy">
      Every property has a story. The HealthScore tells it — in 60 seconds.
    </div>
    <div class="card-body-text">
      Instant risk snapshot on any address — structural condition, legal flags,
      energy rating and running costs. Know before you commit.
    </div>
    <div style="margin-bottom: 12px">
      <PropertySearchInput
        placeholder="Enter postcode or address"
        variant="light"
        @select="onHealthScoreSelect"
        @enter="onHealthScoreEnter"
      />
    </div>
    <button class="btn-brand-full" @click="$router.push('/homescore')">
      See what's behind the door
    </button>
  </div>

  <!-- Property Passport navy card -->
  <div class="pp-navy-card">
    <div class="pp-navy-glow-clip">
      <div class="pp-navy-glow"></div>
    </div>
    <div style="position: relative; z-index: 1">
      <div class="hs-free-top" style="margin-bottom: 8px">
        <div class="eyebrow-label" style="color: rgba(255, 255, 255, 0.45)">
          Property Passport
        </div>
        <div class="badge-pp-price">From £99</div>
      </div>
      <div class="card-title" style="color: #fff; margin-bottom: 6px">
        Every property has a history. The Passport holds it.
      </div>
      <div
        class="card-body-text"
        style="color: rgba(255, 255, 255, 0.6); margin-bottom: 14px"
      >
        Title deeds, planning history, legal searches and structural records —
        all verified.
      </div>
      <div style="margin-bottom: 12px">
        <PropertySearchInput
          placeholder="Search a property with a Passport"
          variant="dark"
          :prefer-passport="true"
          @select="onPassportSelect"
          @enter="onPassportEnter"
        />
      </div>
      <button class="btn-teal-dark" @click="$router.push('/explore')">
        Open the Passport
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'

const router = useRouter()

function onHealthScoreSelect(property: any) {
  router.push(`/homescore/${property.id}`)
}

function onHealthScoreEnter(q: string) {
  router.push(q ? `/homescore?q=${encodeURIComponent(q)}` : '/homescore')
}

function onPassportSelect(property: any) {
  router.push(`/property/${property.id}`)
}

function onPassportEnter(_q: string) {
  router.push('/explore')
}
</script>

<style scoped>
.hs-free-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
}
.hs-free-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.eyebrow-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
}
.eyebrow-label.teal {
  color: #00a19a;
}
.badge-free {
  background: #00a19a;
  color: #f1f9f4;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}
.badge-pp-price {
  background: rgba(94, 234, 212, 0.15);
  color: #3dbda3;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}
.card-title {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.015em;
  margin-bottom: 8px;
}
.card-title.navy {
  color: #231d45;
}
.card-body-text {
  font-size: 12.5px;
  line-height: 1.5;
  color: #4a5568;
  margin-bottom: 14px;
}
.btn-brand-full {
  width: 100%;
  background: #00a19a;
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
}
.btn-brand-full:active {
  background: #00a19a;
}
.btn-teal-dark {
  width: 100%;
  background: #3dbda3;
  color: #231d45;
  border: none;
  font-size: 14px;
  font-weight: 800;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
}
.btn-teal-dark:active {
  filter: brightness(0.95);
}
.pp-navy-card {
  background: linear-gradient(150deg, #231d45 0%, #1a3a4a 100%);
  border-radius: 20px;
  padding: 20px;
  position: relative;
  overflow: visible;
  margin-bottom: 14px;
}
.pp-navy-glow-clip {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  overflow: hidden;
  pointer-events: none;
}
.pp-navy-glow {
  position: absolute;
  top: -30%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(94, 234, 212, 0.2), transparent 70%);
  pointer-events: none;
}
</style>
