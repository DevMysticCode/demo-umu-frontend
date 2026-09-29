<template>
  <div class="pwo-card" :class="`pwo-card--${status.toLowerCase()}`">
    <div class="pwo-header">
      <span class="pwo-title">What happens next</span>
      <span class="pwo-pill" :class="`pwo-pill--${status.toLowerCase()}`">{{ pillLabel }}</span>
    </div>

    <p class="pwo-explanation">{{ outcomeExplanation }}</p>

    <div v-if="showHandover && pathway.stopPoint" class="pwo-handover">
      <h4 class="pwo-handover-title">Options a conveyancer may recommend</h4>
      <p class="pwo-handover-text">{{ pathway.stopPoint }}</p>
    </div>

    <p class="pwo-disclaimer">UMU gives information, not legal advice.</p>

    <button type="button" class="pwo-continue-btn" @click="$emit('continue')">Continue</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResolutionPathway } from '~/composables/usePathways'

const props = defineProps<{
  pathway: ResolutionPathway
  status: 'RESOLVED' | 'CHECK' | 'FLAG' | 'ESCALATE'
}>()

defineEmits<{ (e: 'continue'): void }>()

const PILL_LABELS: Record<string, string> = {
  RESOLVED: 'Resolved',
  CHECK: 'Check before you sell',
  FLAG: 'For a conveyancer',
  ESCALATE: 'Needs a conveyancer',
}
const pillLabel = computed(() => PILL_LABELS[props.status] ?? props.status)
const showHandover = computed(() => props.status === 'FLAG' || props.status === 'ESCALATE')

const outcomeExplanation = computed(() => {
  switch (props.status) {
    case 'RESOLVED':
      return `Nothing further to address for "${props.pathway.name}" - your evidence is saved in your passport.`
    case 'CHECK':
      return `This is known and documented, or there's still a homeowner step to finish for "${props.pathway.name}".`
    case 'FLAG':
      return `You've done everything you can yourself for "${props.pathway.name}" - this is now ready for a conveyancer to review.`
    case 'ESCALATE':
      return `"${props.pathway.name}" needs a legal judgement before selling. Please speak to a conveyancer.`
    default:
      return ''
  }
})
</script>

<style scoped>
.pwo-card {
  margin-top: 16px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e6e4de;
  border-radius: 16px;
}
.pwo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.pwo-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.pwo-pill {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}
.pwo-pill--resolved {
  background: #e6f6ee;
  color: #137a4b;
}
.pwo-pill--check,
.pwo-pill--flag {
  background: #fff4e0;
  color: #a15c00;
}
.pwo-pill--escalate {
  background: #fdecec;
  color: #d93025;
}
.pwo-explanation {
  font-size: 14px;
  color: #4a4b52;
  line-height: 1.5;
  margin: 0 0 14px;
}
.pwo-handover {
  padding: 12px 14px;
  background: #f7f6f3;
  border-radius: 10px;
  margin-bottom: 14px;
}
.pwo-handover-title {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7089;
  margin: 0 0 6px;
}
.pwo-handover-text {
  font-size: 13px;
  color: #4a4b52;
  line-height: 1.5;
  margin: 0;
}
.pwo-disclaimer {
  font-size: 11.5px;
  color: #9a9a9a;
  margin: 0 0 14px;
}
.pwo-continue-btn {
  padding: 10px 20px;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}
</style>
