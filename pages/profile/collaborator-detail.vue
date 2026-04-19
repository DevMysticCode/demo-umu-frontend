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
        class="font-sf-pro text-[17px] leading-[22px] tracking-[-0.43px] font-[590] text-black text-center truncate max-w-[200px]"
      >
        {{ collaborator?.name || 'Collaborator' }}
      </h1>

      <button
        type="button"
        class="w-8 h-8 rounded-full bg-[#403d91] flex items-center justify-center"
        aria-label="More"
      >
        <Icon name="i-heroicons-ellipsis-horizontal" class="w-5 h-5 text-white" />
      </button>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center pt-24">
      <Icon name="i-heroicons-arrow-path" class="w-10 h-10 text-brand-aqua animate-spin" />
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="px-4 pt-16 text-center">
      <p class="text-red-500 text-[15px]">{{ loadError }}</p>
      <button type="button" class="mt-4 text-brand-aqua text-[15px]" @click="load">Try again</button>
    </div>

    <main v-else-if="collaborator" class="px-4 pb-8">
      <!-- Profile header -->
      <section class="pt-6">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h2 class="text-[22px] leading-[28px] font-semibold text-black tracking-[-0.45px]">
              {{ collaborator.name }}
            </h2>
            <p class="text-[15px] leading-[20px] tracking-[-0.23px] text-[#3C3C43]/60 truncate">
              {{ collaborator.email }}
            </p>
            <p class="text-[12px] leading-[16px] text-[#3C3C43]/60">
              Joined {{ joinedLabel }}
            </p>
            <div class="mt-5 flex items-center gap-3 flex-wrap">
              <span
                class="h-9 px-4 rounded-full bg-gray-200 text-brand-aqua text-[11px] leading-[13px] font-semibold inline-flex items-center"
              >
                ACTIVE
              </span>
              <span class="text-brand-aqua text-[11px] leading-[13px] tracking-[0.06px] font-semibold uppercase">
                {{ roleLabel }}
              </span>
            </div>
          </div>

          <div class="w-[97px] h-[97px] rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
            <img
              v-if="collaborator.avatarUrl"
              :src="collaborator.avatarUrl"
              :alt="collaborator.name"
              class="w-full h-full object-cover"
            />
            <Icon v-else name="i-heroicons-user" class="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <div class="mt-8 flex items-center gap-8">
          <button
            type="button"
            class="w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center shrink-0"
            aria-label="Message"
          >
            <Icon name="i-heroicons-chat-bubble-left-ellipsis" class="w-6 h-6 text-brand-aqua" />
          </button>

          <button
            type="button"
            class="w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center shrink-0"
            aria-label="Call"
          >
            <Icon name="i-heroicons-phone-arrow-up-right" class="w-6 h-6 text-brand-aqua" />
          </button>

          <button
            type="button"
            class="flex-1 h-[50px] rounded-[12px] bg-brand-aqua text-white text-[17px] leading-[22px] font-medium inline-flex items-center justify-center gap-2"
          >
            <Icon name="i-heroicons-arrow-up-on-square" class="w-5 h-5" />
            Share Access
          </button>
        </div>
      </section>

      <!-- Shared Properties -->
      <section class="mt-10">
        <h3 class="text-[15px] leading-[20px] tracking-[-0.23px] font-semibold text-black">
          Shared Properties
        </h3>
        <p class="mt-1 text-[13px] leading-[18px] tracking-[-0.08px] text-[#3C3C43]/60">
          <template v-if="collaborator.permission === 'all'">All your properties</template>
          <template v-else-if="collaborator.permission === 'specific'">{{ collaborator.sharedPassports.length }} {{ collaborator.sharedPassports.length === 1 ? 'Property' : 'Properties' }} Shared</template>
          <template v-else>Not assigned yet</template>
        </p>

        <div v-if="collaborator.sharedPassports.length > 0" class="mt-4 space-y-3">
          <div
            v-for="passport in collaborator.sharedPassports"
            :key="passport.id"
            class="bg-white rounded-3xl px-4 py-3 flex items-center gap-3"
          >
            <img
              src="/images/addressSearch.png"
              alt="Map preview"
              class="w-[56px] h-[56px] rounded-[6px] object-cover"
            />

            <div class="flex-1 min-w-0">
              <p class="text-[17px] leading-[22px] tracking-[-0.43px] font-medium text-black truncate">
                {{ passport.addressLine1 }}
              </p>
              <p class="text-[13px] leading-[18px] tracking-[-0.08px] text-gray-500 truncate">
                {{ passport.address }}
              </p>
              <p class="text-[13px] leading-[18px] tracking-[-0.08px] text-gray-500">
                {{ passport.postcode }}
              </p>
            </div>

            <button
              type="button"
              class="w-[24px] h-[24px] rounded-full border border-gray-200 flex items-center justify-center"
              aria-label="Property actions"
            >
              <Icon name="i-heroicons-ellipsis-horizontal" class="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        <div v-else class="mt-4 bg-white rounded-3xl px-6 py-5">
          <p class="text-[15px] text-[#3C3C43]/60 text-center">
            <template v-if="collaborator.permission === 'later'">Properties not assigned yet.</template>
            <template v-else>No shared properties.</template>
          </p>
        </div>
      </section>

      <!-- Permissions & Access -->
      <section class="mt-10">
        <h3 class="text-[15px] leading-[20px] tracking-[-0.23px] font-semibold text-black">
          Permissions &amp; Access
        </h3>

        <div class="mt-4 space-y-3">
          <!-- Property Access -->
          <div class="bg-white rounded-3xl px-6 py-5 flex items-center justify-between">
            <div>
              <p class="text-[15px] leading-[20px] tracking-[-0.23px] text-black">Property Access</p>
              <p class="text-[13px] leading-[18px] tracking-[-0.08px] text-[#3C3C43]/60 mt-0.5">
                {{ propertyAccessLabel }}
              </p>
            </div>
            <span class="h-8 px-3 rounded-full bg-brand-aqua/10 text-brand-aqua text-[12px] font-medium inline-flex items-center">
              {{ permissionChip }}
            </span>
          </div>

          <!-- Client Access -->
          <div class="bg-white rounded-3xl px-6 py-5 flex items-center justify-between">
            <p class="text-[15px] leading-[20px] tracking-[-0.23px] text-black">Client Access</p>
            <span class="h-8 px-3 rounded-full bg-brand-aqua/10 text-brand-aqua text-[12px] font-medium inline-flex items-center">
              {{ clientAccessLabel }}
            </span>
          </div>

          <!-- Allow Communications -->
          <div class="bg-white rounded-3xl px-6 py-5 flex items-center justify-between">
            <p class="text-[15px] leading-[20px] tracking-[-0.23px] text-black">Communications</p>
            <span
              class="h-8 px-3 rounded-full text-[12px] font-medium inline-flex items-center"
              :class="collaborator.allowComms ? 'bg-brand-aqua/10 text-brand-aqua' : 'bg-gray-100 text-gray-500'"
            >
              {{ collaborator.allowComms ? 'Allowed' : 'Disabled' }}
            </span>
          </div>

          <!-- Access Duration -->
          <div class="bg-white rounded-3xl px-6 py-5 flex items-center justify-between">
            <div>
              <p class="text-[15px] leading-[20px] tracking-[-0.23px] text-black">Partnership Validity</p>
              <p class="text-[13px] leading-[18px] tracking-[-0.08px] text-[#3C3C43]/60 mt-0.5">
                {{ accessDurationLabel }}
              </p>
            </div>
            <button
              type="button"
              class="h-10 px-5 rounded-full bg-teal-50 text-brand-aqua text-[13px] font-medium"
            >
              Edit
            </button>
          </div>
        </div>
      </section>

      <!-- Remove Collaborator -->
      <section class="mt-10">
        <button
          type="button"
          class="w-full h-14 rounded-2xl bg-white border border-red-200 text-red-500 text-[17px] font-medium flex items-center justify-center gap-2"
          :disabled="removing"
          @click="removeCollab"
        >
          <Icon name="i-heroicons-trash" class="w-5 h-5" />
          {{ removing ? 'Removing...' : 'Remove Collaborator' }}
        </button>
        <p v-if="removeError" class="mt-2 text-center text-red-500 text-[13px]">{{ removeError }}</p>
      </section>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Collaborator Detail - UmovingU",
  middleware: 'auth',
});

const { fetchCollaborator, removeCollaborator } = useProfile();
const route = useRoute();
const collaboratorId = route.query.id;

const collaborator = ref(null);
const loading = ref(false);
const loadError = ref("");
const removing = ref(false);
const removeError = ref("");

const load = async () => {
  if (!collaboratorId) {
    loadError.value = "No collaborator ID provided.";
    return;
  }
  loading.value = true;
  loadError.value = "";
  try {
    collaborator.value = await fetchCollaborator(collaboratorId);
  } catch (e) {
    loadError.value = e?.data?.message || "Failed to load collaborator.";
  } finally {
    loading.value = false;
  }
};

onMounted(load);

// Derived labels
const roleLabels = {
  partner: "Partner",
  solicitor: "Solicitor",
  "estate-agent": "Estate Agent",
  "mortgage-broker": "Mortgage Broker",
};

const roleLabel = computed(() =>
  collaborator.value ? (roleLabels[collaborator.value.role] || collaborator.value.role || "Collaborator") + " Collaborator" : "",
);

const joinedLabel = computed(() => {
  if (!collaborator.value?.joinedAt) return "";
  return new Date(collaborator.value.joinedAt).toLocaleDateString("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
});

const propertyAccessLabel = computed(() => {
  if (!collaborator.value) return "";
  if (collaborator.value.permission === "all") return "Access to all your properties";
  if (collaborator.value.permission === "specific") {
    const count = collaborator.value.sharedPassports?.length ?? 0;
    return `${count} specific ${count === 1 ? "property" : "properties"}`;
  }
  return "Not assigned yet";
});

const permissionChip = computed(() => {
  if (!collaborator.value) return "";
  return { all: "All Properties", specific: "Specific", later: "Assign Later" }[collaborator.value.permission] || "—";
});

const clientAccessLabels = {
  shared: "Shared Clients",
  all: "All Clients",
  none: "No Clients",
};

const clientAccessLabel = computed(() =>
  collaborator.value ? (clientAccessLabels[collaborator.value.clientAccess] || "—") : "",
);

const accessDurationLabel = computed(() => {
  if (!collaborator.value) return "";
  if (collaborator.value.accessDuration === "permanent") return "Permanent — Until Cancelled";
  if (collaborator.value.expiresAt) {
    const d = new Date(collaborator.value.expiresAt);
    return `Expires ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  }
  return "Permanent";
});

// Remove
const removeCollab = async () => {
  if (!collaboratorId) return;
  removing.value = true;
  removeError.value = "";
  try {
    await removeCollaborator(collaboratorId);
    navigateTo("/profile/collaborator-information");
  } catch (e) {
    removeError.value = e?.data?.message || "Failed to remove collaborator.";
  } finally {
    removing.value = false;
  }
};

const goBack = () => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
    return;
  }
  navigateTo("/profile/collaborator-information");
};
</script>
