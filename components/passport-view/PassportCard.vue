<template>
  <div class="passport-card">
    <div class="passport-container">
      <!-- passport-frame is always exactly the cover art's own aspect
           ratio, centered within whatever box .passport-container ends up
           being (which varies a lot — a 92px auto-height slot on the
           dashboard, a fixed 104x140 box on the hero pages, a square grid
           cell). That's what makes the address position below correct
           everywhere: it's positioned relative to the book art itself,
           never to a differently-shaped outer wrapper. -->
      <div class="passport-frame">
        <img
          :src="passportImage"
          alt="Passport Background"
          class="passport-image rounded-lg"
        />
        <div class="passport-address">
          <div class="address-line">{{ line1 }}</div>
          <div class="address-line-small">{{ line2 }}</div>
        </div>
      </div>
    </div>

    <!-- <div class="passport-visual">
      <div class="passport-book">
        <div class="passport-cover">
          <div class="passport-text">Property Passport</div>
          <div class="house-icon">
            <OPIcon name="logo" class="w-[50px] h-[50px]" />
          </div>
          <div class="passport-address">
            <div class="address-line">{{ line1 }}</div>
            <div class="address-line-small">{{ line2 }}</div>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import OPIcon from '../ui/OPIcon.vue'

const props = defineProps({
  line1: {
    type: String,
    required: true,
  },
  line2: {
    type: String,
    required: true,
  },
  // Passport type drives which cover art we show — each type has its own
  // properly-labeled book cover so they're visually distinguishable at a
  // glance, not just a generic "Property Passport" book for everything.
  type: {
    type: String,
    default: 'SELLER',
  },
})

const passportImage = computed(() => {
  if (props.type === 'LANDLORD')
    return '/op-icons/passport-covers/landlord_front_no_tile_no_tilt.png'
  if (props.type === 'BUYER')
    return '/op-icons/passport-covers/buyer_front_no_tile_no_tilt.png'
  return '/op-icons/passport-covers/seller_front_no_tile_no_tilt.png'
})

// The three cover art files aren't quite the same shape (measured from the
// PNGs themselves: seller 515x485, landlord 415x402, buyer 413x409) — and
// every page that embeds this card sizes its wrapper differently (a 92px
// auto-height slot on the dashboard, a fixed 104x140 box on the hero pages,
// a square grid cell, ...). .passport-frame below uses this ratio to always
// render the book at its own true shape, centered, regardless of what shape
// box the page gives it — which is what keeps the address overlay landing
// in the same place on the artwork everywhere.
const ASPECT_RATIOS = {
  SELLER: 515 / 485,
  LANDLORD: 415 / 402,
  BUYER: 413 / 409,
}
const aspectRatio = computed(() => ASPECT_RATIOS[props.type] ?? ASPECT_RATIOS.SELLER)
</script>

<style scoped>
/* Extracted CSS for passport-card only. You can move/adjust as needed */
.passport-card {
  display: flex;
  justify-content: center;
  margin: 32px 0;
  perspective: 1000px;
}

.passport-container {
  position: relative;
  width: 100%;
  max-width: 360px;
  /* Only takes effect when a page constrains width alone (e.g. the
     dashboard's 92px auto-height slot) — aspect-ratio is what gives the
     container a height in that case. Pages that instead give this a fixed
     width AND height (a hero book, a grid cell) make both dimensions
     already-definite, so this is simply ignored there — .passport-frame's
     own aspect-ratio is what matters in that case. */
  aspect-ratio: v-bind(aspectRatio);
}

.passport-frame {
  /* The book, at its true shape, centered within .passport-container no
     matter what shape that container ends up being — the standard
     "letterboxed content" recipe: absolutely positioned, inset 0, auto
     margins, and its own aspect-ratio capped by max-width/max-height. */
  position: absolute;
  inset: 0;
  margin: auto;
  aspect-ratio: v-bind(aspectRatio);
  max-width: 100%;
  max-height: 100%;
  /* Become a size container so the address text below scales with the
     book's own rendered width (cqi = 1% of container's inline size) —
     tied to the true book width, not whatever shape the outer wrapper is. */
  container-type: inline-size;
}

.passport-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}
/* .passport-visual {
  transform: rotateY(-15deg);
  transition: transform 0.3s;
}

.passport-visual:hover {
  transform: rotateY(0deg);
}

.passport-book {
  width: 200px;
  height: 260px;
  position: relative;
}

.passport-cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #00a19a 0%, #00a89a 100%);
  border-radius: 8px;
  box-shadow:
    8px 8px 20px rgba(0, 0, 0, 0.3),
    inset 2px 2px 8px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  color: white;
  position: relative;
}

.passport-cover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.3), transparent);
  border-radius: 8px 0 0 8px;
} */

/* .passport-text {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
}

.house-icon {
  width: 40%;
  margin: 20px 0;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
} */

.passport-address {
  /* Empirically placed against the cover art's blank zone below the house
     icon and above the corner camera glyph — verified against all three
     covers (seller/landlord/buyer share the same layout, just recolored).
     Only meaningful now that .passport-frame guarantees this sits over the
     undistorted book at its true aspect ratio; the old 31% value was
     tuned against one specific letterboxed context and looked wrong (too
     high, overlapping the house icon) anywhere that rendered the cover at
     its natural proportions instead. */
  position: absolute;
  bottom: 23%;
  left: 50%;
  transform: translateX(-50%);
  width: 76%;
  max-width: 76%;
  text-align: center;
  color: #fff;
  line-height: 1.15;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

/* Address typography scales with the card's container width via cqi.
   clamp() pins it between sensible min/max so a tiny resume tile stays
   readable and a large grid tile doesn't blow up. */
.address-line {
  font-size: clamp(4px, 6cqi, 14px);
  font-weight: 400;
  margin: 0;
  letter-spacing: -0.01em;
  word-break: break-word;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.address-line-small {
  font-size: clamp(5px, 3.5cqi, 11px);
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Browsers without container-query support fall back to a small fixed
   size — not perfect, but never broken. */
@supports not (container-type: inline-size) {
  .address-line {
    font-size: 11px;
  }
  .address-line-small {
    font-size: 9px;
  }
}
</style>
