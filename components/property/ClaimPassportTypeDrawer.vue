<template>
  <Teleport to="body">
    <Transition name="cpt-fade">
      <div v-if="modelValue" class="cpt-overlay" @click.self="close">
        <div class="cpt-card">
          <button class="cpt-close" type="button" aria-label="Close" @click="close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div class="cpt-head">
            <div class="cpt-title">Who's your passport for?</div>
            <div class="cpt-sub">Choose the role that best describes you to get started.</div>
          </div>

          <div class="cpt-opts">
            <div class="cpt-opt seller">
              <div class="cpt-opt-ico">
                <img src="/op-icons/passport-covers/seller_front_no_tile.png" alt="Seller passport" />
              </div>
              <div class="cpt-opt-title">Seller Passport</div>
              <div class="cpt-opt-sub">For homeowners who want to sell or are thinking of selling.</div>
              <button type="button" class="cpt-opt-btn seller" @click="choose('seller')">
                I'm a seller
              </button>
            </div>

            <div class="cpt-opt landlord">
              <div class="cpt-opt-ico">
                <img src="/op-icons/passport-covers/landlord_front_no_tile.png" alt="Landlord passport" />
              </div>
              <div class="cpt-opt-title">Landlord Passport</div>
              <div class="cpt-opt-sub">For landlords who own rental properties.</div>

              <button
                v-if="!landlordExpanded"
                type="button"
                class="cpt-opt-btn landlord"
                @click="landlordExpanded = true"
              >
                I'm a landlord
              </button>
              <template v-else>
                <button
                  type="button"
                  class="cpt-hmo-toggle-row"
                  @click="isHmo = !isHmo"
                >
                  <span class="cpt-hmo-text">
                    <span class="cpt-hmo-title">Is this an HMO?</span>
                    <span class="cpt-hmo-meta">House in Multiple Occupation</span>
                  </span>
                  <span class="cpt-toggle" :class="{ on: isHmo }" />
                </button>
                <button type="button" class="cpt-opt-btn landlord" @click="choose('landlord')">
                  Continue →
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type PassportType = 'seller' | 'landlord'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', payload: { type: PassportType; isHmo: boolean }): void
}>()

const landlordExpanded = ref(false)
const isHmo = ref(false)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      landlordExpanded.value = false
      isHmo.value = false
    }
  },
)

function close() {
  emit('update:modelValue', false)
}

function choose(type: PassportType) {
  emit('confirm', { type, isHmo: type === 'landlord' && isHmo.value })
  close()
}
</script>

<style scoped>
.cpt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.cpt-card {
  position: relative;
  width: 100%;
  max-width: 34rem;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 24px 60px rgba(35, 29, 69, 0.45);
  padding: 28px 24px 24px;
  max-height: 90dvh;
  overflow-y: auto;
}
.cpt-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f4f4f6;
  border: none;
  color: #6b6783;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.cpt-close:hover {
  background: #ece9f7;
  color: #231d45;
}
.cpt-head {
  text-align: center;
  padding: 0 28px 20px;
}
.cpt-title {
  font-size: 22px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px;
  margin-bottom: 6px;
}
.cpt-sub {
  font-size: 13.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.5;
}

.cpt-opts {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.cpt-opt {
  flex: 1 1 180px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 16px;
  border-radius: 16px;
  border: 1.5px solid;
}
.cpt-opt.seller {
  background: #f0faf8;
  border-color: #cdeee9;
}
.cpt-opt.landlord {
  background: #f2f1fa;
  border-color: #dcdaf2;
}
.cpt-opt-ico {
  width: 76px;
  height: 76px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cpt-opt-ico img {
  height: 100%;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 8px 12px rgba(35, 29, 69, 0.18));
}
.cpt-opt-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
  margin-bottom: 6px;
}
.cpt-opt-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.45;
  margin-bottom: 16px;
  flex: 1;
}
.cpt-opt-btn {
  width: 100%;
  padding: 12px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: filter 0.15s;
}
.cpt-opt-btn:hover {
  filter: brightness(1.06);
}
.cpt-opt-btn.seller {
  background: #00a19a;
  color: #fff;
}
.cpt-opt-btn.landlord {
  background: #231d45;
  color: #fff;
}

.cpt-hmo-toggle-row {
  width: 100%;
  background: #fff;
  border: 1px solid #dcdaf2;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  margin-bottom: 10px;
}
.cpt-hmo-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.cpt-hmo-title {
  font-size: 12px;
  font-weight: 800;
  color: #231d45;
}
.cpt-hmo-meta {
  font-size: 10.5px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 1px;
  line-height: 1.35;
}
.cpt-toggle {
  width: 36px;
  height: 20px;
  border-radius: 100px;
  background: #dcdaf2;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s;
}
.cpt-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s;
}
.cpt-toggle.on {
  background: #231d45;
}
.cpt-toggle.on::after {
  transform: translateX(16px);
}

.cpt-fade-enter-active,
.cpt-fade-leave-active {
  transition: opacity 0.22s ease;
}
.cpt-fade-enter-active .cpt-card,
.cpt-fade-leave-active .cpt-card {
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.cpt-fade-enter-from,
.cpt-fade-leave-to {
  opacity: 0;
}
.cpt-fade-enter-from .cpt-card,
.cpt-fade-leave-to .cpt-card {
  transform: scale(0.94);
}
</style>
