<template>
  <div class="feature-stack">
    <!-- ── HomeScore card ── -->
    <div class="feat-card homescore" @click="router.push('/homescore')">
      <div class="feat-main">
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
            Bills, value, comparisons, energy rating —
            scored 0–100 from public records.
            <b>Done in 60 seconds.</b>
          </div>
          <ul class="feat-checks">
            <li>
              <span class="feat-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              Energy &amp; running costs
            </li>
            <li>
              <span class="feat-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              Sold history &amp; estimate
            </li>
            <li>
              <span class="feat-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              Area comparison
            </li>
          </ul>
        </div>
      </div>

      <div class="feat-footer feat-footer--cta-only">
        <button class="feat-cta" type="button" @click.stop="router.push('/homescore')">
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
      <div class="feat-main">
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
            Title, planning, surveys, certificates,
            warranties and fittings — verified,
            organised and ready before any offer.
          </div>
          <ul class="feat-checks">
            <li>
              <span class="feat-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              Sells up to <b>&nbsp;12 weeks&nbsp;</b> faster
            </li>
            <li>
              <span class="feat-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              No title surprises
            </li>
            <li>
              <span class="feat-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              No survey shocks
            </li>
          </ul>
        </div>
      </div>

      <div class="feat-footer feat-footer--cta-only">
        <button class="feat-cta" type="button" @click.stop="goToPassportSample">
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
.feature-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.feat-card {
  border-radius: 28px;
  border: 1.5px solid #d6ecea;
  background: #fff;
  cursor: pointer;
  transition: transform 0.16s, box-shadow 0.16s, border-color 0.16s;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(21, 48, 74, 0.05);
}
.feat-card:hover {
  transform: translateY(-2px);
  border-color: #b8dcda;
  box-shadow: 0 10px 26px rgba(14, 40, 64, 0.1);
}

.feat-main {
  display: grid;
  grid-template-columns: minmax(132px, 36%) 1fr;
  gap: 18px;
  padding: 20px 20px 18px;
}

.feat-hero {
  display: flex;
  align-items: center;
  justify-content: center;
}

.feat-hero-img {
  width: 100%;
  height: auto;
  max-height: 228px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.1));
}

.feat-body {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.feat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 28px;
}

.feat-eyebrow {
  font-size: 11px;
  line-height: 1;
  font-weight: 900;
  color: #00a19a;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.feat-eyebrow--passport {
  font-size: 11px;
  letter-spacing: 0.1em;
  line-height: 1;
}

.feat-pill {
  font-size: 10.5px;
  font-weight: 900;
  letter-spacing: 0.12em;
  padding: 6px 12px;
  border-radius: 100px;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}
.feat-pill--aqua {
  background: #f2fbfb;
  color: #0c8f89;
  border: 2px solid #93d2cf;
}
.feat-pill--navy {
  background: #121c59;
  color: #fff;
  border: 2px solid #121c59;
}

.feat-headline {
  font-size: 20px;
  line-height: 1.12;
  font-weight: 900;
  color: #1c2558;
  letter-spacing: -0.015em;
}

.feat-sub {
  font-size: 13.5px;
  line-height: 1.32;
  font-weight: 500;
  color: #5f6579;
}

.feat-sub b {
  color: #00a19a;
  font-weight: 800;
}

.feat-checks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.feat-checks li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #1c2558;
}

.feat-checks li b {
  font-weight: 900;
  color: #00a19a;
}

.feat-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #00a19a;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feat-check svg {
  width: 12px;
  height: 12px;
}

.feat-footer {
  border-top: 1px solid #d9dde6;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
/* When the meta row is removed, let the CTA span the whole footer so
   the button isn't marooned to the right on wide screens. */
.feat-footer--cta-only { justify-content: stretch; }
.feat-footer--cta-only .feat-cta { flex: 1; min-width: 0; }

.feat-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.feat-clock {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #00a19a;
  color: #00a19a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feat-clock svg {
  width: 20px;
  height: 20px;
}

.feat-meta-title {
  font-size: 14px;
  line-height: 1.16;
  font-weight: 800;
  color: #1d2556;
}

.feat-meta-sub {
  font-size: 12px;
  line-height: 1.14;
  color: #5f6579;
  font-weight: 500;
  margin-top: 4px;
}

.feat-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 13px 24px;
  border: none;
  border-radius: 100px;
  background: #00a19a;
  color: #fff;
  font: inherit;
  font-size: 14.5px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.1px;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(0, 161, 154, 0.26);
  transition: background 0.15s, transform 0.1s;
  min-width: 220px;
}
.feat-cta:hover { background: #008a84; }
.feat-cta:active { transform: scale(0.98); }
.feat-cta svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 900px) {
  .feat-main {
    grid-template-columns: minmax(112px, 34%) 1fr;
    gap: 14px;
    padding: 16px 16px 14px;
  }

  .feat-footer {
    padding: 12px 16px;
    gap: 12px;
  }
}

@media (max-width: 540px) {
  .feat-card {
    border-radius: 22px;
  }

  /* Keep the side-by-side illustration + body layout on phones so the
     card matches the demo/desktop look. The old rule collapsed to a
     single column which pushed the CTA into a second row and made the
     card twice as tall as it needed to be. */
  .feat-main {
    grid-template-columns: minmax(96px, 34%) 1fr;
    gap: 12px;
    padding: 14px 14px 12px;
  }

  .feat-hero-img {
    max-height: 150px;
  }

  /* Footer stays a row (meta on left, CTA pill on right) — same as
     desktop — but the meta text can wrap under the icon if needed. */
  .feat-footer {
    padding: 12px 14px 14px;
    gap: 10px;
  }

  .feat-cta {
    padding: 10px 16px;
    font-size: 13px;
  }
  .feat-cta svg { width: 14px; height: 14px; }

  /* If the viewport really is tiny (<360px), we still can't fit
     everything on one row cleanly — collapse only the footer to
     stack the CTA below the meta, but keep illustration + body
     side-by-side above. */
  @media (max-width: 360px) {
    .feat-footer {
      flex-direction: column;
      align-items: stretch;
    }
    .feat-cta { width: 100%; }
  }
}
</style>
