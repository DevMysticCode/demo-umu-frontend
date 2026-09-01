<template>
  <Teleport to="body">
    <Transition name="watch-modal">
      <div
        v-if="open"
        class="watch-overlay"
        @click.self="$emit('close')"
      >
        <div
          class="watch-sheet"
          :style="dragStyle"
          @click.stop
          @touchstart.passive="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
        >
          <div class="watch-grip" />
          <div class="watch-head">
            <div class="watch-eyebrow"><img src="/op-icons/misc/eye.png" alt="" style="height:1.4em;display:inline-block;vertical-align:-0.3em;margin-right:4px" loading="lazy" />Watch this property</div>
            <div class="watch-title">Pick what you want to be notified about.</div>
            <div class="watch-sub">We'll keep you updated when something important happens at <b>{{ addressLabel || 'this property' }}</b>.</div>
          </div>

          <div class="watch-triggers">
            <div
              v-for="t in triggers"
              :key="t.key"
              class="watch-trigger"
            >
              <div class="watch-trigger-ico">
                <img
                  :src="`/op-icons/watchThisProperty/${t.icon}.png`"
                  :alt="''"
                  class="watch-trigger-img"
                  loading="lazy"
                />
              </div>
              <div class="watch-trigger-body">
                <div class="watch-trigger-title">{{ t.title }}</div>
                <div class="watch-trigger-sub">{{ t.sub }}</div>
              </div>
              <div
                class="wt-toggle"
                :class="{ on: selected[t.key] }"
                role="switch"
                :aria-checked="selected[t.key]"
                @click="selected[t.key] = !selected[t.key]"
              >
                <span />
              </div>
            </div>
          </div>

          <div class="watch-read-row">
            <div class="watch-read-icon">
              <img
                src="/op-icons/watchThisProperty/buyersWatching.png"
                alt=""
                class="watch-read-img"
                loading="lazy"
              />
            </div>
            <div class="watch-read-text">
              <b>You'll be among the first to know.</b> Sellers see that buyers
              are watching this property when they claim it — it's a helpful
              nudge.
            </div>
          </div>

          <div class="watch-cta-row">
            <button class="watch-btn secondary" type="button" @click="$emit('close')">
              Maybe later
            </button>
            <button class="watch-btn primary" type="button" :disabled="submitting" @click="onSubmit">
              {{ submitting ? 'Saving…' : '👁 Watch this property' }}
            </button>
          </div>
          <div class="watch-privacy">
            <span class="watch-privacy-icon">🔒</span>
            <span>Saved to your account. The owner won't see your name — only a count of buyers watching.</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

type PassportWatchState = 'unclaimed' | 'private' | 'partiallyPublic' | 'public'

const props = defineProps<{
  open: boolean
  /** Short address label shown in the eyebrow, e.g. "9 Woodfield Rd". */
  addressLabel?: string
  submitting?: boolean
  /** Existing prefs to prefill with (e.g. from GET /property/:id/watch) —
   *  without this the toggles always reset to the hardcoded defaults below,
   *  discarding whatever the user actually chose last time. */
  initialPrefs?: Record<string, boolean> | null
  /** Drives which toggles actually make sense to show. Without this, every
   *  toggle showed regardless of the property's real state — "Owner claims
   *  this property" on an already-claimed property, "Passport published"
   *  on an already-published one, both describing events that can never
   *  fire again. Optional and defaults to showing everything, so a caller
   *  that hasn't been updated yet still works exactly as before. */
  passportState?: PassportWatchState | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', prefs: Record<string, boolean>): void
}>()

const { dragStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeToDismiss({
  onDismiss: () => emit('close'),
  handleSelector: '.watch-grip',
})

// 'updated' reuses the same `progress` preference key as 'progress' — it's
// the identical underlying PropertyWatch field, just relabeled per state
// (build-progress framing before publish, "anything changed" framing
// after) — no backend change needed for any of this.
const ALL_TRIGGERS = {
  claimed: { key: 'claimed', icon: 'ownerClaim', title: 'Owner claims this property', sub: "You'll be notified the moment they verify ownership." },
  progress: { key: 'progress', icon: 'passportProgress', title: 'Passport progress milestones', sub: 'Get a ping at 25% / 50% / 75% as their Passport is built.' },
  updated: { key: 'progress', icon: 'passportProgress', title: 'Passport updated', sub: "We'll let you know if the owner adds or changes anything." },
  published: { key: 'published', icon: 'passportPublished', title: 'Passport published', sub: "We'll notify you when it goes live and you can access it." },
  comparables: { key: 'comparables', icon: 'comparableSales', title: 'Comparable sales nearby', sub: "Weekly update if there's new Land Registry data." },
  homescore: { key: 'homescore', icon: 'homescoreChanges', title: 'HomeScore changes', sub: "We'll let you know if the public HomeScore goes up or down." },
} as const

// Which toggles apply to each real property state:
// - unclaimed: nothing's been built yet, so no progress/updated toggle;
//   claiming and publishing are both still real future events.
// - private: claimed already (no 'claimed' toggle); still pre-publish, so
//   the original 25/50/75% build-progress framing fits, and publishing is
//   still a real future event.
// - partiallyPublic: already claimed AND already published (that's what
//   "partially public" means under the Private/Partially Public/Public
//   model — live, just incomplete) — so neither 'claimed' nor 'published'
//   applies. It can still change, though, so 'updated' replaces 'progress'.
// - public: claimed, published, and complete — none of claimed/published/
//   progress/updated describe a real future event; only the
//   state-independent toggles are left.
const TRIGGERS_BY_STATE: Record<PassportWatchState, (keyof typeof ALL_TRIGGERS)[]> = {
  unclaimed: ['claimed', 'published', 'comparables', 'homescore'],
  private: ['progress', 'published', 'comparables', 'homescore'],
  partiallyPublic: ['updated', 'comparables', 'homescore'],
  public: ['comparables', 'homescore'],
}

const triggers = computed(() => {
  const state = props.passportState
  const keys = state ? TRIGGERS_BY_STATE[state] : (Object.keys(ALL_TRIGGERS) as (keyof typeof ALL_TRIGGERS)[])
  return keys.map((k) => ALL_TRIGGERS[k])
})

const DEFAULT_PREFS: Record<string, boolean> = {
  claimed: true,
  progress: true,
  published: true,
  comparables: false,
  homescore: true,
}

const selected = reactive<Record<string, boolean>>({
  ...DEFAULT_PREFS,
  ...(props.initialPrefs ?? {}),
})

// initialPrefs typically arrives async (a GET call after the drawer's
// already mounted) — watch so a late-arriving fetch still prefills.
watch(
  () => props.initialPrefs,
  (prefs) => {
    if (!prefs) return
    Object.assign(selected, prefs)
  },
)

function onSubmit() {
  emit('submit', { ...selected })
}
</script>

<style scoped>
.watch-overlay {
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
.watch-sheet {
  width: 100%;
  max-width: 28rem;
  background: var(--card);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  max-height: 90dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.watch-grip {
  width: 42px;
  height: 4px;
  background: var(--border);
  border-radius: 100px;
  margin: 10px auto 0;
  touch-action: none;
}
.watch-head {
  padding: 14px 22px 6px;
}
.watch-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.watch-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.4px;
  line-height: 1.2;
  margin-bottom: 6px;
}
.watch-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.55;
}
.watch-sub b {
  color: var(--text);
  font-weight: 800;
}
.watch-triggers {
  padding: 6px 22px 0;
}
.watch-trigger {
  display: flex;
  gap: 12px;
  padding: 13px 0;
  align-items: center;
}
.watch-trigger + .watch-trigger {
  border-top: 1px dashed var(--border-soft);
}
.watch-trigger-ico {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.watch-trigger-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.watch-trigger-body {
  flex: 1;
  min-width: 0;
}
.watch-trigger-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.1px;
}
.watch-trigger-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.4;
}
.wt-toggle {
  width: 44px;
  height: 25px;
  border-radius: 100px;
  background: var(--border);
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.22s;
}
.wt-toggle.on {
  background: var(--accent);
}
.wt-toggle span {
  position: absolute;
  left: 3px;
  top: 3px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: white;
  transition: left 0.22s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.wt-toggle.on span {
  left: 22px;
}
.watch-read-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 22px 0;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}
.watch-read-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.watch-read-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.watch-read-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}
.watch-read-text b {
  color: var(--text);
  font-weight: 800;
}
.watch-cta-row {
  padding: 18px 22px 6px;
  display: flex;
  gap: 8px;
}
.watch-btn {
  flex: 1;
  padding: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.watch-btn.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.watch-btn.primary:hover {
  filter: brightness(1.06);
}
.watch-btn.primary:disabled {
  opacity: 0.6;
  cursor: default;
}
.watch-btn.secondary {
  background: var(--card);
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
}
.watch-privacy {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 22px 18px;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-faint);
  line-height: 1.5;
}
.watch-privacy-icon {
  flex-shrink: 0;
  font-size: 13px;
}

/* Slide-up transition */
.watch-modal-enter-active,
.watch-modal-leave-active {
  transition: opacity 0.25s ease;
}
.watch-modal-enter-active .watch-sheet,
.watch-modal-leave-active .watch-sheet {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.watch-modal-enter-from,
.watch-modal-leave-to {
  opacity: 0;
}
.watch-modal-enter-from .watch-sheet,
.watch-modal-leave-to .watch-sheet {
  transform: translateY(100%);
}
</style>
