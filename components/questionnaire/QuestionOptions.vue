<template>
  <div class="question-options">
    <div
      v-for="option in options"
      :key="option.value"
      @click="selectOption(option)"
      class="question-option"
      :class="getOptionClasses(option)"
    >
      <!-- <span class="question-option__icon" :class="getIconClasses(option)">
        {{ getIconEmoji(option.icon) }}
      </span> -->
      <Icon
        :name="option.icon"
        class="w-6 h-6 mr-4"
        :class="selectedAnswer === option.value ? 'text-black' : 'text-white'"
      />
      <span class="question-option__label" :class="getLabelClasses(option)">
        {{ option.label }}
      </span>
      <div
        v-if="selectedAnswer === option.value"
        class="question-option__check"
      >
        <Icon name="i-heroicons-check" class="w-6 h-6 text-black" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  selectedAnswer: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select'])

const selectOption = (option) => {
  emit('select', option)
}

const getOptionClasses = (option) => {
  return props.selectedAnswer === option.value
    ? 'question-option--selected'
    : 'question-option--unselected'
}

const getIconClasses = (option) => {
  return props.selectedAnswer === option.value
    ? 'question-option__icon--selected'
    : 'question-option__icon--unselected'
}

const getLabelClasses = (option) => {
  return props.selectedAnswer === option.value
    ? 'question-option__label--selected'
    : 'question-option__label--unselected'
}

// Simple icon mapping to emojis
const getIconEmoji = (iconName) => {
  const iconMap = {
    'i-heroicons-user': '👤',
    'i-heroicons-home': '🏠',
    'i-heroicons-magnifying-glass': '🔍',
    'i-heroicons-clock': '⏰',
    'i-heroicons-calendar': '📅',
    'i-heroicons-calendar-days': '📆',
    'i-heroicons-building-office': '🏢',
    'i-heroicons-map': '🗺️',
    'i-heroicons-building-office-2': '🏬',
  }
  return iconMap[iconName] || '📋'
}
</script>
