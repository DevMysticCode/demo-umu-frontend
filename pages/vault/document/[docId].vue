<template>
  <div class="mobile-container vlt-page">
    <div class="vlt-header">
      <button type="button" class="vlt-back" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>
      <h1 class="vlt-title">Document details</h1>
      <span style="width:30px" />
    </div>

    <div v-if="loading" class="vlt-empty">Loading…</div>
    <template v-else-if="doc">
      <div class="vlt-doc-head">
        <span class="vlt-doc-head-icon"><img :src="fileIcon(doc.mimeType)" alt="" loading="lazy" /></span>
        <div>
          <div class="vlt-doc-head-name">{{ doc.title }}</div>
          <div class="vlt-doc-head-meta">{{ doc.size }} · Added {{ doc.uploadedAt }}</div>
        </div>
      </div>

      <div class="vlt-dtabs">
        <button v-for="t in tabs" :key="t" type="button" :class="['vlt-dtab', activeTab === t ? 'active' : '']" @click="activeTab = t">{{ t }}</button>
      </div>

      <template v-if="activeTab === 'Details'">
        <h3 class="vlt-card-title">Visibility</h3>
        <p class="vlt-section-sub">Choose who can see this document.</p>
        <div class="vlt-visibility-options">
          <label v-for="opt in VISIBILITY_OPTIONS" :key="opt.value" :class="['vlt-vis-opt', accessLevel === opt.value ? 'selected' : '']">
            <input type="radio" name="visibility" :value="opt.value" v-model="accessLevel" />
            <span class="vlt-vis-icon"><img :src="opt.icon" alt="" loading="lazy" /></span>
            <span class="vlt-vis-body">
              <span class="vlt-vis-label">{{ opt.label }}</span>
              <span class="vlt-vis-desc">{{ opt.desc }}</span>
            </span>
          </label>
        </div>

        <template v-if="doc.passport">
          <h3 class="vlt-card-title">Linked to</h3>
          <div class="vlt-linked-card">
            <span class="vlt-linked-icon"><img src="/op-icons/investment/house.png" alt="" loading="lazy" /></span>
            <div>
              <div class="vlt-linked-name">{{ doc.passport.addressLine1 }}</div>
              <div class="vlt-linked-sub">{{ doc.passport.postcode }}</div>
            </div>
          </div>
          <button type="button" class="vlt-unlink-btn" @click="unlink">Unlink from property</button>
        </template>

        <h3 class="vlt-card-title">Document information</h3>
        <div class="vlt-info-rows">
          <div class="vlt-info-row"><span>File type</span><b>{{ doc.mimeType || '—' }}</b></div>
          <div class="vlt-info-row"><span>File size</span><b>{{ doc.size || '—' }}</b></div>
          <div class="vlt-info-row"><span>Date added</span><b>{{ doc.uploadedAt }}</b></div>
          <div class="vlt-info-row"><span>Category</span><b>{{ categoryLabel }}</b></div>
        </div>

        <button type="button" class="vlt-save-btn" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save changes' }}</button>
      </template>

      <template v-else-if="activeTab === 'Sharing'">
        <p class="vlt-section-sub" v-if="doc.sharedWith.length === 0">Not shared with anyone yet.</p>
        <div v-else class="vlt-shared-list">
          <div v-for="s in doc.sharedWith" :key="s.id" class="vlt-shared-row">
            <span class="vlt-category-icon vlt-category-icon--manuals">{{ (s.name || s.email)[0]?.toUpperCase() }}</span>
            <span class="vlt-category-body">
              <span class="vlt-category-name">{{ s.name || s.email }}</span>
            </span>
          </div>
        </div>
      </template>

      <template v-else-if="activeTab === 'History'">
        <p class="vlt-section-sub" v-if="doc.history.length === 0">No recorded activity yet.</p>
        <div v-else class="vlt-history-list">
          <div v-for="h in doc.history" :key="h.version" class="vlt-info-row">
            <span>{{ h.action }} · v{{ h.version }}</span>
            <b>{{ new Date(h.createdAt).toLocaleDateString() }}</b>
          </div>
        </div>
      </template>

      <template v-else>
        <p class="vlt-section-sub">Nothing related yet.</p>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVault, VAULT_CATEGORIES, VAULT_VISIBILITY_ICON } from '~/composables/useVault'

const route = useRoute()
const router = useRouter()
const docId = route.params.docId
const { getDocumentDetail, setDocumentAccess, updateDocumentMeta } = useVault()

const loading = ref(true)
const doc = ref(null)
const accessLevel = ref('PRIVATE')
const saving = ref(false)
const activeTab = ref('Details')
const tabs = ['Details', 'Sharing', 'History', 'Related']

const categoryLabel = computed(() => VAULT_CATEGORIES.find((c) => c.key === doc.value?.category)?.label || 'Uncategorised')

const VISIBILITY_OPTIONS = [
  { value: 'PRIVATE', icon: VAULT_VISIBILITY_ICON.PRIVATE, label: 'Private', desc: 'Only you can see this document.' },
  { value: 'SELECTED', icon: VAULT_VISIBILITY_ICON.SELECTED, label: 'Shared', desc: 'Only people you have given access to.' },
  { value: 'PUBLISHED', icon: VAULT_VISIBILITY_ICON.PUBLISHED, label: 'Public', desc: 'Visible in your public property passport.' },
]

function fileIcon(mimeType) {
  if (mimeType?.includes('image')) return '/op-icons/misc/camera.png'
  return '/op-icons/misc/pdf.png'
}

async function save() {
  saving.value = true
  try {
    await setDocumentAccess(docId, accessLevel.value)
  } catch (e) {
    console.error('Failed to save document visibility', e)
  } finally {
    saving.value = false
  }
}

async function unlink() {
  try {
    await updateDocumentMeta(docId, { passportId: null })
    doc.value.passport = null
  } catch (e) {
    console.error('Failed to unlink document', e)
  }
}

onMounted(async () => {
  try {
    doc.value = await getDocumentDetail(docId)
    accessLevel.value = doc.value.accessLevel
  } catch (e) {
    console.error('Failed to load document detail', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.vlt-page { min-height: 100vh; background: #fafafa; padding: 16px 16px 32px; }
.vlt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.vlt-back { display: flex; align-items: center; gap: 4px; background: none; border: none; color: #00a19a; font-weight: 600; font-size: 0.9375rem; cursor: pointer; padding: 0; }
.vlt-back svg { width: 20px; height: 20px; }
.vlt-title { font-size: 1.0625rem; font-weight: 800; color: #231d45; margin: 0; }
.vlt-empty { padding: 32px 0; text-align: center; color: #94a3b8; font-size: 0.875rem; }

.vlt-doc-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.vlt-doc-head-icon { width: 48px; height: 48px; flex-shrink: 0; }
.vlt-doc-head-icon img { width: 100%; height: 100%; object-fit: contain; display: block; }
.vlt-doc-head-name { font-size: 1rem; font-weight: 800; color: #231d45; }
.vlt-doc-head-meta { font-size: 0.75rem; color: #6b7089; margin-top: 2px; }

.vlt-dtabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid #f0f2f5; }
.vlt-dtab { flex: 1; padding: 10px 0; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7089; font-weight: 700; font-size: 0.8125rem; cursor: pointer; }
.vlt-dtab.active { color: #00a19a; border-bottom-color: #00a19a; }

.vlt-card-title { font-size: 0.875rem; font-weight: 800; color: #231d45; margin: 18px 0 2px; }
.vlt-section-sub { font-size: 0.8125rem; color: #6b7089; line-height: 1.5; margin: 0 0 14px; }

.vlt-visibility-options { display: flex; flex-direction: column; gap: 10px; }
.vlt-vis-opt { display: flex; align-items: flex-start; gap: 12px; padding: 14px; background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; cursor: pointer; }
.vlt-vis-opt.selected { border-color: #00a19a; background: #f2faf8; }
.vlt-vis-opt input { margin-top: 3px; accent-color: #00a19a; }
.vlt-vis-icon { width: 28px; height: 28px; flex-shrink: 0; }
.vlt-vis-icon img { width: 100%; height: 100%; object-fit: contain; display: block; }
.vlt-vis-body { display: flex; flex-direction: column; }
.vlt-vis-label { font-size: 0.875rem; font-weight: 700; color: #231d45; }
.vlt-vis-desc { font-size: 0.75rem; color: #6b7089; margin-top: 2px; }

.vlt-linked-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: #fff; border: 1px solid #f0f2f5; border-radius: 14px; margin-bottom: 10px; }
.vlt-linked-icon { width: 36px; height: 36px; flex-shrink: 0; }
.vlt-linked-icon img { width: 100%; height: 100%; object-fit: contain; display: block; }
.vlt-linked-name { font-size: 0.875rem; font-weight: 700; color: #231d45; }
.vlt-linked-sub { font-size: 0.75rem; color: #6b7089; margin-top: 2px; }
.vlt-unlink-btn { background: none; border: none; color: #d93025; font-weight: 700; font-size: 0.8125rem; cursor: pointer; padding: 0 0 8px; }

.vlt-info-rows { background: #fff; border: 1px solid #f0f2f5; border-radius: 14px; overflow: hidden; }
.vlt-info-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; font-size: 0.8125rem; border-bottom: 1px solid #f5f5f7; }
.vlt-info-row:last-child { border-bottom: none; }
.vlt-info-row span { color: #6b7089; }
.vlt-info-row b { color: #231d45; font-weight: 700; }

.vlt-save-btn { width: 100%; margin-top: 20px; padding: 15px; background: #00a19a; color: #fff; border: none; border-radius: 14px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
.vlt-save-btn:disabled { opacity: 0.6; }

.vlt-shared-list, .vlt-history-list { display: flex; flex-direction: column; gap: 10px; }
.vlt-shared-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #fff; border: 1px solid #f0f2f5; border-radius: 14px; }
.vlt-category-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.vlt-category-icon--manuals { background: #00a19a; color: #fff; }
.vlt-category-name { font-size: 0.875rem; font-weight: 700; color: #231d45; }
</style>
