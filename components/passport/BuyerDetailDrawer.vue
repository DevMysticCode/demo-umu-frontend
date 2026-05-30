<template>
  <Teleport to="body">
    <Transition name="bdd">
      <div v-if="buyer" class="bdd-overlay" @click.self="$emit('close')">
        <div class="bdd-sheet" @click.stop>
          <div class="bdd-grip" />
          <div class="bdd-head">
            <div class="bdd-eyebrow">👤 Matched buyer</div>
            <div class="bdd-title">{{ buyer.name }}</div>
            <div class="bdd-sub">{{ matchWord }} match · UmovingU verified</div>
          </div>

          <div class="bdd-hero">
            <div class="bdd-avatar">{{ initial }}</div>
            <div class="bdd-hero-info">
              <div class="bdd-hero-name">{{ buyer.name }}</div>
              <div class="bdd-hero-sub">✓ Verified buyer · UmovingU</div>
            </div>
            <div class="bdd-hero-gauge">
              <svg viewBox="0 0 80 80">
                <circle class="bg-track" cx="40" cy="40" r="32" stroke-width="7" fill="none" />
                <circle
                  class="bg-fill" cx="40" cy="40" r="32"
                  stroke="#5EEAD4" stroke-width="7" fill="none"
                  stroke-dasharray="201.06"
                  :stroke-dashoffset="201.06 - (buyer.matchScore / 100) * 201.06"
                  stroke-linecap="round" transform="rotate(-90 40 40)"
                />
              </svg>
              <div class="bdd-hero-gauge-num">
                <b>{{ buyer.matchScore }}%</b><span>match</span>
              </div>
            </div>
          </div>

          <div class="bdd-sec-h">What they're looking for</div>
          <div class="bdd-crit">
            <div class="bdd-crit-tile">
              <div class="bdd-crit-label">Area</div>
              <div class="bdd-crit-val">{{ buyer.area || '—' }}</div>
            </div>
            <div class="bdd-crit-tile">
              <div class="bdd-crit-label">Budget</div>
              <div class="bdd-crit-val">{{ buyer.budget || '—' }}</div>
            </div>
            <div class="bdd-crit-tile">
              <div class="bdd-crit-label">Timeline</div>
              <div class="bdd-crit-val">{{ buyer.timeline || '—' }}</div>
            </div>
            <div class="bdd-crit-tile">
              <div class="bdd-crit-label">Status</div>
              <div class="bdd-crit-val">✓ Verified</div>
            </div>
          </div>

          <div class="bdd-sec-h">Why this is a {{ matchWord.toLowerCase() }} match</div>
          <div
            v-for="f in factors"
            :key="f.title"
            class="bdd-factor"
          >
            <div class="bdd-factor-ico" :class="f.tone">{{ f.tone === 'ok' ? '✓' : f.tone === 'warn' ? '!' : '—' }}</div>
            <div class="bdd-factor-body">
              <div class="bdd-factor-title">{{ f.title }}</div>
              <div class="bdd-factor-sub">{{ f.sub }}</div>
            </div>
          </div>

          <div v-if="buyer.tags?.length" class="bdd-sec-h">How ready they are</div>
          <div v-if="buyer.tags?.length" class="bdd-ready">
            <span
              v-for="t in buyer.tags"
              :key="t"
              class="bdd-ready-chip"
              :class="/strong|good|active/i.test(t) ? 'yes' : 'no'"
            >{{ t }}</span>
          </div>

          <div class="bdd-activity">
            Stays anonymous until you reach out. The buyer sees the
            <b>property</b> you've matched — never your name — until you tap
            <b>Invite to view</b> or <b>Share Passport</b>.
          </div>

          <div class="bdd-cta-grid">
            <button class="bdd-cta primary" type="button" @click="$emit('action', 'invite')">
              📅 Invite to view
            </button>
            <button class="bdd-cta" type="button" @click="$emit('action', 'share')">
              🔗 Share Passport
            </button>
            <button class="bdd-cta" type="button" @click="$emit('action', 'message')">
              💬 Message
            </button>
          </div>
          <div class="bdd-foot">
            You stay anonymous until you invite or share. The buyer only sees the property.
          </div>
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

// Reasoning derived from the backend's tag/score signal — we don't have rich
// per-factor data yet, so we surface what we know with a sensible split.
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

  if (tags.some((t) => /active|ready/i.test(t))) {
    out.push({
      title: 'Active buyer',
      sub: 'Recently logged in / engaged with similar listings.',
      tone: 'ok',
    })
  }
  return out
})
</script>

<style scoped>
.bdd-overlay {
  position: fixed; inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1200;
  display: flex; align-items: flex-end; justify-content: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  --accent: #00a19a; --accent-dark: #008a84;
  --accent-pale: #e5f4f2; --accent-paler: #f2faf8;
  --primary: #231d45;
  --bg: #f5f6fa; --card: #ffffff;
  --text: #231d45; --text-secondary: #6b7089; --text-faint: #a8a9ad;
  --border: #e4e5ed; --border-soft: #f0f1f5;
  --warning: #f5a623;
  color: var(--text);
}
.bdd-sheet { width: 100%; max-width: 28rem; background: var(--card); border-radius: 22px 22px 0 0; box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25); max-height: 92dvh; overflow-y: auto; padding-bottom: env(safe-area-inset-bottom); }
.bdd-grip { width: 42px; height: 4px; background: var(--border); border-radius: 100px; margin: 10px auto 0; }
.bdd-head { padding: 14px 22px 6px; }
.bdd-eyebrow { font-size: 10px; font-weight: 800; color: var(--accent-dark); letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 6px; }
.bdd-title { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; line-height: 1.2; margin-bottom: 4px; }
.bdd-sub { font-size: 12.5px; font-weight: 500; color: var(--text-secondary); line-height: 1.5; }

.bdd-hero { display: flex; align-items: center; gap: 14px; margin: 14px 22px 0; padding: 16px; background: linear-gradient(140deg, #2D2466, #231D45 60%, #15102E); border-radius: 16px; color: white; }
.bdd-avatar { width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, #00b8b0, var(--accent-dark)); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; flex-shrink: 0; }
.bdd-hero-info { flex: 1; min-width: 0; }
.bdd-hero-name { font-size: 17px; font-weight: 800; letter-spacing: -0.3px; }
.bdd-hero-sub { font-size: 11.5px; font-weight: 600; color: rgba(255, 255, 255, 0.72); margin-top: 2px; }
.bdd-hero-gauge { position: relative; width: 58px; height: 58px; flex-shrink: 0; }
.bdd-hero-gauge svg { width: 100%; height: 100%; }
.bdd-hero-gauge .bg-track { stroke: rgba(255, 255, 255, 0.16); }
.bdd-hero-gauge .bg-fill { transition: stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1); filter: drop-shadow(0 0 5px rgba(94, 234, 212, 0.55)); }
.bdd-hero-gauge-num { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.bdd-hero-gauge-num b { font-size: 16px; font-weight: 900; color: #5EEAD4; line-height: 1; letter-spacing: -0.4px; }
.bdd-hero-gauge-num span { font-size: 7px; font-weight: 800; color: rgba(255, 255, 255, 0.6); letter-spacing: 0.5px; text-transform: uppercase; margin-top: 2px; }

.bdd-sec-h { font-size: 10px; font-weight: 800; color: var(--text-faint); letter-spacing: 1.2px; text-transform: uppercase; margin: 16px 22px 8px; }
.bdd-crit { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 22px; }
.bdd-crit-tile { flex: 1; min-width: 44%; padding: 11px 12px; background: var(--bg); border: 1px solid var(--border-soft); border-radius: 12px; }
.bdd-crit-label { font-size: 9.5px; font-weight: 800; color: var(--text-faint); letter-spacing: 0.5px; text-transform: uppercase; }
.bdd-crit-val { font-size: 13px; font-weight: 800; color: var(--text); margin-top: 3px; }

.bdd-factor { display: flex; align-items: flex-start; gap: 10px; margin: 0 22px; padding: 9px 0; }
.bdd-factor + .bdd-factor { border-top: 1px dashed var(--border-soft); }
.bdd-factor-ico { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; color: white; flex-shrink: 0; }
.bdd-factor-ico.ok { background: var(--accent); }
.bdd-factor-ico.warn { background: var(--warning); }
.bdd-factor-ico.no { background: var(--text-faint); }
.bdd-factor-body { flex: 1; }
.bdd-factor-title { font-size: 12.5px; font-weight: 800; color: var(--text); }
.bdd-factor-sub { font-size: 11px; font-weight: 500; color: var(--text-secondary); margin-top: 1px; line-height: 1.4; }

.bdd-ready { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 22px; }
.bdd-ready-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 6px 11px; border-radius: 100px; }
.bdd-ready-chip.yes { background: var(--accent-paler); color: var(--accent-dark); border: 1px solid var(--accent-pale); }
.bdd-ready-chip.no { background: var(--bg); color: var(--text-faint); border: 1px solid var(--border); }

.bdd-activity { margin: 12px 22px 0; padding: 11px 13px; background: var(--accent-paler); border: 1px solid var(--accent-pale); border-radius: 12px; font-size: 11.5px; font-weight: 600; color: var(--text-secondary); line-height: 1.5; }
.bdd-activity b { color: var(--text); font-weight: 800; }

.bdd-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 16px 22px 6px; }
.bdd-cta { padding: 13px; font-family: inherit; font-size: 12.5px; font-weight: 800; border-radius: 12px; cursor: pointer; border: 1.5px solid var(--border); background: var(--card); color: var(--text); transition: all 0.15s; }
.bdd-cta:hover { border-color: var(--accent-pale); background: var(--accent-paler); color: var(--accent-dark); }
.bdd-cta.primary { grid-column: 1 / -1; background: linear-gradient(135deg, var(--accent), var(--accent-dark)); color: white; border: none; box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3); }
.bdd-cta.primary:hover { filter: brightness(1.06); }
.bdd-foot { text-align: center; font-size: 11px; color: var(--text-faint); line-height: 1.5; padding: 4px 24px 16px; }

.bdd-enter-active,
.bdd-leave-active { transition: opacity 0.25s ease; }
.bdd-enter-active .bdd-sheet,
.bdd-leave-active .bdd-sheet { transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.bdd-enter-from,
.bdd-leave-to { opacity: 0; }
.bdd-enter-from .bdd-sheet,
.bdd-leave-to .bdd-sheet { transform: translateY(100%); }
</style>
