<template>
  <Teleport to="body">
    <Transition name="cpt">
      <div v-if="modelValue" class="cpt-overlay" @click.self="close">
        <div class="cpt-sheet" @click.stop>
          <div class="cpt-grip" />

          <div class="cpt-head">
            <div class="cpt-title">Choose your passport</div>
            <div class="cpt-sub">
              What kind of passport are you setting up for this property?
              We'll seed the right sections for you.
            </div>
          </div>

          <div
            class="choose-opt seller"
            :class="{ sel: chosen === 'seller' }"
            @click="chosen = 'seller'"
          >
            <!-- The actual umu seller passport book — same artwork the
                 rest of the app uses on PassportCard, so the drawer
                 reads as "you're picking which book to make". -->
            <div class="choose-ico seller">
              <img
                src="/op-icons/passportview/umu-passport.png"
                alt="Seller passport"
                class="choose-ico-img"
              />
            </div>
            <div class="choose-body">
              <div class="choose-title">Seller passport</div>
              <div class="choose-eyebrow">For selling your home</div>
              <div class="choose-list">
                <div class="choose-list-item">Full TA6 / TA10 / TA7 forms</div>
                <div class="choose-list-item">
                  18 sections — boundaries, deeds, alterations, services
                </div>
                <div class="choose-list-item">Buyer-shareable digital passport</div>
              </div>
            </div>
            <div class="choose-radio" />
          </div>

          <div
            class="choose-opt landlord"
            :class="{ sel: chosen === 'landlord' }"
            @click="chosen = 'landlord'"
          >
            <!-- The actual landlord passport book — dark-blue cover,
                 matches the artwork PassportCard renders for landlord
                 passports across the app. -->
            <div class="choose-ico landlord">
              <img
                src="/op-icons/passportview/landlordPassport.png"
                alt="Landlord passport"
                class="choose-ico-img"
              />
            </div>
            <div class="choose-body">
              <div class="choose-title">Landlord passport</div>
              <div class="choose-eyebrow">For letting your property</div>
              <div class="choose-list">
                <div class="choose-list-item">
                  Compliance docs — Gas, EICR, EPC, alarms, Legionella
                </div>
                <div class="choose-list-item">
                  Tenancy — AST, deposit, Right-to-Rent, How-to-Rent
                </div>
                <div class="choose-list-item">Tenant-shareable doc bundle</div>
              </div>
            </div>
            <div class="choose-radio" />
          </div>

          <div v-if="chosen === 'landlord'" class="cpt-hmo">
            <button type="button" class="cpt-toggle-row" @click="isHmo = !isHmo">
              <div class="cpt-toggle-content">
                <div class="cpt-toggle-title">Is this an HMO?</div>
                <div class="cpt-toggle-meta">
                  House in Multiple Occupation — adds PAT testing &amp; HMO licence sections
                </div>
              </div>
              <div class="cpt-toggle" :class="{ on: isHmo }" />
            </button>
          </div>

          <div class="modal-cta-row">
            <button class="modal-btn secondary" type="button" @click="close">Cancel</button>
            <button
              class="modal-btn primary"
              type="button"
              :disabled="!chosen"
              @click="confirm"
            >
              Continue →
            </button>
          </div>
          <div style="height: calc(8px + env(safe-area-inset-bottom))" />
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

const chosen = ref<PassportType | null>(null)
const isHmo = ref(false)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      // Seller is the most common path — pre-select it (matches the prototype).
      chosen.value = 'seller'
      isHmo.value = false
    }
  },
)

const close = () => emit('update:modelValue', false)
const confirm = () => {
  if (!chosen.value) return
  emit('confirm', {
    type: chosen.value,
    isHmo: chosen.value === 'landlord' && isHmo.value,
  })
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
  z-index: 1100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  color: var(--text);
}
.cpt-sheet {
  width: 100%;
  max-width: 28rem;
  background: var(--card);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  max-height: 92dvh;
  overflow-y: auto;
}
.cpt-grip {
  width: 42px;
  height: 4px;
  background: var(--border);
  border-radius: 100px;
  margin: 10px auto 0;
}
.cpt-head {
  padding: 14px 22px 6px;
}
.cpt-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.4px;
  line-height: 1.2;
  margin-bottom: 4px;
}
.cpt-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Choose option cards (ported from prototype) */
.choose-opt {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin: 14px 22px 0;
  padding: 16px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.15s;
}
.choose-opt:hover {
  border-color: var(--accent-pale);
}
.choose-opt.sel {
  border-color: var(--accent);
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.14);
  background: var(--accent-paler);
}
.choose-ico {
  /* width: 54px; */
  height: 54px;
  /* border-radius: 14px; */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  /* Soft drop-shadow so the passport "lifts" off the card without
     needing the old amber/green gradient tile underneath. The PNG
     covers are colourful on their own. */
  box-shadow: 0 6px 14px rgba(35, 29, 69, 0.18);
  overflow: hidden;
  background: transparent;
}
.choose-ico-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.choose-body {
  flex: 1;
  min-width: 0;
}
.choose-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
  line-height: 1.2;
}
.choose-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  /* 2px matches the prototype; was 4px before. */
  margin-top: 2px;
  /* Eyebrow tints now follow the actual passport cover colours: teal
     for the seller book, navy for the landlord book. Anchors the tonal
     accent on the card to whichever passport's artwork sits beside it. */
  color: #007e78;
}
.choose-opt.landlord .choose-eyebrow {
  color: #1e2a5e;
}
.choose-list {
  margin-top: 10px;
}
.choose-list-item {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.6;
}
.choose-radio {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
  flex-shrink: 0;
  position: relative;
  margin-top: 4px;
}
.choose-opt.sel .choose-radio {
  border-color: var(--accent);
}
.choose-opt.sel .choose-radio::after {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: var(--accent);
}

/* HMO toggle (app-specific, fits the prototype's option-card visual style) */
.cpt-hmo {
  margin: 12px 22px 0;
}
.cpt-toggle-row {
  width: 100%;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}
.cpt-toggle-content {
  flex: 1;
  min-width: 0;
}
.cpt-toggle-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
}
.cpt-toggle-meta {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
  line-height: 1.4;
}
.cpt-toggle {
  width: 40px;
  height: 22px;
  border-radius: 100px;
  background: var(--border);
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s;
}
.cpt-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s;
}
.cpt-toggle.on {
  background: var(--accent);
}
.cpt-toggle.on::after {
  transform: translateX(18px);
}

/* CTA row */
.modal-cta-row {
  padding: 18px 22px 4px;
  display: flex;
  gap: 8px;
}
.modal-btn {
  flex: 1;
  padding: 14px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  transition: filter 0.15s;
}
.modal-btn.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.modal-btn.primary:hover:not(:disabled) {
  filter: brightness(1.06);
}
.modal-btn.primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}
.modal-btn.secondary {
  background: var(--card);
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
}

/* Slide-up transition */
.cpt-enter-active,
.cpt-leave-active { transition: opacity 0.25s ease; }
.cpt-enter-active .cpt-sheet,
.cpt-leave-active .cpt-sheet { transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.cpt-enter-from,
.cpt-leave-to { opacity: 0; }
.cpt-enter-from .cpt-sheet,
.cpt-leave-to .cpt-sheet { transform: translateY(100%); }
</style>
