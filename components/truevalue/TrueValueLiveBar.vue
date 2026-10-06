<template>
  <div class="tv-livebar">
    <div>
      <div class="tv-livebar-lab">Working estimate</div>
      <div class="tv-livebar-val">{{ display }}</div>
    </div>
    <div class="tv-livebar-rt">
      {{ live?.hasWorks ? `${live.provedCount} of ${live.scoringCount} proved` : 'postcode baseline' }}
      <br>
      {{ extraText }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ live: any; baseline: number | null }>()

function formatPrice(price: number) {
  return '£' + Math.round(price).toLocaleString('en-GB')
}

const display = computed(() => {
  if (props.live?.hasWorks) {
    return formatPrice(props.live.estimateLow) + '–' + formatPrice(props.live.estimateHigh).replace('£', '')
  }
  return props.baseline ? formatPrice(props.baseline) : '-'
})

const extraText = computed(() => {
  const l = props.live
  if (!l) return ''
  const extras: string[] = []
  if (l.derisked) extras.push(`${l.derisked} de-risked`)
  if (l.recorded) extras.push(`${l.recorded} recorded`)
  if (l.flagged) extras.push(`${l.flagged} flagged`)
  if (extras.length) return extras.join(' · ')
  return l.hasWorks ? 'prove more to narrow it' : 'nothing added yet'
})
</script>

<style scoped>
.tv-livebar {
  position: sticky;
  bottom: 0;
  margin: 18px -20px 0;
  background: #fff;
  border-top: 1.5px solid #e7e4ec;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -8px 26px rgba(35, 29, 69, 0.07);
}
.tv-livebar-lab { font-size: 0.6563rem; font-weight: 700; letter-spacing: 1.2px; color: #6e6879; text-transform: uppercase; }
.tv-livebar-val { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.6px; color: #231d45; margin-top: 3px; }
.tv-livebar-rt { text-align: right; font-size: 0.75rem; color: #6e6879; font-weight: 600; line-height: 1.5; }
</style>
