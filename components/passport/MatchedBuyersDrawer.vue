<template>
  <Teleport to="body">
    <Transition name="mbd">
      <div v-if="open" class="mbd-overlay" @click.self="$emit('close')">
        <div class="mbd-sheet" @click.stop>
          <div class="mbd-grip" />

          <!-- Header: handshake eyebrow + big title + house illustration right -->
          <div class="mbd-head">
            <div class="mbd-head-text">
              <div class="mbd-eyebrow">
                <img src="/op-icons/matched-buyers/handshake.png" alt="" class="mbd-eyebrow-ic" loading="lazy" />
                MATCHED BUYERS
              </div>
              <h2 class="mbd-title">Buyers are already waiting for this home.</h2>
              <p class="mbd-sub">
                As your Passport fills out, we match it to verified buyers. Reach
                out privately and gauge interest first — then publish when you're
                ready to go public.
              </p>
            </div>
            <img
              src="/op-icons/matched-buyers/house-person.png"
              alt=""
              class="mbd-head-illustration"
              loading="lazy"
            />
          </div>

          <!-- Hint bar -->
          <div class="mbd-hint">
            <span class="mbd-hint-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
              </svg>
            </span>
            <span><b>Tap any buyer</b> to see how well they match your property.</span>
          </div>

          <!-- Empty -->
          <div v-if="buyers.length === 0" class="mbd-empty">
            <img src="/op-icons/matched-buyers/handshake.png" alt="" class="mbd-empty-ic" loading="lazy" />
            <div class="mbd-empty-text">
              No buyers yet. As you complete more sections, matches will appear here.
            </div>
          </div>

          <!-- Buyer cards -->
          <button
            v-for="b in buyers"
            :key="b.name"
            type="button"
            class="mbd-card"
            @click="$emit('select', b)"
          >
            <div class="mbd-avatar">{{ initial(b.name) }}</div>
            <div class="mbd-info">
              <div class="mbd-name">{{ b.name }}</div>
              <div class="mbd-meta">
                {{ b.area }} · {{ b.budget }} · {{ b.timeline }}
              </div>
              <span class="mbd-pill" :class="matchPillClass(b.matchScore)">
                {{ matchLabel(b.matchScore) }}
                <svg
                  v-if="b.matchScore >= 55"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="mbd-pill-star"
                >
                  <path d="M12 2l2.9 6.6 7.1.6-5.4 4.8 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z" />
                </svg>
              </span>
            </div>
            <div class="mbd-gauge">
              <svg viewBox="0 0 80 80">
                <circle class="mg-track" cx="40" cy="40" r="32" stroke-width="6" fill="none" />
                <circle
                  class="mg-fill" cx="40" cy="40" r="32"
                  :stroke="matchStrokeColor(b.matchScore)"
                  stroke-width="6" fill="none"
                  stroke-dasharray="201.06"
                  :stroke-dashoffset="201.06 - (b.matchScore / 100) * 201.06"
                  stroke-linecap="round" transform="rotate(-90 40 40)"
                />
              </svg>
              <div class="mbd-gauge-num">{{ b.matchScore }}<small>%</small></div>
            </div>
            <svg class="mbd-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div style="height: 24px" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  buyers: Array<{
    name: string
    area: string
    budget: string
    timeline: string
    matchScore: number
    tags: string[]
  }>
}>()
defineEmits<{
  (e: 'close'): void
  (e: 'select', buyer: any): void
}>()

function initial(name: string) {
  return (name || '?').trim().charAt(0).toUpperCase()
}
function matchLabel(score: number): string {
  if (score >= 75) return 'Strong match'
  if (score >= 55) return 'Good match'
  return 'Possible match'
}
function matchPillClass(score: number): string {
  if (score >= 75) return 'mbd-pill--strong'
  if (score >= 55) return 'mbd-pill--good'
  return 'mbd-pill--possible'
}
function matchStrokeColor(score: number): string {
  // Full teal for strong, medium for good, soft for possible.
  if (score >= 75) return '#00A19A'
  if (score >= 55) return '#4CBFB4'
  return '#7FD0CB'
}
</script>

<style scoped>
.mbd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1100;
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
  --line: #E7EAEE;
  --wash: #F5F7F9;
  --card: #FFFFFF;
  color: var(--navy);
}
.mbd-sheet {
  width: 100%;
  max-width: 28rem;
  background: var(--card);
  border-radius: 26px 26px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  max-height: 92dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.mbd-grip {
  width: 44px;
  height: 4px;
  background: #DADEE4;
  border-radius: 100px;
  margin: 10px auto 4px;
}

.mbd-head {
  display: flex;
  gap: 14px;
  padding: 14px 22px 4px;
  align-items: flex-start;
}
.mbd-head-text { flex: 1; min-width: 0; }
.mbd-head-illustration {
  width: 118px;
  height: 118px;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: 8px;
}
.mbd-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  color: var(--teal-dk);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.mbd-eyebrow-ic {
  width: 30px;
  height: 30px;
  object-fit: contain;
  flex-shrink: 0;
}
.mbd-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.5px;
  line-height: 1.15;
  margin: 0 0 10px;
}
.mbd-sub {
  font-size: 13px;
  color: var(--navy-70);
  font-weight: 500;
  line-height: 1.5;
  margin: 0;
}

.mbd-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 22px 10px;
  font-size: 13px;
  color: var(--navy-70);
  font-weight: 500;
}
.mbd-hint b { color: var(--navy); font-weight: 800; }
.mbd-hint-ic {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--teal-wash);
  color: var(--teal-dk);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mbd-hint-ic svg { width: 18px; height: 18px; }

.mbd-empty {
  margin: 12px 22px 0;
  padding: 22px 20px;
  background: var(--wash);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.mbd-empty-ic { width: 44px; height: 44px; object-fit: contain; flex-shrink: 0; }
.mbd-empty-text {
  font-size: 12.5px;
  color: var(--navy-70);
  font-weight: 500;
  line-height: 1.5;
}

.mbd-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 22px 0;
  padding: 14px 14px 14px 16px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 3px 10px rgba(35, 29, 69, 0.05);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.15s;
  font: inherit;
  text-align: left;
  color: inherit;
  width: calc(100% - 44px);
}
.mbd-card:active { transform: scale(0.99); }
.mbd-card:hover { box-shadow: 0 6px 18px rgba(35, 29, 69, 0.08); }
.mbd-avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00B8B0, var(--teal-dk));
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 14px rgba(0, 161, 154, 0.28);
}
.mbd-info { flex: 1; min-width: 0; }
.mbd-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.3px;
  line-height: 1.15;
}
.mbd-meta {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--navy-70);
  margin-top: 4px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mbd-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  margin-top: 8px;
  background: var(--teal-wash);
  color: var(--teal-dk);
}
.mbd-pill--good     { background: var(--teal-wash); color: var(--teal-dk); }
.mbd-pill--strong   { background: var(--teal-wash); color: var(--teal-dk); }
.mbd-pill--possible { background: var(--wash); color: var(--navy-70); }
.mbd-pill-star { width: 12px; height: 12px; }
.mbd-pill--possible .mbd-pill-star { color: var(--navy-40); }

.mbd-gauge {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}
.mbd-gauge svg { width: 100%; height: 100%; }
.mbd-gauge .mg-track { stroke: var(--teal-wash); }
.mbd-gauge .mg-fill {
  transition: stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}
.mbd-gauge-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
  color: var(--teal-dk);
  letter-spacing: -0.3px;
}
.mbd-gauge-num small { font-size: 8px; font-weight: 800; margin-left: 1px; }
.mbd-chev {
  width: 18px;
  height: 18px;
  color: var(--navy-40);
  flex-shrink: 0;
}

.mbd-enter-active,
.mbd-leave-active { transition: opacity 0.25s ease; }
.mbd-enter-active .mbd-sheet,
.mbd-leave-active .mbd-sheet {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.mbd-enter-from,
.mbd-leave-to { opacity: 0; }
.mbd-enter-from .mbd-sheet,
.mbd-leave-to .mbd-sheet { transform: translateY(100%); }
</style>
