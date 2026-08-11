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

          <div class="wc-hero">
            <span class="wc-confetti wc-confetti--1" />
            <span class="wc-confetti wc-confetti--2" />
            <span class="wc-confetti wc-confetti--3" />
            <span class="wc-confetti wc-confetti--4" />
            <span class="wc-confetti wc-confetti--5" />
            <span class="wc-confetti wc-confetti--6" />
            <div class="wc-hero-icon">
              <img src="/op-icons/landing/propertyPassportCard.png" alt="" class="wc-hero-img" loading="lazy" />
              <span class="wc-hero-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="5 13 10 18 19 7" />
                </svg>
              </span>
            </div>
          </div>

          <div class="wc-title-row">
            <div class="wc-title">You're watching {{ addressLabel || 'this property' }}</div>
            <svg class="wc-title-check" viewBox="0 0 24 24" fill="none" stroke="#00a19a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#00a19a" stroke="none" />
              <polyline points="7 12.5 10.5 16 17 9" stroke="#fff" />
            </svg>
          </div>
          <div class="wc-sub">
            We'll notify you about the updates you've chosen. You can change
            these anytime in your account.
          </div>

          <div class="wc-notif-card">
            <div class="wc-notif-head">You'll be notified about:</div>
            <div
              v-for="t in triggers"
              :key="t.key"
              class="wc-notif-row"
            >
              <img
                :src="`/op-icons/watchThisProperty/${t.icon}.png`"
                alt=""
                class="wc-notif-ic"
                loading="lazy"
              />
              <div class="wc-notif-label">{{ t.label }}</div>
              <svg
                v-if="prefs?.[t.key]"
                class="wc-notif-state wc-notif-state--on"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                stroke-width="2.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" fill="#00a19a" stroke="none" />
                <polyline points="7 12.5 10.5 16 17 9" />
              </svg>
              <span v-else class="wc-notif-state wc-notif-state--off">
                <span class="wc-notif-dash" />
              </span>
            </div>
          </div>

          <div class="wc-upsell">
            <div class="wc-upsell-icon">
              <img src="/op-icons/landing/propertyPassportCard.png" alt="" class="wc-upsell-img" loading="lazy" />
              <span class="wc-upsell-badge">
                <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.6" />
                  <path d="M4.5 20c0-3.6 3.4-6.2 7.5-6.2s7.5 2.6 7.5 6.2" />
                </svg>
              </span>
            </div>
            <div class="wc-upsell-body">
              <div class="wc-upsell-title">
                Want the owner to know you're a serious buyer?
              </div>
              <div class="wc-upsell-desc">
                Create your Buyer Passport to verify who you are and your
                buying position. It works across every property you're
                interested in.
              </div>
              <button class="wc-upsell-btn" type="button" @click="$emit('create-passport')">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none">
                  <path d="M12 3l7 3v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z" />
                </svg>
                Create my Buyer Passport
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div class="wc-maybe-row">
            <button class="wc-maybe-btn" type="button" @click="$emit('close')">
              Maybe later
            </button>
          </div>
          <div class="watch-privacy">
            <span class="watch-privacy-icon">🔒</span>
            <span>Watching is private. The owner won't see your name — only a count of buyers watching.</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  /** Short address label, e.g. "10 Bates Road". */
  addressLabel?: string
  /** The prefs the buyer just saved in WatchPropertyDrawer — drives the
   *  check / dash state per row so this reflects what they actually
   *  chose, not a fixed mockup list. */
  prefs?: Record<string, boolean> | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create-passport'): void
}>()

const { dragStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeToDismiss({
  onDismiss: () => emit('close'),
  handleSelector: '.watch-grip',
})

// Same trigger set/copy as WatchPropertyDrawer.vue, kept in sync manually
// since both live show the same 5 notification types.
const triggers = [
  { key: 'claimed', icon: 'ownerClaim', label: 'Owner claims this property' },
  { key: 'progress', icon: 'passportProgress', label: 'Passport progress milestones' },
  { key: 'published', icon: 'passportPublished', label: 'Passport published' },
  { key: 'comparables', icon: 'comparableSales', label: 'Comparable sales nearby' },
  { key: 'homescore', icon: 'homescoreChanges', label: 'HomeScore changes' },
] as const
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

/* Hero icon + confetti */
.wc-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 0 6px;
}
.wc-hero-icon {
  position: relative;
  width: 96px;
}
.wc-hero-img {
  width: 100%;
  display: block;
  filter: drop-shadow(0 10px 16px rgba(35, 29, 69, 0.25));
}
.wc-hero-badge {
  position: absolute;
  right: -4px;
  bottom: -2px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wc-hero-badge svg {
  width: 15px;
  height: 15px;
}
.wc-confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.wc-confetti--1 { top: 6px; left: 22%; background: #7c5cff; transform: rotate(20deg); }
.wc-confetti--2 { top: 40px; left: 14%; background: #ff9f43; transform: rotate(-15deg); width: 6px; height: 6px; border-radius: 50%; }
.wc-confetti--3 { top: 10px; right: 20%; background: #ff9f43; transform: rotate(35deg); }
.wc-confetti--4 { top: 46px; right: 16%; background: #7c5cff; width: 6px; height: 6px; border-radius: 50%; }
.wc-confetti--5 { bottom: 4px; left: 30%; background: var(--accent); width: 6px; height: 6px; border-radius: 50%; }
.wc-confetti--6 { bottom: 10px; right: 28%; background: #7c5cff; transform: rotate(-25deg); }

.wc-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 4px 22px 0;
  text-align: center;
}
.wc-title {
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
  line-height: 1.25;
}
.wc-title-check {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
}
.wc-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.55;
  text-align: center;
  padding: 6px 26px 0;
}

.wc-notif-card {
  margin: 16px 22px 0;
  padding: 14px 14px 4px;
  background: var(--card);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(35, 29, 69, 0.05);
}
.wc-notif-head {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 8px;
}
.wc-notif-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
}
.wc-notif-row + .wc-notif-row {
  border-top: 1px dashed var(--border-soft);
}
.wc-notif-ic {
  width: 26px;
  height: 26px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 7px;
}
.wc-notif-label {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}
.wc-notif-state {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
}
.wc-notif-state--off {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--border);
}
.wc-notif-dash {
  width: 8px;
  height: 2px;
  border-radius: 1px;
  background: var(--text-faint);
}

.wc-upsell {
  display: flex;
  gap: 12px;
  margin: 14px 22px 0;
  padding: 14px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 14px;
}
.wc-upsell-icon {
  position: relative;
  width: 44px;
  flex-shrink: 0;
}
.wc-upsell-img {
  width: 100%;
  display: block;
}
.wc-upsell-badge {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wc-upsell-badge svg {
  width: 11px;
  height: 11px;
}
.wc-upsell-body {
  flex: 1;
  min-width: 0;
}
.wc-upsell-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.3;
  margin-bottom: 4px;
}
.wc-upsell-desc {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 10px;
}
.wc-upsell-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.wc-upsell-btn svg {
  width: 15px;
  height: 15px;
}

.wc-maybe-row {
  padding: 16px 22px 0;
}
.wc-maybe-btn {
  width: 100%;
  padding: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-secondary);
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
}
.watch-privacy {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 22px 18px;
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
