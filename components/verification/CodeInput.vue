<template>
  <div class="code-input">
    <div class="code-input__fields">
      <input
        v-for="(digit, index) in digits"
        :key="index"
        :ref="(el) => (inputRefs[index] = el)"
        v-model="digits[index]"
        @input="handleInput(index, $event)"
        @keydown="handleKeydown(index, $event)"
        @paste="handlePaste"
        type="text"
        inputmode="numeric"
        maxlength="1"
        class="code-input__field"
        :class="{ 'code-input__field--filled': digits[index] }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  modelValue: string
  length?: number
}

const props = withDefaults(defineProps<Props>(), {
  length: 6,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  complete: [code: string]
}>()

const digits = ref<string[]>(Array(props.length).fill(''))
const inputRefs = ref<(HTMLInputElement | null)[]>([])

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== digits.value.join('')) {
      digits.value = newValue
        .split('')
        .concat(Array(props.length).fill(''))
        .slice(0, props.length)
    }
  }
)

const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '') // Only allow numbers

  digits.value[index] = value

  // Move to next field if value entered
  if (value && index < props.length - 1) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus()
    })
  }

  updateModelValue()
}

const handleKeydown = (index: number, event: KeyboardEvent) => {
  // Handle backspace
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    nextTick(() => {
      inputRefs.value[index - 1]?.focus()
    })
  }

  // Handle arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }

  if (event.key === 'ArrowRight' && index < props.length - 1) {
    inputRefs.value[index + 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const numbers = pastedData.replace(/[^0-9]/g, '').slice(0, props.length)

  digits.value = numbers
    .split('')
    .concat(Array(props.length).fill(''))
    .slice(0, props.length)

  // Focus the next empty field or the last field
  const nextEmptyIndex = digits.value.findIndex((digit) => !digit)
  const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : props.length - 1

  nextTick(() => {
    inputRefs.value[focusIndex]?.focus()
  })

  updateModelValue()
}

const updateModelValue = () => {
  const code = digits.value.join('')
  emit('update:modelValue', code)

  // Check if code is complete
  if (code.length === props.length && !code.includes('')) {
    emit('complete', code)
  }
}
</script>

<style scoped>
.code-input__fields {
  @apply flex justify-center space-x-3;
}

.code-input__field {
  @apply w-12 h-12 bg-white rounded-xl text-center text-xl font-semibold text-gray-900 border-0 focus:ring-2 focus:ring-white/50 transition-all;
}

.code-input__field--filled {
  @apply bg-white;
}
</style>
