<template>
  <img 
    :src="iconPath" 
    class="op-icon"
    :class="props.class" 
    :alt="`${name} icon`"
  />
</template>

<script setup lang="ts">
// Naming things is hard! OPIcon - OpenPropertyIcon

interface Props {
  name: string;
  class?: string;
}
const defaultClasses = 'w-5 h-5'
const props = withDefaults(defineProps<Props>(), {
  class: defaultClasses
});

const iconPath = (() => {
  const iconMap: Record<string, string> = {
    'logo': '/op-icons/logo.svg',
    'user-code': '/op-icons/User-Code.svg',
    'check': '/op-icons/Check.svg',
    'home-search': '/op-icons/Home-Search.svg',
    'building-community': '/op-icons/Building-Community.svg',
  };
  
  return iconMap[props.name] || '/op-icons/default.svg';
})();
</script> 