<template>
  <div class="mobile-container vlt-page">
    <div class="vlt-header">
      <button type="button" class="vlt-back" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>
      <h1 class="vlt-title">Add document</h1>
      <span style="width:30px" />
    </div>

    <label class="vlt-dropzone" :class="{ 'has-file': file }">
      <input type="file" class="vlt-file-input" accept=".pdf,.jpg,.jpeg,.png" @change="onFileChange" />
      <span class="vlt-dropzone-icon"><img src="/op-icons/buyer-profile/upload.png" alt="" loading="lazy" /></span>
      <template v-if="file">
        <span class="vlt-dropzone-title">{{ file.name }}</span>
        <span class="vlt-dropzone-sub">Tap to choose a different file</span>
      </template>
      <template v-else>
        <span class="vlt-dropzone-title">Choose a file or take a photo</span>
        <span class="vlt-dropzone-sub">PDF, JPG, PNG (max 20MB)</span>
      </template>
    </label>

    <h3 class="vlt-card-title">Where do you want to save this?</h3>
    <div class="vlt-save-options">
      <label :class="['vlt-save-opt', scope === 'property' ? 'selected' : '']">
        <input type="radio" name="scope" value="property" v-model="scope" />
        <span class="vlt-save-opt-icon"><img src="/op-icons/investment/house.png" alt="" loading="lazy" /></span>
        <span>
          <span class="vlt-save-opt-title">Property documents</span>
          <span class="vlt-save-opt-sub">Related to this property</span>
        </span>
      </label>
      <label :class="['vlt-save-opt', scope === 'private' ? 'selected' : '']">
        <input type="radio" name="scope" value="private" v-model="scope" />
        <span class="vlt-save-opt-icon"><img src="/op-icons/investment/padlock.png" alt="" loading="lazy" /></span>
        <span>
          <span class="vlt-save-opt-title">My private documents</span>
          <span class="vlt-save-opt-sub">Visible only to you</span>
        </span>
      </label>
    </div>

    <h3 class="vlt-card-title">What type of document is this?</h3>
    <div class="vlt-category-options">
      <label v-for="cat in VAULT_CATEGORIES" :key="cat.key" :class="['vlt-category-opt', category === cat.key ? 'selected' : '']">
        <input type="radio" name="category" :value="cat.key" v-model="category" />
        <span class="vlt-category-opt-icon"><img :src="cat.icon" alt="" loading="lazy" /></span>
        <span class="vlt-category-opt-label">{{ cat.label }}</span>
        <svg class="vlt-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </label>
    </div>

    <button type="button" class="vlt-save-btn" :disabled="!file || !category || uploading" @click="submit">
      {{ uploading ? 'Uploading…' : 'Continue' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVault, VAULT_CATEGORIES } from '~/composables/useVault'

const route = useRoute()
const router = useRouter()
const passportId = route.params.passportId
const { uploadDocument } = useVault()

const file = ref(null)
const scope = ref(route.query.scope === 'private' ? 'private' : 'property')
const category = ref(route.query.category || '')
const uploading = ref(false)

function onFileChange(e) {
  file.value = e.target.files?.[0] || null
}

async function submit() {
  if (!file.value || !category.value) return
  uploading.value = true
  try {
    await uploadDocument(file.value, {
      category: category.value,
      passportId: scope.value === 'property' ? passportId : undefined,
    })
    router.push(`/vault/${passportId}/${category.value}?scope=${scope.value}`)
  } catch (e) {
    console.error('Failed to upload document', e)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.vlt-page { min-height: 100vh; background: #fafafa; padding: 16px 16px 32px; }
.vlt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.vlt-back { display: flex; align-items: center; gap: 4px; background: none; border: none; color: #00a19a; font-weight: 600; font-size: 0.9375rem; cursor: pointer; padding: 0; }
.vlt-back svg { width: 20px; height: 20px; }
.vlt-title { font-size: 1.0625rem; font-weight: 800; color: #231d45; margin: 0; }

.vlt-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 32px 16px;
  border: 1.5px dashed #b8e0dc;
  border-radius: 16px;
  background: #f2faf8;
  cursor: pointer;
  margin-bottom: 20px;
  text-align: center;
}
.vlt-dropzone.has-file { border-style: solid; border-color: #00a19a; }
.vlt-file-input { display: none; }
.vlt-dropzone-icon { width: 40px; height: 40px; }
.vlt-dropzone-icon img { width: 100%; height: 100%; object-fit: contain; display: block; }
.vlt-dropzone-title { font-size: 0.9375rem; font-weight: 700; color: #231d45; }
.vlt-dropzone-sub { font-size: 0.75rem; color: #6b7089; }

.vlt-card-title { font-size: 0.875rem; font-weight: 800; color: #231d45; margin: 0 0 10px; }

.vlt-save-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.vlt-save-opt, .vlt-category-opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  cursor: pointer;
}
.vlt-save-opt.selected, .vlt-category-opt.selected { border-color: #00a19a; background: #f2faf8; }
.vlt-save-opt input, .vlt-category-opt input { accent-color: #00a19a; }
.vlt-save-opt-icon, .vlt-category-opt-icon { width: 28px; height: 28px; flex-shrink: 0; }
.vlt-save-opt-icon img, .vlt-category-opt-icon img { width: 100%; height: 100%; object-fit: contain; display: block; }
.vlt-save-opt-title { display: block; font-size: 0.875rem; font-weight: 700; color: #231d45; }
.vlt-save-opt-sub { display: block; font-size: 0.75rem; color: #6b7089; margin-top: 2px; }

.vlt-category-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.vlt-category-opt-label { flex: 1; font-size: 0.875rem; font-weight: 700; color: #231d45; }
.vlt-chevron { width: 18px; height: 18px; color: #c1c5d0; }

.vlt-save-btn { width: 100%; padding: 15px; background: #00a19a; color: #fff; border: none; border-radius: 14px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
.vlt-save-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
</style>
