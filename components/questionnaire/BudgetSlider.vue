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
      <div class="budget-slider__labels mt-4">
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
    <!-- <div class="budget-slider__selected">
      <span class="budget-slider__selected-text">
        Between £{{ budgetRange.min }}k and £{{
          budgetRange.max === maxBudget
            ? budgetRange.max + 'k+'
            : budgetRange.max + 'k'
        }}
      </span>
    </div> -->
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

const handleMinInput = (event) => {
  const newMin = parseInt(event.target.value)
  let updatedRange = { ...props.budgetRange, min: newMin }

  // Ensure min doesn't exceed max minus step
  if (newMin >= props.budgetRange.max) {
    updatedRange.min = props.budgetRange.max - props.step
  }

  emit('update:budgetRange', updatedRange)
}

const handleMaxInput = (event) => {
  const newMax = parseInt(event.target.value)
  let updatedRange = { ...props.budgetRange, max: newMax }

  // Ensure max doesn't go below min plus step
  if (newMax <= props.budgetRange.min) {
    updatedRange.max = props.budgetRange.min + props.step
  }

  emit('update:budgetRange', updatedRange)
}
</script>
