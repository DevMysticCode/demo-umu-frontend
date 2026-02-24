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
  addressSearch: '/images/addressSearch.png',
  search: '/op-icons/search.svg',
  passwordShow: '/op-icons/passwordShow.svg',
  passwordHide: '/op-icons/passwordHide.svg',
  checkboxUnchecked: '/op-icons/checkboxUnchecked.svg',
  checkboxChecked: '/op-icons/checkboxChecked.svg',
  explore: '/op-icons/bottom-nav/explore.svg',
  passport: '/op-icons/bottom-nav/passport.svg',
  marketplace: '/op-icons/bottom-nav/marketplace.svg',
  rewards: '/op-icons/bottom-nav/rewards.svg',
  learn: '/op-icons/bottom-nav/learn.svg',
  propertySearch: '/op-icons/explore/propertySearch.png',
  accessPassport: '/op-icons/property-nav/accessPassport.svg',
  registerInterest: '/op-icons/property-nav/registerInterest.svg',
  saveProperty: '/op-icons/property-nav/saveProperty.svg',
  tapOwner: '/op-icons/property-nav/tapOwner.svg',
  buyer: '/op-icons/passportview/buyer.svg',
  seller: '/op-icons/passportview/seller.svg',
  pin: '/op-icons/passportview/pin.svg',
  caretDown: '/op-icons/passportview/caretDown.svg',
  addCollaborator: '/op-icons/passportview/addCollaborator.svg',
  list: '/op-icons/passportview/list.svg',
  map: '/op-icons/passportview/map.svg',
  caretRight: '/op-icons/passportview/caretRight.svg',
  instructions: '/op-icons/passportview/instructions.svg',
  ownershipProfile: '/op-icons/passportview/instructions.svg',
  boundaries: '/op-icons/passportview/boundaries.svg',
  disputesAndComplaints: '/op-icons/passportview/disputes-and-complaints.svg',
  noticesAndProposals: '/op-icons/passportview/notices-and-proposals.svg',
  alterationsAndPlanning: '/op-icons/passportview/alterations-and-planning.svg',
  guaranteesAndWarranties:
    '/op-icons/passportview/guarantees-and-warranties.svg',
  insurance: '/op-icons/passportview/insurance.svg',
  environmental: '/op-icons/passportview/environmental.svg',
  rightsAndInformalArrangements:
    '/op-icons/passportview/rights-and-informal-arrangements.svg',
  parking: '/op-icons/passportview/parking.svg',
  otherCharges: '/op-icons/passportview/other-charges.svg',
  occupiers: '/op-icons/passportview/occupiers.svg',
  services: '/op-icons/passportview/services.svg',
  transactionInformation: '/op-icons/passportview/transaction-information.svg',
  fixturesAndFittings: '/op-icons/passportview/fixture-and-fittings.svg',
  leasehold: '/op-icons/passportview/leasehold.svg',
  titleDeedsAndPlan: '/op-icons/passportview/title-deeds-and-plan.svg',
  searches: '/op-icons/passportview/searches.svg',
  info: '/op-icons/passportview/steps/info.svg',
  playIcon: '/op-icons/passportview/steps/play-icon.svg',
  rewardBox: '/op-icons/passportview/steps/rewardBox.svg',
  appleNew: '/icons/AppleNewIcon.svg',
  googleNew: '/icons/GoogleNewIcon.svg',
  facebookNew: '/icons/FacebookNewIcon.svg',
  leftChevronWhite: '/icons/leftChevronWhite.svg',
  wishlist: '/icons/wishlist.svg',
  share: '/icons/share.svg',
  messages: '/op-icons/property/messages.svg',
  airdrop: '/op-icons/property/airdrop.svg',
  instagram: '/op-icons/property/instagram.svg',
  messagesLight: '/op-icons/property/messagesLight.svg',
  whatsapp: '/op-icons/property/whatsapp.svg',
  matchToBuyers: '/op-icons/passportview/matchToBuyers.svg',
  pending: '/op-icons/passportview/pending.svg',
  upload: '/op-icons/passportview/upload.svg',
  scan: '/op-icons/passportview/scan.svg',
  underReview: '/op-icons/passportview/steps/underReview.svg',
  infoCircle: '/op-icons/passportview/steps/infoCircle.svg',
  expertIcon: '/op-icons/passportview/steps/expertIcon.svg',
  progressMan: '/op-icons/passportview/progressMan.svg',
  roadLeftToRight: '/op-icons/passportview/roadLeftToRight.svg',
  roadRightToLeft: '/op-icons/passportview/roadRightToLeft.svg',
  giftIcon: '/op-icons/passportview/giftIcon.svg',
  mapBackgroundTile: '/op-icons/passportview/mapBackgroundTile.svg',
  pointsLock: '/op-icons/passportview/pointsLock.svg',
  lightBulb: '/op-icons/passportview/lightBulb.svg',
  addMoreButton: '/op-icons/passportview/addMoreButton.svg',
  backgroundImage: '/op-icons/backgroundImage.jpeg',
  pendingCircle: '/op-icons/passportview/pendingCircle.svg',
  boundariesMap: '/op-icons/passportview/boundariesMap.svg',
  ownershipProfileNotes: '/op-icons/passportview/ownershipProfileNotes.svg',
  visitLink: '/op-icons/passportview/visitLink.svg',
  helpIcon: '/op-icons/passportview/steps/helpIcon.svg',
}

const iconPath = computed(() => {
  return iconMap[props.name] || '/op-icons/default.svg'
})
</script>
