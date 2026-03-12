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
        Maxine Wilson
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
      <section class="pt-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-22-emphasized text-black">Maxine Wilson</h2>
            <p
              class="font-sf-pro text-[15px] leading-[20px] tracking-[-0.23px] text-[#3C3C43] opacity-60%"
            >
              maxinewilson@yahoo.com
            </p>
            <p
              class="font-sf-pro text-[12px] leading-[16px] tracking-[0px] text-[#3C3C43] opacity-60%"
            >
              Joined June 12, 2023
            </p>
            <div class="mt-5 flex items-center gap-3">
              <span
                class="h-9 px-4 rounded-full bg-gray-200 text-[#00A19A] text-[11px] leading-[13px] font-semibold inline-flex items-center"
              >
                ACTIVE
              </span>
              <span
                class="text-[#00A19A] text-[11px] leading-[13px] tracking-[0.06px] font-semibold"
              >
                CO-LISTING COLLABORATOR
              </span>
            </div>
          </div>

          <img
            src="/op-icons/temp/profilepic.png"
            alt="Profile avatar"
            class="w-[97px] h-[97px] rounded-full object-cover"
          />
        </div>

        <div class="mt-8 flex items-center btn-container">
          <button
            type="button"
            class="w-[50px] h-[50px] rounded-full bg-[#ffffff] flex items-center justify-center shrink-0"
            aria-label="Message"
          >
            <Icon
              name="i-heroicons-chat-bubble-left-ellipsis"
              class="w-17 h-22 text-brand-aqua"
            />
          </button>

          <button
            type="button"
            class="w-[50px] h-[50px] rounded-full bg-[#ffffff] flex items-center justify-center shrink-0"
            aria-label="Call"
          >
            <Icon
              name="i-heroicons-phone-arrow-up-right"
              class="w-17 h-22 text-brand-aqua"
            />
          </button>

          <button
            type="button"
            class="w-[254px] h-[50px] pt-[14px] pr-[20px] pb-[14px] pl-[20px] gap-[4px] rounded-[12px] bg-brand-aqua text-white text-[17px] leading-[22px] font-medium inline-flex items-center justify-center"
          >
            <Icon
              name="i-heroicons-arrow-up-on-square"
              class="w-17 h-22 text-white"
            />
            Share Property
          </button>
        </div>
      </section>

      <section class="mt-10">
        <h3
          class="font-sf-pro text-[15px] leading-[20px] tracking-[-0.23px] font-[590] text-[#000000]"
        >
          Shared Properties
        </h3>
        <p
          class="mt-1 text-[13px] leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-60"
        >
          5 Properties Shared
        </p>

        <div class="mt-4 space-y-3">
          <div
            v-for="property in sharedProperties"
            :key="property.address"
            class="bg-white rounded-3xl px-4 py-3 flex items-center gap-3"
          >
            <img
              src="/images/addressSearch.png"
              alt="Map preview"
              class="w-[56px] h-[56px] rounded-[6px] object-cover"
            />

            <div class="flex-1 min-w-0">
              <p
                class="text-[17px] leading-[22px] tracking-[-0.43px] font-medium text-black truncate"
              >
                {{ property.address }}
              </p>
              <p
                class="text-[13px] leading-[18px] tracking-[-0.08px] text-gray-500 truncate"
              >
                {{ property.area }}
              </p>
              <p
                class="text-[13px] leading-[18px] tracking-[-0.08px] text-gray-500 truncate"
              >
                {{ property.postcode }}
              </p>
            </div>

            <button
              type="button"
              class="w-[24px] h-[24px] rounded-full border border-gray-200 text-[#000000] flex items-center justify-center"
              aria-label="Property actions"
            >
              <Icon name="i-heroicons-ellipsis-horizontal" class="w-13 h-18" />
            </button>
          </div>
        </div>

        <button
          type="button"
          class="mt-4 w-full h-20 rounded-full bg-white px-6 text-brand-aqua text-[15px] leading-[20px] tracking-[-0.23px] font-medium flex items-center justify-between"
        >
          <span>Show all share properties</span>
          <Icon
            name="i-heroicons-chevron-right"
            class="w-[16px] h-[21px] text-[#3C3C43] opacity-80"
          />
        </button>
      </section>

      <section class="mt-10">
        <h3
          class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] font-semibold text-black"
        >
          Permissions &amp; Access
        </h3>

        <div class="mt-4 space-y-3">
          <div
            v-for="permission in permissions"
            :key="permission.label"
            class="bg-white rounded-3xl px-6 py-5 flex items-center justify-between"
          >
            <p class="text-[17px] leading-[22px] tracking-[-0.43px] text-black">
              {{ permission.label }}
            </p>

            <button
              type="button"
              class="relative w-12 h-7 rounded-full transition-colors bg-brand-aqua"
              aria-label="Permission enabled"
            >
              <span
                class="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-white"
              />
            </button>
          </div>

          <div
            class="bg-white rounded-3xl px-6 py-5 flex items-center justify-between"
          >
            <div>
              <p
                class="text-[15px]-regular leading-[20px] tracking-[-0.23px] text-black"
              >
                Partnership Validity
              </p>
              <p
                class="text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-60"
              >
                Until 24 Sep 2025
              </p>
            </div>

            <button
              type="button"
              class="h-12 px-5 rounded-full bg-teal-50 text-brand-aqua text-[15px] leading-[20px] font-medium"
            >
              Edit
            </button>
          </div>
        </div>
      </section>

      <section class="mt-10">
        <h3
          class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] font-semibold text-black"
        >
          Recent Activity
        </h3>

        <div class="mt-4 space-y-3">
          <button
            v-for="activity in recentActivity"
            :key="activity.title"
            type="button"
            class="w-full bg-white rounded-3xl px-6 py-5 flex items-center justify-between text-left"
          >
            <div>
              <p
                class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] text-black"
              >
                {{ activity.title }}
              </p>
              <p
                class="text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-60 mt-1"
              >
                {{ activity.time }}
              </p>
            </div>

            <Icon
              name="i-heroicons-chevron-right"
              class="w-7 h-4 text-gray-400"
            />
          </button>
        </div>

        <button
          type="button"
          class="mt-4 w-full h-20 rounded-full bg-white px-6 text-brand-aqua text-[15px]-regular leading-[20px] tracking-[-0.23px] font-medium flex items-center justify-between"
        >
          <span>Show older activity</span>
          <Icon
            name="i-heroicons-chevron-right"
            class="w-7 h-4 text-gray-400"
          />
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Property Information - UmovingU",
});

const sharedProperties = [
  {
    address: "21, Rochester",
    area: "Earlsdon, Coventry",
    postcode: "CV5 6AB",
  },
  {
    address: "7, London Road",
    area: "Sunninghill, Ascot",
    postcode: "SL5 7BG",
  },
];

const permissions = [
  { label: "View All Properties" },
  { label: "Share Listings" },
  { label: "Client Communications" },
];

const recentActivity = [
  {
    title: "Shared property listing via email",
    time: "1 Day Ago",
  },
  {
    title: "Added New Certificate - EPC May 2025",
    time: "2 Day Ago",
  },
  {
    title: "Updated property details for client",
    time: "3 Day Ago",
  },
];

const goBack = () => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
    return;
  }

  navigateTo("/profile");
};
</script>

<style scoped>
.btn-container {
  gap: 32px;
}
</style>
