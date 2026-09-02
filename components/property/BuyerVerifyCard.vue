<template>
  <!-- Three states, all ported from the two prototypes:
       - logged-out OR no profile yet         → unverified card with "See what verification gets you →"
       - logged-in + buyer profile published  → verified card with "Take me to my buyer profile"
       - logged-in + profile present but not yet published → unverified card too
       (the profile only counts as "active" once the user has paid + published) -->
  <div class="vb-card">
    <!-- ── Verified state ── -->
    <template v-if="state === 'verified'">
      <div class="vb-badge">
        <span class="vb-badge__icon" aria-hidden="true">🛡</span>
        <span>VERIFIED BUYER</span>
        <span class="vb-badge__sep">·</span>
        <span class="vb-badge__active">ACTIVE</span>
      </div>

      <h2 class="vb-title">Welcome back, {{ firstName || 'there' }}.</h2>
      <p class="vb-lede">
        You're verified and viewing-ready. Here's what that gets you.
      </p>

      <div class="vb-benefit">
        <span
          class="vb-benefit__icon vb-benefit__icon--amber"
          aria-hidden="true"
          >↑</span
        >
        <div>
          <div class="vb-benefit__head">First in the queue</div>
          <div class="vb-benefit__sub">
            Owners see verified buyers first when choosing who to sell to.
          </div>
        </div>
      </div>

      <div class="vb-benefit">
        <span class="vb-benefit__icon vb-benefit__icon--teal" aria-hidden="true"
          >✓</span
        >
        <div>
          <div class="vb-benefit__head">
            Passport unlocked — free on day one
          </div>
          <div class="vb-benefit__sub">
            It's yours free when you start viewing — no £35 charge.
          </div>
        </div>
      </div>

      <button type="button" class="vb-btn vb-btn--primary" @click="onView">
        Take me to my buyer passport →
      </button>
      <button type="button" class="vb-btn vb-btn--ghost" @click="onEdit">
        Edit my buyer passport
      </button>
    </template>

    <!-- ── Unverified state (guests + logged-in users without a published profile) ── -->
    <template v-else>
      <div class="vb-badge">
        <span class="vb-badge__icon" aria-hidden="true">🛡</span>
        <span>VERIFIED BUYER</span>
        <span class="vb-badge__sep">·</span>
        <span class="vb-badge__price">£35 ONE-OFF</span>
      </div>

      <h2 class="vb-title">Be viewing-ready before anyone else.</h2>
      <p class="vb-lede">
        Owners building a Passport are choosing who to sell to. Get verified and
        here's what you unlock.
      </p>

      <div class="vb-benefit">
        <span
          class="vb-benefit__icon vb-benefit__icon--amber"
          aria-hidden="true"
          >↑</span
        >
        <div>
          <div class="vb-benefit__head">Go to the front of the queue</div>
          <div class="vb-benefit__sub">
            Owners see verified buyers first when choosing who to sell to.
          </div>
        </div>
      </div>

      <div class="vb-benefit">
        <span class="vb-benefit__icon vb-benefit__icon--teal" aria-hidden="true"
          >✓</span
        >
        <div>
          <div class="vb-benefit__head">Get your Passport free on day one</div>
          <div class="vb-benefit__sub">
            Skip the £35 charge once you're verified and registered.
          </div>
        </div>
      </div>

      <div class="vb-benefit">
        <span
          class="vb-benefit__icon vb-benefit__icon--amber"
          aria-hidden="true"
          >★</span
        >
        <div>
          <div class="vb-benefit__head">
            3× more likely to have an offer accepted
          </div>
          <div class="vb-benefit__sub">
            Owners favour verified buyers, so your offers land more often.
          </div>
        </div>
      </div>

      <button
        type="button"
        class="vb-btn vb-btn--primary vb-btn--cta"
        @click="onStart"
      >
        ✓ See what verification gets you →
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  /** When provided, used in the "Welcome back, …" greeting on the verified card. */
  firstName?: string | null
}>()

const emit = defineEmits<{
  /** Tapped on the unverified CTA — parent decides whether to navigate
   *  to sign-in (guests) or /buyer-profile/build (logged-in). */
  (e: 'start-verification'): void
  /** Verified user wants to view their buyer profile. */
  (e: 'view-profile'): void
  /** Verified user wants to edit their buyer profile. */
  (e: 'edit-profile'): void
}>()

// ── Profile state ────────────────────────────────────────────────
const state = ref<'unverified' | 'verified' | 'loading'>('loading')
const isAuthed = ref(false)

async function loadState() {
  if (typeof window === 'undefined') {
    state.value = 'unverified'
    return
  }
  const token = localStorage.getItem('token')
  isAuthed.value = !!token
  if (!token) {
    // Guest → always show the unverified card with the "see what you get" CTA.
    state.value = 'unverified'
    return
  }
  try {
    const config = useRuntimeConfig()
    const profile = await $fetch<any>(
      `${config.public.apiBase}/buyer-profile`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    // Profile counts as "active / verified" only once it's been published.
    // A draft profile that exists but isn't published still shows the
    // unverified card (the user has more to do).
    state.value = profile?.published ? 'verified' : 'unverified'
  } catch {
    state.value = 'unverified'
  }
}

onMounted(loadState)

const firstName = computed(() => props.firstName ?? null)

function onStart() {
  emit('start-verification')
}
function onView() {
  emit('view-profile')
}
function onEdit() {
  emit('edit-profile')
}
</script>

<style scoped>
/* Palette ported from prisma/{verified-buyer-card,buyer-card-unverified}.html.
   Sizes scaled down from the prototype's 560px frame to match the app's
   ~28rem card rhythm, so the buyer card sits flush with neighbouring
   cards instead of dwarfing them. */
.vb-card {
  box-sizing: border-box;
  width: auto;
  max-width: 100%;
  background: #221d44;
  border-radius: 16px;
  padding: 16px 18px;
  color: #e9e7f5;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
  margin: 14px 20px 0;
}
.vb-card * {
  box-sizing: border-box;
}

.vb-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  letter-spacing: 0.8px;
  font-weight: 600;
  color: #c9c4e8;
  margin-bottom: 12px;
}
.vb-badge__icon {
  font-size: 13px;
}
.vb-badge__sep {
  color: #6f689c;
}
.vb-badge__price {
  color: #c9c4e8;
}
.vb-badge__active {
  color: #5dcaa5;
}

.vb-title {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px;
  line-height: 1.2;
  letter-spacing: -0.2px;
}
.vb-lede {
  font-size: 12.5px;
  line-height: 1.5;
  color: #c4bfe0;
  margin: 0 0 14px;
}

.vb-benefit {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #2c2657;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
}
.vb-benefit:last-of-type {
  margin-bottom: 14px;
}
.vb-benefit__icon {
  font-size: 14px;
  line-height: 1.3;
  flex: 0 0 auto;
}
.vb-benefit__icon--amber {
  color: #f0b84a;
}
.vb-benefit__icon--teal {
  color: #5dcaa5;
}
.vb-benefit__head {
  font-size: 12.5px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
}
.vb-benefit__sub {
  font-size: 11.5px;
  color: #b3aed6;
  line-height: 1.45;
  margin-top: 2px;
}

.vb-btn {
  width: 100%;
  font-size: 13px;
  font-weight: 600;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 8px;
  border: none;
  transition:
    opacity 0.15s ease,
    background 0.15s ease;
  font-family: inherit;
}
.vb-btn:last-child {
  margin-bottom: 0;
}
.vb-btn--primary {
  background: #00a19a;
  color: #ffffff;
}
.vb-btn--primary:hover {
  background: #0d8a69;
}
.vb-btn--ghost {
  border: 0.5px solid #4a4480;
  background: transparent;
  color: #d8d4ef;
  font-size: 12.5px;
  padding: 10px;
}
.vb-btn--ghost:hover {
  background: #2c2657;
}
</style>
