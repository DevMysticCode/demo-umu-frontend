<template>
  <div class="address-question">
    <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3>

    <!-- The property was claimed, so the address / UPRN / title number are
         already known and won't change - shown read-only for confirmation
         rather than as an editable field. -->
    <div class="addr-confirm">
      <div class="addr-confirm-line">{{ displayAddress || 'Address on file' }}</div>
      <div class="uprn-panel">
        <div class="uprn-panel-h">From HM Land Registry &amp; Ordnance Survey</div>
        <template v-if="hasKnownRefs">
          <div v-if="facts.uprn" class="uprn-row">
            <span class="uprn-label">UPRN</span>
            <span class="uprn-val">{{ facts.uprn }}</span>
          </div>
          <div v-if="facts.titleNumber" class="uprn-row">
            <span class="uprn-label">Title number</span>
            <span class="uprn-val">{{ facts.titleNumber }}</span>
          </div>
          <div v-if="facts.propertyType" class="uprn-row">
            <span class="uprn-label">Type</span>
            <span class="uprn-val">{{ facts.propertyType }}</span>
          </div>
        </template>
        <div v-else class="uprn-empty">
          UPRN and title number are still being confirmed — we'll add them
          once the property has been through Land Registry lookup.
        </div>
      </div>
      <p class="addr-confirm-note">
        Something not right? Your solicitor can correct the record during the
        transaction.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: String, default: '' },
  propertyFacts: { type: Object, default: null },
})
const emit = defineEmits(['update'])

const facts = computed(() => props.propertyFacts || {})

const knownAddress = computed(() => {
  const f = facts.value
  return [f.addressLine1, f.city, f.postcode].filter(Boolean).join(', ')
})

// Prefer what's already saved as the answer; fall back to the known
// property address.
const displayAddress = computed(() => props.answer?.trim() || knownAddress.value)

const hasKnownRefs = computed(
  () => !!(facts.value.uprn || facts.value.titleNumber || facts.value.propertyType),
)

// Record the confirmed address as the answer so the question counts as
// answered (there's nothing for the user to type). Never clobber an
// existing answer.
function syncAnswer() {
  if (!props.answer?.trim() && knownAddress.value) {
    emit('update', knownAddress.value)
  }
}
onMounted(syncAnswer)
watch(knownAddress, syncAnswer)
</script>

<style scoped>
.section-title {
  font-size: 15px;
  margin-bottom: 8px;
  color: #111;
}
.addr-confirm-line {
  font-size: 15px;
  font-weight: 800;
  color: #0e2840;
  margin-bottom: 10px;
}
.uprn-panel {
  padding: 12px 14px;
  background: #f2faf8;
  border: 1px solid #d5efe8;
  border-radius: 10px;
}
.uprn-panel-h {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7089;
  margin-bottom: 8px;
}
.uprn-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 4px 0;
  font-size: 13px;
}
.uprn-label {
  font-weight: 600;
  color: #4a5568;
}
.uprn-val {
  font-weight: 800;
  color: #0e2840;
  font-variant-numeric: tabular-nums;
}
.uprn-empty {
  font-size: 12px;
  color: #6b7089;
  line-height: 1.5;
}
.addr-confirm-note {
  font-size: 11.5px;
  color: #9c98ad;
  line-height: 1.5;
  margin: 10px 0 0;
}
</style>
