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
          <!-- <button
            type="button"
            class="pe-close"
            aria-label="Close"
            @click="$emit('close')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button> -->

          <div class="pe-scroll">
            <!-- ── Hero ─────────────────────────────────────────── -->
            <div class="pe-hero">
              <div class="pe-hero-text">
                <h2 class="pe-hero-title">One home.<br />Many passports.</h2>
                <div class="pe-hero-sub">
                  One permanent record.<br />Built for every journey.
                </div>
                <p class="pe-hero-desc">
                  Your Property Passport is the foundation. When life changes,
                  unlock new roles with the right passport for the next chapter.
                </p>
              </div>
              <img
                src="/op-icons/misc/passportGroupOnTile.png"
                alt="Seller, Landlord, Buyer and Tenant Passport covers"
                class="pe-hero-group"
                loading="lazy"
              />
            </div>

            <!-- ── Ecosystem blurb ──────────────────────────────── -->
            <div class="pe-blurb">
              <img
                src="/op-icons/homescore/house.png"
                alt=""
                class="pe-blurb-ic"
                loading="lazy"
              />
              <div class="pe-blurb-body">
                <div class="pe-blurb-eyebrow">
                  A passport ecosystem that moves with you
                </div>
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
                <img
                  :src="c.img"
                  :alt="`${c.title} cover`"
                  class="pe-card-book"
                  loading="lazy"
                />
                <div class="pe-card-title" :style="{ color: c.color }">
                  {{ c.title }}
                </div>
                <p class="pe-card-desc">{{ c.desc }}</p>
                <span
                  class="pe-card-pill"
                  :class="`pe-card-pill--${c.status}`"
                  >{{ c.statusLabel }}</span
                >
              </div>
            </div>

            <!-- ── Power of the ecosystem ───────────────────────── -->
            <div class="pe-power">
              <div class="pe-power-title">The power of the ecosystem</div>
              <div class="pe-power-scroll">
                <div class="pe-power-list">
                  <template v-for="(item, i) in powerItems" :key="item.title">
                    <div class="pe-power-col">
                      <img
                        :src="item.img"
                        alt=""
                        class="pe-power-ic"
                        loading="lazy"
                      />
                      <div class="pe-power-item-title">{{ item.title }}</div>
                      <div class="pe-power-item-desc">{{ item.desc }}</div>
                    </div>
                    <span
                      v-if="i < powerItems.length - 1"
                      class="pe-power-connector"
                    />
                  </template>
                </div>
              </div>
            </div>

            <!-- ── Footer ────────────────────────────────────────── -->
            <div class="pe-footer">
              <div class="pe-footer-tag">
                Your journey. <span>Our ecosystem.</span>
              </div>
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

// img: existing 3D icon assets reused from elsewhere in the app.
// "Save time & money" and "More value for you" don't have an existing
// icon in the same "on a white tile" style as the other three (their
// closest matches — calendar/clock.png and investment/growthChart.png —
// are flat/floating, not tile-mounted, and growthChart is blue not
// teal) — see the ChatGPT prompts left for the design team below to
// generate matching ones.
const powerItems = [
  {
    title: 'One verified foundation',
    desc: 'Maximise trust, reduce rework and eliminate lost information.',
    img: '/op-icons/onboarding/trustShield.png',
  },
  {
    title: 'Reuse across roles',
    desc: "Move your data wherever you're heading next.",
    img: '/op-icons/investment/refreshArrows.png',
  },
  {
    title: 'Save time & money',
    desc: 'Fewer forms. Faster decisions. More wins.',
    img: '/op-icons/calendar/clock.png',
  },
  {
    title: 'Secure for life',
    desc: 'Your data. Your control. Encrypted and always yours.',
    img: '/op-icons/matched-buyers/lock-big.png',
  },
  {
    title: 'More value for you',
    desc: 'Unlock stronger offers and a stronger property outcome.',
    img: '/op-icons/investment/growthChart.png',
  },
]

/* ── ChatGPT / DALL·E prompts for the two missing "on tile" icons ──
   Paste either of these into ChatGPT (with image generation) to get a
   matching asset, then save it as the filename noted and swap the
   `img` path above.

   1) Save as: public/op-icons/ecosystem/clockOnTile.png
   "A 3D rendered clock icon in a glossy plastic/soft-toy material
   style, teal (#00958f) face with white clock hands and dashes, sitting
   on a small square white pedestal/tile base, isometric perspective,
   soft ambient shadow, transparent background, matching the style of a
   3D refresh-arrows icon and a 3D checkmark-shield icon on the same
   kind of white tile base. Centered, no text, no watermark."

   2) Save as: public/op-icons/ecosystem/growthChartOnTile.png
   "A 3D rendered bar chart icon with an upward-trending arrow above
   the bars, glossy plastic/soft-toy material style, teal (#00958f)
   bars and arrow, sitting on a small square white pedestal/tile base,
   isometric perspective, soft ambient shadow, transparent background,
   matching the style of a 3D refresh-arrows icon and a 3D
   checkmark-shield icon on the same kind of white tile base. Centered,
   no text, no watermark." */
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
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
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
.pe-close svg {
  width: 15px;
  height: 15px;
}

/* Hero — text and passport group image side by side, per the prototype */
.pe-hero {
  padding: 20px 16px 4px 22px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.pe-hero-text {
  flex: 1.1;
  min-width: 0;
}
.pe-hero-title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: #1a1535;
  line-height: 1.18;
  letter-spacing: -0.2px;
}
.pe-hero-sub {
  margin-top: 8px;
  font-size: 11.5px;
  font-weight: 700;
  color: #00858a;
  line-height: 1.35;
}
.pe-hero-desc {
  margin: 8px 0 0;
  font-size: 10.5px;
  font-weight: 500;
  color: #6b6a82;
  line-height: 1.5;
}
.pe-hero-group {
  flex: 1;
  min-width: 0;
  max-width: 44%;
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
.pe-blurb-ic {
  flex-shrink: 0;
  width: 55px;
  height: 55px;
  object-fit: contain;
  margin: auto;
}
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
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.pe-card {
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 12px;
  padding: 8px 6px 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.pe-card-book {
  width: 100%;
  max-width: 40px;
  height: auto;
  object-fit: contain;
  margin: 0 auto 6px;
}
.pe-card-title {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: -0.1px;
  line-height: 1.2;
}
.pe-card-desc {
  margin: 3px 0 0;
  font-size: 8px;
  font-weight: 500;
  color: #6b6a82;
  line-height: 1.35;
  flex: 1;
}
.pe-card-pill {
  margin-top: 8px;
  font-size: 6.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: 3px 5px;
  border-radius: 100px;
  white-space: nowrap;
  margin-left: auto;
  margin-right: auto;
}
.pe-card-pill--here {
  background: #e3f5f3;
  color: #00706b;
}
.pe-card-pill--now {
  background: #edebf7;
  color: #4b2e83;
}
.pe-card-pill--soon {
  background: #f1effa;
  color: #6b6a82;
}

/* Power of the ecosystem — single horizontal row, per the prototype.
   Scrolls horizontally on very narrow phones rather than squeezing 5
   columns + connectors into illegibly small text. */
.pe-power {
  margin: 24px 18px 0;
  padding: 16px 0;
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
  padding: 0 16px;
}
.pe-power-scroll {
  overflow-x: auto;
  padding: 0 16px;
}
.pe-power-list {
  display: flex;
  align-items: flex-start;
  min-width: max-content;
}
.pe-power-col {
  width: 96px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.pe-power-ic {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.pe-power-connector {
  width: 22px;
  height: 1.5px;
  flex-shrink: 0;
  margin-top: 20px;
  background-image: linear-gradient(90deg, #c7c4dc 50%, transparent 50%);
  background-size: 8px 1.5px;
}
.pe-power-item-title {
  font-size: 11px;
  font-weight: 800;
  color: #231d45;
  padding-top: 8px;
  line-height: 1.25;
}
.pe-power-item-desc {
  margin-top: 3px;
  font-size: 9.5px;
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
.pe-footer-tag span {
  color: #00858a;
}
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
