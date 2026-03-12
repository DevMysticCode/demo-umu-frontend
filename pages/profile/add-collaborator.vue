<template>
  <div class="mobile-container min-h-screen bg-umu-gradient pb-8">
    <header class="flex items-center justify-between px-4 pt-5">
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center"
        @click="goBack"
      >
        <Icon name="i-heroicons-chevron-left" class="w-6 h-6 text-gray-900" />
      </button>

      <h1
        class="text-[17px]-emphasized leading-[22px] tracking-[-0.43px] font-semibold text-black"
      >
        Collaborators
      </h1>

      <button
        type="button"
        class="w-9 h-9 rounded-full bg-[#403D91] text-white flex items-center justify-center"
        aria-label="More"
      >
        <Icon name="i-heroicons-ellipsis-horizontal" class="w-5 h-5" />
      </button>
    </header>

    <main class="pt-7">
      <section class="px-4 text-center">
        <div class="flex items-center justify-center">
          <div
            class="w-[96px] h-[96px] rounded-full border-[6px] border-white overflow-hidden bg-white"
          >
            <img
              src="/op-icons/temp/profilepic.png"
              alt="Owner profile"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            class="w-[96px] h-[96px] rounded-full border-[6px] border-white bg-[#f2f2f7] -ml-2 flex items-center justify-center text-brand-aqua"
          >
            <Icon name="i-heroicons-user-plus" class="w-11 h-11" />
          </div>
        </div>

        <h2
          class="mt-5 text-[20px]-emphasized leading-[25px] font-semibold text-[#000000] tracking-[-0.45px]"
        >
          Lets add your Collaborator
        </h2>
        <p
          class="mt-2 text-[15px]-regular leading-[20px] tracking-[-0.23px] text-[#3C3C43] opacity-60%"
        >
          Please fill following form to add your partner...
        </p>
      </section>

      <div class="h-px bg-gray-200 mt-8" />

      <section class="px-4 mt-6 space-y-6">
        <div>
          <h3
            class="text-[15px]-emphasized leading-[20px] font-semibold text-[#000000] tracking-[-0.23px]"
          >
            Contact Information
          </h3>

          <div class="mt-3 space-y-3">
            <label
              class="h-14 rounded-2xl bg-white px-4 flex items-center gap-3"
            >
              <Icon
                name="i-heroicons-user-circle"
                class="w-6 h-6 text-gray-400"
              />
              <input
                v-model="fullName"
                type="text"
                placeholder="Enter Full Name"
                class="w-full bg-transparent outline-none text-[17px] leading-[22px] text-[#101319] placeholder:text-[#8f9094]"
              />
            </label>

            <label
              class="h-14 rounded-2xl bg-white px-4 flex items-center gap-3"
            >
              <Icon name="i-heroicons-envelope" class="w-6 h-6 text-gray-400" />
              <input
                v-model="email"
                type="email"
                placeholder="Enter Email Address"
                class="w-full bg-transparent outline-none text-[17px] leading-[22px] text-[#101319] placeholder:text-[#8f9094]"
              />
            </label>
          </div>
        </div>

        <div>
          <h3
            class="text-[15px]-emphasized leading-[20px] font-semibold text-[#000000] tracking-[-0.23px]"
          >
            Permissions
          </h3>
          <p
            class="text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-60% mt-1"
          >
            What can they access?
          </p>

          <div class="mt-3 space-y-3">
            <button
              type="button"
              class="option-row"
              @click="permission = 'all'"
            >
              <span :class="radioClass(permission === 'all')">
                <Icon
                  v-if="permission === 'all'"
                  name="i-heroicons-check"
                  class="w-4 h-4 text-white"
                />
              </span>
              <span class="option-text">All Properties</span>
            </button>

            <button
              type="button"
              class="option-row"
              @click="permission = 'specific'"
            >
              <span :class="radioClass(permission === 'specific')" />
              <span class="option-text">Specific Properties</span>
              <span
                @click.stop="openPropertyModal"
                class="ml-auto h-10 px-4 rounded-[14px] bg-[#f2f2f7] text-brand-aqua inline-flex items-center text-[17px] leading-[22px] cursor-pointer"
              >
                Select
              </span>
            </button>

            <button
              type="button"
              class="option-row"
              @click="permission = 'later'"
            >
              <span :class="radioClass(permission === 'later')">
                <Icon
                  v-if="permission === 'later'"
                  name="i-heroicons-check"
                  class="w-4 h-4 text-white"
                />
              </span>
              <span class="option-text">Assign Later</span>
            </button>
          </div>
        </div>

        <div>
          <h3
            class="text-[15px]-emphasized leading-[20px] font-semibold text-[#000000] tracking-[-0.23px]"
          >
            Access Duration
          </h3>
          <p
            class="text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-60% mt-1"
          >
            How long should they have access?
          </p>

          <div class="mt-3 space-y-3">
            <button
              type="button"
              class="option-row"
              @click="accessDuration = 'permanent'"
            >
              <span :class="radioClass(accessDuration === 'permanent')">
                <Icon
                  v-if="accessDuration === 'permanent'"
                  name="i-heroicons-check"
                  class="w-4 h-4 text-white"
                />
              </span>
              <span class="option-text"
                >Permanent Access - Until Cancelled</span
              >
            </button>

            <button
              type="button"
              class="option-row"
              @click="accessDuration = 'expiry'"
            >
              <span :class="radioClass(accessDuration === 'expiry')" />
              <span class="option-text">Set Expiration Date</span>
              <span
                class="ml-auto h-10 px-4 rounded-[14px] bg-[#f2f2f7] text-brand-aqua inline-flex items-center text-[17px] leading-[22px]"
              >
                March 2026
              </span>
            </button>
          </div>
        </div>

        <div>
          <h3
            class="text-[15px]-emphasized leading-[20px] font-semibold text-[#000000] tracking-[-0.23px]"
          >
            Additional Preferences
          </h3>
          <p
            class="text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-60% mt-1"
          >
            Client Access
          </p>

          <div class="mt-3 space-y-3">
            <button
              type="button"
              class="option-row"
              @click="clientAccess = 'shared'"
            >
              <span :class="radioClass(clientAccess === 'shared')">
                <Icon
                  v-if="clientAccess === 'shared'"
                  name="i-heroicons-check"
                  class="w-4 h-4 text-white"
                />
              </span>
              <span class="option-text">Shared Clients Only</span>
            </button>

            <button
              type="button"
              class="option-row"
              @click="clientAccess = 'all'"
            >
              <span :class="radioClass(clientAccess === 'all')" />
              <span class="option-text">All Clients</span>
            </button>

            <button
              type="button"
              class="option-row"
              @click="clientAccess = 'none'"
            >
              <span :class="radioClass(clientAccess === 'none')" />
              <span class="option-text">No Client Access</span>
            </button>
          </div>
        </div>

        <div>
          <h3
            class="text-[15px]-emphasized leading-[20px] font-semibold text-[#000000] tracking-[-0.23px]"
          >
            Communications
          </h3>

          <div
            class="mt-3 h-14 rounded-2xl bg-white px-4 flex items-center justify-between"
          >
            <span class="text-[17px] leading-[22px] text-[#1f2024]"
              >Allow Communications</span
            >
            <button
              type="button"
              class="relative w-12 h-7 rounded-full transition-colors"
              :class="allowCommunications ? 'bg-brand-aqua' : 'bg-[#d1d1d6]'"
              @click="allowCommunications = !allowCommunications"
            >
              <span
                class="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform"
                :class="
                  allowCommunications
                    ? 'translate-x-[-2px]'
                    : 'translate-x-[-20px]'
                "
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          class="w-full h-[50px] rounded-2xl bg-brand-aqua text-white text-[17px]-regular leading-[22px] tracking-[-0.43px] font-medium"
          @click="openSaveModal"
        >
          Save
        </button>
      </section>
    </main>

    <div
      v-if="showPropertyModal"
      class="fixed inset-0 z-50 bg-black/25 flex items-end"
      @click.self="closePropertyModal"
    >
      <div
        class="w-full rounded-t-[34px] bg-[#f2f2f7] px-4 pt-3 pb-6 min-h-[86vh] flex flex-col"
      >
        <div class="w-[72px] h-[6px] rounded-full bg-[#3c3c43]/30 mx-auto" />

        <div class="mt-4 flex justify-end">
          <button
            type="button"
            class="w-12 h-12 rounded-full bg-black/10 inline-flex items-center justify-center"
            @click="closePropertyModal"
            aria-label="Close"
          >
            <Icon name="i-heroicons-x-mark" class="w-7 h-7 text-black/40" />
          </button>
        </div>

        <h3
          class="mt-2 text-[17px]-regular leading-[22px] tracking-[-0.43px] font-semibold text-[#171717]"
        >
          Select Properties
        </h3>
        <p
          class="mt-2 text-[15px]-regular leading-[20px] tracking-[-0.23px] text-[#3C3C43]/60 max-w-[340px]"
        >
          Please specify the properties you want to share.
        </p>

        <div class="mt-6 flex items-center gap-2">
          <div
            class="h-14 rounded-2xl bg-white border border-gray-200 px-4 flex items-center gap-3 flex-1"
          >
            <Icon
              name="i-heroicons-magnifying-glass"
              class="w-6 h-6 text-gray-400"
            />
            <input
              v-model="propertySearch"
              type="text"
              placeholder="Search properties"
              class="w-full bg-transparent outline-none text-[17px]-regular leading-[22px] tracking-[-0.43px] text-[#1f2024] placeholder:text-[#8f9094]"
            />
          </div>

          <button
            type="button"
            class="w-14 h-14 rounded-2xl bg-brand-aqua text-white flex items-center justify-center"
            aria-label="Filter properties"
          >
            <Icon name="i-heroicons-adjustments-horizontal" class="w-6 h-6" />
          </button>
        </div>

        <div class="mt-6 space-y-3 flex-1 overflow-auto pb-4">
          <button
            v-for="property in filteredProperties"
            :key="property.id"
            type="button"
            class="w-full rounded-[28px] border border-[#e5e5ea] bg-white px-4 py-5 flex items-center gap-4 text-left"
            @click="toggleProperty(property.id)"
          >
            <span :class="propertyRadioClass(property.selected)">
              <Icon
                v-if="property.selected"
                name="i-heroicons-check"
                class="w-5 h-5 text-white"
              />
            </span>

            <span class="min-w-0">
              <span
                class="block text-[17px] leading-[22px] tracking-[-0.43px] text-[#000000] font-regular"
              >
                {{ property.title }}
              </span>
              <span
                class="block mt-1 text-[15px] leading-[20px] tracking-[-0.23px] text-[#3c3c43] opacity-60% font-regular"
              >
                {{ property.address }}
              </span>
              <span
                class="block text-[13px] leading-[18px] tracking-[-0.08px] text-[#3c3c43] opacity-60% font-regular"
              >
                {{ property.postcode }}
              </span>
            </span>
          </button>
        </div>

        <p class="mt-2 text-center text-brand-aqua text-[17px] leading-[22px]">
          {{ selectedPropertyCount }} of {{ properties.length }} Properties
          Selected
        </p>

        <button
          type="button"
          class="mt-4 w-full h-[70px] rounded-2xl bg-brand-aqua text-white text-[20px] leading-[24px] font-medium"
          @click="continuePropertySelection"
        >
          Continue
        </button>
      </div>
    </div>

    <div
      v-if="showSaveModal"
      class="fixed inset-0 z-[60] bg-black/35 flex items-end"
      @click.self="closeSaveModal"
    >
      <div
        class="w-full rounded-t-[34px] bg-[#f2f2f7] px-4 pt-3 pb-8 min-h-[88vh] flex flex-col"
      >
        <div class="w-[72px] h-[6px] rounded-full bg-[#3c3c43]/25 mx-auto" />

        <div class="mt-3 flex justify-end">
          <button
            type="button"
            class="w-11 h-11 rounded-full bg-black/10 inline-flex items-center justify-center"
            @click="closeSaveModal"
            aria-label="Close"
          >
            <Icon name="i-heroicons-x-mark" class="w-6 h-6 text-black/35" />
          </button>
        </div>

        <h3
          class="mt-2 text-center text-[17px]-regular leading-[22px] tracking-[-0.43px] font-semibold text-[#171717]"
        >
          Partner Added
        </h3>
        <p
          class="mt-3 text-center text-[15px]-regular leading-[20px] tracking-[-0.23px] text-[#3C3C43]/60 px-6"
        >
          Partner added successfully! They'll receive an invitation email
          shortly.
        </p>

        <div class="mt-6 flex items-center justify-center">
          <div
            class="w-[97px] h-[97px] rounded-full border-[8px] border-white overflow-hidden bg-black"
          >
            <img
              src="/op-icons/temp/profilepic.png"
              alt="Partner avatar"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            class="w-[97px] h-[97px] rounded-full border-[8px] border-white bg-[#f2f2f7] -ml-6 flex items-center justify-center"
          >
            <img
              src="/op-icons/temp/paul.svg"
              alt="Partner avatar"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <div class="mt-8 space-y-3">
          <button
            type="button"
            class="w-full h-[78px] rounded-[30px] bg-white border border-[#d8d8dd] px-6 flex items-center"
            @click="copyShareLink"
          >
            <Icon
              name="i-heroicons-link"
              class="w-[15px] h-[20px] tracking-[-0.23px] font-regular text-brand-aqua"
            />
            <span
              class="ml-4 text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#000000]"
              >Copy share link</span
            >
            <Icon
              name="i-heroicons-document-duplicate"
              class="ml-auto w-[16px] h-[21px] text-[#3c3c43] opacity-30%"
            />
          </button>

          <button
            type="button"
            class="w-full h-[78px] rounded-[30px] bg-white border border-[#d8d8dd] px-6 flex items-center"
          >
            <Icon
              name="i-heroicons-arrow-up-tray"
              class="w-[15px] h-[20px] tracking-[-0.23px] font-regular text-brand-aqua"
            />
            <span
              class="ml-4 text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#000000]"
              >Open Share Menu</span
            >
          </button>

          <button
            type="button"
            class="w-full h-[78px] rounded-[30px] bg-white border border-[#d8d8dd] px-6 flex items-center"
          >
            <Icon
              name="i-heroicons-qr-code"
              class="w-[15px] h-[20px] tracking-[-0.23px] font-regular text-brand-aqua"
            />
            <span
              class="ml-4 text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#000000]"
              >Download Share QR Code</span
            >
          </button>
        </div>

        <button
          type="button"
          class="mt-4 w-full h-[50px] rounded-[22px] bg-brand-aqua text-white text-[17px]-regular leading-[22px] tracking-[-0.43px] font-regular"
          @click="closeSaveModal"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Add Collaborator - UmovingU",
});

const fullName = ref("");
const email = ref("");

const permission = ref("all");
const accessDuration = ref("permanent");
const clientAccess = ref("shared");
const allowCommunications = ref(true);
const showPropertyModal = ref(false);
const showSaveModal = ref(false);
const propertySearch = ref("");

const properties = ref([
  {
    id: 1,
    title: "21 Kingston Road",
    address: "Leacroft, Staines-Upon-Thames",
    postcode: "TW18 4NJ",
    selected: true,
  },
  {
    id: 2,
    title: "134, The Summit",
    address: "University Road, Leicester",
    postcode: "LE2 7WT",
    selected: true,
  },
  {
    id: 3,
    title: "21, Rochester",
    address: "Earlsdon, C",
    postcode: "CV5 6AB",
    selected: false,
  },
]);

const radioClass = (selected) => {
  if (selected) {
    return "w-8 h-8 rounded-full bg-brand-aqua inline-flex items-center justify-center";
  }

  return "w-8 h-8 rounded-full border-[3px] border-brand-aqua inline-flex items-center justify-center";
};

const propertyRadioClass = (selected) => {
  if (selected) {
    return "w-8 h-8 rounded-full bg-brand-aqua inline-flex items-center justify-center shrink-0";
  }

  return "w-8 h-8 rounded-full border-[5px] border-[#8e8e93] inline-flex items-center justify-center shrink-0";
};

const filteredProperties = computed(() => {
  if (!propertySearch.value.trim()) {
    return properties.value;
  }

  const query = propertySearch.value.toLowerCase();
  return properties.value.filter((property) => {
    return (
      property.title.toLowerCase().includes(query) ||
      property.address.toLowerCase().includes(query) ||
      property.postcode.toLowerCase().includes(query)
    );
  });
});

const selectedPropertyCount = computed(
  () => properties.value.filter((property) => property.selected).length,
);

const openPropertyModal = () => {
  permission.value = "specific";
  showPropertyModal.value = true;
};

const closePropertyModal = () => {
  showPropertyModal.value = false;
};

const toggleProperty = (propertyId) => {
  properties.value = properties.value.map((property) => {
    if (property.id === propertyId) {
      return {
        ...property,
        selected: !property.selected,
      };
    }

    return property;
  });
};

const continuePropertySelection = () => {
  showPropertyModal.value = false;
};

const openSaveModal = () => {
  showSaveModal.value = true;
};

const closeSaveModal = () => {
  showSaveModal.value = false;
  navigateTo("/profile/collabarot-information");
};

const copyShareLink = async () => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(window.location.href);
  }
};

const goBack = () => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
    return;
  }

  navigateTo("/profile/collabarot-information");
};
</script>

<style scoped>
.option-row {
  width: 100%;
  min-height: 72px;
  border-radius: 18px;
  background: #ffffff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}

.option-text {
  font-size: 17px;
  line-height: 22px;
  color: #1f2024;
}
</style>
