<template>
  <div class="budget-slider scale-slider">
    <!-- Question Display (skip if hideQuestionDisplay is true) -->
    <template v-if="!hideQuestionDisplay">
      <p v-if="displayedQuestion" class="question-text">
        {{ displayedQuestion }}
        <span v-if="showQuestionCursor" class="typing-cursor">|</span>
      </p>

      <!-- Description Display -->
      <div v-if="displayedDescription" class="question-description">
        {{ displayedDescription }}
        <span
          v-if="showDescriptionCursor"
          class="typing-cursor typing-cursor--small"
          >|</span
        >
      </div>

      <!-- Help Display -->
      <div v-if="displayedHelp" class="help-section">
        <div class="help-content">
          <h4 class="help-title">
            <span class="help-icon">💡</span>What is this?
          </h4>
          <p class="help-text">
            {{ displayedHelp }}
            <span
              v-if="showHelpCursor"
              class="typing-cursor typing-cursor--small"
              >|</span
            >
          </p>
        </div>
      </div>
    </template>

    <div>
      <div class="budget-slider__container">
        <div class="budget-slider__track">
          <!-- Selected Value Pill (moves with slider) -->
          <div
            class="budget-slider__value-pill"
            :style="{ left: rangePercent + '%' }"
          >
            <span class="value-pill-text">{{ displayValue }}</span>
          </div>

          <!-- Range Fill -->
          <div
            class="budget-slider__range"
            :style="{ width: rangePercent + '%' }"
          ></div>

          <!-- Scale Ticks -->
          <div class="budget-slider__scale">
            <div
              v-for="(tick, index) in scaleTicks"
              :key="index"
              class="budget-slider__scale-tick"
              :class="{
                'budget-slider__scale-tick--major': index % 5 === 0,
                'budget-slider__scale-tick--minor': index % 5 !== 0,
              }"
            ></div>
          </div>

          <!-- Hidden Input -->
          <input
            type="range"
            :min="minValue"
            :max="maxValue"
            :step="step"
            :value="localValue"
            class="budget-slider__input"
            @input="handleInput"
          />

          <!-- Handle Dot -->
          <div
            class="budget-slider__handle"
            :style="{ left: rangePercent + '%' }"
          ></div>
        </div>

        <!-- Bottom Labels -->
        <div class="budget-slider__labels">
          <span
            v-for="(label, index) in bottomLabels"
            :key="index"
            class="label-item"
          >
            {{ label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: [Number, String], default: null },
  displayedQuestion: { type: String, default: '' },
  showQuestionCursor: { type: Boolean, default: false },
  displayedDescription: { type: String, default: '' },
  showDescriptionCursor: { type: Boolean, default: false },
  displayedHelp: { type: String, default: '' },
  showHelpCursor: { type: Boolean, default: false },
  hideQuestionDisplay: { type: Boolean, default: false },
})
const emit = defineEmits(['update'])

// Determine if scale is alphabetic or numeric
const isAlphabetic = computed(() => {
  return props.question.scaleType === 'alphabet'
})

// Handle numeric values
const minValue = computed(() => {
  if (isAlphabetic.value) return 0
  return props.question.scaleMin ?? props.question.min ?? 0
})

const maxValue = computed(() => {
  if (isAlphabetic.value) return 25 // A-Z = 0-25
  return props.question.scaleMax ?? props.question.max ?? 10
})

const step = computed(() => {
  return props.question.scaleStep ?? props.question.step ?? 1
})

// Local value for the slider (always numeric: 0-25 for alphabet, min-max for numbers)
const localValue = ref(
  props.answer !== null && props.answer !== undefined
    ? convertAnswerToSliderValue(props.answer)
    : minValue.value,
)

function convertAnswerToSliderValue(answer) {
  if (isAlphabetic.value) {
    // Convert letter to index (A=0, B=1, ..., Z=25)
    if (typeof answer === 'string') {
      return answer.toUpperCase().charCodeAt(0) - 65
    }
    return answer ?? 0
  }
  return Number(answer) ?? minValue.value
}

function convertSliderValueToAnswer(value) {
  if (isAlphabetic.value) {
    // Convert index to letter
    return String.fromCharCode(65 + value)
  }
  return Number(value)
}

// Display value shown in the pill
const displayValue = computed(() => {
  if (isAlphabetic.value) {
    return String.fromCharCode(65 + localValue.value)
  }

  // For numeric scales with custom format
  const format = props.question.scaleFormat
  if (format === 'currency') {
    return '£' + localValue.value + 'K'
  }
  if (format === 'percentage') {
    return localValue.value + '%'
  }
  return localValue.value
})

watch(
  () => props.answer,
  (newAnswer) => {
    if (newAnswer !== null && newAnswer !== undefined) {
      localValue.value = convertAnswerToSliderValue(newAnswer)
    }
  },
)

const rangePercent = computed(() => {
  if (maxValue.value === minValue.value) return 0
  return (
    ((localValue.value - minValue.value) / (maxValue.value - minValue.value)) *
    100
  )
})

const scaleTicks = computed(() => {
  const ticks = []
  const totalTicks = isAlphabetic.value
    ? maxValue.value - minValue.value + 1
    : 21
  for (let i = 0; i < totalTicks; i++) {
    ticks.push(i)
  }
  return ticks
})

const bottomLabels = computed(() => {
  if (isAlphabetic.value) {
    const start = minValue.value
    const end = maxValue.value
    return Array.from({ length: end - start + 1 }, (_, i) =>
      String.fromCharCode(65 + start + i),
    )
  }

  // For numeric scales with custom format
  const format = props.question.scaleFormat
  const steps = 4
  const span = maxValue.value - minValue.value
  const labels = Array.from({ length: steps + 1 }, (_, i) => {
    const value = minValue.value + (span / steps) * i
    const roundedValue = Math.round(value)

    if (format === 'currency') {
      return roundedValue + 'K'
    }
    if (format === 'percentage') {
      return roundedValue + '%'
    }
    return roundedValue
  })

  // Add + sign to last label if specified
  if (props.question.scaleMaxLabel) {
    labels[labels.length - 1] = props.question.scaleMaxLabel
  }

  return labels
})

const handleInput = (event) => {
  localValue.value = Number(event.target.value)
  emitValue()
}

const emitValue = () => {
  emit('update', convertSliderValueToAnswer(localValue.value))
}
</script>

<style scoped>
.budget-slider {
  padding: 0 8px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* min-height: 350px; */
}

.budget_helper_text {
  font-size: 17px;
  margin-bottom: 1rem;
}

.budget_helper_text p {
  margin: 0;
}

.budget-slider__container {
  position: relative;
  padding: 0 0.5rem;
  margin-top: 80px;
}

.budget-slider__track {
  position: relative;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  margin: 0 0 3rem;
  margin-top: 2rem;
}

.budget-slider__value-pill {
  position: absolute;
  top: -40px;
  transform: translateX(-50%);
  background-color: #00a19a;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  white-space: nowrap;
  z-index: 10;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.3);
}

.value-pill-text {
  display: inline-block;
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
}

.budget-slider__scale-tick--major {
  height: 22px;
  background-color: #00a19a;
}

.budget-slider__scale-tick--minor {
  height: 19px;
  background: linear-gradient(
    180deg,
    rgba(0, 161, 154, 0.1) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
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

.label-item {
  font-size: 0.875rem;
  color: #00a19a;
  font-weight: 500;
}

.question-text {
  color: #000000;
  margin: 0 0 20px 0;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
}

.question-description {
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  color: #3c3c4399;
  margin-bottom: 20px;
}

.help-section {
  display: flex;
  gap: 2px;
  padding: 12px;
  background: #00a19a1a;
  border-radius: 12px;
  border: 2px solid #e6f9f7;
  margin-bottom: 20px;
}

.help-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.help-content {
  flex: 1;
}

.help-title {
  margin: 0px 0 8px -5px;
  color: #00a19a;
  font-weight: 590;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
}

.help-text {
  color: #3c3c4399;
  margin: 0;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
}

.typing-cursor {
  margin-left: 2px;
  color: #00a19a;
  animation: blink 1s infinite;
}

.typing-cursor--small {
  font-size: 12px;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@media (max-width: 400px) {
  .budget-slider__labels {
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 0.5rem;
  }

  .label-item {
    flex: 0 0 auto;
  }
}
</style>
