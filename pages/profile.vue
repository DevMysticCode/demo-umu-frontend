<template>
  <NuxtPage v-if="!isProfileRoot" />

  <div v-else class="mobile-container min-h-screen bg-umu-gradient pb-8">
    <header class="flex items-center justify-between px-4 pt-5">
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center"
        @click="goBack"
      >
        <Icon name="i-heroicons-chevron-left" class="w-6 h-6 text-black" />
      </button>

      <h1 class="text-[32px] leading-[38px] font-semibold text-black">
        My Profile
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

    <main class="px-5 pb-8">
      <section class="pt-6 text-center">
        <div class="relative w-fit mx-auto">
          <img
            src="/op-icons/temp/profilepic.png"
            alt="Profile avatar"
            class="w-28 h-28 rounded-full object-cover"
          />
          <span
            class="absolute left-1/2 -translate-x-1/2 -bottom-3 bg-brand-aqua text-white text-sm font-semibold rounded-full px-3 py-1 flex items-center gap-1"
          >
            <Icon name="i-heroicons-star" class="w-3 h-3" />
            PRO
          </span>
        </div>

        <h2
          class="mt-8 text-[44px] leading-[52px] font-semibold text-[#101319]"
        >
          Maxine Wilson
        </h2>
        <p class="text-[20px] leading-[24px] text-[#7f8084] mt-1">
          maxinewilson@yahoo.com
        </p>

        <button
          type="button"
          class="mt-6 h-14 px-8 rounded-full border border-brand-aqua text-brand-aqua text-xl leading-6 font-medium"
        >
          Member since 2023
        </button>
      </section>

      <div class="mt-8 flex gap-3 items-center">
        <div class="flex-1 bg-white rounded-2xl h-14 px-4 flex items-center">
          <Icon
            name="i-heroicons-magnifying-glass"
            class="w-6 h-6 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search Preferences"
            class="ml-2 w-full bg-transparent outline-none text-lg placeholder:text-[#8f9094]"
          />
        </div>

        <button
          type="button"
          class="w-14 h-14 rounded-2xl bg-brand-aqua text-white flex items-center justify-center"
          aria-label="Search filters"
        >
          <Icon name="i-heroicons-adjustments-horizontal" class="w-6 h-6" />
        </button>
      </div>

      <div class="mt-8 space-y-3">
        <button
          v-for="item in filteredItems"
          :key="item.title"
          type="button"
          class="w-full bg-[#f6f6f7] rounded-3xl px-5 py-4 flex items-center gap-4 text-left"
          @click="onPreferenceClick(item)"
        >
          <div class="w-7 h-7 flex items-center justify-center text-[#1f2024]">
            <Icon :name="item.icon" class="w-6 h-6" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-[32px] leading-[38px] font-medium text-[#1f2024]">
              {{ item.title }}
            </p>
            <p class="text-[20px] leading-[24px] text-[#7f8084] mt-1">
              {{ item.description }}
            </p>
          </div>

          <Icon
            name="i-heroicons-chevron-right"
            class="w-6 h-6 text-[#b4b5b8]"
          />
        </button>
      </div>

      <button
        type="button"
        class="mt-8 w-full h-[60px] rounded-2xl bg-brand-aqua text-white text-[32px] leading-[38px] font-medium"
        @click="logout"
      >
        Log Out
      </button>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  title: "My Profile - UmovingU",
  alias: "/profile-main",
});

const searchQuery = ref("");
const route = useRoute();
const isProfileRoot = computed(
  () => route.path === "/profile-main" || route.path === "/profile-main/",
);

const profileItems = [
  {
    title: "Your Personal Information",
    description: "Manage how we know and communicate with you.",
    icon: "i-heroicons-user",
    route: "/profile/personal-information",
  },
  {
    title: "Collaborators",
    description:
      "Invite, manage, and control who you work with across your property journey.",
    icon: "i-heroicons-users",
    route: "/profile/property-information",
  },
  {
    title: "Your Documents",
    description: "View and manage your essential property documents.",
    icon: "i-heroicons-document-text",
  },
  {
    title: "Downloaded Snapshots",
    description:
      "Easily export all your downloaded snapshots into formats such as PDF.",
    icon: "i-heroicons-arrow-down-tray",
  },
  {
    title: "Saved Properties",
    description: "All your saved and recently viewed properties, organized.",
    icon: "i-heroicons-heart",
  },
  {
    title: "Billing & Payment History",
    description: "Manage your subscription, invoices, and payment methods.",
    icon: "i-heroicons-credit-card",
  },
  {
    title: "Settings",
    description: "Customize your experience, privacy, and account security.",
    icon: "i-heroicons-cog-6-tooth",
  },
  {
    title: "Help & Support",
    description: "Need help? Browse FAQs or speak to support.",
    icon: "i-heroicons-question-mark-circle",
  },
  {
    title: "Calendar",
    description: "Stay on top of viewings, deadlines, and reminders.",
    icon: "i-heroicons-calendar-days",
  },
  {
    title: "Learn & Ask AI",
    description: "Get expert guidance and answers at any step.",
    icon: "i-heroicons-sparkles",
  },
];

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return profileItems;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return profileItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query),
  );
});

const goBack = () => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
    return;
  }

  navigateTo("/dashboard");
};

const onPreferenceClick = async (item) => {
  if (item.route) {
    await navigateTo(item.route);
  }
};

const logout = async () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
  await navigateTo("/onboarding/signin");
};
</script>
