<template>
  <div class="mobile-container p-4">
    <AppHeader title="Step complete" showBack />
    <div class="mt-8 text-center">
      <h2 class="text-2xl font-semibold">🎉 Well done</h2>
      <p class="text-gray-600 mt-2">You completed this step.</p>

      <div class="mt-6">
        <button
          class="bg-brand-aqua text-white px-6 py-3 rounded-xl"
          @click="goNextStep"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePassportSteps } from '~/composables/usePassportSteps'
const { steps } = usePassportSteps()
const route = useRoute()
const router = useRouter()
const passportId = route.params.id
const stepId = route.params.stepId

const goNextStep = () => {
  const idx = steps.value.findIndex((s) => s.id === stepId)
  if (idx + 1 < steps.value.length) {
    const next = steps.value[idx + 1]
    router.push(`/passport/${passportId}/step/${next.id}`)
  } else {
    // all done - show final thank you / completed passport page
    router.push(`/passport/${passportId}/done`)
  }
}
</script>
