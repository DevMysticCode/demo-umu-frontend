<template>
  <div class="fm-wrap">
    <!-- Header -->
    <div class="fm-header">
      <h2 class="fm-title">All Filters</h2>
      <button class="fm-close-btn" @click="$emit('close')">
        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="#555"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <div class="fm-body">
      <!-- ── Explore ────────────────────────────────────────────── -->
      <div class="fm-section">
        <div class="fm-section-head">
          <div class="fm-section-label">
            <OPIcon name="filterExplore" class="w-[15px] h-[15px]" />
            <span>Explore</span>
          </div>
          <button class="fm-reset" @click="exploreType = 'ready-to-sell'">
            RESET
          </button>
        </div>
        <SegmentedSwitch
          :options="[
            { label: 'Ready to sell', value: 'ready-to-sell' },
            { label: 'Published Passports', value: 'published-passports' },
          ]"
          v-model="exploreType"
        />
      </div>

      <!-- ── Price Range ────────────────────────────────────────── -->
      <div class="fm-section">
        <div class="fm-section-head">
          <div class="fm-section-label">
            <OPIcon name="filterPriceRange" class="w-[15px] h-[15px]" />
            <span>Price Range</span>
          </div>
          <button class="fm-reset" @click="resetPriceRange">RESET</button>
        </div>
        <div class="fm-card">
          <!-- Tags -->
          <div class="fm-price-tags">
            <span class="fm-price-tag">£{{ priceRange.min }}K</span>
            <span class="fm-price-tag">£{{ priceRange.max }}K</span>
          </div>

          <!-- Slider -->
          <BudgetSlider
            :budget-range="priceRange"
            :min-budget="50"
            :max-budget="350"
            :step="25"
            :labels="['50K', '100K', '150K', '200K', '250K', '300K', '350K+']"
            :show-helper-text="false"
            :show-values="false"
            @update:budget-range="
              (v) => {
                priceRange = v
              }
            "
          />

          <!-- Min / Max inputs -->
          <div class="fm-minmax-row">
            <div class="fm-minmax-box">
              <input
                class="fm-minmax-input"
                type="number"
                :value="priceRange.min"
                placeholder="Min"
                @change="setMin($event.target.value)"
              />
            </div>
            <div class="fm-minmax-sep" />
            <div class="fm-minmax-box">
              <input
                class="fm-minmax-input"
                type="number"
                :value="priceRange.max"
                placeholder="Max"
                @change="setMax($event.target.value)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Property Type ──────────────────────────────────────── -->
      <div class="fm-section">
        <div class="fm-section-head">
          <div class="fm-section-label">
            <OPIcon name="filterPropertyType" class="w-[15px] h-[15px]" />
            <span>Property Type</span>
          </div>
          <button class="fm-reset" @click="selectedTypes = ['Any']">
            RESET
          </button>
        </div>
        <div class="fm-card">
          <div class="fm-chips-wrap">
            <button
              v-for="type in propertyTypes"
              :key="type"
              :class="['fm-chip', { active: selectedTypes.includes(type) }]"
              @click="toggleType(type)"
            >
              {{ type }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Apply button -->
    <div class="fm-footer">
      <button class="fm-apply-btn" @click="apply">Apply Filters</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BudgetSlider from '~/components/questionnaire/BudgetSlider.vue'
import SegmentedSwitch from '~/components/core/SegmentedSwitch.vue'
import OPIcon from '~/components/ui/OPIcon.vue'

const emit = defineEmits(['close', 'apply'])

const exploreType = ref<'ready-to-sell' | 'published-passports'>(
  'ready-to-sell',
)
const priceRange = ref({ min: 100, max: 200 })
const selectedTypes = ref<string[]>(['Any'])

const propertyTypes = [
  'Any',
  'Detached',
  'Semi-Detached',
  'Terraced',
  'Flat',
  'Maisonette',
  'Bungalow',
  'Mobile Home',
  'Boat',
  'Parking',
  'Land',
]

const resetPriceRange = () => {
  priceRange.value = { min: 50, max: 350 }
}

const setMin = (v: string) => {
  const n = parseInt(v)
  if (!isNaN(n) && n >= 50 && n < priceRange.value.max) {
    priceRange.value = { ...priceRange.value, min: n }
  }
}

const setMax = (v: string) => {
  const n = parseInt(v)
  if (!isNaN(n) && n > priceRange.value.min && n <= 350) {
    priceRange.value = { ...priceRange.value, max: n }
  }
}

const toggleType = (type: string) => {
  if (type === 'Any') {
    selectedTypes.value = ['Any']
    return
  }
  const arr = selectedTypes.value.filter((t) => t !== 'Any')
  const idx = arr.indexOf(type)
  if (idx > -1) arr.splice(idx, 1)
  else arr.push(type)
  selectedTypes.value = arr.length ? arr : ['Any']
}

const apply = () => {
  emit('apply', {
    exploreType: exploreType.value,
    priceRange: { ...priceRange.value },
    propertyTypes: [...selectedTypes.value],
  })
}
</script>

<style scoped>
.fm-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f2f6f6;
}

/* Header */
.fm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px 16px;
  flex-shrink: 0;
  background: white;
}

.fm-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.fm-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e8e8ee;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Scrollable body */
.fm-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 0 16px 16px;
}
.fm-body::-webkit-scrollbar {
  display: none;
}

/* Section */
.fm-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.fm-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.fm-section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8e8e93;
}

.fm-reset {
  font-size: 13px;
  font-weight: 700;
  color: #00a19a;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

/* Card */
.fm-card {
  background: white;
  border-radius: 16px;
  padding: 14px;
}

/* Price tags */
.fm-price-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.fm-price-tag {
  background: rgba(0, 161, 154, 0.12);
  color: #00a19a;
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
}

/* Override BudgetSlider min-height when used in filter */
:deep(.budget-slider) {
  min-height: unset;
  padding: 0;
  max-width: 100%;
  margin: 0;
}

/* Min/Max row */
.fm-minmax-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.fm-minmax-box {
  flex: 1;
  background: #f2f6f6;
  border-radius: 12px;
  padding: 11px 14px;
}

.fm-minmax-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 500;
  color: #00a19a;
  text-align: center;
}
.fm-minmax-input::placeholder {
  color: #00a19a;
  opacity: 0.6;
}
.fm-minmax-input::-webkit-inner-spin-button,
.fm-minmax-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.fm-minmax-sep {
  width: 20px;
  height: 1.5px;
  background: #d0d0d5;
  flex-shrink: 0;
}

/* Property type chips */
.fm-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fm-chip {
  padding: 8px 16px;
  border-radius: 100px;
  border: 1.5px solid rgba(0, 161, 154, 0.2);
  background: white;
  color: #00a19a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.fm-chip.active {
  background: #00a19a;
  border-color: #00a19a;
  color: white;
}

/* Footer */
.fm-footer {
  padding: 12px 16px 20px;
  flex-shrink: 0;
  background: #f2f6f6;
}

.fm-apply-btn {
  width: 100%;
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
</style>
