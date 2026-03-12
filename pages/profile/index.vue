<template>
  <div class="mobile-container min-h-screen bg-umu-gradient pb-8">
    <header class="flex items-center justify-between px-4 pt-5">
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center"
        @click="goBack"
      >
        <Icon
          name="i-heroicons-chevron-left"
          class="w-[15px] h-[15px] text-black"
        />
      </button>
      <h1
        class="w-[82.85px] h-[22px] font-sf-pro text-[17px] leading-[22px] tracking-[-0.43px] font-[20px]t-center text-black"
      >
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
            :src="profile?.avatarUrl || '/op-icons/temp/profilepic.png'"
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

        <h2 class="mt-8 text-22-emphasized text-center text-[#000000]">
          {{ fullName || 'Your Profile' }}
        </h2>
        <p
          class="mt-1 font-sf-pro text-[15px] leading-[20px] tracking-[-0.23px] radius font-normal text-center text-[#3C3C43] opacity-60%"
        >
          {{ profile?.email || '' }}
        </p>

        <button
          type="button"
          class="mt-6 h-14 px-8 rounded-full border border-brand-aqua text-brand-aqua inline-flex items-center justify-center font-sf-pro text-[15px] leading-[20px] tracking-[-0.4px] font-[590] border-color-[#00A19A] text-[#00A19A]"
        >
          Member since {{ memberSince }}
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
          :class="getPreferenceItemClass(item)"
          @click="onPreferenceClick(item)"
        >
          <div class="w-7 h-7 flex items-center justify-center text-[#1f2024]">
            <OPIcon :name="item.icon" class="w-[15px] h-[15px]" />
          </div>

          <div class="flex-1 min-w-0">
            <p :class="getPreferenceTitleClass(item)">
              {{ item.title }}
            </p>
            <p
              class="mt-1 font-sf-pro text-[13px] leading-[18px] tracking-[-0.08px] font-normal text-[#7f8084] align-middle text-start"
            >
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
        class="mt-8 w-full h-[50px] rounded-[12px] pt-[14px] pr-[20px] pb-[14px] pl-[20px] bg-brand-aqua text-white inline-flex items-center justify-center gap-[4px] text-[17px] leading-[38px] font-medium"
        @click="logout"
      >
        Log Out
      </button>
    </main>
  </div>
</template>

<script setup>
import OPIcon from "~/components/ui/OPIcon.vue";

definePageMeta({
  title: "My Profile - UmovingU",
});

const { profile, fullName, memberSince, fetchProfile } = useProfile();

onMounted(fetchProfile);

const searchQuery = ref("");

const profileItems = [
  {
    title: "Your Personal Information",
    description: "Manage how we know and communicate with you.",
    icon: "personalInformation",
    route: "/profile/personal-information",
  },
  {
    title: "Collaborators",
    description:
      "Invite, manage, and control who you work with across your property journey.",
    icon: "collaborators",
    route: "/profile/property-information",
  },
  {
    title: "Your Documents",
    description: "View and manage your essential property documents.",
    icon: "yourDocuments",
  },
  {
    title: "Downloaded Snapshots",
    description:
      "Easily export all your downloaded snapshots into formats such as PDF.",
    icon: "Snapshots",
  },
  {
    title: "Saved Properties",
    description: "All your saved and recently viewed properties, organized.",
    icon: "SavedProperties",
  },
  {
    title: "Billing & Payment History",
    description: "Manage your subscription, invoices, and payment methods.",
    icon: "BillingPaymentHistory",
  },
  {
    title: "Settings",
    description: "Customize your experience, privacy, and account security.",
    icon: "Settings",
  },
  {
    title: "Help & Support",
    description: "Need help? Browse FAQs or speak to support.",
    icon: "HelpSupport",
  },
  {
    title: "Calendar",
    description: "Stay on top of viewings, deadlines, and reminders.",
    icon: "Calendar",
  },
  {
    title: "Learn & Ask AI",
    description: "Get expert guidance and answers at any step.",
    icon: "learnAskAI",
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

const getPreferenceItemClass = (item) => {
  if (item.title === "Your Personal Information") {
    return "w-full h-[84px] bg-[#f6f6f7] rounded-[16px] border border-[0.33px] border-[#d9dae0] pt-[14px] pr-[12px] pb-[14px] pl-[20px] flex items-center gap-[8px] line-height-[20px]";
  }

  return "w-full bg-[#f6f6f7] rounded-3xl px-5 py-4 flex items-center gap-4 text-left";
};

const getPreferenceTitleClass = (item) => {
  if (item.title === "Your Personal Information") {
    return "font-sf-pro text-start text-[15px] leading-[20px] tracking-[-0.23px] font-normal text-[#1f2024] align-middle";
  }

  return "font-sf-pro text-start text-[15px] leading-[20px] tracking-[-0.23px] font-normal text-[#1f2024] align-middle";
};

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
