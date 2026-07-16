<template>
  <div class="feature-stack">
    <!-- ── HomeScore card ── -->
    <div class="feat-card homescore" @click="$router.push('/homescore')">
      <div class="feat-hero">
        <img
          src="/op-icons/explore/passportHasAStory.png"
          alt=""
          class="feat-hero-img"
          loading="lazy"
        />
      </div>
      <div class="feat-body">
        <div class="feat-top">
          <div class="feat-eyebrow">HomeScore</div>
          <span class="feat-pill feat-pill--aqua">Free</span>
        </div>
        <div class="feat-headline">Every property has a story.</div>
        <div class="feat-sub">
          Bills, value, comparisons, energy rating — scored 0–100 from public records.
          <b>Done in 60 seconds.</b>
        </div>
        <ul class="feat-checks">
          <li>
            <span class="feat-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            Energy &amp; running costs
          </li>
          <li>
            <span class="feat-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            Sold history &amp; estimate
          </li>
          <li>
            <span class="feat-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            Area comparison
          </li>
        </ul>
        <button class="feat-cta" @click.stop="$router.push('/homescore')">
          Run a HomeScore
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ── Property Passport card ── -->
    <div class="feat-card passport" @click="goToPassportSample">
      <div class="feat-hero">
        <img
          src="/op-icons/explore/samplePassportImage.png"
          alt=""
          class="feat-hero-img"
          loading="lazy"
        />
      </div>
      <div class="feat-body">
        <div class="feat-top">
          <div class="feat-eyebrow feat-eyebrow--passport">Property Passport</div>
          <span class="feat-pill feat-pill--navy">Solicitor-grade</span>
        </div>
        <div class="feat-headline">Every property has a history.</div>
        <div class="feat-sub">
          Title, planning, surveys, certificates, warranties and fittings — verified,
          organised and ready before any offer.
        </div>
        <ul class="feat-checks">
          <li>
            <span class="feat-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            Sells up to <b>&nbsp;12 weeks&nbsp;</b> faster
          </li>
          <li>
            <span class="feat-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            No title surprises
          </li>
          <li>
            <span class="feat-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            No survey shocks
          </li>
        </ul>
        <button class="feat-cta" @click.stop="goToPassportSample">
          See a sample Passport
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

function goToPassportSample() {
  // Landing page deck has the full sample passport viewer (seller / landlord / buyer)
  router.push('/?sample=seller')
}
</script>

<style scoped>
/* ── Side-by-side layout to match the client's mockups ──
   Left: big illustration hero. Right: eyebrow + pill row, headline,
   subtitle, checks card, full-width CTA. Stacks vertically on narrow
   phones so the illustration doesn't get squeezed. */
.feature-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 14px;
}

.feat-card {
  border-radius: 20px;
  padding: 18px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  display: grid;
  grid-template-columns: minmax(120px, 38%) 1fr;
  gap: 14px;
  align-items: stretch;
  border: 1.5px solid transparent;
}
.feat-card:hover { transform: translateY(-2px); }

/* Card colour treatments — soft mint wash for HomeScore, near-white
   with a faint mint tint for Passport (matches attachments). */
.feat-card.homescore {
  background: linear-gradient(160deg, #eaf6f3 0%, #f7fbf9 55%, #ffffff 100%);
  border-color: rgba(0, 161, 154, 0.15);
}
.feat-card.homescore:hover {
  border-color: rgba(0, 161, 154, 0.4);
  box-shadow: 0 10px 26px -8px rgba(0, 161, 154, 0.22);
}
.feat-card.passport {
  background: linear-gradient(160deg, #f2faf8 0%, #f9fcfb 55%, #ffffff 100%);
  border-color: rgba(35, 29, 69, 0.14);
}
.feat-card.passport:hover {
  border-color: rgba(35, 29, 69, 0.4);
  box-shadow: 0 10px 26px -8px rgba(35, 29, 69, 0.2);
}

/* Left hero — big illustration, centered in its column. */
.feat-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.feat-hero-img {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.08));
}

/* Right column — vertical stack, CTA pinned at the bottom by the flex
   layout's natural flow. */
.feat-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

/* Eyebrow + pill row. Eyebrow is aqua uppercase; pill matches the
   card's brand — teal for HomeScore, navy for Passport. */
.feat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 24px;
}
.feat-eyebrow {
  font-size: 11px;
  font-weight: 900;
  color: #00a19a;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}
.feat-eyebrow--passport { color: #00a19a; }

.feat-pill {
  font-size: 10.5px;
  font-weight: 900;
  letter-spacing: 1px;
  padding: 5px 12px;
  border-radius: 100px;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}
.feat-pill--aqua {
  background: #e6f7f6;
  color: #007e78;
  border: 1.5px solid rgba(0, 161, 154, 0.35);
}
.feat-pill--navy {
  background: #231d45;
  color: #fff;
  border: 1.5px solid #231d45;
}

.feat-headline {
  font-size: 18px;
  font-weight: 900;
  color: #0e2840;
  letter-spacing: -0.4px;
  line-height: 1.15;
}
.feat-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: #4a5868;
  line-height: 1.45;
}
.feat-sub b { color: #0e2840; font-weight: 800; }

/* Checks card — three ticked rows in a soft-white inner container so
   the highlights read as "what you get" rather than blending into
   the card background. */
.feat-checks {
  list-style: none;
  padding: 12px 14px;
  margin: 0;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 161, 154, 0.15);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.feat-checks li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  font-weight: 700;
  color: #0e2840;
}
.feat-checks li b {
  font-weight: 900;
  color: #00a19a;
}
.feat-card.passport .feat-checks li b { color: #007e78; }
.feat-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00a19a;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.feat-check svg { width: 11px; height: 11px; }
.feat-card.passport .feat-check { background: #00a19a; }

/* Full-width teal CTA. Matches the mockups on both cards — the
   HomeScore card's card sub-brand is aqua-first, and the Passport
   card also uses the aqua CTA in the client's mocks (not navy). */
.feat-cta {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 100px;
  background: #00a19a;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.1px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
  transition: background 0.15s, transform 0.1s;
  width: 100%;
}
.feat-cta:hover { background: #008a84; }
.feat-cta:active { transform: scale(0.98); }
.feat-cta svg { width: 14px; height: 14px; }

/* Narrow phones — stack vertically so the illustration keeps its
   shape and the CTA stays comfortably tappable. */
@media (max-width: 400px) {
  .feat-card {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 12px;
  }
  .feat-hero-img { max-height: 140px; }
  .feat-headline { font-size: 17px; }
}
</style>
