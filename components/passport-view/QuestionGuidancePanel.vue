<template>
  <div class="qgp-card" :class="`qgp-card--${toneClass}`">
    <div class="qgp-header">
      <span class="qgp-title">{{ panel.title || 'Your answer' }}</span>
      <span v-if="draft" class="qgp-draft-pill">Draft guidance</span>
    </div>

    <p v-if="panel.meaning" class="qgp-meaning">{{ panel.meaning }}</p>
    <p v-if="panel.why_now" class="qgp-why-now"><strong>Why deal with this now?</strong> {{ panel.why_now }}</p>

    <div v-if="panel.owner_actions?.length" class="qgp-section">
      <h4 class="qgp-section-title">What you can do</h4>
      <ul class="qgp-list">
        <li v-for="(action, i) in panel.owner_actions" :key="i">{{ action }}</li>
      </ul>
    </div>

    <div v-if="panel.possible_outcomes?.length" class="qgp-section">
      <h4 class="qgp-section-title">Possible next outcomes</h4>
      <div v-for="(outcome, i) in panel.possible_outcomes" :key="i" class="qgp-outcome">
        <strong>{{ outcome.title }}</strong>
        <p>{{ outcome.explanation }}</p>
      </div>
    </div>

    <p v-if="timeText" class="qgp-time"><strong>Time to prepare or resolve:</strong> {{ timeText }}</p>

    <div v-if="panel.evidence?.length" class="qgp-section">
      <h4 class="qgp-section-title">Supporting evidence</h4>
      <ul class="qgp-list">
        <li v-for="(e, i) in panel.evidence" :key="i">{{ e }}</li>
      </ul>
    </div>

    <p v-if="panel.professional_help" class="qgp-pro-help">{{ panel.professional_help }}</p>
    <p v-if="panel.transaction_context" class="qgp-tx-context">{{ panel.transaction_context }}</p>
    <p v-if="panel.completion" class="qgp-completion">{{ panel.completion }}</p>

    <details v-if="panel.source_ids?.length" class="qgp-sources">
      <summary>Sources</summary>
      <p>{{ panel.source_ids.join(', ') }}</p>
    </details>

    <p class="qgp-disclaimer">UMU gives information, not legal advice.</p>

    <button type="button" class="qgp-continue-btn" @click="$emit('continue')">Continue</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GuidancePanel } from '~/composables/usePathways'

const props = defineProps<{
  panel: GuidancePanel
  draft?: boolean
}>()

defineEmits<{ (e: 'continue'): void }>()

// The pack's own style values are 'clear' | 'neutral' | 'yellow' (an
// 'attention' value from older content is normalised to 'yellow' on
// import - see import-278-question-content.ts). Anything else falls back
// to 'neutral' rather than breaking the card's styling.
const toneClass = computed(() => {
  const s = props.panel.style
  return s === 'clear' || s === 'yellow' ? s : 'neutral'
})

const timeText = computed(() => {
  const t = props.panel.time
  if (!t) return ''
  if (typeof t === 'string') return t
  return t.resolution_or_transaction_impact || t.preparation || t.basis || ''
})
</script>

<style scoped>
.qgp-card {
  margin-top: 16px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #e6e4de;
}
.qgp-card--clear,
.qgp-card--neutral {
  background: linear-gradient(140deg, #f2faf8 0%, #edf8ff 100%);
  border-color: #e5f4f2;
}
.qgp-card--yellow {
  background: #fffaf0;
  border-color: #fde9b8;
}
.qgp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.qgp-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.qgp-draft-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: #eceaf5;
  color: #6b6783;
  white-space: nowrap;
}
.qgp-meaning {
  font-size: 14px;
  color: #3a3b42;
  line-height: 1.55;
  margin: 0 0 10px;
}
.qgp-why-now,
.qgp-time,
.qgp-pro-help,
.qgp-tx-context,
.qgp-completion {
  font-size: 13.5px;
  color: #4a4b52;
  line-height: 1.55;
  margin: 0 0 10px;
}
.qgp-section {
  margin: 0 0 14px;
}
.qgp-section-title {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #00a19a;
  margin: 0 0 6px;
}
.qgp-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13.5px;
  color: #3a3b42;
  line-height: 1.6;
}
.qgp-outcome {
  margin-bottom: 8px;
  font-size: 13.5px;
  color: #3a3b42;
  line-height: 1.5;
}
.qgp-outcome strong {
  display: block;
  color: #231d45;
  margin-bottom: 2px;
}
.qgp-outcome p {
  margin: 0;
}
.qgp-sources {
  margin: 0 0 14px;
  font-size: 12.5px;
  color: #6b6783;
}
.qgp-sources summary {
  cursor: pointer;
  font-weight: 700;
}
.qgp-disclaimer {
  font-size: 11.5px;
  color: #9a9a9a;
  margin: 0 0 14px;
}
.qgp-continue-btn {
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
