<template>
  <div class="budget-slider">
    <div class="budget-slider__current">
      <p class="budget-slider__current-label">{{ budgetRange.label }}</p>
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

        <!-- Min Handle -->
        <input
          type="range"
          :min="minBudget"
          :max="maxBudget"
          :step="step"
          v-model.number="budgetRange.min"
          class="budget-slider__input"
          style="z-index: 2"
          @input="handleMinInput"
        />

        <!-- Max Handle -->
        <input
          type="range"
          :min="minBudget"
          :max="maxBudget"
          :step="step"
          v-model.number="budgetRange.max"
          class="budget-slider__input"
          style="z-index: 3"
          @input="handleMaxInput"
        />

        <!-- Visual Handles -->
        <div
          class="budget-slider__handle"
          :style="{
            left:
              ((budgetRange.min - minBudget) / (maxBudget - minBudget)) * 100 +
              '%',
            zIndex: 4,
          }"
        ></div>
        <div
          class="budget-slider__handle"
          :style="{
            left:
              ((budgetRange.max - minBudget) / (maxBudget - minBudget)) * 100 +
              '%',
            zIndex: 4,
          }"
        ></div>
      </div>

      <!-- Range Labels -->
      <div class="budget-slider__labels">
        <span>£50k</span>
        <span>£100k</span>
        <span>£150k</span>
        <span>£200k</span>
        <span>£250k</span>
        <span>£300k</span>
        <span>£350k+</span>
      </div>
    </div>

    <!-- Display Selected Range -->
    <div class="budget-slider__selected">
      <span class="budget-slider__selected-text">
        Between £{{ budgetRange.min }}k and £{{
          budgetRange.max === maxBudget
            ? budgetRange.max + 'k+'
            : budgetRange.max + 'k'
        }}
      </span>
    </div>
  </div>
</template>

<script setup>
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

const handleMinInput = () => {
  if (props.budgetRange.min > props.budgetRange.max - props.step) {
    const newRange = {
      ...props.budgetRange,
      min: props.budgetRange.max - props.step,
    }
    emit('update:budgetRange', newRange)
  }
}

const handleMaxInput = () => {
  if (props.budgetRange.max < props.budgetRange.min + props.step) {
    const newRange = {
      ...props.budgetRange,
      max: props.budgetRange.min + props.step,
    }
    emit('update:budgetRange', newRange)
  }
}
</script>
