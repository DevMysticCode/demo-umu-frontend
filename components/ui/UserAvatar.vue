<template>
  <img
    v-if="src"
    :src="src"
    :alt="initials"
    :style="imgStyle"
  />
  <div v-else :style="initialsStyle">
    {{ initials }}
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string | null
  firstName?: string | null
  lastName?: string | null
  size?: number
}>(), {
  size: 32,
})

const initials = computed(() => {
  const f = (props.firstName ?? '').trim()[0]?.toUpperCase() ?? ''
  const l = (props.lastName ?? '').trim()[0]?.toUpperCase() ?? ''
  return (f + l) || '?'
})

const baseStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: '50%',
  flexShrink: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const imgStyle = computed(() => ({
  ...baseStyle.value,
  objectFit: 'cover' as const,
  border: '2px solid rgba(255,255,255,0.3)',
}))

const initialsStyle = computed(() => ({
  ...baseStyle.value,
  background: 'linear-gradient(135deg, #00A19A, #231d45)',
  color: '#fff',
  fontWeight: '700',
  fontSize: `${Math.max(10, Math.round(props.size * 0.38))}px`,
  letterSpacing: '-0.02em',
  userSelect: 'none' as const,
  border: '2px solid rgba(255,255,255,0.2)',
}))
</script>
