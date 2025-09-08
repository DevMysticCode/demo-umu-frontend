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
  name: string
  class?: string
}
const defaultClasses = 'w-5 h-5'
const props = withDefaults(defineProps<Props>(), {
  class: defaultClasses,
})

const iconPath = (() => {
  const iconMap: Record<string, string> = {
    logo: '/op-icons/logo.svg',
    'user-code': '/op-icons/User-Code.svg',
    check: '/op-icons/Check.svg',
    'home-search': '/op-icons/Home-Search.svg',
    'building-community': '/op-icons/Building-Community.svg',
    apple: '/op-icons/Apple.svg',
    google: '/op-icons/Google.svg',
    facebook: '/op-icons/Facebook.svg',
    leftChevron: '/op-icons/backButtonIcon.svg',
    'create-account': '/images/createAccount.svg',
    userRegistration: '/op-icons/userRegistration.svg',
    house: '/op-icons/house.svg',
    apartment: '/op-icons/apartment.svg',
    land: '/op-icons/land.svg',
    commercial: '/op-icons/commercial.svg',
    semiDetached: '/op-icons/semiDetached.svg',
    terrace: '/op-icons/terrace.svg',
    singleFloorBungalow: '/op-icons/singleFloorBunglow.svg',
    garden: '/op-icons/garden.svg',
    publicTransport: '/op-icons/publicTransport.svg',
    driveway: '/op-icons/driveway.svg',
    mobileSignal: '/op-icons/mobileSignal.svg',
    goodEnergy: '/op-icons/goodEnergy.svg',
    closeToPublicPark: '/op-icons/closeToPublicPark.svg',
    closeToSchool: '/op-icons/closeToSchool.svg',
    homeOfficeSpace: '/op-icons/homeOfficeSpace.svg',
    radioUnchecked: '/op-icons/radioUnchecked.svg',
    radioChecked: '/op-icons/radioChecked.svg',
  }

  return iconMap[props.name] || '/op-icons/default.svg'
})()
</script>
