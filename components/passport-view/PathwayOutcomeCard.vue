<template>
  <div class="pwo-card" :class="`pwo-card--${severityTier.toLowerCase()}`">
    <div class="pwo-header">
      <span class="pwo-title">What happens next</span>
      <span class="pwo-pill" :class="`pwo-pill--${severityTier.toLowerCase()}`">{{ pillLabel }}</span>
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
import type { ResolutionPathway, PathwaySeverity } from '~/composables/usePathways'

const props = defineProps<{
  pathway: ResolutionPathway
  // The raw outcome code - one of the 4 generic statuses for most
  // pathways, or one of P09/P39's fine-grained codes (e.g.
  // 'dispute_mismatch', 'record_held') for boundary/glazing.
  status: string
  // The 4-tier classification for styling/sorting - always present once a
  // journey has an outcome (backend computes it; see
  // pathway-outcome-codes.ts). Falls back to treating `status` itself as
  // the tier for older callers that haven't started passing it yet.
  severity?: PathwaySeverity | null
}>()

defineEmits<{ (e: 'continue'): void }>()

const severityTier = computed<PathwaySeverity>(
  () => props.severity ?? (props.status as PathwaySeverity) ?? 'CHECK',
)

// Generic 4-status copy (every pathway except P09/P39) plus specific copy
// for each fine-grained boundary/glazing code - see
// UMU_278_Developer_Guide.md "Boundary specialist flow" / "Replacement
// glazing specialist flow" for the source wording this paraphrases.
const PILL_LABELS: Record<string, string> = {
  RESOLVED: 'Resolved',
  CHECK: 'Check before you sell',
  FLAG: 'For a conveyancer',
  ESCALATE: 'Needs a conveyancer',
  // Boundary (P09)
  ordinary: 'No concern raised',
  moved_explained: 'Explained, no concern',
  check: 'Check before you sell',
  conflict: 'Answers need reviewing',
  mismatch: 'For a conveyancer',
  historic: 'Check before you sell',
  historic_mismatch: 'For a conveyancer',
  dispute: 'Needs a conveyancer',
  dispute_mismatch: 'Needs a conveyancer',
  // Glazing (P39)
  before: 'Resolved',
  record_added: 'Resolved',
  record_held: 'Check before you sell',
  date_unknown: 'Check before you sell',
  check_record: 'Check before you sell',
  searching: 'Check before you sell',
  missing_record: 'For a conveyancer',
}
const pillLabel = computed(() => PILL_LABELS[props.status] ?? PILL_LABELS[severityTier.value] ?? props.status)
const showHandover = computed(() => severityTier.value === 'FLAG' || severityTier.value === 'ESCALATE')

const OUTCOME_EXPLANATIONS: Record<string, string> = {
  ordinary: 'An unusual shape alone is not a legal problem, and no dispute has been raised.',
  moved_explained: 'A moved feature is noted in your passport, the plan still appears to match, and no dispute has been raised.',
  check: 'There is some uncertainty here - keep what you know on record and come back to it before you sell.',
  conflict: 'Your answers about whether the plan matches contradict each other. Review and correct whichever one is no longer accurate.',
  mismatch: 'The plan and the land you use appear to differ. Your evidence is saved - a conveyancer should review this before sale.',
  historic: 'A past disagreement was resolved in writing. A conveyancer can confirm how it should be disclosed to a buyer.',
  historic_mismatch: 'A past disagreement was resolved in writing, but the plan/land difference is a separate, still-open concern for a conveyancer to review.',
  dispute: 'An active disagreement has been raised. This needs a conveyancer’s judgement before selling.',
  dispute_mismatch: 'An active disagreement has been raised, alongside an apparent plan mismatch. This needs a conveyancer’s judgement before selling.',
  before: 'This work was done before the 1 April 2002 compliance-evidence requirement applied.',
  record_added: 'Your compliance evidence is saved and ready for a buyer enquiry.',
  record_held: 'You’ve told us the record exists - add it to your passport when you can.',
  date_unknown: 'The work date isn’t confirmed yet. Update this once you know, so the right route can be shown.',
  check_record: 'It’s not yet confirmed whether compliance evidence exists for this work.',
  searching: 'You’re still looking for a record. Come back and update this once you’ve checked.',
  missing_record: 'No compliance record has been found. A conveyancer can discuss the available routes, including a regularisation assessment.',
}

const outcomeExplanation = computed(() => {
  if (OUTCOME_EXPLANATIONS[props.status]) return OUTCOME_EXPLANATIONS[props.status]
  switch (severityTier.value) {
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
