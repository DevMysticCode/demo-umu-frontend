<template>
  <div class="mobile-container bg-gray-50">
    <!-- Header -->
    <header class="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm z-50 bg-white shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-brand-aqua rounded-full flex items-center justify-center">
            <Icon name="i-heroicons-user" class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Welcome back,</p>
            <p class="font-semibold text-gray-900">{{ user?.name || 'User' }}</p>
          </div>
        </div>
        <UButton
          variant="ghost"
          icon="i-heroicons-bell"
          class="text-gray-600"
        />
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-20 pb-20 px-4 space-y-6">
      <!-- Quick Stats -->
      <div class="grid grid-cols-2 gap-4">
        <UCard class="p-4 text-center">
          <div class="space-y-2">
            <Icon name="i-heroicons-document-text" class="w-8 h-8 text-brand-aqua mx-auto" />
            <p class="text-2xl font-bold text-gray-900">{{ stats.documents }}</p>
            <p class="text-sm text-gray-600">Documents</p>
          </div>
        </UCard>
        <UCard class="p-4 text-center">
          <div class="space-y-2">
            <Icon name="i-heroicons-chart-bar" class="w-8 h-8 text-brand-aqua mx-auto" />
            <p class="text-2xl font-bold text-gray-900">{{ stats.progress }}%</p>
            <p class="text-sm text-gray-600">Progress</p>
          </div>
        </UCard>
      </div>

      <!-- Recent Activity -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </template>
        <div class="space-y-4">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <Icon :name="activity.icon" class="w-5 h-5 text-brand-aqua" />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
              <p class="text-xs text-gray-600">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Quick Actions -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </template>
        <div class="grid grid-cols-2 gap-3">
          <UButton
            v-for="action in quickActions"
            :key="action.id"
            @click="handleQuickAction(action.id)"
            variant="outline"
            class="h-20 flex-col space-y-2"
          >
            <Icon :name="action.icon" class="w-6 h-6" />
            <span class="text-sm">{{ action.label }}</span>
          </UButton>
        </div>
      </UCard>
    </main>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t">
      <div class="flex justify-around py-2">
        <UButton
          v-for="tab in bottomTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          variant="ghost"
          class="flex-col space-y-1 py-2"
          :class="{ 'text-brand-aqua': activeTab === tab.id }"
        >
          <Icon :name="tab.icon" class="w-5 h-5" />
          <span class="text-xs">{{ tab.label }}</span>
        </UButton>
      </div>
    </nav>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Dashboard - UmovingU',
  middleware: 'auth' // Add auth middleware when implemented
})

// State
const activeTab = ref('home')
const user = ref({ name: 'John Doe' })

const stats = ref({
  documents: 12,
  progress: 75
})

const recentActivities = ref([
  {
    id: 1,
    title: 'Document uploaded',
    time: '2 hours ago',
    icon: 'i-heroicons-document-plus'
  },
  {
    id: 2,
    title: 'Progress updated',
    time: '1 day ago',
    icon: 'i-heroicons-chart-bar'
  },
  {
    id: 3,
    title: 'New message',
    time: '2 days ago',
    icon: 'i-heroicons-chat-bubble-left'
  }
])

const quickActions = ref([
  { id: 'upload', label: 'Upload Doc', icon: 'i-heroicons-document-plus' },
  { id: 'progress', label: 'Track Progress', icon: 'i-heroicons-chart-bar' },
  { id: 'trades', label: 'Find Trades', icon: 'i-heroicons-users' },
  { id: 'messages', label: 'Messages', icon: 'i-heroicons-chat-bubble-left' }
])

const bottomTabs = ref([
  { id: 'home', label: 'Home', icon: 'i-heroicons-home' },
  { id: 'documents', label: 'Documents', icon: 'i-heroicons-document-text' },
  { id: 'progress', label: 'Progress', icon: 'i-heroicons-chart-bar' },
  { id: 'profile', label: 'Profile', icon: 'i-heroicons-user' }
])

// Methods
const handleQuickAction = (actionId) => {
  switch (actionId) {
    case 'upload':
      navigateTo('/documents/upload')
      break
    case 'progress':
      navigateTo('/progress')
      break
    case 'trades':
      navigateTo('/trades')
      break
    case 'messages':
      navigateTo('/messages')
      break
  }
}

// Load user data on mount
onMounted(async () => {
  try {
    const userData = await $fetch('/api/user/profile')
    user.value = userData
  } catch (error) {
    console.error('Failed to load user data:', error)
  }
})
</script>