<template>
  <div class="prop-img">
    <img
      :src="shown ? resolvedSrc! : DUMMY_IMAGE"
      :alt="alt"
      class="prop-img-photo"
      @error="failed = true"
    />
    <slot name="overlay" />
  </div>
</template>

<script setup lang="ts">
// Generic stock photo shown whenever a property has no real uploaded/
// enriched image — reads as "a house", not a broken image, and doesn't
// give the false impression of being this specific property's photo.
const DUMMY_IMAGE = '/op-icons/misc/propertyPlaceholder.png'

const props = withDefaults(
  defineProps<{
    src?: string | null
    alt?: string
    showCaption?: boolean
  }>(),
  {
    src: null,
    alt: 'Property',
    showCaption: true,
  },
)

const failed = ref(false)
const resolvedSrc = computed(() => (props.src && props.src.trim() ? props.src : null))
const shown = computed(() => !!resolvedSrc.value && !failed.value)

watch(() => props.src, () => { failed.value = false })
</script>

<style scoped>
.prop-img {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #e6efe9;
}
.prop-img-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>