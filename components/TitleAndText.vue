<template>
  <div class="title-and-text">
    <h2 class="title-and-text__title">
      {{ title.split('\n').join('\n') }}
    </h2>

    <p class="title-and-text__description">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string;
  description: string;
}>(), {
  title: '',
  description: ''
});
</script>
<style scoped>
.title-and-text {
  @apply flex flex-col gap-3 px-4;

  &__title {
    @apply text-white text-[34px] font-bold leading-[41px] tracking-[-0.4px];
  }

  &__description {
    @apply text-white text-[17px] font-normal leading-[22px] tracking-[-0.43px] opacity-90;
  }
}
</style>