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
        class="font-sf-pro text-[17px]-emphasized leading-[22px] tracking-[-0.43px] font-[590] text-[#000000] text-center"
      >
        Collaborators
      </h1>

      <button
        type="button"
        class="w-9 h-9 rounded-full bg-[#403D91] text-white flex items-center justify-center"
        aria-label="More"
      >
        <Icon
          name="i-heroicons-ellipsis-horizontal"
          class="w-5 h-5 text-white"
        />
      </button>
    </header>

    <main class="px-4 pb-6">
      <section class="pt-7 text-center">
        <div class="avatar-stack">
          <div
            v-for="person in summaryCollaborators"
            :key="person.name"
            class="summary-avatar"
          >
            <img
              v-if="person.avatar"
              :src="person.avatar"
              :alt="person.name"
              class="w-full h-full rounded-full object-cover"
            />
            <span v-else class="text-[26px]">{{ person.emoji }}</span>
          </div>
        </div>

        <h2
          class="mt-4 text-[20px] leading-[25px] font-semibold text-[#000000]"
        >
          {{ collaborators.length }} Collaborators
        </h2>

        <p
          class="inline-flex mt-2 rounded-full bg-[#7878801F] opacity-12 px-4 h-8 items-center text-brand-aqua font-semibold text-[11px] leading-[13px]"
        >
          OWNER: {{ ownerName }}
        </p>

        <p
          class="mt-3 text-[15px] leading-[20px] tracking-[-0.23px] text-[#3C3C4399] opacity-60%"
        >
          Team Members: {{ collaborators.length }} • Partners:
          {{ partnerCount }} • Clients: {{ clientCount }} • Pending:
          {{ pendingCount }}
        </p>
      </section>

      <section class="mt-6 flex items-center gap-2">
        <div
          class="h-14 rounded-2xl bg-white/90 border border-gray-200 px-4 flex items-center gap-3 flex-1"
        >
          <Icon
            name="i-heroicons-magnifying-glass"
            class="w-6 h-6 text-gray-400"
          />
          <input
            v-model="searchText"
            type="text"
            placeholder="Search collaborators"
            class="w-full bg-transparent outline-none text-[17px]-regular leading-[22px] tracking-[-0.43px] text-[#3C3C4399] opacity-90 placeholder:text-gray-400"
          />
        </div>

        <button
          type="button"
          class="w-14 h-14 rounded-2xl bg-brand-aqua text-white flex items-center justify-center"
          aria-label="Open filters"
        >
          <Icon
            name="i-heroicons-adjustments-horizontal"
            class="text-[15px] leading-[20px]"
          />
        </button>
      </section>

      <div class="h-px w-[calc(100%+2rem)] -ml-4 bg-gray-200" />

      <section class="mt-8">
        <button
          type="button"
          class="w-full bg-white rounded-3xl p-5 text-left flex items-center justify-between"
          @click="openCollaboratorTypeModal"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="w-[16px] h-[22px] rounded-full bg-brand-aqua/10 text-brand-aqua inline-flex items-center justify-center"
            >
              <Icon name="i-heroicons-user-plus" class="w-5 h-5" />
            </span>
            <div>
              <p
                class="text-brand-aqua text-[15px]-regular w-400 leading-[20px] tracking-[-0.23px] font-medium"
              >
                Add Collaborators
              </p>
              <p
                class="mt-1 text-brand-aqua text-[13px]-regular leading-[18px] tracking-[-0.08px] w-400 font-normal"
              >
                Add agents, brokers, assistants, or partners
              </p>
            </div>
          </div>

          <Icon
            name="i-heroicons-chevron-right"
            class="w-5 h-5 text-[#3C3C434D]"
          />
        </button>
      </section>

      <section class="mt-7">
        <h3
          class="text-[15px]-emphasized leading-[20px] font-sf pro text-[#000000] font-[590] tracking-[-0.23px ]"
        >
          Collaborators
        </h3>
        <p
          class="mt-1 text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C4399] opacity-60%"
        >
          All Team Members
        </p>

        <div class="mt-4 space-y-4">
          <article
            v-for="person in filteredCollaborators"
            :key="person.name"
            class="bg-white rounded-3xl p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-3 min-w-0">
                <div
                  class="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 self-center"
                >
                  <img
                    v-if="person.avatar"
                    :src="person.avatar"
                    :alt="person.name"
                    class="w-14 h-14 object-cover"
                  />
                  <span v-else class="text-2xl">{{ person.emoji }}</span>
                </div>

                <div class="min-w-0">
                  <p
                    class="text-[14px]-regular leading-[20px] text-[#000000] tracking-[-0.23px] w-400 font-medium truncate"
                  >
                    {{ person.name }}
                  </p>
                  <p
                    class="mt-1 text-[13px]-regular leading-[18px] text-gray-400"
                  >
                    {{ person.role }}
                  </p>

                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      class="h-6 px-3 rounded-lg bg-brand-aqua text-white inline-flex items-center justify-center gap-2 text-[32px]-regular leading-[22px]"
                    >
                      <Icon
                        name="i-heroicons-check-badge"
                        class="text-[11px] leading-[13px]"
                      />
                    </span>

                    <span
                      class="h-7 px-3 rounded-lg bg-brand-aqua/10 text-brand-aqua inline-flex items-center gap-2 text-[11px]-regular leading-[13px]"
                    >
                      <Icon
                        name="i-heroicons-home"
                        class="text-[11px] leading-[13px]"
                      />
                      {{ person.properties }} Properties
                    </span>

                    <span
                      class="h-7 px-3 rounded-lg bg-brand-aqua/10 text-brand-aqua inline-flex items-center gap-2 text-[11px]-regular leading-[13px]"
                    >
                      <Icon
                        name="i-heroicons-user-group"
                        class="text-[11px] leading-[13px]"
                      />
                      {{ person.sharedClients }} Shared
                      {{ person.sharedClients === 1 ? "Client" : "Clients" }}
                    </span>

                    <span
                      class="h-7 px-3 rounded-lg bg-brand-aqua/10 text-brand-aqua inline-flex items-center text-[11px]-regular leading-[13px]"
                    >
                      {{ person.accessLevel }}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="w-25px h-25px shrink-0 self-center text-gray-300 inline-flex items-center justify-center"
                :aria-label="`Open ${person.name}`"
              >
                <Icon
                  name="i-heroicons-chevron-right"
                  class="w-5 h-5 text-[#3C3C434D]"
                />
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>

    <div
      v-if="showCollaboratorTypeModal"
      class="fixed inset-0 z-50 bg-black/30 flex items-end"
      @click.self="closeCollaboratorTypeModal"
    >
      <div class="w-full rounded-t-[34px] bg-[#f2f2f7] px-4 pt-3 pb-6">
        <div class="w-[72px] h-[6px] rounded-full bg-[#3c3c43]/30 mx-auto" />

        <div class="mt-4 flex justify-end">
          <button
            type="button"
            class="w-12 h-12 rounded-full bg-black/10 inline-flex items-center justify-center"
            @click="closeCollaboratorTypeModal"
            aria-label="Close"
          >
            <Icon name="i-heroicons-x-mark" class="w-7 h-7 text-black/40" />
          </button>
        </div>

        <h3
          class="mt-2 text-[18px]-semibold leading-[24px] font-Plus Jakarta Sans text-[#171717]"
        >
          Collaborator Type
        </h3>
        <p class="mt-2 text-[15px]-regular leading-[20px] text-[#3c3c43]/60">
          Assign type of partnership to this account...
        </p>

        <div class="mt-7 grid grid-cols-2 gap-3">
          <button
            v-for="option in collaboratorTypeOptions"
            :key="option.key"
            type="button"
            class="rounded-3xl bg-white px-4 py-6 min-h-[170px] border text-center"
            :class="
              selectedCollaboratorType === option.key
                ? 'border-brand-aqua border-[3px]'
                : 'border-[#d1d1d6]'
            "
            @click="selectedCollaboratorType = option.key"
          >
            <Icon
              name="i-heroicons-user-group"
              class="w-[15px] h-[20px] mx-auto text-[#3C3C43]/60"
            />
            <p
              class="mt-3 text-[17px]-regular leading-[22px] font-semibold text-[#3C3C43]/60 tracking-[-0.43px]"
            >
              {{ option.title }}
            </p>
            <p
              class="mt-2 text-[13px]-regular leading-[18px] text-[#3C3C43]/60 tracking-[-0.08px]"
            >
              {{ option.description }}
            </p>
          </button>
        </div>

        <button
          type="button"
          class="mt-8 w-full h-14 rounded-2xl bg-brand-aqua text-white text-[20px] leading-[24px] font-medium"
          @click="continueCollaboratorType"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Collaborators - UmovingU",
});

const { fetchCollaborators, removeCollaborator } = useProfile();

const searchText = ref("");
const collaborators = ref([]);

const loadCollaborators = async () => {
  try {
    const data = await fetchCollaborators();
    collaborators.value = data.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role || "Collaborator",
      type: c.role || "partner",
      properties: 0,
      sharedClients: 0,
      accessLevel: c.permission === "all" ? "Full Access" : "Limited",
      status: "active",
      avatar: c.avatarUrl || null,
    }));
  } catch {
    // list stays empty
  }
};

onMounted(loadCollaborators);

const ownerName = computed(() => "You");

const partnerCount = computed(
  () => collaborators.value.filter((p) => p.type === "partner").length,
);

const clientCount = computed(
  () => collaborators.value.filter((p) => p.type === "client").length,
);

const pendingCount = computed(
  () => collaborators.value.filter((p) => p.status === "pending").length,
);

const filteredCollaborators = computed(() => {
  if (!searchText.value.trim()) return collaborators.value;
  const query = searchText.value.toLowerCase();
  return collaborators.value.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.role.toLowerCase().includes(query),
  );
});

const summaryCollaborators = computed(() => collaborators.value.slice(0, 4));

const showCollaboratorTypeModal = ref(false);
const selectedCollaboratorType = ref("referrals");

const collaboratorTypeOptions = [
  {
    key: "solicitor",
    title: "Solicitor",
    description:
      "Share with your solicitor so they can access the property information needed for the legal process.",
  },
  {
    key: "partner",
    title: "Partner",
    description:
      "Share with your partner so they can view and manage your property details with you.",
  },
  {
    key: "estate-agent",
    title: "Estate Agent",
    description:
      "Give your estate agent access to the property details they need to help move the sale forward.",
  },
  {
    key: "mortgage-broker",
    title: "Mortgage Broker",
    description:
      "Share with your mortgage broker so they can view your property details and support your mortgage application.",
  },
];

const openCollaboratorTypeModal = () => {
  showCollaboratorTypeModal.value = true;
};

const closeCollaboratorTypeModal = () => {
  showCollaboratorTypeModal.value = false;
};

const continueCollaboratorType = () => {
  showCollaboratorTypeModal.value = false;
  navigateTo(`/profile/add-collaborator?type=${selectedCollaboratorType.value}`);
};

const goBack = () => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
    return;
  }
  navigateTo("/profile");
};
</script>

<style scoped>
.avatar-stack {
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-avatar {
  width: 118px;
  height: 118px;
  flex: 0 0 auto;
  border-radius: 9999px;
  border: 8px solid #ffffff;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

.summary-avatar + .summary-avatar {
  margin-left: -18px;
}
</style>
