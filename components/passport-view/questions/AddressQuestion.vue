<template>
  <div class="address-question">
    <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3>

    <div class="address-input">
      <input
        :placeholder="question.placeholder || 'Start typing address...'"
        v-model="text"
        @input="onInput"
        class="text-field"
      />
      <button class="btn" type="button" @click="onFindUprn">Find UPRN</button>
    </div>

    <p v-if="prefilled" class="prefill-note">
      ✓ pre-filled from your property record
    </p>

    <!-- Known reference numbers from the enrichment pipeline (OS Places /
         HM Land Registry). Shown on demand so the owner can confirm we
         already hold them and doesn't have to look them up. -->
    <div v-if="lookedUp" class="uprn-panel">
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
        No UPRN or title number on record yet — we'll back-fill these once
        the property has been through address and Land Registry lookup.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: String, default: '' },
  propertyFacts: { type: Object, default: null },
})
const emit = defineEmits(['update'])

const facts = computed(() => props.propertyFacts || {})

const knownAddress = computed(() => {
  const f = facts.value
  const parts = [f.addressLine1, f.city, f.postcode].filter(Boolean)
  return parts.join(', ')
})

const text = ref(props.answer || '')
const prefilled = ref(false)
const lookedUp = ref(false)

// Pre-fill the address from what we already hold, but only when the owner
// hasn't answered yet — never clobber a real answer.
onMounted(() => {
  if (!text.value.trim() && knownAddress.value) {
    text.value = knownAddress.value
    prefilled.value = true
    emit('update', text.value)
  }
})

watch(
  () => props.answer,
  (v) => {
    if ((v || '') !== text.value) text.value = v || ''
  },
)
watch(knownAddress, (addr) => {
  if (addr && !text.value.trim()) {
    text.value = addr
    prefilled.value = true
    emit('update', text.value)
  }
})

const hasKnownRefs = computed(
  () => !!(facts.value.uprn || facts.value.titleNumber || facts.value.propertyType),
)

const onInput = () => {
  prefilled.value = false
  emit('update', text.value)
}

const onFindUprn = () => {
  lookedUp.value = true
  // Still record whatever's in the field as the answer.
  emit('update', text.value)
}
</script>

<style scoped>
.address-input {
  display: flex;
  gap: 8px;
  align-items: center;
}
.text-field {
  flex: 1;
  min-width: 0;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.btn {
  padding: 8px 12px;
  border-radius: 8px;
  background: #00a19a;
  color: white;
  border: none;
  white-space: nowrap;
  cursor: pointer;
}
.section-title {
  font-size: 15px;
  margin-bottom: 8px;
  color: #111;
}
.prefill-note {
  font-size: 12px;
  font-weight: 700;
  color: #00a19a;
  margin: 6px 0 0;
}
.uprn-panel {
  margin-top: 10px;
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
</style>
