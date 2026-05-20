<template>
  <div class="mobile-container min-h-screen bg-umu-gradient pb-8">
    <header class="flex items-center justify-between px-4 pt-5">
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center"
        @click="goBack"
      >
        <Icon
          name="i-heroicons-chevron-left"
          class="w-[15px] h-[15px] text-black"
        />
      </button>
      <h1
        class="w-[82.85px] h-[22px] font-sf-pro text-[17px] leading-[22px] tracking-[-0.43px] font-[20px]t-center text-black"
      >
        My Profile
      </h1>

      <!-- Empty spacer matching the back button's footprint so the title
           stays visually centered. The old purple "More" 3-dot button was
           a dummy with no handler; sign-out + settings are already in the
           list below, so it had nothing to surface. -->
      <div class="w-10 h-10" aria-hidden="true" />
    </header>

    <main class="px-5 pb-8">
      <section class="pt-6 text-center">
        <div class="relative w-fit mx-auto">
          <UserAvatar
            :src="profile?.avatarUrl"
            :firstName="profile?.firstName"
            :lastName="profile?.lastName"
            :size="112"
          />
        </div>

        <h2 class="mt-8 text-22-emphasized text-center text-[#000000]">
          {{ fullName || 'Your Profile' }}
        </h2>
        <p
          class="mt-1 font-sf-pro text-[15px] leading-[20px] tracking-[-0.23px] radius font-normal text-center text-[#3C3C43] opacity-60%"
        >
          {{ profile?.email || '' }}
        </p>

        <button
          type="button"
          class="mt-6 py-2 px-4 rounded-full border border-brand-aqua text-brand-aqua inline-flex items-center justify-center font-sf-pro text-[15px] leading-[20px] tracking-[-0.4px] font-[590] border-color-[#00A19A] text-[#00A19A]"
        >
          Member since {{ memberSince }}
        </button>
      </section>

      <!-- Role Switcher -->
      <section class="mt-8">
        <p
          class="font-sf-pro text-[13px] font-semibold text-[#8f9094] uppercase tracking-wider mb-3"
        >
          Your Role
        </p>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="r in roleOptions"
            :key="r.key"
            type="button"
            :class="[
              'px-4 py-2 rounded-full text-[14px] font-medium font-sf-pro border transition',
              currentRole === r.key
                ? 'bg-[#00A19A] text-white border-[#00A19A]'
                : 'bg-white text-[#1f2024] border-[#d9dae0]',
            ]"
            :disabled="savingRole"
            @click="setRole(r.key)"
          >
            {{ r.label }}
          </button>
        </div>
        <p v-if="roleSaved" class="mt-2 text-[13px] text-[#1f7a66] font-sf-pro">
          ✓ Role updated
        </p>
        <p v-if="roleError" class="mt-2 text-[13px] text-red-500 font-sf-pro">
          {{ roleError }}
        </p>
      </section>

      <div class="mt-6">
        <div class="bg-white rounded-2xl h-11 px-4 flex items-center">
          <Icon
            name="i-heroicons-magnifying-glass"
            class="w-4 h-4 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Find a setting"
            class="ml-2 w-full bg-transparent outline-none text-lg placeholder:text-[#8f9094]"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="w-4 h-4 rounded-full bg-[#f0f2f1] text-[#4a5868] flex items-center justify-center shrink-0"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <Icon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <ProfileSectionHead label="Account" />
      <div class="profile-row-list">
        <ProfileRow
          v-for="item in filteredItems"
          :key="item.title"
          :title="item.title"
          :meta="item.description"
          @click="onPreferenceClick(item)"
        >
          <template #icon>
            <OPIcon :name="item.icon" class="w-[18px] h-[18px]" />
          </template>
        </ProfileRow>
      </div>

      <button
        type="button"
        class="mt-4 w-full h-[50px] rounded-[12px] pt-[14px] pr-[20px] pb-[14px] pl-[20px] bg-red-50 border border-red-200 text-red-500 inline-flex items-center justify-center gap-[4px] text-[15px] font-medium"
        @click="showDeleteModal = true"
      >
        Delete my Account
      </button>

      <button
        type="button"
        class="mt-3 w-full h-[50px] rounded-[12px] pt-[14px] pr-[20px] pb-[14px] pl-[20px] bg-brand-aqua text-white inline-flex items-center justify-center gap-[4px] text-[17px] leading-[38px] font-medium"
        @click="showLogoutModal = true"
      >
        Log Out
      </button>
    </main>

    <!-- Logout confirmation modal -->
    <Teleport to="body">
      <div
        v-if="showLogoutModal"
        class="fixed inset-0 z-[70] flex items-center justify-center px-6"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="showLogoutModal = false"
        />
        <div
          class="relative bg-white rounded-3xl px-6 py-8 w-full max-w-[340px] text-center shadow-2xl"
        >
          <div
            class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"
          >
            <Icon
              name="i-heroicons-arrow-right-on-rectangle"
              class="w-8 h-8 text-red-400"
            />
          </div>
          <h3 class="font-sf-pro text-[19px] font-semibold text-[#1f2024] mb-2">
            Log Out?
          </h3>
          <p class="font-sf-pro text-[14px] text-[#8f9094] mb-6">
            Are you sure you want to log out of your account?
          </p>
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 h-[48px] rounded-2xl border border-[#e5e5ea] bg-[#f6f6f7] font-sf-pro text-[16px] font-medium text-[#1f2024]"
              @click="showLogoutModal = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 h-[48px] rounded-2xl bg-red-500 font-sf-pro text-[16px] font-medium text-white disabled:opacity-60"
              :disabled="isLoggingOut"
              @click="logout"
            >
              {{ isLoggingOut ? 'Logging out…' : 'Log Out' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete account confirmation modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-[70] flex items-center justify-center px-6"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="showDeleteModal = false"
        />
        <div
          class="relative bg-white rounded-3xl px-6 py-8 w-full max-w-[340px] text-center shadow-2xl"
        >
          <div
            class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"
          >
            <Icon name="i-heroicons-trash" class="w-8 h-8 text-red-500" />
          </div>
          <h3 class="font-sf-pro text-[19px] font-semibold text-[#1f2024] mb-2">
            Delete Account?
          </h3>
          <p
            class="font-sf-pro text-[14px] text-[#8f9094] mb-6 leading-relaxed"
          >
            This will permanently delete your account, all your passports,
            documents, and data.
            <strong class="text-red-500">This cannot be undone.</strong>
          </p>
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 h-[48px] rounded-2xl border border-[#e5e5ea] bg-[#f6f6f7] font-sf-pro text-[16px] font-medium text-[#1f2024]"
              @click="showDeleteModal = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 h-[48px] rounded-2xl bg-red-500 font-sf-pro text-[16px] font-medium text-white disabled:opacity-60"
              :disabled="isDeletingAccount"
              @click="deleteAccount"
            >
              {{ isDeletingAccount ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import OPIcon from '~/components/ui/OPIcon.vue'
import UserAvatar from '~/components/ui/UserAvatar.vue'
import ProfileRow from '~/components/profile/ProfileRow.vue'
import ProfileSectionHead from '~/components/profile/ProfileSectionHead.vue'

definePageMeta({
  title: 'My Profile - UmovingU',
  middleware: 'auth',
})

const { profile, fullName, memberSince, fetchProfile } = useProfile()
const config = useRuntimeConfig()

const searchQuery = ref('')

const roleOptions = [
  { key: 'buy', label: '🏠 Buying' },
  { key: 'sell', label: '🏷️ Selling' },
  { key: 'landlord', label: '🔑 Landlord' },
  { key: 'both', label: '↔️ Both' },
]
const currentRole = ref('buy')
const savingRole = ref(false)
const roleSaved = ref(false)
const roleError = ref('')

onMounted(async () => {
  fetchProfile()
  // Read cached role immediately so the correct pill shows without waiting for API
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('umu_role')
    if (cached) currentRole.value = cached
  }
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      const prefs = await $fetch(
        `${config.public.apiBase}/profile/preferences`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const role = prefs?.purpose?.[0] ?? 'buy'
      currentRole.value = role
      if (typeof window !== 'undefined') localStorage.setItem('umu_role', role)
    }
  } catch {}
})

async function setRole(key) {
  if (savingRole.value || currentRole.value === key) return
  savingRole.value = true
  roleSaved.value = false
  roleError.value = ''
  const prevRole = currentRole.value
  currentRole.value = key // optimistic update
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const result = await $fetch(
      `${config.public.apiBase}/profile/preferences`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { purpose: [key] },
      },
    )
    console.log('[setRole] saved:', result)
    if (typeof window !== 'undefined') localStorage.setItem('umu_role', key)
    roleSaved.value = true
    setTimeout(() => {
      roleSaved.value = false
    }, 2500)
  } catch (err) {
    console.error('[setRole] failed:', err)
    roleError.value =
      'Failed to save — ' +
      (err?.data?.message || err?.message || 'unknown error')
    currentRole.value = prevRole // revert on error
  } finally {
    savingRole.value = false
  }
}

const profileItems = [
  {
    title: 'Your Personal Information',
    description: 'Manage how we know and communicate with you.',
    icon: 'personalInformation',
    route: '/profile/personal-information',
  },
  {
    title: 'Your Buyer Profile',
    description:
      'Verified ID, proof of funds and chain position — share with sellers, agents and solicitors.',
    icon: 'personalInformation',
    route: '/buyer-profile',
  },
  {
    title: 'Collaborators',
    description:
      'Invite, manage, and control who you work with across your property journey.',
    icon: 'collaborators',
    route: '/profile/collaborator-information',
  },
  {
    title: 'Your Documents',
    description: 'View and manage your essential property documents.',
    icon: 'yourDocuments',
    route: '/profile/document',
  },
  // Downloaded Snapshots — hidden for now; route still exists at
  // /profile/snapshot if we re-introduce it later.
  // {
  //   title: 'Downloaded Snapshots',
  //   description:
  //     'Easily export all your downloaded snapshots into formats such as PDF.',
  //   icon: 'snapshots',
  //   route: '/profile/snapshot',
  // },
  {
    title: 'Saved Properties',
    description: 'All your saved and recently viewed properties, organized.',
    icon: 'savedProperties',
    route: '/profile/saved-properties',
  },
  // Billing & Payment History — hidden for now; route still exists at
  // /profile/subscription-plan if we re-introduce it later.
  // {
  //   title: 'Billing & Payment History',
  //   description: 'Manage your subscription, invoices, and payment methods.',
  //   icon: 'billingPaymentHistory',
  //   route: '/profile/subscription-plan',
  // },
  {
    title: 'Settings',
    description: 'Customize your experience, privacy, and account security.',
    icon: 'settings',
    route: '/profile/settings',
  },
  {
    title: 'Help & Support',
    description: 'Need help? Browse FAQs or speak to support.',
    icon: 'helpSupport',
    route: '/profile/support',
  },
  {
    title: 'Calendar',
    description: 'Stay on top of viewings, deadlines, and reminders.',
    icon: 'calendar',
    route: '/profile/calendar',
  },
  {
    title: 'Learn & Ask AI',
    description: 'Get expert guidance and answers at any step.',
    icon: 'learnAskAI',
    route: '/profile/learn',
  },
]

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return profileItems
  }

  const query = searchQuery.value.toLowerCase().trim()
  return profileItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query),
  )
})

const getPreferenceItemClass = (item) => {
  if (item.title === 'Your Personal Information') {
    return 'w-full h-[84px] bg-[#f6f6f7] rounded-[16px] border border-[0.33px] border-[#d9dae0] pt-[14px] pr-[12px] pb-[14px] pl-[20px] flex items-center gap-[8px] line-height-[20px]'
  }

  return 'w-full h-[84px] bg-[#f6f6f7] rounded-[16px] border border-[0.33px] border-[#d9dae0] pt-[14px] pr-[12px] pb-[14px] pl-[20px] flex items-center gap-[8px] line-height-[20px]'
}

const getPreferenceTitleClass = (item) => {
  if (item.title === 'Your Personal Information') {
    return 'font-sf-pro text-start text-[15px] leading-[20px] tracking-[-0.23px] font-normal text-[#1f2024] align-middle'
  }

  return 'font-sf-pro text-start text-[15px] leading-[20px] tracking-[-0.23px] font-normal text-[#1f2024] align-middle'
}

const goBack = () => {
  // if (typeof window !== 'undefined' && window.history.length > 1) {
  //   window.history.back()
  //   return
  // }

  navigateTo('/explore')
}

const onPreferenceClick = async (item) => {
  if (item.route) {
    await navigateTo(item.route)
  }
}

const showLogoutModal = ref(false)
const isLoggingOut = ref(false)
const showDeleteModal = ref(false)
const isDeletingAccount = ref(false)

const logout = async () => {
  isLoggingOut.value = true
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      await $fetch(`${config.public.apiBase}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {}) // ignore network errors — still log out locally
    }
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('redirectAfterLogin')
    }
    showLogoutModal.value = false
    isLoggingOut.value = false
    await navigateTo('/onboarding/signin?reason=logout', { replace: true })
  }
}

const deleteAccount = async () => {
  isDeletingAccount.value = true
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      await $fetch(`${config.public.apiBase}/profile/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    }
  } catch {
    // Proceed with local cleanup regardless
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('redirectAfterLogin')
      sessionStorage.clear()
    }
    showDeleteModal.value = false
    isDeletingAccount.value = false
    await navigateTo('/onboarding/signup', { replace: true })
  }
}
</script>

<style scoped>
.profile-row-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
}
</style>
