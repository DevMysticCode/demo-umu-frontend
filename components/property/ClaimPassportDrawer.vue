<template>
  <BaseDrawer
    :model-value="modelValue"
    title="Claim Property Passport"
    :show-back-button="true"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
  >
    <div class="claim-drawer">
      <!-- Property Preview -->
      <div class="claim-drawer__property">
        <img
          v-if="property?.image"
          :src="property.image"
          :alt="property.addressLine1"
          class="claim-drawer__image"
        />
        <div class="claim-drawer__address">
          <h3 class="claim-drawer__address-line1">
            {{ property?.addressLine1 }}
          </h3>
          <p class="claim-drawer__address-area">
            {{ property?.area }}
            <span v-if="property?.postcode">, {{ property?.postcode }}</span>
          </p>
          <p class="claim-drawer__price">
            {{ property?.priceDisplay }}
            <span class="claim-drawer__price-label">Estimated Value</span>
          </p>
        </div>
      </div>

      <!-- Passport Info -->
      <div class="claim-drawer__info">
        <div class="claim-drawer__info-icon">🏠</div>
        <div>
          <h4 class="claim-drawer__info-title">What is a Property Passport?</h4>
          <p class="claim-drawer__info-body">
            A Property Passport is your property's digital identity — storing
            ownership details, planning history, warranties, and more in one
            secure place. Unlock transparency for buyers and protect your
            investment.
          </p>
        </div>
      </div>

      <!-- Features List -->
      <ul class="claim-drawer__features">
        <li v-for="feat in features" :key="feat" class="claim-drawer__feature">
          <span class="claim-drawer__feature-check">✓</span>
          {{ feat }}
        </li>
      </ul>

      <!-- Simulated Price -->
      <div class="claim-drawer__price-box">
        <span class="claim-drawer__price-amount">£49</span>
        <span class="claim-drawer__price-period">one-time unlock</span>
      </div>

      <!-- Error -->
      <p v-if="errorMsg" class="claim-drawer__error">{{ errorMsg }}</p>

      <!-- CTA Button -->
      <button
        class="claim-drawer__cta"
        :disabled="loading"
        @click="handleClaim"
      >
        <span v-if="loading" class="claim-drawer__spinner" />
        <span v-else>Unlock Passport</span>
      </button>

      <p class="claim-drawer__disclaimer">
        Simulated payment — real payment integration coming soon.
      </p>
    </div>
  </BaseDrawer>
</template>

<script setup lang="ts">
import BaseDrawer from '~/components/ui/BaseDrawer.vue'
import { usePassportClaim } from '~/composables/usePassportClaim'

interface PropertyDisplay {
  id: string
  addressLine1: string
  area?: string
  postcode: string
  priceDisplay?: string
  image?: string
}

const props = defineProps<{
  modelValue: boolean
  property: PropertyDisplay | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  claimed: [passportId: string]
}>()

const { claimPassport } = usePassportClaim()
const loading = ref(false)
const errorMsg = ref('')

const features = [
  'Secure digital ownership record',
  'Planning & building history',
  'Certificates, guarantees & warranties',
  'Boundary & title information',
  'Trusted by solicitors & estate agents',
]

async function handleClaim() {
  if (!props.property) return
  loading.value = true
  errorMsg.value = ''

  try {
    const result = await claimPassport(
      props.property.id,
      props.property.addressLine1,
      props.property.postcode,
    )
    emit('claimed', result.passportId)
    emit('update:modelValue', false)
  } catch (err: any) {
    errorMsg.value =
      err?.data?.message ||
      err?.message ||
      'Failed to claim passport. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.claim-drawer {
  padding: 8px 0 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.claim-drawer__property {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: #f8f8f8;
  border-radius: 14px;
  padding: 12px;
}

.claim-drawer__image {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.claim-drawer__address-line1 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 2px;
}

.claim-drawer__address-area {
  font-size: 13px;
  color: #666;
  margin: 0 0 6px;
}

.claim-drawer__price {
  font-size: 18px;
  font-weight: 700;
  color: #00b8a9;
  margin: 0;
}

.claim-drawer__price-label {
  font-size: 11px;
  font-weight: 400;
  color: #999;
  margin-left: 4px;
}

.claim-drawer__info {
  display: flex;
  gap: 12px;
  background: #e6fbfa;
  border-radius: 14px;
  padding: 14px;
}

.claim-drawer__info-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.claim-drawer__info-title {
  font-size: 14px;
  font-weight: 700;
  color: #00a19a;
  margin: 0 0 6px;
}

.claim-drawer__info-body {
  font-size: 13px;
  color: #444;
  line-height: 1.5;
  margin: 0;
}

.claim-drawer__features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.claim-drawer__feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #333;
}

.claim-drawer__feature-check {
  width: 22px;
  height: 22px;
  background: #00b8a9;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.claim-drawer__price-box {
  display: flex;
  align-items: baseline;
  gap: 8px;
  background: #f8f8f8;
  border-radius: 14px;
  padding: 14px 18px;
}

.claim-drawer__price-amount {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
}

.claim-drawer__price-period {
  font-size: 14px;
  color: #888;
}

.claim-drawer__error {
  font-size: 13px;
  color: #e53e3e;
  text-align: center;
  margin: 0;
}

.claim-drawer__cta {
  width: 100%;
  background: linear-gradient(135deg, #00b8a9, #00a19a);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.claim-drawer__cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.claim-drawer__spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.claim-drawer__disclaimer {
  font-size: 11px;
  color: #bbb;
  text-align: center;
  margin: 0;
}
</style>
