<template>
  <div class="mobile-container vlt-page">
    <div class="vlt-header">
      <button type="button" class="vlt-back" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>
      <h1 class="vlt-title">{{ categoryLabel }}</h1>
      <span style="width: 30px" />
    </div>

    <p class="vlt-breadcrumb">
      Vault <span class="vlt-breadcrumb-sep">›</span>
      {{ scope === 'property' ? 'Property documents' : 'My private documents' }}
      <span class="vlt-breadcrumb-sep">›</span>
      {{ categoryLabel }}
    </p>
    <p class="vlt-section-sub">Store {{ categoryLabel.toLowerCase() }} for everything in your home.</p>

    <div class="vlt-search">
      <span class="vlt-search-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
      </span>
      <input v-model="search" type="text" class="vlt-search-input" :placeholder="`Search ${categoryLabel.toLowerCase()}`" />
    </div>

    <div v-if="loading" class="vlt-empty">Loading…</div>
    <div v-else-if="filteredDocs.length === 0" class="vlt-empty">No documents in this category yet.</div>
    <div v-else class="vlt-doc-list">
      <NuxtLink v-for="d in filteredDocs" :key="d.id" :to="`/vault/document/${d.id}`" class="vlt-doc-row">
        <span class="vlt-doc-icon"><img :src="fileIcon(d.mimeType)" alt="" loading="lazy" /></span>
        <span class="vlt-doc-body">
          <span class="vlt-doc-name">{{ d.title }}</span>
          <span class="vlt-doc-meta">{{ d.size }} · Added {{ d.uploadedAt }}</span>
        </span>
        <span class="vlt-visibility-pill" :class="`vlt-visibility-pill--${d.accessLevel?.toLowerCase()}`">
          <img :src="VAULT_VISIBILITY_ICON[d.accessLevel]" alt="" loading="lazy" class="vlt-visibility-pill-ic" />
          {{ VISIBILITY_LABEL[d.accessLevel] || d.accessLevel }}
        </span>
      </NuxtLink>
    </div>

    <button type="button" class="vlt-upload-btn" @click="router.push(`/vault/${passportId}/add?scope=${scope}&category=${category}`)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
      Upload document
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVault, VAULT_CATEGORIES, VAULT_VISIBILITY_ICON } from '~/composables/useVault'

const route = useRoute()
const router = useRouter()
const passportId = route.params.passportId
const category = route.params.category
const scope = computed(() => route.query.scope || 'property')

const { getCategoryDocuments } = useVault()

const categoryLabel = computed(() => VAULT_CATEGORIES.find((c) => c.key === category)?.label || category)
const search = ref('')
const loading = ref(true)
const docs = ref([])

const VISIBILITY_LABEL = { PRIVATE: 'Only you', SELECTED: 'Shared', ELIGIBLE: 'Included when shared', PUBLISHED: 'Public' }

const filteredDocs = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return docs.value
  return docs.value.filter((d) => d.title.toLowerCase().includes(q))
})

function fileIcon(mimeType) {
  if (mimeType?.includes('image')) return '/op-icons/misc/camera.png'
  return '/op-icons/misc/pdf.png'
}

onMounted(async () => {
  try {
    docs.value = await getCategoryDocuments(passportId, category, scope.value)
  } catch (e) {
    console.error('Failed to load category documents', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.vlt-page {
  min-height: 100vh;
  background: #fafafa;
  padding: 16px 16px 32px;
}
.vlt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.vlt-back {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #00a19a;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  padding: 0;
}
.vlt-back svg { width: 20px; height: 20px; }
.vlt-title {
  font-size: 1.0625rem;
  font-weight: 800;
  color: #231d45;
  margin: 0;
}
.vlt-breadcrumb {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0 0 6px;
}
.vlt-breadcrumb-sep { margin: 0 4px; }
.vlt-section-sub {
  font-size: 0.8125rem;
  color: #6b7089;
  line-height: 1.5;
  margin: 0 0 16px;
}
.vlt-search {
  position: relative;
  margin-bottom: 18px;
}
.vlt-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}
.vlt-search-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  font-size: 0.9375rem;
  color: #231d45;
  font-family: inherit;
}
.vlt-empty {
  padding: 32px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}
.vlt-doc-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vlt-doc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border: 1px solid #f0f2f5;
  border-radius: 14px;
  text-decoration: none;
}
.vlt-doc-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vlt-doc-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.vlt-doc-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.vlt-doc-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #231d45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vlt-doc-meta {
  font-size: 0.75rem;
  color: #6b7089;
  margin-top: 2px;
}
.vlt-visibility-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}
.vlt-visibility-pill--private { background: #f1f1f4; color: #6b7089; }
.vlt-visibility-pill--selected { background: #e5f4f2; color: #008a84; }
.vlt-visibility-pill--eligible { background: #fdf4dc; color: #92650d; }
.vlt-visibility-pill--published { background: #e8f1fd; color: #2563eb; }
.vlt-visibility-pill-ic { width: 12px; height: 12px; object-fit: contain; display: block; }

.vlt-upload-btn {
  width: 100%;
  margin: 20px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
}
.vlt-upload-btn svg { width: 20px; height: 20px; }
</style>
