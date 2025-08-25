<template>
  <div class="bottom-navigation">
    <div class="bottom-navigation__container">
      <div
        v-for="item in navigationItems"
        :key="item.id"
        @click="handleNavigation(item)"
        class="bottom-navigation__item"
        :class="{ 'bottom-navigation__item--active': activeTab === item.id }"
      >
        <div class="bottom-navigation__icon">
          <img :src="item.icon" :alt="item.label" />
        </div>
        <span class="bottom-navigation__label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NavigationItem {
  id: string
  label: string
  icon: string
  route?: string
}

interface Props {
  activeTab?: string
}

withDefaults(defineProps<Props>(), {
  activeTab: 'passport',
})

const emit = defineEmits<{
  navigate: [item: NavigationItem]
}>()

const navigationItems: NavigationItem[] = [
  {
    id: 'passport',
    label: 'Passport',
    icon: '/icons/Passport.png',
    route: '/passport',
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: '/icons/Search-Map.png',
    route: '/find-property',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: '/icons/Marketplace.png',
    route: '/marketplace',
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: '/icons/Trophy.png',
    route: '/rewards',
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: '/icons/Education.png',
    route: '/learn',
  },
]

const handleNavigation = (item: NavigationItem) => {
  emit('navigate', item)
}
</script>

<style scoped>
/* Bottom Navigation */
.bottom-navigation {
  @apply fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50;
  max-width: 28rem;
  margin-left: auto;
  margin-right: auto;
}

.bottom-navigation__container {
  @apply max-w-md mx-auto flex justify-around;
}

.bottom-navigation__item {
  @apply flex flex-col items-center py-2 px-3 text-xs cursor-pointer transition-colors;
}

.bottom-navigation__icon {
  @apply w-6 h-6 mb-1 text-lg;
}

.bottom-navigation__label {
  @apply text-gray-600 transition-colors;
}

.bottom-navigation__item--active .bottom-navigation__label {
  @apply text-brand-aqua;
}

.bottom-navigation__item--active .bottom-navigation__icon {
  @apply text-brand-aqua;
}
</style>
