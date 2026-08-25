<template>
  <Teleport to="body">
    <Transition name="ppd">
      <div v-if="open" class="ppd-overlay" @click.self="$emit('close')">
        <div
          class="ppd-sheet"
          :style="dragStyle"
          @click.stop
          @touchstart.passive="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
        >
          <div class="ppd-grip" />
          <div class="ppd-head">
            <div class="ppd-eyebrow"><img src="/op-icons/misc/rocket.png" alt="" style="height:1.4em;display:inline-block;vertical-align:-0.3em;margin-right:4px" loading="lazy" />Publish your passport</div>
            <div class="ppd-title">Go public to every matching buyer.</div>
            <div class="ppd-sub">
              Right now your passport is private — you choose who sees it.
              Publishing lists it openly so any verified buyer searching this
              area can find and request it.
            </div>
          </div>

          <template v-if="!notReady">
            <div class="ppd-list">
              <div class="ppd-row">
                <span class="ppd-ico on">🔒</span>
                <div>
                  <div class="ppd-row-t">Today — private</div>
                  <div class="ppd-row-s">
                    Only buyers you contact can see it. Good for testing
                    interest first.
                  </div>
                </div>
              </div>
              <div class="ppd-row">
                <span class="ppd-ico">🌐</span>
                <div>
                  <div class="ppd-row-t">After publishing — public</div>
                  <div class="ppd-row-s">
                    Listed to all matching verified buyers. They can view &amp;
                    request a viewing.
                  </div>
                </div>
              </div>
              <div class="ppd-row">
                <span class="ppd-ico">↩️</span>
                <div>
                  <div class="ppd-row-t">You stay in control</div>
                  <div class="ppd-row-s">
                    Unpublish any time. Your contact details stay hidden until
                    you choose to share.
                  </div>
                </div>
              </div>
            </div>

            <div class="ppd-tip">
              💡 Tip: <b>match &amp; make contact first</b> — gauge interest
              privately, then publish to open it up to everyone.
            </div>
          </template>

          <template v-else>
            <div class="ppd-gate">
              <div class="ppd-gate-head">
                <span class="ppd-gate-pct">{{ readiness?.readinessPct ?? 0 }}%</span>
                <span class="ppd-gate-lbl">Upfront Ready</span>
                <span class="ppd-gate-count">
                  {{ readiness?.requiredDone ?? 0 }}/{{ readiness?.requiredTotal ?? 0 }} done
                </span>
              </div>
              <p class="ppd-gate-sub">
                Buyers pay to unlock this passport, so these disclosures are
                required before it can go public. Tap any item to jump
                straight to it — done ones are shown too, so you can see
                exactly where things stand.
              </p>
              <div class="ppd-gate-list">
                <button
                  v-for="(item, idx) in readiness?.checklist ?? []"
                  :key="idx"
                  type="button"
                  class="ppd-gate-item"
                  :class="{ done: item.satisfied }"
                  @click="$emit('go-to-question', item)"
                >
                  <span v-if="item.satisfied" class="ppd-gate-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span v-else class="ppd-gate-dot" />
                  <span class="ppd-gate-item-text">
                    <span class="ppd-gate-item-section">{{ item.section }}</span>
                    {{ item.question }}
                  </span>
                  <OPIcon name="caretRight" class="w-[11px] h-[11px]" />
                </button>
              </div>
            </div>
          </template>

          <div class="ppd-cta-row">
            <button class="ppd-btn secondary" type="button" @click="$emit('close')">
              Not yet
            </button>
            <button
              v-if="!notReady"
              class="ppd-btn primary"
              type="button"
              :disabled="submitting"
              @click="$emit('publish')"
            >
              {{ submitting ? 'Publishing…' : 'Publish now →' }}
            </button>
          </div>
          <div style="height: 12px" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OPIcon from '~/components/ui/OPIcon.vue'

interface ChecklistItem {
  section: string
  sectionId: string | null
  task: string
  taskId: string | null
  question: string
  questionId: string | null
  milestone: number
  satisfied: boolean
}

const props = defineProps<{
  open: boolean
  submitting?: boolean
  readiness?: {
    canPublish: boolean
    readinessPct: number
    requiredDone: number
    requiredTotal: number
    checklist: ChecklistItem[]
  } | null
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'publish'): void
  (e: 'go-to-question', item: ChecklistItem): void
}>()

// readiness is null while still loading — don't flash the "not ready" gate
// before we actually know; only show it once we have a real, not-ready result.
const notReady = computed(() => props.readiness != null && props.readiness.canPublish === false)

const { dragStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeToDismiss({
  onDismiss: () => emit('close'),
  handleSelector: '.ppd-grip',
})
</script>

<style scoped>
.ppd-overlay {
  position: fixed; inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex; align-items: flex-end; justify-content: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  --accent: #00a19a; --accent-dark: #008a84;
  --accent-pale: #e5f4f2; --accent-paler: #f2faf8;
  --bg: #f5f6fa; --card: #ffffff;
  --text: #231d45; --text-secondary: #6b7089; --text-faint: #a8a9ad;
  --border: #e4e5ed; --border-soft: #f0f1f5;
  color: var(--text);
}
.ppd-sheet { width: 100%; max-width: 28rem; background: var(--card); border-radius: 22px 22px 0 0; box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25); max-height: 90dvh; overflow-y: auto; padding-bottom: env(safe-area-inset-bottom); }
.ppd-grip { width: 42px; height: 4px; background: var(--border); border-radius: 100px; margin: 10px auto 0; touch-action: none; }
.ppd-head { padding: 14px 22px 6px; }
.ppd-eyebrow { font-size: 10px; font-weight: 800; color: var(--accent-dark); letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 6px; }
.ppd-title { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; line-height: 1.2; margin-bottom: 4px; }
.ppd-sub { font-size: 12.5px; font-weight: 500; color: var(--text-secondary); line-height: 1.5; }

.ppd-list { padding: 8px 22px 0; display: flex; flex-direction: column; gap: 10px; }
.ppd-row { display: flex; gap: 12px; align-items: flex-start; }
.ppd-ico { width: 34px; height: 34px; border-radius: 10px; background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.ppd-ico.on { background: var(--accent-pale); }
.ppd-row-t { font-size: 13px; font-weight: 800; color: var(--text); }
.ppd-row-s { font-size: 11.5px; font-weight: 600; color: var(--text-secondary); line-height: 1.5; margin-top: 1px; }

.ppd-tip { margin: 14px 22px 0; padding: 11px 13px; background: var(--accent-paler); border: 1px solid var(--accent-pale); border-radius: 11px; font-size: 11.5px; font-weight: 600; color: var(--text-secondary); line-height: 1.5; }
.ppd-tip b { color: var(--accent-dark); font-weight: 800; }

.ppd-gate { padding: 4px 22px 0; }
.ppd-gate-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.ppd-gate-pct { font-size: 22px; font-weight: 800; color: #d97706; }
.ppd-gate-lbl { font-size: 11.5px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.6px; }
.ppd-gate-count { font-size: 11px; font-weight: 700; color: var(--text-faint); margin-left: auto; }
.ppd-gate-sub { margin: 6px 0 0; font-size: 12px; font-weight: 500; color: var(--text-secondary); line-height: 1.5; }
.ppd-gate-list { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; max-height: 320px; overflow-y: auto; }
.ppd-gate-item { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; background: #fff8ed; border: 1px solid #fbe4bd; border-radius: 10px; padding: 10px 12px; font-family: inherit; cursor: pointer; }
.ppd-gate-item:active { background: #fdecd2; }
.ppd-gate-item.done { background: var(--accent-paler); border-color: var(--accent-pale); }
.ppd-gate-item.done:active { background: var(--accent-pale); }
.ppd-gate-dot { width: 7px; height: 7px; border-radius: 50%; background: #d97706; flex-shrink: 0; }
.ppd-gate-check { width: 16px; height: 16px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ppd-gate-item-text { flex: 1; font-size: 12px; font-weight: 600; color: var(--text); line-height: 1.4; }
.ppd-gate-item.done .ppd-gate-item-text { color: var(--text-secondary); }
.ppd-gate-item-section { display: block; font-size: 10px; font-weight: 800; color: #d97706; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 1px; }
.ppd-gate-item.done .ppd-gate-item-section { color: var(--accent-dark); }
.ppd-gate-item svg { flex-shrink: 0; color: var(--text-faint); }

.ppd-cta-row { padding: 18px 22px 6px; display: flex; gap: 8px; }
.ppd-btn { flex: 1; padding: 14px; font-family: inherit; font-size: 13.5px; font-weight: 800; border-radius: 12px; cursor: pointer; border: none; transition: filter 0.15s; }
.ppd-btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent-dark)); color: white; box-shadow: 0 4px 14px rgba(0, 161, 154, 0.30); }
.ppd-btn.primary:hover:not(:disabled) { filter: brightness(1.06); }
.ppd-btn.primary:disabled { opacity: 0.55; cursor: default; box-shadow: none; }
.ppd-btn.secondary { background: var(--card); border: 1.5px solid var(--border); color: var(--text-secondary); }

.ppd-enter-active,
.ppd-leave-active { transition: opacity 0.25s ease; }
.ppd-enter-active .ppd-sheet,
.ppd-leave-active .ppd-sheet { transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.ppd-enter-from,
.ppd-leave-to { opacity: 0; }
.ppd-enter-from .ppd-sheet,
.ppd-leave-to .ppd-sheet { transform: translateY(100%); }
</style>
