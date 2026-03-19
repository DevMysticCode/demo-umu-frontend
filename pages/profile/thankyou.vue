<template>
  <div
    class="mobile-container min-h-screen page-bg text-white overflow-hidden flex flex-col"
  >
    <section class="fixed inset-0 z-50 bg-black text-white">
      <img
        src="/op-icons/temp/bg.svg"
        alt="Thank you video background"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 thankyou-overlay" />

      <div class="relative h-full flex flex-col px-6 pt-6 pb-8">
        <div class="flex items-center justify-between">
          <div
            class="inline-flex items-center gap-2 bg-black/45 rounded-full px-2 py-1"
          >
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
              aria-label="Close"
              @click="goBack"
            >
              <Icon name="i-heroicons-x-mark" class="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
            >
              <Icon
                name="i-heroicons-rectangle-stack"
                class="w-4 h-4 text-white"
              />
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
            >
              <Icon
                name="i-heroicons-musical-note"
                class="w-4 h-4 text-white"
              />
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
            >
              <Icon
                name="i-heroicons-arrow-up-tray"
                class="w-4 h-4 text-white"
              />
            </button>
          </div>

          <div class="inline-flex items-center gap-2">
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
            >
              <Icon name="i-heroicons-heart" class="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
            >
              <Icon
                name="i-heroicons-speaker-wave"
                class="w-5 h-5 text-white"
              />
            </button>
          </div>
        </div>

        <div
          class="mt-auto mb-20 flex flex-col items-center justify-center text-center"
        >
          <div class="mb-8">
            <img
              src="/op-icons/temp/celebration.png"
              alt="Celebration"
              class="w-[176px] h-[176px] mx-auto"
            />
          </div>

          <h1
            class="text-[28px] leading-[35px] tracking-[-0.55px] font-semibold text-white mb-3"
          >
            Thank you for watching this video.
          </h1>

          <p
            class="text-[14px] leading-[18px] tracking-[-0.23px] text-white/90 mb-8 max-w-xs"
          >
            You have now learnt all you need to know about ownership of
            property.
          </p>

          <button
            type="button"
            class="w-full max-w-xs px-6 py-3 rounded-full bg-[#00A19A] text-white font-normal text-[15px] leading-[18px]"
            @click="finish"
          >
            Finish
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const finish = () => {
  router.push('/profile/learn')
}
</script>

<style scoped>
.page-bg {
  background: linear-gradient(180deg, #ffffff 0%, #eff4f4 68%, #dff3f1 100%);
}

.thankyou-overlay {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0) 36%),
    linear-gradient(180deg, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.66) 100%);
}
</style>
