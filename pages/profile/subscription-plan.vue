<template>
  <div class="mobile-container min-h-screen bg-umu-gradient pb-10">
    <header class="flex items-center justify-between px-4 pt-5">
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center"
        @click="goBack"
      >
        <Icon name="i-heroicons-chevron-left" class="w-6 h-6 text-black" />
      </button>

      <div />

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

    <main class="px-4 pb-10">
      <section class="pt-5 text-center">
        <div class="relative w-fit mx-auto">
          <img
            src="/op-icons/temp/profilepic.png"
            alt="Profile avatar"
            class="w-[97px] h-[97px] rounded-full object-cover"
          />
          <span
            class="absolute left-1/2 -translate-x-1/2 -bottom-2.5 h-6 px-3 rounded-full bg-brand-aqua text-white text-[11px] leading-[13px] font-semibold inline-flex items-center gap-1"
          >
            <Icon name="i-heroicons-star" class="w-3 h-3" />
            PRO
          </span>
        </div>

        <h1
          class="mt-5 text-[20px]-emphasized leading-[25px] tracking-[-0.45px] font-semibold text-[#000000] text-center"
        >
          Your Subscriptions and plans
        </h1>
        <p
          class="mt-2 text-[15px]-regular leading-[20px] tracking-[-0.23px] text-[#3C3C43] font-sf-pro opacity-60 text-center"
        >
          Your Subscriptions and all payments related
          <br />
          information in one place
        </p>
      </section>

      <section class="mt-8">
        <h2
          class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] font-semibold text-[#000000]"
        >
          Your Plans
        </h2>

        <div class="mt-3 bg-[#f8f8f8] rounded-2xl border border-[#ffffff] p-3">
          <p
            class="text-[12px]-regular leading-[16px] font-sf-pro text-[#3C3C43] opacity-60"
          >
            Your Current Plan
          </p>
          <div class="mt-2 flex items-center justify-between gap-3">
            <div class="min-w-0 flex-1 text-left">
              <p
                class="text-[15px]-regular leading-[20px] tracking-[-0.23px] text-[#000000] font-sf-pro"
              >
                UMU Pro Subscription
              </p>
              <p
                class="text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-60 font-sf-pro"
              >
                £29.99/month
              </p>
              <p
                class="text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-80 font-sf-pro"
              >
                Renews on Sep 15, 2024
              </p>
              <p
                class="text-[11px]-regular leading-[13px] tracking-[-0.06px] text-brand-aqua font-sf-pro"
              >
                Member since March 2024
              </p>
            </div>

            <div class="relative w-[136px] h-[104px] shrink-0 overflow-hidden">
              <img
                src="/op-icons/temp/property-1.svg"
                alt="Property Passport card background"
                class="absolute left-[4px] top-[2px] w-[88px] h-[102px] object-cover"
              />
              <img
                src="/op-icons/temp/property-2.svg"
                alt="Property Passport card"
                class="absolute right-0 top-[12px] w-[88px] h-[92px] object-cover"
              />
            </div>

            <Icon
              name="i-heroicons-chevron-right"
              class="w-5 h-5 text-[#b4b5b8]"
            />
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            class="h-[50px] rounded-2xl bg-[#ffffff] border-[0.33px] border-[#3C3C43] opacity-80 text-[17px]-regular leading-[22px] font-sf-pro tracking-[-0.43px] text-brand-aqua"
          >
            Benefits
          </button>
          <button
            type="button"
            class="h-[50px] rounded-2xl bg-[#ffffff] border-[0.33px] border-[#3C3C43] opacity-80 text-[17px]-regular leading-[22px] font-sf-pro tracking-[-0.43px] text-brand-aqua"
          >
            Manage
          </button>
        </div>
      </section>

      <section class="mt-8">
        <h2
          class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] font-semibold text-[#000000]"
        >
          Stored Payment Methods
        </h2>

        <div class="mt-3 space-y-2.5">
          <div
            v-for="method in paymentMethods"
            :key="method.name"
            class="bg-[#f8f8f8] border border-[#e7e8eb] rounded-2xl p-4 flex items-start justify-between gap-3"
          >
            <div>
              <span
                class="inline-flex h-6 px-3 rounded-full items-center text-[11px]-regular font-sf-pro leading-[13px]"
                :class="
                  method.primary
                    ? 'bg-brand-aqua/15 text-brand-aqua'
                    : 'bg-brand-aqua/15 text-brand-aqua'
                "
              >
                {{ method.primary ? "Primary" : "Secondary" }}
              </span>
              <p
                class="mt-2 text-[15px]-regular leading-[20px] tracking-[-0.23px] text-[#000000] font-sf-pro"
              >
                {{ method.name }}
              </p>
              <p
                class="text-[13px]-emphasized leading-[18px] tracking-[-0.08px] text-[#000000] font-sf-pro"
              >
                •••• •••• •••• {{ method.last4 }}
              </p>
              <p
                class="text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-60 font-sf-pro"
              >
                {{ method.brand }} · Expires {{ method.expiry }}
              </p>
            </div>

            <Icon
              name="i-heroicons-chevron-right"
              class="w-[16px] h-[21px] text-[#3C3C43] opacity-30 mt-6"
            />
          </div>
        </div>

        <div
          class="mt-2.5 bg-[#f8f8f8] border border-[#e7e8eb] rounded-2xl p-4"
        >
          <h3
            class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] font-semibold text-brand-aqua"
          >
            Add New Payment Method
          </h3>
          <p
            class="text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-60 font-sf-pro"
          >
            Choose one of the Supported Payment Methods to get started.
          </p>

          <div class="mt-3 grid grid-cols-4 gap-2.5">
            <div
              v-for="brand in paymentBrands"
              :key="brand"
              class="h-[56px] rounded-2xl border border-[#e2e2e7] flex items-center justify-center px-2 overflow-hidden"
              :class="brand === 'Klarna' ? 'bg-[#FEB4C7]' : 'bg-white'"
            >
              <img
                :src="
                  {
                    Mastercard: '/op-icons/temp/mastercard.svg',
                    VISA: '/op-icons/temp/visa.svg',
                    'Apple Pay': '/op-icons/temp/apple.svg',
                    'G Pay': '/op-icons/temp/gpay.svg',
                    PayPal: '/op-icons/temp/paypal.svg',
                    Klarna: '/op-icons/temp/klarna.svg',
                  }[brand]
                "
                :alt="brand"
                class="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="mt-8">
        <h2
          class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] font-semibold text-[#000000]"
        >
          Transaction History
        </h2>

        <div class="mt-3 space-y-2.5">
          <button
            v-for="transaction in transactions"
            :key="transaction.invoice"
            type="button"
            class="w-full bg-[#f8f8f8] border border-[#e7e8eb] rounded-2xl p-4 flex items-center justify-between gap-3 text-left"
          >
            <div class="flex items-start gap-3 min-w-0">
              <div
                class="w-6 h-6 rounded-md border border-[#d9dae0] flex items-center justify-center mt-5"
              >
                <img
                  src="/op-icons/temp/badge.svg"
                  alt="Transaction badge"
                  class="w-6 h-6 text-[#3c3c43] opacity-60 object-contain"
                />
              </div>

              <div class="min-w-0">
                <span
                  v-if="transaction.badge"
                  class="inline-flex h-6 px-3 rounded-full items-center text-[11px]-regular leading-[13px] bg-brand-aqua/15 text-brand-aqua"
                >
                  {{ transaction.badge }}
                </span>
                <p
                  class="mt-1 text-[15px]-regular leading-[20px] font-sf-pro tracking-[-0.23px] text-[#000000] truncate"
                >
                  Invoice #{{ transaction.invoice }}
                </p>
                <p
                  class="text-[13px]-regular leading-[18px] tracking-[-0.08px] text-[#3C3C43] opacity-60 truncate"
                >
                  {{ transaction.description }}
                </p>
                <p
                  class="text-[11px]-regular font-sf-pro leading-[13px] text-brand-aqua"
                >
                  £{{ transaction.amount }} · {{ transaction.date }}
                </p>
              </div>
            </div>

            <Icon
              name="i-heroicons-chevron-right"
              class="w-[16px] h-[22px] font-sf-pro text-[#3c3c43] opacity-30"
            />
          </button>
        </div>
      </section>

      <section class="mt-8">
        <h2
          class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] font-semibold text-[#000000]"
        >
          Billing Address
        </h2>

        <button
          type="button"
          class="mt-3 w-full bg-[#f8f8f8] border border-[#e7e8eb] rounded-2xl p-4 flex items-start justify-between gap-3 text-left"
        >
          <div>
            <p
              class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] text-[#000000] font-sf-pro"
            >
              12, London Road
            </p>
            <p
              class="text-[13px]-regular leading-[18px] tracking-[-0.08px] font-sf-pro text-[#3C3C43] opacity-80 whitespace-pre-line"
            >
              Kingston-upon-Thames Surrey KN51 78J
            </p>
            <p
              class="text-[11px]-regular leading-[13px] tracking-[-0.06px] font-sf-pro text-brand-aqua"
            >
              Added: August 3, 2023
            </p>
          </div>

          <Icon
            name="i-heroicons-chevron-right"
            class="w-5 h-5 text-[#3C3C43] opacity-30 mt-4"
          />
        </button>

        <button
          type="button"
          class="mt-2.5 w-full h-[52px] rounded-2xl border border-dashed border-brand-aqua bg-brand-aqua/5 text-[13px]-regular leading-[18px] tracking-[-0.08px] font-sf-pro text-brand-aqua flex items-center justify-center gap-2"
        >
          <Icon name="i-heroicons-plus" class="w-[30px] h-[30px]" />
          Add New Billing Address
        </button>
      </section>

      <section class="mt-8">
        <h2
          class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] font-semibold text-[#000000]"
        >
          Billing Preferences
        </h2>

        <div class="mt-3 space-y-2.5">
          <div
            v-for="item in billingSwitches"
            :key="item.label"
            class="bg-[#f8f8f8] border border-[#e7e8eb] rounded-2xl px-4 h-[62px] flex items-center justify-between"
          >
            <p
              class="text-[15px]-regular leading-[20px] tracking-[-0.23px] font-sf-pro text-[#000000]"
            >
              {{ item.label }}
            </p>
            <button
              type="button"
              class="relative w-11 h-7 rounded-full transition-colors"
              :class="item.enabled ? 'bg-brand-aqua' : 'bg-[#d9dae0]'"
              @click="item.enabled = !item.enabled"
            >
              <span
                class="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all"
                :class="item.enabled ? 'right-0.5' : 'left-0.5'"
              />
            </button>
          </div>

          <div
            v-for="item in billingActions"
            :key="item.label"
            class="bg-[#f8f8f8] border border-[#e7e8eb] rounded-2xl px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p
                class="text-[15px]-regular leading-[20px] tracking-[-0.23px] font-sf-pro text-[#000000]"
              >
                {{ item.label }}
              </p>
              <p
                class="text-[13px]-regular leading-[18px] tracking-[-0.08px] font-sf-pro text-[#3C3C43] opacity-60"
              >
                {{ item.value }}
              </p>
            </div>
            <button
              type="button"
              class="h-10 px-4 rounded-xl bg-brand-aqua/10 text-brand-aqua text-[15px] leading-[20px] tracking-[-0.23px] font-sf-pro"
            >
              Change
            </button>
          </div>
        </div>
      </section>

      <section class="mt-8">
        <h2
          class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] font-semibold text-[#000000]"
        >
          Download Preferences
        </h2>

        <div
          class="mt-3 bg-[#f8f8f8] border border-[#e7e8eb] rounded-2xl px-4 py-3 flex items-center justify-between"
        >
          <div>
            <p
              class="text-[15px]-regular leading-[20px] tracking-[-0.23px] font-sf-pro text-[#000000]"
            >
              Format: PDF
            </p>
            <p
              class="text-[13px]-regular leading-[18px] tracking-[-0.08px] font-sf-pro text-[#3C3C43] opacity-60"
            >
              Include: All transaction details
            </p>
          </div>
          <button
            type="button"
            class="h-10 px-4 rounded-xl bg-brand-aqua/10 text-brand-aqua text-[15px] leading-[20px] tracking-[-0.23px] font-sf-pro"
          >
            Change
          </button>
        </div>
      </section>

      <section class="mt-8">
        <h2
          class="text-[15px]-emphasized leading-[20px] tracking-[-0.23px] font-semibold text-[#000000]"
        >
          Security
        </h2>

        <div class="mt-3 space-y-2.5">
          <div
            v-for="item in securitySwitches"
            :key="item.label"
            class="bg-[#f8f8f8] border border-[#e7e8eb] rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <p
              class="text-[15px]-regular leading-[20px] tracking-[-0.23px] font-sf-pro text-[#000000]"
            >
              {{ item.label }}
            </p>
            <button
              type="button"
              class="relative w-11 h-7 rounded-full transition-colors"
              :class="item.enabled ? 'bg-brand-aqua' : 'bg-[#d9dae0]'"
              @click="item.enabled = !item.enabled"
            >
              <span
                class="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all"
                :class="item.enabled ? 'right-0.5' : 'left-0.5'"
              />
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Subscription Plan - UmovingU",
});

const paymentMethods = [
  {
    name: "LLoyds Bank Card",
    last4: "4829",
    brand: "Visa",
    expiry: "12/26",
    primary: true,
  },
  {
    name: "Monzo Bank Card",
    last4: "3398",
    brand: "Mastercard",
    expiry: "11/28",
    primary: false,
  },
];

const paymentBrands = [
  "Mastercard",
  "VISA",
  "Apple Pay",
  "G Pay",
  "PayPal",
  "Klarna",
];

const transactions = [
  {
    invoice: "UMU-2024-0087",
    description: "",
    amount: "29.99",
    date: "Aug 04, 2024",
    badge: "Renewal",
  },
  {
    invoice: "UMU-2024-0086",
    description: "Towards BS Plumbing - Woking",
    amount: "47.98",
    date: "Aug 10, 2024",
    badge: "",
  },
  {
    invoice: "UMU-2024-0085",
    description: "Towards Apex Engineering Works - Surrey",
    amount: "210.00",
    date: "Aug 10, 2024",
    badge: "",
  },
];

const billingSwitches = ref([
  { label: "Billing Email Alerts", enabled: false },
  { label: "Invoice Notifications", enabled: true },
  { label: "Promotional Offers", enabled: true },
]);

const billingActions = [
  { label: "Billing Cycle", value: "Monthly billing (15th of each month)" },
  { label: "Auto-renewal", value: "Auto-renew subscription" },
];

const securitySwitches = ref([
  { label: "Two-factor authentication for payments:", enabled: true },
  { label: "Payment notifications via SMS", enabled: true },
]);

const goBack = () => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
    return;
  }

  navigateTo("/profile");
};
</script>
