<template>
  <Teleport to="body">
    <Transition name="bpd">
      <div v-if="pro" class="bpd-overlay" @click.self="close">
        <div
          class="bpd-sheet"
          :style="dragStyle"
          @click.stop
          @touchstart.passive="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
        >
          <div class="bpd-grip" aria-hidden="true" />

          <div class="bpd-head">
            <div class="bpd-eyebrow"><img src="/op-icons/misc/wrench.png" alt="" class="inline-ic" loading="lazy" /> How it works</div>
            <div class="bpd-title">{{ pro.label }}</div>
            <div class="bpd-sub">{{ pro.sub }}</div>
          </div>

          <ol class="bpd-steps">
            <li class="bpd-step">
              <img
                src="/op-icons/explore/searchYourself.png"
                alt=""
                class="bpd-step-img"
                loading="lazy"
              />
              <div class="bpd-step-body">
                <div class="bpd-step-num">Step 1</div>
                <div class="bpd-step-title">Search yourself</div>
                <div class="bpd-step-copy">
                  We find vetted {{ tradeName }}s near your postcode - sorted by
                  availability, price, and buyer reviews.
                </div>
              </div>
            </li>

            <li class="bpd-step">
              <img
                src="/op-icons/explore/getMatched.png"
                alt=""
                class="bpd-step-img"
                loading="lazy"
              />
              <div class="bpd-step-body">
                <div class="bpd-step-num">Step 2</div>
                <div class="bpd-step-title">Get matched</div>
                <div class="bpd-step-copy">
                  Pick a slot that works. Payment is held safely by UMovingU
                  until the visit is complete.
                </div>
              </div>
            </li>

            <li class="bpd-step">
              <img
                src="/op-icons/explore/safetyCheck.png"
                alt=""
                class="bpd-step-img"
                loading="lazy"
              />
              <div class="bpd-step-body">
                <div class="bpd-step-num">Step 3</div>
                <div class="bpd-step-title">{{ step3Title }}</div>
                <div class="bpd-step-copy">
                  {{ step3Copy }}
                </div>
              </div>
            </li>
          </ol>

          <div class="bpd-info">
            <span class="bpd-info-icon">💷</span>
            <div>
              <div class="bpd-info-title">No booking fee</div>
              <div class="bpd-info-sub">You pay the pro's quote - nothing on top.</div>
            </div>
          </div>

          <div class="bpd-actions">
            <button type="button" class="bpd-btn ghost" @click="close">
              Not now
            </button>
            <button
              type="button"
              class="bpd-btn primary"
              @click="onCta"
            >
              {{ marketplaceReady ? 'Find a pro' : 'Notify me when live' }}
            </button>
          </div>

          <div class="bpd-foot">
            Marketplace launching soon. We'll email you the moment it's live.
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  pro: { key: string; label: string; sub: string } | null
  marketplaceReady?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'notify-me', proKey: string): void
  (e: 'find-pro', proKey: string): void
}>()

/** Human-readable trade name derived from the pro key - powers the
 *  step-1 copy ("we find vetted gas engineers near you"). Keeps the
 *  copy sharp without needing a separate field on qwPros. */
const tradeName = computed(() => {
  switch (props.pro?.key) {
    case 'gassafe': return 'Gas Safe engineer'
    case 'electrician': return 'electrician'
    case 'epcassess': return 'EPC assessor'
    default: return 'pro'
  }
})

/** Step 3 differs by trade - the safety-check illustration works for
 *  every case; the copy just reframes what "safety check" means for
 *  the specific job. */
const step3Title = computed(() => {
  switch (props.pro?.key) {
    case 'gassafe': return 'Safety check + certificate'
    case 'electrician': return 'EICR + certificate'
    case 'epcassess': return 'Assessment + certificate'
    default: return 'Safety check'
  }
})
const step3Copy = computed(() => {
  switch (props.pro?.key) {
    case 'gassafe':
      return 'The engineer completes the annual gas safety check. Your Gas Safety Certificate lands directly in your Passport - no scanning, no chasing.'
    case 'electrician':
      return 'The electrician issues an EICR (Electrical Installation Condition Report). It auto-attaches to your Passport when signed off.'
    case 'epcassess':
      return 'The assessor produces your new EPC. Automatically loaded into your Passport and used to update your HomeScore.'
    default:
      return 'The pro completes the check and their certificate auto-attaches to your Passport.'
  }
})

function close() {
  emit('close')
}

const { dragStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeToDismiss({
  onDismiss: close,
  handleSelector: '.bpd-grip',
})
function onCta() {
  if (!props.pro) return
  if (props.marketplaceReady) emit('find-pro', props.pro.key)
  else emit('notify-me', props.pro.key)
}
</script>

<style scoped>
.bpd-overlay {
  position: fixed; inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1250;
  display: flex; align-items: flex-end; justify-content: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}
.bpd-sheet {
  width: 100%; max-width: 28rem;
  background: #fff;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  max-height: 92dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.bpd-grip {
  width: 42px; height: 4px;
  background: #e4e5ed;
  border-radius: 100px;
  margin: 10px auto 0;
  touch-action: none;
}
.bpd-head { padding: 14px 22px 6px; }
.bpd-eyebrow {
  font-size: 10px; font-weight: 800;
  color: #008a84;
  letter-spacing: 1.4px; text-transform: uppercase;
  margin-bottom: 6px;
}
.bpd-eyebrow .inline-ic {
  width: 12px;
  height: 12px;
  object-fit: contain;
  vertical-align: -1px;
  display: inline-block;
  margin-right: 2px;
}
.bpd-title {
  font-size: 20px; font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px; line-height: 1.2;
  margin-bottom: 4px;
}
.bpd-sub {
  font-size: 12.5px; font-weight: 500;
  color: #6b7089;
  line-height: 1.5;
}

.bpd-steps {
  list-style: none;
  padding: 8px 22px 0;
  margin: 12px 0 0;
  display: flex; flex-direction: column; gap: 12px;
}
.bpd-step {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 12px 14px;
  background: #f9fafc;
  border: 1px solid #eef0f6;
  border-radius: 14px;
}
.bpd-step-img {
  width: 56px; height: 56px;
  object-fit: contain;
  flex-shrink: 0;
  display: block;
}
.bpd-step-body { flex: 1; min-width: 0; }
.bpd-step-num {
  font-size: 10px; font-weight: 800;
  color: #008a84;
  letter-spacing: 1px; text-transform: uppercase;
}
.bpd-step-title {
  font-size: 14px; font-weight: 800;
  color: #231d45;
  margin-top: 2px;
  letter-spacing: -0.15px;
}
.bpd-step-copy {
  font-size: 12px; font-weight: 500;
  color: #4b5169;
  line-height: 1.5;
  margin-top: 4px;
}

.bpd-info {
  display: flex; align-items: center; gap: 12px;
  margin: 14px 22px 0;
  padding: 12px 14px;
  background: #f2faf8;
  border: 1px solid #b2e4e1;
  border-radius: 12px;
}
.bpd-info-icon {
  font-size: 22px;
  flex-shrink: 0;
}
.bpd-info-title {
  font-size: 12.5px; font-weight: 800;
  color: #008a84;
}
.bpd-info-sub {
  font-size: 11.5px; font-weight: 500;
  color: #4b5169;
  margin-top: 2px;
  line-height: 1.45;
}

.bpd-actions {
  display: grid; grid-template-columns: 1fr 1.4fr;
  gap: 8px;
  padding: 14px 22px 6px;
}
.bpd-btn {
  padding: 13px;
  font: inherit; font-size: 13px; font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.bpd-btn.ghost {
  background: #fff;
  border: 1.5px solid #e4e5ed;
  color: #231d45;
}
.bpd-btn.primary {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.bpd-foot {
  padding: 6px 24px 18px;
  text-align: center;
  font-size: 11px;
  color: #a8a9ad;
  line-height: 1.45;
}

.bpd-enter-active,
.bpd-leave-active { transition: opacity 0.25s ease; }
.bpd-enter-active .bpd-sheet,
.bpd-leave-active .bpd-sheet {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.bpd-enter-from,
.bpd-leave-to { opacity: 0; }
.bpd-enter-from .bpd-sheet,
.bpd-leave-to .bpd-sheet { transform: translateY(100%); }
</style>
