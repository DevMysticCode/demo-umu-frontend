<template>
  <div class="rhr-row">
    <div class="rhr-icon" :class="entry.amount >= 0 ? 'rhr-icon--credit' : 'rhr-icon--debit'">
      {{ entry.amount >= 0 ? '+' : '−' }}
    </div>
    <div class="rhr-body">
      <div class="rhr-desc">{{ description }}</div>
      <div class="rhr-date">
        {{ formattedDate }}
        <span v-if="entry.status === 'PENDING'" class="rhr-pending">· Pending verification</span>
      </div>
    </div>
    <div class="rhr-right">
      <div class="rhr-amount" :class="entry.amount >= 0 ? 'rhr-amount--credit' : 'rhr-amount--debit'">
        {{ entry.amount >= 0 ? '+' : '' }}{{ entry.amount.toLocaleString('en-GB') }}
      </div>
      <div class="rhr-balance">balance {{ entry.balanceAfter.toLocaleString('en-GB') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LedgerEntry {
  id: string
  description: string
  amount: number
  balanceAfter: number
  createdAt: string
  status?: string
}

const props = defineProps<{ entry: LedgerEntry }>()

// A handful of older ledger rows were written as `Answered: ""` — the
// question they were for has an intentionally blank QuestionTemplate.title
// (MULTIPART questions build their label from `parts` on the frontend
// instead). New rows fall back to the task title server-side; this catches
// the already-written rows so history never renders broken empty quotes.
const BLANK_ANSWERED_RE = /^Answered:\s*""\s*$/
const description = computed(() =>
  BLANK_ANSWERED_RE.test(props.entry.description?.trim() ?? '')
    ? 'Answered a Property Passport question'
    : props.entry.description,
)

const formattedDate = computed(() => {
  const d = new Date(props.entry.createdAt)
  const datePart = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const timePart = d.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${datePart} · ${timePart}`
})
</script>

<style scoped>
.rhr-row { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #e7e4ec; border-radius: 16px; padding: 14px; }
.rhr-icon { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 16px; flex-shrink: 0; }
.rhr-icon--credit { background: #dff2e9; color: #186b48; }
.rhr-icon--debit { background: #f7eaea; color: #8a3a3a; }
.rhr-body { flex: 1; min-width: 0; }
.rhr-desc { font-size: 13.5px; font-weight: 600; color: #231d45; line-height: 1.35; }
.rhr-date { font-size: 11.5px; color: #6e6879; margin-top: 3px; }
.rhr-pending { color: #a17b1f; font-weight: 700; }
.rhr-right { text-align: right; flex-shrink: 0; }
.rhr-amount { font-weight: 800; font-size: 15px; }
.rhr-amount--credit { color: #1f8f62; }
.rhr-amount--debit { color: #a13a3a; }
.rhr-balance { font-size: 10.5px; color: #6e6879; margin-top: 2px; }
</style>
