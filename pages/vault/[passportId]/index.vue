<template>
  <div class="mobile-container vlt-page">
    <div class="vlt-header">
      <button type="button" class="vlt-back" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>
      <h1 class="vlt-title">Vault</h1>
      <span style="width: 30px" />
    </div>

    <div class="vlt-scope-tabs">
      <button type="button" :class="['vlt-scope-tab', scope === 'property' ? 'active' : '']" @click="scope = 'property'">Property</button>
      <button type="button" :class="['vlt-scope-tab', scope === 'private' ? 'active' : '']" @click="scope = 'private'">Private</button>
      <button type="button" :class="['vlt-scope-tab', scope === 'shared' ? 'active' : '']" @click="scope = 'shared'">Shared</button>
    </div>

    <template v-if="scope !== 'shared'">
      <h2 class="vlt-section-title">{{ scope === 'property' ? 'Property documents' : 'My private documents' }}</h2>
      <p class="vlt-section-sub">
        <template v-if="scope === 'property'">
          Documents related to {{ addressLine }}. You can control the visibility of each file.
        </template>
        <template v-else>Personal documents and receipts, visible only to you.</template>
      </p>

      <div class="vlt-search">
        <span class="vlt-search-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
        </span>
        <input v-model="search" type="text" class="vlt-search-input" placeholder="Search documents" />
      </div>

      <div v-if="loading" class="vlt-empty">Loading…</div>
      <div v-else class="vlt-category-list">
        <NuxtLink
          v-for="cat in filteredCategories"
          :key="cat.key"
          :to="`/vault/${passportId}/${cat.key}?scope=${scope}`"
          class="vlt-category-row"
        >
          <span class="vlt-category-icon" :class="`vlt-category-icon--${cat.key}`"><img :src="cat.icon" alt="" loading="lazy" /></span>
          <span class="vlt-category-body">
            <span class="vlt-category-name">{{ cat.label }}</span>
            <span class="vlt-category-count">{{ cat.count }} file{{ cat.count === 1 ? '' : 's' }}</span>
          </span>
          <svg class="vlt-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </NuxtLink>
      </div>
    </template>

    <template v-else>
      <h2 class="vlt-section-title">Shared with me</h2>
      <p class="vlt-section-sub">Documents other people have shared with you.</p>
      <div v-if="sharedLoading" class="vlt-empty">Loading…</div>
      <div v-else-if="sharedDocs.length === 0" class="vlt-empty">Nothing has been shared with you yet.</div>
      <div v-else class="vlt-shared-list">
        <a v-for="d in sharedDocs" :key="d.id" :href="d.fileUrl" target="_blank" rel="noopener" class="vlt-shared-row">
          <span class="vlt-category-icon vlt-category-icon--manuals"><img src="/op-icons/misc/pdf.png" alt="" loading="lazy" /></span>
          <span class="vlt-category-body">
            <span class="vlt-category-name">{{ d.title }}</span>
            <span class="vlt-category-count">{{ d.uploadedAt }}</span>
          </span>
        </a>
      </div>
    </template>

    <button v-if="scope !== 'shared'" type="button" class="vlt-upload-btn" @click="router.push(`/vault/${passportId}/add?scope=${scope}`)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
      Upload document
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVault, VAULT_CATEGORIES } from '~/composables/useVault'

const route = useRoute()
const router = useRouter()
const passportId = route.params.passportId

const { getOverview, getSharedWithMe } = useVault()

const scope = ref(['property', 'private', 'shared'].includes(route.query.scope) ? route.query.scope : 'property')
const search = ref('')
const loading = ref(true)
const overview = ref(null)
const addressLine = ref('this property')

const sharedDocs = ref([])
const sharedLoading = ref(false)

const categoriesForScope = computed(() => {
  const data = scope.value === 'property' ? overview.value?.propertyDocuments : overview.value?.privateDocuments
  const counts = data?.categories ?? []
  return VAULT_CATEGORIES.map((c) => ({ ...c, count: counts.find((x) => x.key === c.key)?.count ?? 0 }))
})
const filteredCategories = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return categoriesForScope.value
  return categoriesForScope.value.filter((c) => c.label.toLowerCase().includes(q))
})

async function load() {
  loading.value = true
  try {
    overview.value = await getOverview(passportId)
  } catch (e) {
    console.error('Failed to load vault overview', e)
  } finally {
    loading.value = false
  }
}

watch(
  scope,
  (val) => {
    if (val === 'shared' && sharedDocs.value.length === 0 && !sharedLoading.value) {
      sharedLoading.value = true
      getSharedWithMe()
        .then((d) => (sharedDocs.value = d))
        .catch((e) => console.error('Failed to load shared documents', e))
        .finally(() => (sharedLoading.value = false))
    }
  },
  { immediate: true },
)

onMounted(async () => {
  load()
  try {
    const config = useRuntimeConfig()
    const token = localStorage.getItem('token')
    const passport = await $fetch(`${config.public.apiBase}/passport/${passportId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    addressLine.value = passport?.addressLine1 || addressLine.value
  } catch (e) {
    console.error('Failed to load passport address', e)
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

.vlt-scope-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.vlt-scope-tab {
  flex: 1;
  padding: 10px 0;
  border-radius: 24px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #4a5868;
  font-weight: 700;
  font-size: 0.8438rem;
  cursor: pointer;
}
.vlt-scope-tab.active {
  background: #00a19a;
  border-color: #00a19a;
  color: #fff;
}

.vlt-section-title {
  font-size: 1.1875rem;
  font-weight: 800;
  color: #231d45;
  margin: 0 0 6px;
}
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

.vlt-category-list,
.vlt-shared-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vlt-category-row,
.vlt-shared-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #fff;
  border: 1px solid #f0f2f5;
  border-radius: 14px;
  text-decoration: none;
  cursor: pointer;
}
.vlt-category-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f2faf8;
  overflow: hidden;
}
.vlt-category-icon img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  display: block;
}
.vlt-category-icon--property_information { background: #e8f1fd; }
.vlt-category-icon--ownership_legal { background: #eee8fd; }
.vlt-category-icon--energy_utilities { background: #e5f9ea; }
.vlt-category-icon--compliance { background: #fdeee0; }
.vlt-category-icon--improvements_maintenance { background: #e5f4f2; }
.vlt-category-icon--appliances_warranties { background: #fdf3e0; }
.vlt-category-icon--manuals { background: #e3edfb; }
.vlt-category-icon--photos { background: #fbe6f3; }

.vlt-category-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.vlt-category-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #231d45;
}
.vlt-category-count {
  font-size: 0.75rem;
  color: #6b7089;
  margin-top: 2px;
}
.vlt-chevron {
  width: 20px;
  height: 20px;
  color: #c1c5d0;
  flex-shrink: 0;
}

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
