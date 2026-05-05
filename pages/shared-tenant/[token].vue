<template>
  <div class="st-page mobile-container">
    <div v-if="loading" class="st-loading">Loading shared documents…</div>

    <div v-else-if="error" class="st-error">
      <div class="st-error-ic">!</div>
      <h2>Link unavailable</h2>
      <p>{{ error }}</p>
    </div>

    <template v-else-if="data">
      <div class="atm-bg teal" />

      <div class="st-hero">
        <div class="st-greeting">Shared with you</div>
        <div class="st-h1">{{ data.passport.addressLine1 }}</div>
        <div class="st-meta">{{ data.passport.postcode }} · Read-only · expires {{ expiryLabel }}</div>
      </div>

      <div class="section-heading">Your tenancy documents</div>

      <div v-if="data.sections.length === 0" class="st-empty">
        Your landlord has not yet uploaded any of the documents you are entitled to receive.
      </div>

      <div v-for="section in data.sections" :key="section.key" class="st-card">
        <div class="st-card-head">
          <div class="st-card-title">{{ section.title }}</div>
          <span class="st-card-pill" :class="pillClass(section)">{{ pillLabel(section) }}</span>
        </div>
        <div v-if="section.subtitle" class="st-card-sub">{{ section.subtitle }}</div>

        <div v-for="task in section.tasks" :key="task.id">
          <div v-for="q in task.passportQuestions" :key="q.id">
            <div v-if="answerFile(q)" class="st-doc-row">
              <div class="st-doc-icon">📄</div>
              <div class="st-doc-info">
                <div class="st-doc-name">{{ q.questionTemplate?.title || 'Document' }}</div>
                <div class="st-doc-meta">{{ uploadedLabel(q.answer) }}</div>
              </div>
              <a :href="answerFile(q)" target="_blank" rel="noopener" class="st-doc-action">Open</a>
            </div>
            <div v-else-if="q.answer && q.answer.value" class="st-text-row">
              <div class="st-text-label">{{ q.questionTemplate?.title }}</div>
              <div class="st-text-value">{{ q.answer.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <p class="st-footnote">
        This is a read-only view of the documents your landlord shared with you for this tenancy.
        UMovingU does not store who you are.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const config = useRuntimeConfig()

const loading = ref(true)
const error = ref('')
const data = ref<any>(null)

const expiryLabel = computed(() => {
  if (!data.value?.expiresAt) return ''
  const d = new Date(data.value.expiresAt)
  return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
})

function answerFile(q: any) {
  const a = q.answer
  if (!a) return null
  const file = a.fileUrl ?? a.value?.fileUrl ?? a.url ?? null
  if (!file) return null
  return file.startsWith('/') ? `${config.public.apiBase}${file}` : file
}

function uploadedLabel(answer: any) {
  if (!answer?.updatedAt) return 'Uploaded'
  return `Uploaded ${new Date(answer.updatedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })}`
}

function pillLabel(section: any) {
  if (section.status === 'COMPLETED') return 'On file'
  return 'Pending'
}
function pillClass(section: any) {
  return section.status === 'COMPLETED' ? 'good' : 'pending'
}

onMounted(async () => {
  try {
    const res = await $fetch<any>(
      `${config.public.apiBase}/passport/shared/${route.params.token}`,
    )
    data.value = res
  } catch (err: any) {
    error.value = err?.data?.message ?? 'This share link is invalid or has expired.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.st-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding: 14px 0 32px;
}

.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 220px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.teal {
  background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(31, 122, 102, 0.16), transparent 65%);
}

.st-loading,
.st-error {
  text-align: center;
  padding: 60px 22px;
}
.st-error h2 {
  font-size: 18px;
  font-weight: 800;
  color: #0e2840;
  margin-bottom: 4px;
}
.st-error p { font-size: 13px; color: #4a5868; font-weight: 600; }
.st-error-ic {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: #ffe9dd;
  color: #b85b36;
  font-size: 28px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.st-hero { padding: 8px 22px 14px; position: relative; z-index: 1; }
.st-greeting {
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 16px;
  color: #1f7a66;
  margin-bottom: 4px;
}
.st-h1 {
  font-size: 26px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.8px;
  line-height: 1.05;
}
.st-meta { font-size: 11.5px; font-weight: 700; color: #4a5868; margin-top: 4px; }

.section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 8px 22px;
  position: relative;
  z-index: 1;
}

.st-empty {
  margin: 0 22px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #4a5868;
  text-align: center;
  position: relative;
  z-index: 1;
}

.st-card {
  margin: 0 22px 8px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 14px 16px;
  position: relative;
  z-index: 1;
}
.st-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.st-card-title {
  flex: 1;
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
}
.st-card-pill {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 100px;
}
.st-card-pill.good { background: #1f7a66; color: #fff; }
.st-card-pill.pending { background: #f0f2f1; color: #4a5868; }
.st-card-sub { font-size: 11px; font-weight: 600; color: #4a5868; margin-bottom: 8px; }

.st-doc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid #f0f2f1;
}
.st-doc-icon {
  width: 30px; height: 34px;
  border-radius: 6px;
  background: linear-gradient(135deg, #fdf4dc, #f8e6c2);
  color: #6f4d14;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.st-doc-info { flex: 1; min-width: 0; }
.st-doc-name {
  font-size: 12px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
}
.st-doc-meta { font-size: 10px; font-weight: 600; color: #8a95a0; margin-top: 1px; }
.st-doc-action {
  background: #3dbda3;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 100px;
  text-decoration: none;
  flex-shrink: 0;
}

.st-text-row {
  padding: 8px 0;
  border-top: 1px solid #f0f2f1;
}
.st-text-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-bottom: 2px;
}
.st-text-value {
  font-size: 12.5px;
  font-weight: 700;
  color: #0e2840;
}

.st-footnote {
  margin: 18px 22px 0;
  font-size: 11px;
  font-weight: 600;
  color: #8a95a0;
  text-align: center;
  line-height: 1.5;
  position: relative;
  z-index: 1;
}
</style>
