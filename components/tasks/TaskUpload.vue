<template>
  <div>
    <p class="text-sm text-gray-600 mb-2">{{ task.question }}</p>
    <input type="file" @change="onFile" />
    <div v-if="files.length" class="mt-2 space-y-2">
      <div v-for="(f, i) in files" :key="i" class="p-2 bg-white rounded border">
        {{ f.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ task: Object, modelValue: null })
const emit = defineEmits(['update:modelValue'])
const files = ref(props.modelValue?.files ?? [])

const onFile = (e) => {
  const f = e.target.files[0]
  if (!f) return
  files.value.push(f)
  emit('update:modelValue', { files: files.value })
}
</script>
