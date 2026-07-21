<template>
  <Teleport to="body">
    <Transition name="bdd">
      <div v-if="buyer" class="bdd-overlay" @click.self="$emit('close')">
        <div class="bdd-sheet" @click.stop>
          <div class="bdd-grip" />

          <!-- Dark navy hero card with avatar + verified + match gauge -->
          <div class="bdd-hero">
            <div class="bdd-hero-avatar-wrap">
              <div class="bdd-hero-avatar">{{ initial }}</div>
              <span class="bdd-hero-verified" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            </div>
            <div class="bdd-hero-info">
              <div class="bdd-hero-name">{{ buyer.name }}</div>
              <div class="bdd-hero-sub">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Verified buyer · UmovingU
              </div>
            </div>
            <div class="bdd-hero-gauge">
              <svg viewBox="0 0 80 80">
                <circle class="bg-track" cx="40" cy="40" r="34" stroke-width="6" fill="none" />
                <circle
                  class="bg-fill" cx="40" cy="40" r="34"
                  stroke="#5EEAD4" stroke-width="6" fill="none"
                  stroke-dasharray="213.63"
                  :stroke-dashoffset="213.63 - (buyer.matchScore / 100) * 213.63"
                  stroke-linecap="round" transform="rotate(-90 40 40)"
                />
              </svg>
              <div class="bdd-hero-gauge-num">
                <b>{{ buyer.matchScore }}%</b><span>MATCH</span>
              </div>
            </div>
          </div>

          <!-- WHAT THEY'RE LOOKING FOR — 2x2 grid of illustrated cards -->
          <div class="bdd-sec-h">
            <span class="bdd-sec-badge bdd-sec-badge--lilac" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </span>
            WHAT THEY'RE LOOKING FOR
          </div>
          <div class="bdd-crit">
            <div class="bdd-crit-tile">
              <img src="/op-icons/matched-buyers/pin.png" alt="" class="bdd-crit-ic" loading="lazy" />
              <div>
                <div class="bdd-crit-label">AREA</div>
                <div class="bdd-crit-val">{{ buyer.area || '—' }}</div>
              </div>
            </div>
            <div class="bdd-crit-tile">
              <img src="/op-icons/matched-buyers/wallet.png" alt="" class="bdd-crit-ic" loading="lazy" />
              <div>
                <div class="bdd-crit-label">BUDGET</div>
                <div class="bdd-crit-val">{{ buyer.budget || '—' }}</div>
              </div>
            </div>
            <div class="bdd-crit-tile">
              <img src="/op-icons/calendar/calendar.png" alt="" class="bdd-crit-ic" loading="lazy" />
              <div>
                <div class="bdd-crit-label">TIMELINE</div>
                <div class="bdd-crit-val">{{ buyer.timeline || '—' }}</div>
              </div>
            </div>
            <div class="bdd-crit-tile">
              <img src="/op-icons/calendar/shield.png" alt="" class="bdd-crit-ic" loading="lazy" />
              <div>
                <div class="bdd-crit-label">STATUS</div>
                <div class="bdd-crit-val">
                  <svg class="bdd-crit-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified
                </div>
              </div>
            </div>
          </div>

          <!-- WHY THIS IS A STRONG MATCH — bullet list -->
          <div class="bdd-sec-h">
            <span class="bdd-sec-badge bdd-sec-badge--lilac" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.9 6.6 7.1.6-5.4 4.8 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z" />
              </svg>
            </span>
            WHY THIS IS A {{ matchWord.toUpperCase() }} MATCH
          </div>
          <div class="bdd-factors">
            <div
              v-for="f in factors"
              :key="f.title"
              class="bdd-factor"
            >
              <div class="bdd-factor-ico" :class="'bdd-factor-ico--' + f.tone" aria-hidden="true">
                <svg v-if="f.tone === 'ok'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <svg v-else-if="f.tone === 'warn'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="6" x2="12" y2="13" />
                  <circle cx="12" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                  <line x1="6" y1="12" x2="18" y2="12" />
                </svg>
              </div>
              <div class="bdd-factor-body">
                <div class="bdd-factor-title">{{ f.title }}</div>
                <div class="bdd-factor-sub">{{ f.sub }}</div>
              </div>
            </div>
          </div>

          <!-- HOW READY THEY ARE -->
          <div class="bdd-sec-h">
            <span class="bdd-sec-badge bdd-sec-badge--lilac" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
            </span>
            HOW READY THEY ARE
          </div>
          <div class="bdd-ready-row">
            <span class="bdd-ready-pill">{{ matchWord }} match</span>
          </div>

          <!-- Anonymity card -->
          <div class="bdd-anon">
            <img src="/op-icons/matched-buyers/lock-big.png" alt="" class="bdd-anon-ic" loading="lazy" />
            <div class="bdd-anon-body">
              <div class="bdd-anon-title">Stays anonymous until you reach out.</div>
              <div class="bdd-anon-sub">
                The buyer sees the property you've matched — never your name — until
                you tap <span class="bdd-anon-link">Invite to view</span> or
                <span class="bdd-anon-link">Share Passport</span>.
              </div>
            </div>
          </div>

          <!-- Primary CTA -->
          <button class="bdd-cta-primary" type="button" @click="$emit('action', 'invite')">
            <span class="bdd-cta-ic" aria-hidden="true">
              <!-- Mini calendar with 17 badge -->
              <svg viewBox="0 0 32 32" fill="none">
                <rect x="4" y="7" width="24" height="21" rx="3" fill="#fff" />
                <rect x="4" y="7" width="24" height="6" rx="3" fill="#8B75E8" />
                <line x1="10" y1="4" x2="10" y2="10" stroke="#75757C" stroke-width="2" stroke-linecap="round" />
                <line x1="22" y1="4" x2="22" y2="10" stroke="#75757C" stroke-width="2" stroke-linecap="round" />
                <text x="16" y="24" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="800" fill="#231D45">17</text>
              </svg>
            </span>
            <span class="bdd-cta-label">Invite to view</span>
            <svg class="bdd-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          <!-- Secondary CTAs -->
          <div class="bdd-cta-row">
            <button class="bdd-cta-secondary" type="button" @click="$emit('action', 'share')">
              <img src="/op-icons/matched-buyers/link.png" alt="" class="bdd-cta-sec-ic" loading="lazy" />
              Share Passport
            </button>
            <button class="bdd-cta-secondary" type="button" @click="$emit('action', 'message')">
              <img src="/op-icons/matched-buyers/chat.png" alt="" class="bdd-cta-sec-ic" loading="lazy" />
              Message
            </button>
          </div>

          <p class="bdd-foot">
            <span class="bdd-foot-lock" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
            </span>
            You stay anonymous until you invite or share. The buyer only sees the property.
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  buyer: {
    name: string
    area: string
    budget: string
    timeline: string
    matchScore: number
    tags: string[]
  } | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'action', kind: 'invite' | 'share' | 'message'): void
}>()

const initial = computed(() =>
  (props.buyer?.name || '?').trim().charAt(0).toUpperCase(),
)

const matchWord = computed(() => {
  const s = props.buyer?.matchScore ?? 0
  if (s >= 75) return 'Strong'
  if (s >= 55) return 'Good'
  return 'Possible'
})

// Derived from the backend's tag/score signal — we don't have rich per-factor
// data yet, so we surface what we know with a sensible split.
const factors = computed(() => {
  const out: { title: string; sub: string; tone: 'ok' | 'warn' | 'no' }[] = []
  if (!props.buyer) return out
  const tags = props.buyer.tags || []
  const score = props.buyer.matchScore || 0

  out.push({
    title: 'Location alignment',
    sub: `Buyer's saved search is in ${props.buyer.area || 'a matching area'}.`,
    tone: 'ok',
  })

  if (tags.some((t) => /type match/i.test(t))) {
    out.push({
      title: 'Property type matches',
      sub: 'This buyer is searching for the same type of home.',
      tone: 'ok',
    })
  } else {
    out.push({
      title: 'Property type may differ',
      sub: "Buyer hasn't pinned a strict type — open to similar homes.",
      tone: 'warn',
    })
  }

  out.push({
    title: 'Budget vs estimate',
    sub: `Budget ${props.buyer.budget}. Score weighted ${score >= 60 ? 'strongly' : 'partially'} on price fit.`,
    tone: score >= 60 ? 'ok' : 'warn',
  })

  return out
})
</script>

<style scoped>
.bdd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  --navy: #231D45;
  --navy-70: #4A5876;
  --navy-40: #A8B0C2;
  --teal: #00A19A;
  --teal-dk: #008A84;
  --teal-wash: #E9F6F5;
  --lilac: #8B75E8;
  --lilac-bg: #EEEAFB;
  --warn: #F5A623;
  --line: #E7EAEE;
  --wash: #F5F7F9;
  --card: #FFFFFF;
  color: var(--navy);
}
.bdd-sheet {
  width: 100%;
  max-width: 28rem;
  background: var(--card);
  border-radius: 26px 26px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  max-height: 92dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.bdd-grip {
  width: 44px;
  height: 4px;
  background: #DADEE4;
  border-radius: 100px;
  margin: 10px auto 12px;
}

/* Dark hero */
.bdd-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 22px;
  padding: 22px 20px;
  background: linear-gradient(140deg, #3A2E7C, #231D45 55%, #17122E);
  border-radius: 22px;
  color: #fff;
  box-shadow: 0 8px 22px rgba(35, 29, 69, 0.25);
}
.bdd-hero-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.bdd-hero-avatar {
  width: 66px;
  height: 66px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00BFB4, #00817C);
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(0, 161, 154, 0.4);
}
.bdd-hero-verified {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--teal);
  color: #fff;
  border: 2px solid #231D45;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.bdd-hero-verified svg { width: 12px; height: 12px; }
.bdd-hero-info { flex: 1; min-width: 0; }
.bdd-hero-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.1;
}
.bdd-hero-sub {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 6px;
}
.bdd-hero-sub svg {
  width: 14px;
  height: 14px;
  color: var(--teal);
  flex-shrink: 0;
}
.bdd-hero-gauge {
  position: relative;
  width: 68px;
  height: 68px;
  flex-shrink: 0;
}
.bdd-hero-gauge svg { width: 100%; height: 100%; }
.bdd-hero-gauge .bg-track { stroke: rgba(255, 255, 255, 0.18); }
.bdd-hero-gauge .bg-fill {
  transition: stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 0 6px rgba(94, 234, 212, 0.6));
}
.bdd-hero-gauge-num {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.bdd-hero-gauge-num b {
  font-size: 16px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.4px;
}
.bdd-hero-gauge-num span {
  font-size: 8px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.72);
  letter-spacing: 0.6px;
  margin-top: 2px;
}

/* Section eyebrows with lilac badge */
.bdd-sec-h {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 22px 10px;
  font-size: 12px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: 1.3px;
}
.bdd-sec-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--lilac-bg);
  color: var(--lilac);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bdd-sec-badge svg { width: 16px; height: 16px; }

/* What they're looking for — 2x2 grid of illustrated cards */
.bdd-crit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 0 22px;
}
.bdd-crit-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(35, 29, 69, 0.04);
}
.bdd-crit-ic {
  width: 46px;
  height: 46px;
  object-fit: contain;
  flex-shrink: 0;
}
.bdd-crit-label {
  font-size: 10.5px;
  font-weight: 800;
  color: var(--navy-40);
  letter-spacing: 0.9px;
}
.bdd-crit-val {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  margin-top: 3px;
  line-height: 1.2;
}
.bdd-crit-check {
  width: 14px;
  height: 14px;
  color: var(--teal-dk);
  flex-shrink: 0;
}

/* Why this is a strong match — factor bullets */
.bdd-factors {
  margin: 0 22px;
}
.bdd-factor {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 0;
}
.bdd-factor + .bdd-factor {
  border-top: 1px dashed var(--line);
}
.bdd-factor-ico {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.bdd-factor-ico svg { width: 18px; height: 18px; }
.bdd-factor-ico--ok   { background: var(--teal); box-shadow: 0 4px 10px rgba(0, 161, 154, 0.25); }
.bdd-factor-ico--warn { background: var(--warn); box-shadow: 0 4px 10px rgba(245, 166, 35, 0.25); }
.bdd-factor-ico--no   { background: var(--navy-40); }
.bdd-factor-body { flex: 1; min-width: 0; padding-top: 2px; }
.bdd-factor-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.2px;
}
.bdd-factor-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--navy-70);
  margin-top: 3px;
  line-height: 1.4;
}

/* How ready they are — single pill */
.bdd-ready-row {
  margin: 0 22px;
}
.bdd-ready-pill {
  display: inline-flex;
  align-items: center;
  font-size: 13.5px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 100px;
  background: var(--teal-wash);
  color: var(--teal-dk);
}

/* Anonymity card */
.bdd-anon {
  display: flex;
  gap: 14px;
  align-items: center;
  margin: 18px 22px 0;
  padding: 16px;
  background: var(--teal-wash);
  border-radius: 16px;
}
.bdd-anon-ic {
  width: 60px;
  height: 60px;
  object-fit: contain;
  flex-shrink: 0;
}
.bdd-anon-body { flex: 1; min-width: 0; }
.bdd-anon-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.2px;
  line-height: 1.25;
}
.bdd-anon-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--navy-70);
  margin-top: 4px;
  line-height: 1.45;
}
.bdd-anon-link { color: var(--teal-dk); font-weight: 800; }

/* Primary CTA */
.bdd-cta-primary {
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 44px);
  margin: 16px 22px 0;
  padding: 16px 18px;
  background: linear-gradient(135deg, #00B0A8, var(--teal));
  color: #fff;
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.2px;
  box-shadow: 0 8px 22px rgba(0, 161, 154, 0.42);
  transition: transform 0.15s ease;
}
.bdd-cta-primary:active { transform: scale(0.98); }
.bdd-cta-ic {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bdd-cta-ic svg { width: 100%; height: 100%; }
.bdd-cta-label { flex: 1; text-align: left; }
.bdd-cta-arrow { width: 20px; height: 20px; flex-shrink: 0; }

/* Secondary CTAs */
.bdd-cta-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 10px 22px 0;
}
.bdd-cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: var(--card);
  color: var(--navy);
  border: 1px solid var(--line);
  border-radius: 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.2px;
  box-shadow: 0 3px 8px rgba(35, 29, 69, 0.05);
}
.bdd-cta-sec-ic {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
}
.bdd-cta-secondary:active { transform: scale(0.98); }

.bdd-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  font-size: 12px;
  color: var(--navy-70);
  font-weight: 500;
  line-height: 1.5;
  padding: 14px 22px 20px;
  margin: 0;
}
.bdd-foot-lock {
  color: var(--navy-40);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.bdd-foot-lock svg { width: 13px; height: 13px; }

.bdd-enter-active,
.bdd-leave-active { transition: opacity 0.25s ease; }
.bdd-enter-active .bdd-sheet,
.bdd-leave-active .bdd-sheet {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.bdd-enter-from,
.bdd-leave-to { opacity: 0; }
.bdd-enter-from .bdd-sheet,
.bdd-leave-to .bdd-sheet { transform: translateY(100%); }
</style>
