<template>
  <BaseDrawer
    :model-value="show"
    :title="activeSection ? activeSection.title : 'Manage visibility'"
    :show-back-button="!!activeSection"
    large
    @update:model-value="onDrawerToggle"
    @close="activeSection ? (activeSection = null) : null"
  >
    <div class="mv">
      <div v-if="loading" class="mv-loading">Loading…</div>

      <template v-else-if="data">
        <!-- ── Section list (top level) ──────────────────────────────── -->
        <template v-if="!activeSection">
          <p class="mv-lede">
            Choose who can see your Property Passport, and manage visibility
            for each section.
          </p>

          <div class="mv-card">
            <div class="mv-card-title">Passport visibility</div>
            <p class="mv-card-sub">
              Choose who can see your property passport and manage visibility
              for each section and document.
            </p>
            <VisibilityPicker
              :model-value="data.visibility"
              :disabled="saving"
              @update:model-value="onSetPassportVisibility"
            />
          </div>

          <div class="mv-section-list-title">Section visibility</div>
          <p class="mv-card-sub">Manage who can see each section of your passport.</p>

          <button
            type="button"
            class="mv-row"
            @click="openSection(data.propertyOverview)"
          >
            <span class="mv-row-body">
              <span class="mv-row-title">{{ data.propertyOverview.title }}</span>
              <span class="mv-row-sub">Address, property type, key details</span>
            </span>
            <VisibilityBadge :level="data.propertyOverview.visibility" />
            <OPIcon name="caretRight" class="w-[14px] h-[14px] mv-row-chev" />
          </button>

          <button
            v-for="s in data.sections"
            :key="s.key"
            type="button"
            class="mv-row"
            @click="openSection(s)"
          >
            <span class="mv-row-body">
              <span class="mv-row-title">{{ s.title }}</span>
            </span>
            <VisibilityBadge :level="s.visibility" />
            <OPIcon name="caretRight" class="w-[14px] h-[14px] mv-row-chev" />
          </button>
        </template>

        <!-- ── Section detail (drill-down) ───────────────────────────── -->
        <template v-else>
          <div class="mv-card">
            <div class="mv-card-title">Visibility for this section</div>
            <VisibilityPicker
              :model-value="activeSection.visibility"
              :disabled="saving"
              @update:model-value="(v) => onSetSectionVisibility(activeSection!.key, v)"
            />
          </div>

          <div class="mv-section-list-title">
            {{ isPropertyOverview ? 'Included in this section' : 'Tasks in this section' }}
          </div>

          <div
            v-for="item in (isPropertyOverview ? (activeSection as any).fields : activeSection.tasks)"
            :key="item.key"
            class="mv-item-row"
          >
            <span class="mv-item-label">{{ item.label || item.title }}</span>
            <VisibilityPicker
              compact
              :model-value="item.visibility"
              :disabled="saving"
              @update:model-value="
                (v) =>
                  isPropertyOverview
                    ? onSetFieldVisibility(item.key, v)
                    : onSetTaskVisibility(activeSection!.key, item.key, v)
              "
            />
          </div>
        </template>

        <p v-if="error" class="mv-error">{{ error }}</p>
      </template>
    </div>
  </BaseDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import VisibilityPicker from './VisibilityPicker.vue'
import VisibilityBadge from './VisibilityBadge.vue'
import { useManageVisibility, type ManageVisibility, type VisibilityLevel, type VisibilitySection, type VisibilityField } from '~/composables/useManageVisibility'

const props = defineProps<{ show: boolean; passportId: string }>()
const emit = defineEmits<{ (e: 'update:show', value: boolean): void }>()

const {
  getManageVisibility,
  setPassportVisibility,
  setSectionVisibility,
  setTaskVisibility,
  setFieldVisibility,
} = useManageVisibility()

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const data = ref<ManageVisibility | null>(null)
const activeSection = ref<(VisibilitySection & { fields?: VisibilityField[] }) | null>(null)

const isPropertyOverview = computed(() => activeSection.value?.key === 'propertyOverview')

function onDrawerToggle(v: boolean) {
  if (!v) activeSection.value = null
  emit('update:show', v)
}

function openSection(s: VisibilitySection & { fields?: VisibilityField[] }) {
  activeSection.value = s
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await getManageVisibility(props.passportId)
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not load visibility settings.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.show,
  (v) => {
    if (v) {
      activeSection.value = null
      load()
    }
  },
)

async function onSetPassportVisibility(v: VisibilityLevel) {
  if (!data.value) return
  saving.value = true
  error.value = ''
  try {
    await setPassportVisibility(props.passportId, v)
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not save. Please try again.'
  } finally {
    saving.value = false
  }
}

async function onSetSectionVisibility(sectionKey: string, v: VisibilityLevel) {
  saving.value = true
  error.value = ''
  try {
    await setSectionVisibility(props.passportId, sectionKey, v)
    await load()
    if (data.value) {
      activeSection.value =
        sectionKey === 'propertyOverview'
          ? data.value.propertyOverview
          : data.value.sections.find((s) => s.key === sectionKey) || null
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not save. Please try again.'
  } finally {
    saving.value = false
  }
}

async function onSetTaskVisibility(sectionKey: string, taskKey: string, v: VisibilityLevel) {
  saving.value = true
  error.value = ''
  try {
    await setTaskVisibility(props.passportId, sectionKey, taskKey, v)
    await load()
    if (data.value) {
      activeSection.value = data.value.sections.find((s) => s.key === sectionKey) || null
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not save. Please try again.'
  } finally {
    saving.value = false
  }
}

async function onSetFieldVisibility(fieldKey: string, v: VisibilityLevel) {
  saving.value = true
  error.value = ''
  try {
    await setFieldVisibility(props.passportId, fieldKey, v)
    await load()
    if (data.value) activeSection.value = data.value.propertyOverview
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not save. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.mv { padding: 0.25rem; }
.mv-loading { padding: 2rem 0; text-align: center; color: #6b7089; font-size: 0.875rem; }
.mv-lede { font-size: 0.8438rem; color: #6b7089; line-height: 1.5; margin: 0 0 1.125rem; }

.mv-card {
  padding: 1rem 1rem 1.125rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 1rem;
  margin-bottom: 1.25rem;
}
.mv-card-title { font-size: 0.9375rem; font-weight: 800; color: #231d45; margin-bottom: 0.375rem; }
.mv-card-sub { font-size: 0.7813rem; color: #6b7089; line-height: 1.5; margin: 0 0 0.875rem; }

.mv-section-list-title {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.025rem;
  text-transform: uppercase;
  color: #6b7089;
  margin: 0 0 0.25rem;
}

.mv-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 0.25rem;
  border: none;
  border-top: 1px solid #f0f2f5;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}
.mv-row:last-child { border-bottom: 1px solid #f0f2f5; }
.mv-row-body { flex: 1; min-width: 0; }
.mv-row-title { display: block; font-size: 0.875rem; font-weight: 700; color: #231d45; }
.mv-row-sub { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 0.125rem; }
.mv-row-chev { color: #c4c1d4; flex-shrink: 0; }

.mv-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.625rem;
  padding: 0.75rem 0.25rem;
  border-top: 1px solid #f0f2f5;
}
.mv-item-row:last-child { border-bottom: 1px solid #f0f2f5; }
.mv-item-label { font-size: 0.8438rem; font-weight: 600; color: #231d45; }

.mv-error {
  margin-top: 0.875rem;
  padding: 0.75rem 0.875rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  color: #b91c1c;
  font-size: 0.8125rem;
}
</style>
