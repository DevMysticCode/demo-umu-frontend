<template>
  <Teleport to="body">
    <div v-if="modelValue" class="cpt-overlay" @click.self="close">
      <div class="cpt-modal">
        <div class="cpt-handle" />
        <div class="cpt-header">
          <div class="cpt-title">Choose your passport</div>
          <button class="cpt-close" type="button" aria-label="Close" @click="close">×</button>
        </div>

        <div class="cpt-body">
          <p class="cpt-intro">
            What kind of passport are you setting up for this property?
            We'll seed the right sections for you.
          </p>

          <button
            type="button"
            class="cpt-card"
            :class="{ active: chosen === 'seller' }"
            @click="chosen = 'seller'"
          >
            <div class="cpt-card-icon cpt-card-icon--seller">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <div class="cpt-card-body">
              <div class="cpt-card-title">Seller passport</div>
              <div class="cpt-card-meta">For selling your home</div>
              <ul class="cpt-card-list">
                <li>Full TA6 / TA10 / TA7 forms</li>
                <li>18 sections — boundaries, deeds, alterations, services</li>
                <li>Buyer-shareable digital passport</li>
              </ul>
            </div>
            <div class="cpt-card-tick">
              <svg v-if="chosen === 'seller'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </button>

          <button
            type="button"
            class="cpt-card"
            :class="{ active: chosen === 'landlord' }"
            @click="chosen = 'landlord'"
          >
            <div class="cpt-card-icon cpt-card-icon--landlord">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div class="cpt-card-body">
              <div class="cpt-card-title">Landlord passport</div>
              <div class="cpt-card-meta">For letting your property</div>
              <ul class="cpt-card-list">
                <li>Compliance docs — Gas, EICR, EPC, alarms, Legionella</li>
                <li>Tenancy — AST, deposit, Right-to-Rent, How-to-Rent</li>
                <li>Tenant-shareable doc bundle</li>
              </ul>
            </div>
            <div class="cpt-card-tick">
              <svg v-if="chosen === 'landlord'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </button>

          <div v-if="chosen === 'landlord'" class="cpt-hmo">
            <button
              type="button"
              class="cpt-toggle-row"
              @click="isHmo = !isHmo"
            >
              <div class="cpt-toggle-content">
                <div class="cpt-toggle-title">Is this an HMO?</div>
                <div class="cpt-toggle-meta">
                  House in Multiple Occupation — adds PAT testing & HMO licence sections
                </div>
              </div>
              <div class="cpt-toggle" :class="{ on: isHmo }" />
            </button>
          </div>
        </div>

        <div class="cpt-footer">
          <button class="cpt-btn-secondary" type="button" @click="close">Cancel</button>
          <button
            class="cpt-btn-primary"
            type="button"
            :disabled="!chosen"
            @click="confirm"
          >
            Continue
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
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
      chosen.value = null
      isHmo.value = false
    }
  },
)

const close = () => emit('update:modelValue', false)
const confirm = () => {
  if (!chosen.value) return
  emit('confirm', { type: chosen.value, isHmo: chosen.value === 'landlord' && isHmo.value })
  close()
}
</script>

<style scoped>
.cpt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14, 40, 64, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 70;
}
.cpt-modal {
  width: 100%;
  max-width: 28rem;
  background: #fafaf8;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  overflow: hidden;
  animation: cpt-up 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes cpt-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
.cpt-handle { width: 36px; height: 4px; background: #d9dae0; border-radius: 100px; margin: 8px auto 0; }
.cpt-header { display: flex; align-items: center; padding: 12px 18px 10px; }
.cpt-title { flex: 1; font-size: 16px; font-weight: 800; color: #0e2840; letter-spacing: -0.4px; }
.cpt-close {
  width: 30px; height: 30px;
  border-radius: 50%; border: none;
  background: #f0f2f1; color: #4a5868;
  font-size: 20px; cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center;
}

.cpt-body { flex: 1; overflow-y: auto; padding: 6px 18px 14px; }
.cpt-intro {
  font-size: 12.5px;
  font-weight: 600;
  color: #4a5868;
  line-height: 1.5;
  margin-bottom: 14px;
}

.cpt-card {
  width: 100%;
  background: #fff;
  border: 1.5px solid #e8eceb;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
}
.cpt-card:hover { border-color: #d9dee2; }
.cpt-card.active { border-color: #3dbda3; background: linear-gradient(135deg, #f1f9f4, #ffffff); }

.cpt-card-icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.cpt-card-icon svg { width: 20px; height: 20px; }
.cpt-card-icon--seller {
  background: linear-gradient(135deg, #d4a659, #6f4d14);
  box-shadow: 0 4px 12px rgba(212, 166, 89, 0.32);
}
.cpt-card-icon--landlord {
  background: linear-gradient(135deg, #2c5f56, #143f38);
  box-shadow: 0 4px 12px rgba(31, 122, 102, 0.32);
}

.cpt-card-body { flex: 1; min-width: 0; }
.cpt-card-title {
  font-size: 14px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.3px;
  line-height: 1.2;
}
.cpt-card-meta {
  font-size: 11px;
  font-weight: 700;
  color: #1f7a66;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  margin-top: 2px;
  margin-bottom: 8px;
}
.cpt-card-list {
  margin: 0;
  padding-left: 14px;
  font-size: 11.5px;
  font-weight: 600;
  color: #4a5868;
  line-height: 1.55;
}
.cpt-card-list li { margin-bottom: 1px; }

.cpt-card-tick {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid #d9dee2;
  background: #fff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.cpt-card.active .cpt-card-tick {
  background: #3dbda3;
  border-color: #3dbda3;
}
.cpt-card-tick svg { width: 12px; height: 12px; }

/* HMO toggle */
.cpt-hmo { margin-top: 8px; }
.cpt-toggle-row {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}
.cpt-toggle-content { flex: 1; min-width: 0; }
.cpt-toggle-title { font-size: 13px; font-weight: 800; color: #0e2840; letter-spacing: -0.2px; }
.cpt-toggle-meta { font-size: 11px; font-weight: 600; color: #4a5868; margin-top: 1px; line-height: 1.4; }
.cpt-toggle {
  width: 40px; height: 22px;
  border-radius: 100px;
  background: #e8eceb;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s;
}
.cpt-toggle::after {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s;
}
.cpt-toggle.on { background: #3dbda3; }
.cpt-toggle.on::after { transform: translateX(18px); }

/* Footer */
.cpt-footer {
  padding: 12px 18px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid #e8eceb;
  background: #fafaf8;
  display: flex;
  gap: 8px;
}
.cpt-btn-secondary {
  flex: 1;
  background: #f0f2f1;
  color: #0e2840;
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
}
.cpt-btn-primary {
  flex: 2;
  background: #3dbda3;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(61, 189, 163, 0.32);
}
.cpt-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.cpt-btn-primary svg { width: 14px; height: 14px; }
</style>
