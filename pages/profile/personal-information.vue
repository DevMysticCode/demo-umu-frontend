<template>
  <div class="mobile-container min-h-screen bg-umu-gradient pb-8">
    <header class="flex items-center justify-between px-4 pt-5">
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center"
        @click="goBack"
      >
        <Icon name="i-heroicons-chevron-left" class="w-6 h-6 text-black" />
      </button>

      <h1
        class="font-sf-pro text-[17px] leading-[22px] tracking-[-0.43px] font-[590] text-black text-center"
      >
        Personal Information
      </h1>

      <button
        type="button"
        class="w-8 h-8 rounded-full bg-[#403d91] flex items-center justify-center"
        aria-label="More"
      >
        <Icon
          name="i-heroicons-ellipsis-horizontal"
          class="w-5 h-5 text-white"
        />
      </button>
    </header>

    <main class="px-4 pb-8">
      <section class="pt-6 text-center">
        <img
          :src="profile?.avatarUrl || '/op-icons/temp/profilepic.png'"
          alt="Profile avatar"
          class="w-24 h-24 rounded-full object-cover mx-auto"
        />

        <h2 class="mt-8 text-22-emphasized text-center text-[#000000]">
          {{ fullName || 'Your Profile' }}
        </h2>
        <p
          class="mt-1 font-sf-pro text-[15px] leading-[20px] tracking-[-0.23px] font-normal text-center text-[#3C3C43] opacity-60%"
        >
          {{ profile?.email || '' }}
        </p>

        <div
          class="mt-5 inline-flex items-center gap-2 px-4 h-11 rounded-full border border-brand-aqua text-brand-aqua text-xl font-medium"
        >
          <Icon name="i-heroicons-star" class="w-4 h-4" />
          <span>PRO · Member since {{ memberSince }}</span>
        </div>
      </section>

      <div class="mt-8 space-y-6">
        <!-- Name and Contact Details -->
        <section>
          <h3
            class="font-sf-pro text-[15px] leading-[20px] tracking-[-0.23px] font-[590] align-middle text-[#101319] mb-3"
          >
            Name and Contact Details
          </h3>

          <div class="space-y-3">
            <div
              v-for="(item, index) in contactDetails"
              :key="item.label"
              class="bg-[#ffffff] rounded-3xl p-4 flex items-start justify-between gap-3"
            >
              <div>
                <p class="text-[15px] leading-[20px] text-[#000000]">
                  {{ item.label }}
                </p>
                <p class="text-[13px] leading-[18px] text-[#3C3C4399]">
                  {{ item.value || '—' }}
                </p>
              </div>
              <button
                type="button"
                class="w-9 h-9 rounded-full border border-[#d9dae0] text-[#1f2024] flex items-center justify-center mt-1"
                @click="openContactEditor(index)"
              >
                <Icon name="i-heroicons-pencil" class="w-4 h-4" />
              </button>
            </div>

            <!-- Contact Visibility toggle -->
            <div
              class="bg-[#ffffff] rounded-3xl p-4 flex items-center justify-between"
            >
              <p class="text-[15px] leading-[20px] text-[#000000]">
                Contact Visibility
              </p>
              <button
                type="button"
                class="relative w-12 h-7 rounded-full transition-colors"
                :class="contactVisible ? 'bg-brand-aqua' : 'bg-[#d9dae0]'"
                @click="toggleContactVisible"
              >
                <span
                  class="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform"
                  :class="
                    contactVisible
                      ? 'translate-x-[-2px]'
                      : 'translate-x-[-20px]'
                  "
                />
              </button>
            </div>
          </div>
        </section>

        <!-- Address / Location Details -->
        <section>
          <h3
            class="text-[15px] leading-[20px] text-[#000000] font-semibold mb-3"
          >
            Address / Location Details
          </h3>

          <div class="space-y-3">
            <div
              v-for="addr in profile?.addresses ?? []"
              :key="addr.id"
              class="bg-[#ffffff] rounded-3xl p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[15px] leading-[20px] text-[#000000]">
                    {{ addr.label }}
                  </p>
                  <p
                    class="text-[13px] leading-[18px] text-[#3C3C43] mt-2 whitespace-pre-line"
                  >
                    {{ formatAddress(addr) }}
                  </p>
                </div>

                <div class="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    class="w-9 h-9 rounded-full border border-[#d9dae0] text-[#1f2024] flex items-center justify-center"
                    @click="openAddressEditor(addr)"
                  >
                    <Icon name="i-heroicons-pencil" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="w-9 h-9 rounded-full bg-brand-aqua text-white flex items-center justify-center"
                    @click="handleDeleteAddress(addr.id)"
                  >
                    <Icon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Add Address button -->
            <button
              type="button"
              class="w-full bg-[#ffffff] rounded-3xl p-4 flex items-center gap-3 text-brand-aqua"
              @click="openAddressEditor(null)"
            >
              <Icon name="i-heroicons-plus-circle" class="w-5 h-5" />
              <span class="text-[15px] leading-[20px] font-medium">Add Address</span>
            </button>
          </div>
        </section>

        <!-- Registered Company Details -->
        <section>
          <h3
            class="text-[15px] leading-[20px] font-semibold text-[#000000] mb-3"
          >
            Registered Company Details
          </h3>

          <div class="space-y-3">
            <div
              v-for="company in profile?.companies ?? []"
              :key="company.id"
              class="bg-[#ffffff] rounded-3xl p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[15px] leading-[20px] font-semibold text-[#000000]">
                    {{ company.name }}
                  </p>
                  <p class="text-[13px] leading-[18px] text-[#3C3C43] mt-2 whitespace-pre-line">
                    {{ company.address }}
                  </p>
                  <div class="mt-3 text-[13px] leading-[18px] text-[#3C3C43]">
                    <p v-if="company.companyNumber">
                      <span class="inline-block w-18">Company Number:</span>
                      {{ company.companyNumber }}
                    </p>
                    <p v-if="company.director">
                      <span class="inline-block w-12">Director:</span> {{ company.director }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    class="w-9 h-9 rounded-full border border-[#d9dae0] text-[#1f2024] flex items-center justify-center"
                    @click="openCompanyEditor(company)"
                  >
                    <Icon name="i-heroicons-pencil" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="w-9 h-9 rounded-full bg-brand-aqua text-white flex items-center justify-center"
                    @click="handleDeleteCompany(company.id)"
                  >
                    <Icon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="w-full bg-[#ffffff] rounded-3xl p-4 flex items-center gap-3 text-brand-aqua"
              @click="openCompanyEditor(null)"
            >
              <Icon name="i-heroicons-plus-circle" class="w-5 h-5" />
              <span class="text-[15px] leading-[20px] font-medium">Add Company</span>
            </button>
          </div>
        </section>

        <!-- Seller / Solicitor -->
        <section>
          <h3
            class="text-[15px] leading-[20px] font-semibold text-[#000000] mb-3"
          >
            Seller / Solicitor
          </h3>

          <div class="space-y-3">
            <div
              v-for="sol in profile?.solicitors ?? []"
              :key="sol.id"
              class="bg-[#ffffff] rounded-3xl p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[15px] leading-[20px] font-semibold text-[#000000]">
                    {{ sol.name }}
                  </p>
                  <p class="text-[13px] leading-[18px] text-[#3C3C43] mt-2 whitespace-pre-line">
                    {{ sol.address }}
                  </p>
                  <div class="mt-3 text-[13px] leading-[18px] text-[#3C3C43]">
                    <p v-if="sol.contactName">
                      <span class="inline-block w-18">Contact Name:</span> {{ sol.contactName }}
                    </p>
                    <p v-if="sol.email">
                      <span class="inline-block w-12">Email:</span> {{ sol.email }}
                    </p>
                    <p v-if="sol.phone">
                      <span class="inline-block w-12">Phone:</span> {{ sol.phone }}
                    </p>
                    <p v-if="sol.reference">
                      <span class="inline-block w-12">Reference:</span> {{ sol.reference }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    class="w-9 h-9 rounded-full border border-[#d9dae0] text-[#1f2024] flex items-center justify-center"
                    @click="openSolicitorEditor(sol)"
                  >
                    <Icon name="i-heroicons-pencil" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="w-9 h-9 rounded-full bg-brand-aqua text-white flex items-center justify-center"
                    @click="handleDeleteSolicitor(sol.id)"
                  >
                    <Icon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="w-full bg-[#ffffff] rounded-3xl p-4 flex items-center gap-3 text-brand-aqua"
              @click="openSolicitorEditor(null)"
            >
              <Icon name="i-heroicons-plus-circle" class="w-5 h-5" />
              <span class="text-[15px] leading-[20px] font-medium">Add Solicitor</span>
            </button>
          </div>
        </section>

        <!-- Communication Preferences -->
        <section>
          <h3
            class="text-[15px] leading-[20px] font-semibold text-[#000000] mb-3"
          >
            Communication Preferences
          </h3>
          <div class="space-y-3">
            <div
              v-for="item in communicationPreferences"
              :key="item.key"
              class="bg-[#ffffff] rounded-3xl p-4 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <Icon :name="item.icon" class="w-5 h-5 text-[#1f2024]" />
                <p class="text-[15px] leading-[20px] text-[#000000]">
                  {{ item.label }}
                </p>
              </div>

              <button
                type="button"
                class="relative w-12 h-7 rounded-full transition-colors"
                :class="item.value ? 'bg-brand-aqua' : 'bg-[#d9dae0]'"
                @click="toggleCommsPreference(item.key)"
              >
                <span
                  class="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform"
                  :class="
                    item.value ? 'translate-x-[-2px]' : 'translate-x-[-20px]'
                  "
                />
              </button>
            </div>
          </div>
        </section>

        <!-- Identity Verification -->
        <section>
          <h3
            class="text-[15px] leading-[20px] font-semibold text-[#000000] mb-3"
          >
            Identity Verification
          </h3>

          <div
            class="bg-[#ffffff] rounded-3xl p-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <Icon
                name="i-heroicons-check-badge"
                class="w-6 h-6 text-brand-aqua"
              />
              <div>
                <p class="text-[15px] leading-[20px] text-[#000000]">
                  Verification Status
                </p>
                <p
                  class="text-base text-[12px] leading-[15px] text-[#3C3C43] uppercase tracking-wide"
                >
                  {{ profile?.isVerified ? 'Verified' : 'Not Verified' }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="h-10 px-4 rounded-full border border-[#cfd1d8] text-[#3C3C43] font-jakarta font-semibold text-[13px] leading-[16px] tracking-[0px] text-center align-middle inline-flex items-center justify-center"
            >
              Reverify
            </button>
          </div>
        </section>
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

        <label class="mt-6 block">
          <span class="sr-only">Edit value</span>
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
              :placeholder="`Enter New ${contactEditLabel}`"
              class="w-full bg-transparent outline-none text-[16px] leading-[22px] text-[#1f2024] placeholder:text-[#8e8e93]"
            />
          </div>
        </label>
      </div>

      <template #footer>
        <button
          type="button"
          class="w-full h-14 rounded-[16px] bg-brand-aqua text-white inline-flex items-center justify-center gap-2 text-[20px] leading-[24px] font-medium"
          :disabled="saving"
          @click="saveContactEdit"
        >
          <Icon name="i-heroicons-check" class="w-6 h-6" />
          <span>{{ saving ? 'Saving…' : 'Save Changes' }}</span>
        </button>
      </template>
    </BaseDrawer>

    <!-- Address Edit Drawer -->
    <BaseDrawer
      v-model="isAddressDrawerOpen"
      :title="editingAddress?.id ? 'Edit Address' : 'Add Address'"
      :show-back-button="false"
    >
      <div class="pt-1 pb-2 space-y-4">
        <div
          v-for="field in addressFields"
          :key="field.key"
          class="h-16 rounded-[20px] border border-[#e2e2e7] bg-[#f4f4f5] flex items-center gap-3 px-5"
        >
          <input
            v-model="editingAddress[field.key]"
            :placeholder="field.label"
            class="w-full bg-transparent outline-none text-[16px] leading-[22px] text-[#1f2024] placeholder:text-[#8e8e93]"
          />
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="w-full h-14 rounded-[16px] bg-brand-aqua text-white inline-flex items-center justify-center gap-2 text-[20px] leading-[24px] font-medium"
          :disabled="saving"
          @click="saveAddress"
        >
          <Icon name="i-heroicons-check" class="w-6 h-6" />
          <span>{{ saving ? 'Saving…' : 'Save Address' }}</span>
        </button>
      </template>
    </BaseDrawer>

    <!-- Company Edit Drawer -->
    <BaseDrawer
      v-model="isCompanyDrawerOpen"
      :title="editingCompany?.id ? 'Edit Company' : 'Add Company'"
      :show-back-button="false"
    >
      <div class="pt-1 pb-2 space-y-4">
        <div
          v-for="field in companyFields"
          :key="field.key"
          class="h-16 rounded-[20px] border border-[#e2e2e7] bg-[#f4f4f5] flex items-center gap-3 px-5"
        >
          <input
            v-model="editingCompany[field.key]"
            :placeholder="field.label"
            class="w-full bg-transparent outline-none text-[16px] leading-[22px] text-[#1f2024] placeholder:text-[#8e8e93]"
          />
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="w-full h-14 rounded-[16px] bg-brand-aqua text-white inline-flex items-center justify-center gap-2 text-[20px] leading-[24px] font-medium"
          :disabled="saving"
          @click="saveCompany"
        >
          <Icon name="i-heroicons-check" class="w-6 h-6" />
          <span>{{ saving ? 'Saving…' : 'Save Company' }}</span>
        </button>
      </template>
    </BaseDrawer>

    <!-- Solicitor Edit Drawer -->
    <BaseDrawer
      v-model="isSolicitorDrawerOpen"
      :title="editingSolicitor?.id ? 'Edit Solicitor' : 'Add Solicitor'"
      :show-back-button="false"
    >
      <div class="pt-1 pb-2 space-y-4">
        <div
          v-for="field in solicitorFields"
          :key="field.key"
          class="h-16 rounded-[20px] border border-[#e2e2e7] bg-[#f4f4f5] flex items-center gap-3 px-5"
        >
          <input
            v-model="editingSolicitor[field.key]"
            :placeholder="field.label"
            class="w-full bg-transparent outline-none text-[16px] leading-[22px] text-[#1f2024] placeholder:text-[#8e8e93]"
          />
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="w-full h-14 rounded-[16px] bg-brand-aqua text-white inline-flex items-center justify-center gap-2 text-[20px] leading-[24px] font-medium"
          :disabled="saving"
          @click="saveSolicitor"
        >
          <Icon name="i-heroicons-check" class="w-6 h-6" />
          <span>{{ saving ? 'Saving…' : 'Save Solicitor' }}</span>
        </button>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup>
import BaseDrawer from "@/components/ui/BaseDrawer.vue";

definePageMeta({
  title: "Personal Information - UmovingU",
});

const {
  profile,
  fullName,
  memberSince,
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
} = useProfile();

onMounted(fetchProfile);

const saving = ref(false);

// ─── Contact Details ──────────────────────────────────────────────────────

const contactDetails = computed(() => [
  { label: "Name", value: fullName.value, key: "name" },
  { label: "Email Address", value: profile.value?.email ?? "", key: "email" },
  { label: "Phone Number", value: profile.value?.phone ?? "", key: "phone" },
]);

const contactVisible = computed(() => profile.value?.contactVisible ?? true);

const toggleContactVisible = async () => {
  if (!profile.value) return;
  await updateProfile({ contactVisible: !profile.value.contactVisible });
};

const isContactDrawerOpen = ref(false);
const activeContactIndex = ref(null);
const contactEditValue = ref("");

const contactEditLabel = computed(() => {
  if (activeContactIndex.value === null) return "Value";
  return contactDetails.value[activeContactIndex.value]?.label ?? "Value";
});

const contactEditInputType = computed(() => {
  const label = contactEditLabel.value.toLowerCase();
  if (label.includes("email")) return "email";
  if (label.includes("phone")) return "tel";
  return "text";
});

const openContactEditor = (index) => {
  activeContactIndex.value = index;
  contactEditValue.value = contactDetails.value[index]?.value ?? "";
  isContactDrawerOpen.value = true;
};

const saveContactEdit = async () => {
  if (activeContactIndex.value === null) return;
  saving.value = true;

  try {
    const key = contactDetails.value[activeContactIndex.value]?.key;
    if (key === "name") {
      const parts = contactEditValue.value.trim().split(/\s+/);
      await updateProfile({
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") || undefined,
      });
    } else if (key === "phone") {
      await updateProfile({ phone: contactEditValue.value });
    }
    // email edits are intentionally skipped (auth concern)
    isContactDrawerOpen.value = false;
  } finally {
    saving.value = false;
  }
};

// ─── Communication Preferences ────────────────────────────────────────────

const communicationPreferences = computed(() => [
  {
    key: "pushNotifications",
    label: "In-App Push Notifications",
    icon: "i-heroicons-bell",
    value: profile.value?.pushNotifications ?? true,
  },
  {
    key: "emailNewsletter",
    label: "Email Newsletter",
    icon: "i-heroicons-envelope",
    value: profile.value?.emailNewsletter ?? true,
  },
  {
    key: "smsNotifications",
    label: "SMS",
    icon: "i-heroicons-chat-bubble-left",
    value: profile.value?.smsNotifications ?? false,
  },
]);

const toggleCommsPreference = async (key) => {
  if (!profile.value) return;
  await updateProfile({ [key]: !profile.value[key] });
};

// ─── Address ─────────────────────────────────────────────────────────────

const isAddressDrawerOpen = ref(false);
const editingAddress = ref({});

const addressFields = [
  { key: "label", label: "Label (e.g. Current Address)" },
  { key: "line1", label: "Address Line 1" },
  { key: "line2", label: "Address Line 2 (optional)" },
  { key: "city", label: "City" },
  { key: "county", label: "County" },
  { key: "postcode", label: "Postcode" },
];

const formatAddress = (addr) =>
  [addr.line1, addr.line2, addr.city, addr.county, addr.postcode]
    .filter(Boolean)
    .join("\n");

const openAddressEditor = (addr) => {
  editingAddress.value = addr ? { ...addr } : { label: "", line1: "", postcode: "" };
  isAddressDrawerOpen.value = true;
};

const saveAddress = async () => {
  saving.value = true;
  try {
    if (editingAddress.value.id) {
      await updateAddress(editingAddress.value.id, editingAddress.value);
    } else {
      await createAddress(editingAddress.value);
    }
    isAddressDrawerOpen.value = false;
  } finally {
    saving.value = false;
  }
};

const handleDeleteAddress = async (id) => {
  await deleteAddress(id);
};

// ─── Company ─────────────────────────────────────────────────────────────

const isCompanyDrawerOpen = ref(false);
const editingCompany = ref({});

const companyFields = [
  { key: "name", label: "Company Name" },
  { key: "address", label: "Address" },
  { key: "companyNumber", label: "Company Number" },
  { key: "director", label: "Director" },
];

const openCompanyEditor = (company) => {
  editingCompany.value = company ? { ...company } : { name: "" };
  isCompanyDrawerOpen.value = true;
};

const saveCompany = async () => {
  saving.value = true;
  try {
    if (editingCompany.value.id) {
      await updateCompany(editingCompany.value.id, editingCompany.value);
    } else {
      await createCompany(editingCompany.value);
    }
    isCompanyDrawerOpen.value = false;
  } finally {
    saving.value = false;
  }
};

const handleDeleteCompany = async (id) => {
  await deleteCompany(id);
};

// ─── Solicitor ───────────────────────────────────────────────────────────

const isSolicitorDrawerOpen = ref(false);
const editingSolicitor = ref({});

const solicitorFields = [
  { key: "name", label: "Firm Name" },
  { key: "address", label: "Address" },
  { key: "contactName", label: "Contact Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "reference", label: "Reference" },
];

const openSolicitorEditor = (sol) => {
  editingSolicitor.value = sol ? { ...sol } : { name: "" };
  isSolicitorDrawerOpen.value = true;
};

const saveSolicitor = async () => {
  saving.value = true;
  try {
    if (editingSolicitor.value.id) {
      await updateSolicitor(editingSolicitor.value.id, editingSolicitor.value);
    } else {
      await createSolicitor(editingSolicitor.value);
    }
    isSolicitorDrawerOpen.value = false;
  } finally {
    saving.value = false;
  }
};

const handleDeleteSolicitor = async (id) => {
  await deleteSolicitor(id);
};

// ─── Navigation ───────────────────────────────────────────────────────────

const goBack = () => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
    return;
  }
  navigateTo("/profile");
};
</script>
