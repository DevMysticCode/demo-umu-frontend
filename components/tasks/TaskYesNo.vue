<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-600">{{ task.question }}</p>
    <div class="flex gap-4">
      <button @click="set(true)" :class="btnClass(true)">Yes</button>
      <button @click="set(false)" :class="btnClass(false)">No</button>
    </div>
    <textarea
      v-if="showFollowup"
      v-model="text"
      class="w-full p-3 rounded-lg border mt-2"
      placeholder="Please describe..."
    ></textarea>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
const props = defineProps({ task: Object, modelValue: null })
const emit = defineEmits(['update:modelValue'])

const val = ref(props.modelValue?.value ?? null)
const text = ref(props.modelValue?.text ?? '')

const set = (v) => {
  val.value = v
  if (!v) text.value = ''
  emit('update:modelValue', { value: val.value, text: text.value })
}

watch(text, () =>
  emit('update:modelValue', { value: val.value, text: text.value })
)

const showFollowup = computed(() => val.value === true)
const btnClass = (b) =>
  `px-6 py-2 rounded-xl ${
    val.value === b ? 'bg-brand-aqua text-white' : 'bg-gray-100 text-gray-700'
  }`
</script>
