<template>
  <div class="pi-page mobile-container">
    <!-- Nav bar -->
    <div class="pi-nav-bar">
      <button class="pi-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="pi-nav-title">Personal Information</div>
      <div style="width: 38px" />
    </div>

    <main class="pi-body">
      <div class="atm-bg warm" />

      <!-- Hero -->
      <div class="pi-hero">
        <button
          type="button"
          class="pi-avatar"
          aria-label="Edit profile picture"
          @click="isAvatarDrawerOpen = true"
        >
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            alt="Profile avatar"
            class="pi-avatar-img"
          />
          <span v-else>{{ initials }}</span>
          <div class="avatar-camera-mini">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
              />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </button>
        <div class="pi-name">{{ fullName || 'Your Profile' }}</div>
        <div class="pi-meta">{{ profile?.email || '' }}</div>
        <div class="pi-completion">
          <span>Profile</span>
          <div class="pic-track">
            <div class="pic-fill" :style="{ width: profileCompletion + '%' }" />
          </div>
          <span class="pic-pct">{{ profileCompletion }}%</span>
        </div>
      </div>

      <!-- Name & contact -->
      <div class="section-heading">Name &amp; contact</div>
      <div class="pi-section">
        <div class="pi-group">
          <button
            v-for="(item, index) in contactDetails"
            :key="item.key"
            class="pi-row"
            type="button"
            @click="openContactEditor(index)"
          >
            <div class="pir-content">
              <div class="pir-label">{{ item.label }}</div>
              <div class="pir-value" :class="{ empty: !item.value }">
                {{ item.value || `Add ${item.label.toLowerCase()}` }}
              </div>
            </div>
            <div class="pir-edit">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
            </div>
          </button>

          <div class="pi-row">
            <div class="pir-content">
              <div class="pir-label">Contact visibility</div>
              <div class="pir-hint">
                Sellers see your details only when you message them
              </div>
            </div>
            <button
              type="button"
              class="pir-toggle"
              :class="{ on: contactVisible }"
              @click="toggleContactVisible"
              :aria-label="
                contactVisible
                  ? 'Disable contact visibility'
                  : 'Enable contact visibility'
              "
            />
          </div>
        </div>
      </div>

      <!-- Address -->
      <div class="section-heading">
        Address
        <span class="sh-action" @click="openAddressEditor(null)">+ Add</span>
      </div>
      <div class="pi-section">
        <div v-if="(profile?.addresses ?? []).length === 0" class="pi-group">
          <button class="pi-row" type="button" @click="openAddressEditor(null)">
            <div class="pir-content">
              <div class="pir-label">Current address</div>
              <div class="pir-value empty">Add your address</div>
            </div>
            <div class="pir-edit">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </button>
        </div>

        <div v-else class="pi-group">
          <div
            v-for="addr in profile?.addresses ?? []"
            :key="addr.id"
            class="pi-row"
          >
            <div class="pir-content">
              <div class="pir-label">{{ addr.label || 'Address' }}</div>
              <div class="pir-value">{{ formatAddress(addr) }}</div>
            </div>
            <button
              class="pir-edit"
              type="button"
              aria-label="Edit address"
              @click="openAddressEditor(addr)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
            </button>
            <button
              class="pir-edit pir-delete"
              type="button"
              aria-label="Delete address"
              @click="handleDeleteAddress(addr.id)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Company -->
      <div class="section-heading">
        Company
        <span class="sh-action" @click="openCompanyEditor(null)">+ Add</span>
      </div>
      <div class="pi-section">
        <div v-if="(profile?.companies ?? []).length === 0" class="pi-group">
          <button class="pi-row" type="button" @click="openCompanyEditor(null)">
            <div class="pir-content">
              <div class="pir-label">Registered company</div>
              <div class="pir-value empty">Add company details</div>
            </div>
            <div class="pir-edit">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </button>
        </div>

        <div v-else class="pi-group">
          <div
            v-for="company in profile?.companies ?? []"
            :key="company.id"
            class="pi-row"
          >
            <div class="pir-content">
              <div class="pir-label">{{ company.name }}</div>
              <div v-if="company.address" class="pir-value">
                {{ company.address }}
              </div>
              <div
                v-if="company.companyNumber || company.director"
                class="pir-hint"
              >
                <span v-if="company.companyNumber"
                  >No. {{ company.companyNumber }}</span
                >
                <span v-if="company.companyNumber && company.director">
                  ·
                </span>
                <span v-if="company.director">{{ company.director }}</span>
              </div>
            </div>
            <button
              class="pir-edit"
              type="button"
              aria-label="Edit company"
              @click="openCompanyEditor(company)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
            </button>
            <button
              class="pir-edit pir-delete"
              type="button"
              aria-label="Delete company"
              @click="handleDeleteCompany(company.id)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Solicitor -->
      <div class="section-heading">
        Solicitor
        <span class="sh-action" @click="openSolicitorEditor(null)">+ Add</span>
      </div>
      <div class="pi-section">
        <div v-if="(profile?.solicitors ?? []).length === 0" class="pi-group">
          <button
            class="pi-row"
            type="button"
            @click="openSolicitorEditor(null)"
          >
            <div class="pir-content">
              <div class="pir-label">Solicitor</div>
              <div class="pir-value empty">Add your solicitor</div>
            </div>
            <div class="pir-edit">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </button>
        </div>

        <div v-else class="pi-group">
          <div
            v-for="sol in profile?.solicitors ?? []"
            :key="sol.id"
            class="pi-row"
          >
            <div class="pir-content">
              <div class="pir-label">{{ sol.name }}</div>
              <div v-if="sol.contactName || sol.email" class="pir-value">
                <span v-if="sol.contactName">{{ sol.contactName }}</span>
                <span v-if="sol.contactName && sol.email"> · </span>
                <span v-if="sol.email">{{ sol.email }}</span>
              </div>
              <div v-if="sol.phone || sol.reference" class="pir-hint">
                <span v-if="sol.phone">{{ sol.phone }}</span>
                <span v-if="sol.phone && sol.reference"> · </span>
                <span v-if="sol.reference">Ref {{ sol.reference }}</span>
              </div>
            </div>
            <button
              class="pir-edit"
              type="button"
              aria-label="Edit solicitor"
              @click="openSolicitorEditor(sol)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
            </button>
            <button
              class="pir-edit pir-delete"
              type="button"
              aria-label="Delete solicitor"
              @click="handleDeleteSolicitor(sol.id)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Communication preferences -->
      <div class="section-heading">Communication preferences</div>
      <div class="pi-section">
        <div class="pi-group">
          <div
            v-for="item in communicationPreferences"
            :key="item.key"
            class="pi-row"
          >
            <div class="pir-content">
              <div class="pir-label">{{ item.label }}</div>
              <div class="pir-hint">{{ item.hint }}</div>
            </div>
            <button
              type="button"
              class="pir-toggle"
              :class="{ on: item.value }"
              :aria-label="item.label"
              @click="toggleCommsPreference(item.key)"
            />
          </div>
        </div>
      </div>

      <!-- Identity verification -->
      <div class="section-heading">Identity verification</div>
      <div class="pi-section">
        <div class="pi-group">
          <div class="pi-row" :class="{ 'verified-row': profile?.isVerified }">
            <div v-if="profile?.isVerified" class="pir-verified-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div class="pir-content">
              <div
                class="pir-label"
                :class="{ 'verified-label': profile?.isVerified }"
              >
                {{ profile?.isVerified ? 'Verified' : 'Not verified yet' }}
              </div>
              <div class="pir-value" :class="{ empty: !profile?.isVerified }">
                {{
                  profile?.isVerified
                    ? 'By Onfido · verified profile'
                    : 'Complete ID verification to be trusted'
                }}
              </div>
            </div>
            <div class="pir-edit">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Contact Edit Drawer -->
    <BaseDrawer
      v-model="isContactDrawerOpen"
      :title="`Change ${contactEditLabel}`"
      :show-back-button="false"
    >
      <div class="pt-1 pb-2">
        <p class="text-[15px] leading-[24px] text-[#7f8084]">
          The changes will reflect immediately.
        </p>
        <div
          v-if="contactDetails[activeContactIndex]?.key === 'phone'"
          class="mt-6"
        >
          <PhoneInput v-model="contactEditValue" />
          <p class="mt-2 text-[13px] text-[#8e8e93]">
            Select your country code, then enter your number without the leading
            0.
          </p>
        </div>
        <label v-else class="mt-6 block">
          <div
            class="h-16 rounded-[20px] border border-[#e2e2e7] bg-[#f4f4f5] flex items-center gap-3 px-5"
          >
            <Icon
              name="i-heroicons-pencil-square"
              class="w-5 h-5 text-[#b3b3b7]"
            />
            <input
              v-model="contactEditValue"
              :type="contactEditInputType"
              :placeholder="`Enter new ${contactEditLabel}`"
              class="w-full bg-transparent outline-none text-[16px] leading-[22px] text-[#1f2024] placeholder:text-[#8e8e93]"
            />
          </div>
        </label>
      </div>
      <template #footer>
        <button
          type="button"
          class="drawer-cta"
          :disabled="saving"
          @click="saveContactEdit"
        >
          <Icon name="i-heroicons-check" class="w-5 h-5" />
          <span>{{ saving ? 'Saving…' : 'Save Changes' }}</span>
        </button>
      </template>
    </BaseDrawer>

    <!-- Address Edit Drawer -->
    <BaseDrawer
      v-model="isAddressDrawerOpen"
      :title="editingAddress?.id ? 'Edit address' : 'Add address'"
      :show-back-button="false"
    >
      <div class="pt-1 pb-2 space-y-3">
        <div
          v-for="field in addressFields"
          :key="field.key"
          class="h-14 rounded-[16px] border border-[#e8eceb] bg-white flex items-center gap-3 px-4"
        >
          <input
            v-model="editingAddress[field.key]"
            :placeholder="field.label"
            class="w-full bg-transparent outline-none text-[15px] leading-[22px] text-[#0e2840] placeholder:text-[#8a95a0] font-semibold"
          />
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          class="drawer-cta"
          :disabled="saving"
          @click="saveAddress"
        >
          <Icon name="i-heroicons-check" class="w-5 h-5" />
          <span>{{ saving ? 'Saving…' : 'Save address' }}</span>
        </button>
      </template>
    </BaseDrawer>

    <!-- Company Edit Drawer -->
    <BaseDrawer
      v-model="isCompanyDrawerOpen"
      :title="editingCompany?.id ? 'Edit company' : 'Add company'"
      :show-back-button="false"
    >
      <div class="pt-1 pb-2 space-y-3">
        <div
          v-for="field in companyFields"
          :key="field.key"
          class="h-14 rounded-[16px] border border-[#e8eceb] bg-white flex items-center gap-3 px-4"
        >
          <input
            v-model="editingCompany[field.key]"
            :placeholder="field.label"
            class="w-full bg-transparent outline-none text-[15px] leading-[22px] text-[#0e2840] placeholder:text-[#8a95a0] font-semibold"
          />
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          class="drawer-cta"
          :disabled="saving"
          @click="saveCompany"
        >
          <Icon name="i-heroicons-check" class="w-5 h-5" />
          <span>{{ saving ? 'Saving…' : 'Save company' }}</span>
        </button>
      </template>
    </BaseDrawer>

    <!-- Avatar Edit Drawer -->
    <BaseDrawer
      v-model="isAvatarDrawerOpen"
      title="Edit profile picture"
      :show-back-button="false"
    >
      <p class="text-[15px] leading-[24px] text-[#7f8084] mb-6">
        The changes will reflect immediately.
      </p>
      <div v-if="avatarPreview" class="mb-6 flex justify-center">
        <img
          :src="avatarPreview"
          alt="Preview"
          class="w-24 h-24 rounded-full object-cover border-4 border-[#3dbda3]"
        />
      </div>
      <div class="space-y-3">
        <label class="avatar-pick-row">
          <div class="apr-content">
            <Icon name="i-heroicons-camera" class="w-5 h-5 text-[#0e2840]" />
            <span>Take picture</span>
          </div>
          <Icon
            name="i-heroicons-chevron-right"
            class="w-4 h-4 text-[#8a95a0]"
          />
          <input
            ref="cameraInputRef"
            type="file"
            accept="image/*"
            capture="camera"
            class="sr-only"
            @change="onFileSelected"
          />
        </label>
        <label class="avatar-pick-row">
          <div class="apr-content">
            <Icon name="i-heroicons-photo" class="w-5 h-5 text-[#0e2840]" />
            <span>Upload from gallery</span>
          </div>
          <Icon
            name="i-heroicons-chevron-right"
            class="w-4 h-4 text-[#8a95a0]"
          />
          <input
            type="file"
            accept="image/*"
            class="sr-only"
            @change="onFileSelected"
          />
        </label>
        <label class="avatar-pick-row">
          <div class="apr-content">
            <Icon
              name="i-heroicons-folder-open"
              class="w-5 h-5 text-[#0e2840]"
            />
            <span>Browse files</span>
          </div>
          <Icon
            name="i-heroicons-chevron-right"
            class="w-4 h-4 text-[#8a95a0]"
          />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="sr-only"
            @change="onFileSelected"
          />
        </label>
      </div>
      <p v-if="avatarError" class="mt-4 text-center text-red-500 text-[13px]">
        {{ avatarError }}
      </p>
      <template #footer>
        <button
          v-if="avatarFile"
          type="button"
          class="drawer-cta"
          :disabled="avatarUploading"
          @click="saveAvatar"
        >
          <Icon name="i-heroicons-check" class="w-5 h-5" />
          <span>{{ avatarUploading ? 'Uploading…' : 'Save picture' }}</span>
        </button>
      </template>
    </BaseDrawer>

    <!-- Solicitor Edit Drawer -->
    <BaseDrawer
      v-model="isSolicitorDrawerOpen"
      :title="editingSolicitor?.id ? 'Edit solicitor' : 'Add solicitor'"
      :show-back-button="false"
    >
      <div class="pt-1 pb-2 space-y-3">
        <div
          v-for="field in solicitorFields"
          :key="field.key"
          class="h-14 rounded-[16px] border border-[#e8eceb] bg-white flex items-center gap-3 px-4"
        >
          <input
            v-model="editingSolicitor[field.key]"
            :placeholder="field.label"
            class="w-full bg-transparent outline-none text-[15px] leading-[22px] text-[#0e2840] placeholder:text-[#8a95a0] font-semibold"
          />
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          class="drawer-cta"
          :disabled="saving"
          @click="saveSolicitor"
        >
          <Icon name="i-heroicons-check" class="w-5 h-5" />
          <span>{{ saving ? 'Saving…' : 'Save solicitor' }}</span>
        </button>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup>
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import PhoneInput from '@/components/form/PhoneInput.vue'

definePageMeta({ title: 'Personal Information - UmovingU', middleware: 'auth' })

const {
  profile,
  fullName,
  uploadAvatar,
  fetchProfile,
  updateProfile,
  createAddress,
  updateAddress,
  deleteAddress,
  createCompany,
  updateCompany,
  deleteCompany,
  createSolicitor,
  updateSolicitor,
  deleteSolicitor,
} = useProfile()

onMounted(fetchProfile)

const saving = ref(false)

// ── Avatar ─────────────────────────────────────────────────────
const isAvatarDrawerOpen = ref(false)
const avatarFile = ref(null)
const avatarPreview = ref('')
const avatarUploading = ref(false)
const avatarError = ref('')

const onFileSelected = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarError.value = ''
  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarPreview.value = ev.target.result
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const saveAvatar = async () => {
  if (!avatarFile.value) return
  avatarUploading.value = true
  avatarError.value = ''
  try {
    await uploadAvatar(avatarFile.value)
    isAvatarDrawerOpen.value = false
    avatarFile.value = null
    avatarPreview.value = ''
  } catch (err) {
    avatarError.value = err?.data?.message || 'Upload failed. Please try again.'
  } finally {
    avatarUploading.value = false
  }
}

// ── Contact ─────────────────────────────────────────────────────
const contactDetails = computed(() => [
  { label: 'Full name', value: fullName.value, key: 'name' },
  { label: 'Email', value: profile.value?.email ?? '', key: 'email' },
  { label: 'Phone', value: profile.value?.phone ?? '', key: 'phone' },
])

const contactVisible = computed(() => profile.value?.contactVisible ?? true)
const toggleContactVisible = async () => {
  if (!profile.value) return
  await updateProfile({ contactVisible: !profile.value.contactVisible })
}

const isContactDrawerOpen = ref(false)
const activeContactIndex = ref(null)
const contactEditValue = ref('')

const contactEditLabel = computed(() => {
  if (activeContactIndex.value === null) return 'Value'
  return contactDetails.value[activeContactIndex.value]?.label ?? 'Value'
})
const contactEditInputType = computed(() => {
  const k = contactDetails.value[activeContactIndex.value ?? -1]?.key
  if (k === 'email') return 'email'
  if (k === 'phone') return 'tel'
  return 'text'
})

const openContactEditor = (index) => {
  activeContactIndex.value = index
  contactEditValue.value = contactDetails.value[index]?.value ?? ''
  isContactDrawerOpen.value = true
}

const saveContactEdit = async () => {
  if (activeContactIndex.value === null) return
  saving.value = true
  try {
    const key = contactDetails.value[activeContactIndex.value]?.key
    if (key === 'name') {
      const parts = contactEditValue.value.trim().split(/\s+/)
      await updateProfile({
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' ') || undefined,
      })
    } else if (key === 'phone') {
      await updateProfile({ phone: contactEditValue.value })
    }
    isContactDrawerOpen.value = false
  } finally {
    saving.value = false
  }
}

// ── Comms preferences ───────────────────────────────────────────
const communicationPreferences = computed(() => [
  {
    key: 'pushNotifications',
    label: 'In-app push',
    hint: 'Viewing reminders & messages',
    value: profile.value?.pushNotifications ?? true,
  },
  {
    key: 'emailNewsletter',
    label: 'Email newsletter',
    hint: 'Weekly market & saved property updates',
    value: profile.value?.emailNewsletter ?? true,
  },
  {
    key: 'smsNotifications',
    label: 'SMS',
    hint: 'Time-sensitive alerts only',
    value: profile.value?.smsNotifications ?? false,
  },
])
const toggleCommsPreference = async (key) => {
  if (!profile.value) return
  await updateProfile({ [key]: !profile.value[key] })
}

// ── Address ─────────────────────────────────────────────────────
const isAddressDrawerOpen = ref(false)
const editingAddress = ref({})
const addressFields = [
  { key: 'label', label: 'Label (e.g. Current address)' },
  { key: 'line1', label: 'Address line 1' },
  { key: 'line2', label: 'Address line 2 (optional)' },
  { key: 'city', label: 'City' },
  { key: 'county', label: 'County' },
  { key: 'postcode', label: 'Postcode' },
]

const formatAddress = (a) =>
  [a.line1, a.line2, a.city, a.county, a.postcode].filter(Boolean).join(', ')

const openAddressEditor = (addr) => {
  editingAddress.value = addr
    ? { ...addr }
    : { label: '', line1: '', postcode: '' }
  isAddressDrawerOpen.value = true
}

const saveAddress = async () => {
  saving.value = true
  try {
    if (editingAddress.value.id)
      await updateAddress(editingAddress.value.id, editingAddress.value)
    else await createAddress(editingAddress.value)
    isAddressDrawerOpen.value = false
  } finally {
    saving.value = false
  }
}
const handleDeleteAddress = async (id) => {
  await deleteAddress(id)
}

// ── Company ─────────────────────────────────────────────────────
const isCompanyDrawerOpen = ref(false)
const editingCompany = ref({})
const companyFields = [
  { key: 'name', label: 'Company name' },
  { key: 'address', label: 'Address' },
  { key: 'companyNumber', label: 'Company number' },
  { key: 'director', label: 'Director' },
]

const openCompanyEditor = (c) => {
  editingCompany.value = c ? { ...c } : { name: '' }
  isCompanyDrawerOpen.value = true
}
const saveCompany = async () => {
  saving.value = true
  try {
    if (editingCompany.value.id)
      await updateCompany(editingCompany.value.id, editingCompany.value)
    else await createCompany(editingCompany.value)
    isCompanyDrawerOpen.value = false
  } finally {
    saving.value = false
  }
}
const handleDeleteCompany = async (id) => {
  await deleteCompany(id)
}

// ── Solicitor ───────────────────────────────────────────────────
const isSolicitorDrawerOpen = ref(false)
const editingSolicitor = ref({})
const solicitorFields = [
  { key: 'name', label: 'Firm name' },
  { key: 'address', label: 'Address' },
  { key: 'contactName', label: 'Contact name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'reference', label: 'Reference' },
]

const openSolicitorEditor = (s) => {
  editingSolicitor.value = s ? { ...s } : { name: '' }
  isSolicitorDrawerOpen.value = true
}
const saveSolicitor = async () => {
  saving.value = true
  try {
    if (editingSolicitor.value.id)
      await updateSolicitor(editingSolicitor.value.id, editingSolicitor.value)
    else await createSolicitor(editingSolicitor.value)
    isSolicitorDrawerOpen.value = false
  } finally {
    saving.value = false
  }
}
const handleDeleteSolicitor = async (id) => {
  await deleteSolicitor(id)
}

// ── Hero ────────────────────────────────────────────────────────
const initials = computed(() => {
  const f = profile.value?.firstName?.[0] ?? ''
  const l = profile.value?.lastName?.[0] ?? ''
  return (
    (f + l).toUpperCase() || (profile.value?.email?.[0] ?? '?').toUpperCase()
  )
})
const profileCompletion = computed(() => {
  const checks = [
    profile.value?.firstName,
    profile.value?.lastName,
    profile.value?.email,
    profile.value?.phone,
    profile.value?.addresses?.length,
    profile.value?.companies?.length,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1)
    window.history.back()
  else navigateTo('/profile')
}
</script>

<style scoped>
.pi-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 32px;
}

.pi-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.pi-nav-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0e2840;
  flex-shrink: 0;
  transition: background 0.2s;
}
.pi-nav-icon-btn:hover {
  background: #f0f2f1;
}
.pi-nav-icon-btn svg {
  width: 18px;
  height: 18px;
}
.pi-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}

.pi-body {
  position: relative;
}
.atm-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.warm {
  background:
    radial-gradient(
      ellipse 70% 100% at 30% 30%,
      rgba(245, 196, 76, 0.1),
      transparent 70%
    ),
    radial-gradient(
      ellipse 70% 80% at 90% 0%,
      rgba(61, 189, 163, 0.1),
      transparent 60%
    );
}

/* Hero */
.pi-hero {
  padding: 10px 22px 14px;
  position: relative;
  z-index: 1;
  text-align: center;
}
.pi-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(155deg, #2a9484 0%, #143f58 60%, #0e2840 100%);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 1px;
  box-shadow:
    0 6px 18px rgba(14, 40, 64, 0.3),
    inset 0 0 0 3px rgba(255, 255, 255, 0.06);
  margin-bottom: 12px;
  position: relative;
  border: none;
  cursor: pointer;
  font-family: inherit;
  /* overflow: hidden; */
}
.pi-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-camera-mini {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #3dbda3;
  color: #fff;
  border: 2.5px solid #fafaf8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-camera-mini svg {
  width: 11px;
  height: 11px;
}
.pi-name {
  font-size: 22px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.6px;
  margin-bottom: 2px;
}
.pi-meta {
  font-size: 12px;
  color: #4a5868;
  font-weight: 600;
  margin-bottom: 12px;
}
.pi-completion {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 100px;
  padding: 6px 12px 6px 8px;
  font-size: 11px;
  font-weight: 700;
  color: #4a5868;
}
.pic-track {
  width: 60px;
  height: 5px;
  background: #e8eceb;
  border-radius: 100px;
  overflow: hidden;
  flex-shrink: 0;
}
.pic-fill {
  height: 100%;
  background: linear-gradient(90deg, #3dbda3, #1f7a66);
  border-radius: 100px;
  transition: width 0.3s ease;
}
.pic-pct {
  color: #1f7a66;
  font-weight: 800;
  font-feature-settings: 'tnum';
}

/* Section heading */
.section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 8px 22px 8px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sh-action {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  color: #1f7a66;
  cursor: pointer;
  letter-spacing: -0.1px;
  text-transform: none;
}

/* Section / group / row */
.pi-section {
  padding: 0 22px;
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
}
.pi-group {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  overflow: hidden;
}
.pi-row {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f0f2f1;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  color: inherit;
}
.pi-row:last-child {
  border-bottom: none;
}
.pi-row:hover {
  background: #fafaf8;
}
.pi-row.verified-row {
  background: linear-gradient(90deg, #f1f9f4, transparent);
  cursor: default;
}
.pi-row.verified-row:hover {
  background: linear-gradient(90deg, #f1f9f4, transparent);
}

.pir-content {
  flex: 1;
  min-width: 0;
}
.pir-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-bottom: 2px;
}
.pir-label.verified-label {
  color: #1f7a66;
}
.pir-value {
  font-size: 13px;
  font-weight: 700;
  color: #0e2840;
  letter-spacing: -0.2px;
  word-break: break-word;
}
.pir-value.empty {
  color: #1f7a66;
  font-weight: 700;
}
.pir-hint {
  font-size: 11.5px;
  color: #4a5868;
  font-weight: 600;
  margin-top: 1px;
}

.pir-edit {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: #f1f9f4;
  color: #1f7a66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  font-family: inherit;
}
.pir-edit:hover {
  background: #e2f1ea;
}
.pir-edit svg {
  width: 14px;
  height: 14px;
}
.pir-delete {
  background: #ffe9dd;
  color: #b85b36;
}
.pir-delete:hover {
  background: #ffd4bd;
}

.pir-toggle {
  width: 40px;
  height: 22px;
  border-radius: 100px;
  background: #e8eceb;
  border: none;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.pir-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s;
}
.pir-toggle.on {
  background: #3dbda3;
}
.pir-toggle.on::after {
  transform: translateX(18px);
}

.pir-verified-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1f7a66;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pir-verified-icon svg {
  width: 16px;
  height: 16px;
}

/* Drawer CTA */
.drawer-cta {
  width: 100%;
  height: 50px;
  border-radius: 14px;
  background: #3dbda3;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.2px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
}
.drawer-cta:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.avatar-pick-row {
  width: 100%;
  height: 64px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.apr-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #0e2840;
  letter-spacing: -0.2px;
}
</style>
