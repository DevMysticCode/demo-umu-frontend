<template>
  <Transition name="ccb-slide">
    <div v-if="consent === null" class="ccb-banner" role="dialog" aria-live="polite" aria-label="Cookie preferences">
      <p class="ccb-text">
        We use essential cookies to run umovingu, and a small number of non-essential ones.
        <NuxtLink to="/legal/cookies" class="ccb-link">Learn more</NuxtLink>
      </p>
      <div class="ccb-actions">
        <button class="ccb-btn ccb-btn--ghost" type="button" @click="rejectNonEssential">
          Necessary only
        </button>
        <button class="ccb-btn ccb-btn--primary" type="button" @click="accept">
          Accept all
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// Security/launch review finding #10 (2026-11-14): shown once, on every
// page, until a choice is recorded (see composables/useCookieConsent.ts).
const { consent, accept, rejectNonEssential } = useCookieConsent()
</script>

<style scoped>
.ccb-banner {
  /* Constrained to the app's own mobile column (.max-w-app, 28rem) and
     centred the same way components/core/BottomNav.vue centres itself -
     without this it spans the full viewport edge-to-edge on anything
     wider than a phone, disconnected from the rest of the UI. The extra
     safe-area-inset-bottom offset (same pattern used in 79+ other files
     in this repo, e.g. BottomNav.vue's .bottom-nav-safe) keeps it clear
     of the iPhone home-indicator / Android gesture-bar area, where a
     plain `bottom: 16px` can leave taps landing in a system-reserved
     zone that silently swallows them. */
  position: fixed;
  left: 16px;
  right: 16px;
  max-width: calc(28rem - 32px);
  margin-left: auto;
  margin-right: auto;
  bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 2000;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 14px;
  background: #16211c;
  color: #f2f5f3;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
}

.ccb-text {
  flex: 1 1 240px;
  margin: 0;
  font-size: 13.5px;
  line-height: 1.5;
}

.ccb-link {
  color: #8fe3b8;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.ccb-actions {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
}

.ccb-btn {
  border: none;
  border-radius: 9px;
  padding: 9px 14px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.ccb-btn--ghost {
  background: transparent;
  color: #f2f5f3;
  border: 1px solid rgba(242, 245, 243, 0.35);
}

.ccb-btn--primary {
  background: #2f9e6b;
  color: #0b140f;
}

.ccb-slide-enter-active,
.ccb-slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.ccb-slide-enter-from,
.ccb-slide-leave-to {
  transform: translateY(16px);
  opacity: 0;
}

@media (max-width: 420px) {
  .ccb-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .ccb-actions {
    justify-content: flex-end;
  }
}
</style>
