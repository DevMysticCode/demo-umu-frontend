<template>
  <div class="budget-slider">
    <div class="budget_helper_text mb-7">
      <p>Please use the slider to specify starting and ending range.</p>
      <p class="text-brand-aqua">Between £150k and £250K</p>
    </div>
    <!-- Value Displays -->
    <div class="budget-slider__values">
      <div class="budget-slider__value">
        <span class="budget-slider__value-prefix">£</span>
        <span class="budget-slider__value-amount">{{ budgetRange.min }}K</span>
      </div>
      <div class="budget-slider__value">
        <span class="budget-slider__value-prefix">£</span>
        <span class="budget-slider__value-amount">{{ budgetRange.max }}K</span>
      </div>
    </div>

    <div class="budget-slider__container">
      <!-- Slider Track -->
      <div class="budget-slider__track">
        <!-- Selected Range Highlight -->
        <div
          class="budget-slider__range"
          :style="{
            left:
              ((budgetRange.min - minBudget) / (maxBudget - minBudget)) * 100 +
              '%',
            width:
              ((budgetRange.max - budgetRange.min) / (maxBudget - minBudget)) *
                100 +
              '%',
          }"
        ></div>

        <!-- Scale Bars -->
        <div class="budget-slider__scale">
          <div
            v-for="(tick, index) in scaleTicks"
            :key="index"
            class="budget-slider__scale-tick"
            :class="{
              'budget-slider__scale-tick--major': index % 2 === 0,
              'budget-slider__scale-tick--minor': index % 2 !== 0,
            }"
          ></div>
        </div>

        <!-- Min Handle Input -->
        <input
          type="range"
          :min="minBudget"
          :max="maxBudget"
          :step="step"
          :value="budgetRange.min"
          class="budget-slider__input budget-slider__input--min"
          @input="handleMinInput"
        />

        <!-- Max Handle Input -->
        <input
          type="range"
          :min="minBudget"
          :max="maxBudget"
          :step="step"
          :value="budgetRange.max"
          class="budget-slider__input budget-slider__input--max"
          @input="handleMaxInput"
        />

        <!-- Visual Handles -->
        <div
          class="budget-slider__handle budget-slider__handle--min"
          :style="{
            left:
              ((budgetRange.min - minBudget) / (maxBudget - minBudget)) * 100 +
              '%',
          }"
        ></div>
        <div
          class="budget-slider__handle budget-slider__handle--max"
          :style="{
            left:
              ((budgetRange.max - minBudget) / (maxBudget - minBudget)) * 100 +
              '%',
          }"
        ></div>
      </div>

      <!-- Range Labels -->
      <div class="budget-slider__labels">
        <span v-for="(label, index) in labels" :key="index">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  budgetRange: {
    type: Object,
    required: true,
  },
  minBudget: {
    type: Number,
    default: 50,
  },
  maxBudget: {
    type: Number,
    default: 350,
  },
  step: {
    type: Number,
    default: 50,
  },
})

const emit = defineEmits(['update:budgetRange'])

// Generate scale ticks
const scaleTicks = computed(() => {
  const ticks = []
  for (let i = props.minBudget; i <= props.maxBudget; i += 10) {
    ticks.push(i)
  }
  return ticks
})

// Generate labels
const labels = computed(() => {
  return ['50K', '100K', '150K', '200K', '250K', '300K', '350K']
})

const handleMinInput = (event) => {
  const newMin = parseInt(event.target.value)
  let updatedRange = { ...props.budgetRange, min: newMin }

  // Ensure min doesn't exceed max minus step
  if (newMin >= props.budgetRange.max) {
    updatedRange.min = props.budgetRange.max - props.step
  }

  // Snap to nearest step
  updatedRange.min = Math.round(updatedRange.min / props.step) * props.step

  emit('update:budgetRange', updatedRange)
}

const handleMaxInput = (event) => {
  const newMax = parseInt(event.target.value)
  let updatedRange = { ...props.budgetRange, max: newMax }

  // Ensure max doesn't go below min plus step
  if (newMax <= props.budgetRange.min) {
    updatedRange.max = props.budgetRange.min + props.step
  }

  // Snap to nearest step
  updatedRange.max = Math.round(updatedRange.max / props.step) * props.step

  emit('update:budgetRange', updatedRange)
}
</script>

<style scoped>
.budget-slider {
  padding: 1.5rem 0.5rem;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.budget-slider__values {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
}

.budget-slider__value {
  display: flex;
  align-items: center;
  background-color: rgba(0, 161, 154, 0.1);
  border-radius: 100px;
  padding: 6px 12px;
  color: #00a19a;
}

.budget-slider__value-prefix {
  font-size: 12px;
  margin-right: 0.25rem;
}

.budget-slider__value-amount {
  font-size: 12px;
}

.budget-slider__container {
  position: relative;
  padding: 0 0.5rem;
}

.budget-slider__track {
  position: relative;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  margin: 0 0 3rem;
}

.budget-slider__range {
  position: absolute;
  height: 100%;
  background-color: #00a19a;
  border-radius: 4px;
  z-index: 1;
}

.budget-slider__scale {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 12px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  margin-top: 8px;
}

.budget-slider__scale-tick {
  width: 2px;
  background-color: #d1d5db;
}

.budget-slider__scale-tick--major {
  height: 12px;
}

.budget-slider__scale-tick--minor {
  height: 6px;
}

.budget-slider__input {
  position: absolute;
  width: 100%;
  height: 20px;
  top: -6px;
  left: 0;
  margin: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 3;
}

.budget-slider__input::-webkit-slider-thumb {
  pointer-events: all;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  appearance: none;
}

.budget-slider__input::-moz-range-thumb {
  pointer-events: all;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}

.budget-slider__handle {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #00a19a;
  border: 2px solid white;
  border-radius: 50%;
  top: -6px;
  transform: translateX(-50%);
  z-index: 2;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.budget-slider__labels {
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
  margin-top: 2rem;
}

.budget-slider__labels span {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 400px) {
  .budget-slider__values {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .budget-slider__value {
    width: 120px;
    justify-content: center;
  }

  .budget-slider__labels {
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 0.5rem;
  }

  .budget-slider__labels span {
    flex: 0 0 auto;
  }
}
</style>
