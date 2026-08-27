<template>
  <Teleport to="body">
    <Transition name="pe-modal">
      <div v-if="open" class="pe-overlay" @click.self="$emit('close')">
        <div
          class="pe-sheet"
          :style="dragStyle"
          @click.stop
          @touchstart.passive="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
        >
          <div class="pe-grip" />
          <button
            type="button"
            class="pe-close"
            aria-label="Close"
            @click="$emit('close')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div class="pe-scroll">
            <!-- ── Hero ─────────────────────────────────────────── -->
            <div class="pe-hero">
              <h2 class="pe-hero-title">One home.<br />Many passports.</h2>
              <div class="pe-hero-sub">One permanent record.<br />Built for every journey.</div>
              <p class="pe-hero-desc">
                Your Property Passport is the foundation. When life changes,
                unlock new roles with the right passport for the next chapter.
              </p>
              <div class="pe-hero-books">
                <img src="/op-icons/passport-covers/seller_tilted_right_on_tile.png" alt="Seller Passport" class="pe-hero-book" loading="lazy" />
                <img src="/op-icons/passport-covers/landlord_tilted_right_on_tile.png" alt="Landlord Passport" class="pe-hero-book" loading="lazy" />
                <img src="/op-icons/passport-covers/buyer_tilted_right_on_tile.png" alt="Buyer Passport" class="pe-hero-book" loading="lazy" />
                <img src="/op-icons/passport-covers/tenant_tilted_right_on_tile.png" alt="Tenant Passport" class="pe-hero-book" loading="lazy" />
              </div>
            </div>

            <!-- ── Ecosystem blurb ──────────────────────────────── -->
            <div class="pe-blurb">
              <div class="pe-blurb-ic" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="40" width="36" height="4" rx="2" fill="#e3f5f3" />
                  <path d="M10 22L24 10l14 12v16a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V22z" fill="#fff" stroke="#00958f" stroke-width="2.2" stroke-linejoin="round" />
                  <path d="M19 40V29h10v11" stroke="#231d45" stroke-width="2.2" stroke-linejoin="round" />
                  <path d="M6 24l18-15 18 15" stroke="#00958f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="pe-blurb-body">
                <div class="pe-blurb-eyebrow">A passport ecosystem that moves with you</div>
                <p class="pe-blurb-desc">
                  Built once. Reuse always. Your verified information flows
                  seamlessly between passports, saving you time, effort and
                  money on every step you buy, sell, live or rent.
                </p>
              </div>
            </div>

            <!-- ── 4 passport cards ─────────────────────────────── -->
            <div class="pe-cards">
              <div v-for="c in passportCards" :key="c.key" class="pe-card">
                <img :src="c.img" :alt="`${c.title} cover`" class="pe-card-book" loading="lazy" />
                <div class="pe-card-title" :style="{ color: c.color }">{{ c.title }}</div>
                <p class="pe-card-desc">{{ c.desc }}</p>
                <span class="pe-card-pill" :class="`pe-card-pill--${c.status}`">{{ c.statusLabel }}</span>
              </div>
            </div>

            <!-- ── Power of the ecosystem ───────────────────────── -->
            <div class="pe-power">
              <div class="pe-power-title">The power of the ecosystem</div>
              <div class="pe-power-list">
                <div v-for="(item, i) in powerItems" :key="item.title" class="pe-power-row">
                  <div class="pe-power-ic-col">
                    <div class="pe-power-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#00958f" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="item.svg" />
                    </div>
                    <span v-if="i < powerItems.length - 1" class="pe-power-connector" />
                  </div>
                  <div class="pe-power-body">
                    <div class="pe-power-item-title">{{ item.title }}</div>
                    <div class="pe-power-item-desc">{{ item.desc }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Footer ────────────────────────────────────────── -->
            <div class="pe-footer">
              <div class="pe-footer-tag">Your journey. <span>Our ecosystem.</span></div>
              <div class="pe-footer-links">
                <span>🛡️ Secure by design</span>
                <span>umovingu.com</span>
                <span>legal@umu.com</span>
                <span>Terms &amp; conditions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { dragStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeToDismiss({
  onDismiss: () => emit('close'),
  handleSelector: '.pe-grip',
})

// "you-are-here" is fixed to Seller for now since this drawer is opened
// from the Property Passport journey — if it's ever opened from a
// buyer/landlord/tenant context, pass the current passport type in as a
// prop instead of hardcoding which card gets the "You are here" pill.
//
// Cover art note: seller/landlord use the *_tilted_right_on_tile.png
// asset, which is only branded "Property Passport" on the cover (not
// "Seller"/"Landlord") — buyer/tenant have role-specific cover art in
// the same style, seller/landlord don't exist yet. The on-screen title
// below each cover is still correct either way. Swap the `img` paths
// here once role-specific seller/landlord cover art exists.
const passportCards = [
  {
    key: 'seller',
    img: '/op-icons/passport-covers/seller_tilted_right_on_tile.png',
    title: 'Seller Passport',
    color: '#00858a',
    desc: 'Prove accuracy and promote. Gain buyer confidence. Streamline every step to settlement.',
    status: 'here',
    statusLabel: 'YOU ARE HERE',
  },
  {
    key: 'landlord',
    img: '/op-icons/passport-covers/landlord_tilted_right_on_tile.png',
    title: 'Landlord Passport',
    color: '#4b2e83',
    desc: 'Proof of trust and care of your asset. Stronger tenants. Fewer surprises.',
    status: 'now',
    statusLabel: 'AVAILABLE NOW',
  },
  {
    key: 'buyer',
    img: '/op-icons/passport-covers/buyer_tilted_right_on_tile.png',
    title: 'Buyer Passport',
    color: '#c9601a',
    desc: 'A clear, confident purchase journey with less stress, more certainty.',
    status: 'now',
    statusLabel: 'AVAILABLE NOW',
  },
  {
    key: 'tenant',
    img: '/op-icons/passport-covers/tenant_tilted_right_on_tile.png',
    title: 'Tenant Passport',
    color: '#4a4a52',
    desc: 'Your trusted profile simplifies rental applications and makes life easier.',
    status: 'soon',
    statusLabel: 'AVAILABLE SOON',
  },
]

const powerItems = [
  {
    title: 'One verified foundation',
    desc: 'Maximise trust, reduce rework and eliminate lost information.',
    svg: '<path d="M12 3l7 3v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z" /><path d="m9 12 2 2 4-4" />',
  },
  {
    title: 'Reuse across roles',
    desc: "Move your data wherever you're heading next.",
    svg: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" /><path d="M18 3v4h-4M6 21v-4h4" />',
  },
  {
    title: 'Save time & money',
    desc: 'Fewer forms. Faster decisions. More wins.',
    svg: '<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />',
  },
  {
    title: 'Secure for life',
    desc: 'Your data. Your control. Encrypted and always yours.',
    svg: '<rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />',
  },
  {
    title: 'More value for you',
    desc: 'Unlock stronger offers and a stronger property outcome.',
    svg: '<path d="M4 18l5-6 4 3 6-8" /><path d="M15 6h4v4" />',
  },
]
</script>

<style scoped>
.pe-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.pe-sheet {
  position: relative;
  width: 100%;
  max-width: 30rem;
  max-height: 92dvh;
  background: #fff;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.pe-grip {
  width: 42px;
  height: 4px;
  background: #e4e5ed;
  border-radius: 100px;
  margin: 10px auto 0;
  touch-action: none;
  flex-shrink: 0;
}
.pe-scroll {
  overflow-y: auto;
  padding-bottom: calc(env(safe-area-inset-bottom) + 22px);
}
.pe-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #ececef;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #231d45;
  cursor: pointer;
}
.pe-close svg { width: 15px; height: 15px; }

/* Hero */
.pe-hero {
  padding: 18px 22px 4px;
  text-align: center;
}
.pe-hero-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #1a1535;
  line-height: 1.2;
  letter-spacing: -0.3px;
}
.pe-hero-sub {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #00858a;
  line-height: 1.4;
}
.pe-hero-desc {
  margin: 12px auto 0;
  max-width: 32ch;
  font-size: 12.5px;
  font-weight: 500;
  color: #6b6a82;
  line-height: 1.55;
}
.pe-hero-books {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 4px;
}
.pe-hero-book {
  width: 25%;
  max-width: 92px;
  height: auto;
  object-fit: contain;
}

/* Blurb */
.pe-blurb {
  margin: 20px 18px 0;
  padding: 14px;
  background: #f7f6fb;
  border: 1px solid #ececf5;
  border-radius: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.pe-blurb-ic { flex-shrink: 0; width: 40px; height: 40px; }
.pe-blurb-ic svg { width: 100%; height: 100%; }
.pe-blurb-eyebrow {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #00858a;
}
.pe-blurb-desc {
  margin: 5px 0 0;
  font-size: 11.5px;
  font-weight: 500;
  color: #6b6a82;
  line-height: 1.5;
}

/* 4 passport cards */
.pe-cards {
  margin: 16px 18px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.pe-card {
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 14px;
  padding: 14px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.pe-card-book {
  width: 56px;
  height: auto;
  object-fit: contain;
  margin-bottom: 8px;
}
.pe-card-title {
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: -0.1px;
}
.pe-card-desc {
  margin: 4px 0 0;
  font-size: 10.5px;
  font-weight: 500;
  color: #6b6a82;
  line-height: 1.45;
  flex: 1;
}
.pe-card-pill {
  margin-top: 10px;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.03em;
  padding: 4px 8px;
  border-radius: 100px;
  white-space: nowrap;
}
.pe-card-pill--here { background: #e3f5f3; color: #00706b; }
.pe-card-pill--now { background: #edebf7; color: #4b2e83; }
.pe-card-pill--soon { background: #f1effa; color: #6b6a82; }

/* Power of the ecosystem */
.pe-power {
  margin: 24px 18px 0;
  padding: 16px;
  background: #f7f6fb;
  border-radius: 16px;
}
.pe-power-title {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #231d45;
  text-align: center;
  margin-bottom: 14px;
}
.pe-power-row {
  display: flex;
  gap: 12px;
}
.pe-power-ic-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.pe-power-ic {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #d9f0ee;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pe-power-ic svg { width: 17px; height: 17px; }
.pe-power-connector {
  width: 1.5px;
  flex: 1;
  min-height: 14px;
  margin: 2px 0;
  background-image: linear-gradient(180deg, #c7c4dc 50%, transparent 50%);
  background-size: 1.5px 8px;
}
.pe-power-body { padding-bottom: 16px; }
.pe-power-item-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  padding-top: 6px;
}
.pe-power-item-desc {
  margin-top: 3px;
  font-size: 11px;
  font-weight: 500;
  color: #6b6a82;
  line-height: 1.5;
}

/* Footer */
.pe-footer {
  margin-top: 24px;
  padding: 0 18px;
  text-align: center;
}
.pe-footer-tag {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
}
.pe-footer-tag span { color: #00858a; }
.pe-footer-links {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 14px;
  font-size: 10px;
  font-weight: 600;
  color: #9c98ad;
}

/* Slide-up transition */
.pe-modal-enter-active,
.pe-modal-leave-active {
  transition: opacity 0.25s ease;
}
.pe-modal-enter-active .pe-sheet,
.pe-modal-leave-active .pe-sheet {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.pe-modal-enter-from,
.pe-modal-leave-to {
  opacity: 0;
}
.pe-modal-enter-from .pe-sheet,
.pe-modal-leave-to .pe-sheet {
  transform: translateY(100%);
}
</style>
