<template>
  <Teleport to="body">
    <Transition name="mbd">
      <div v-if="open" class="mbd-overlay" @click.self="$emit('close')">
        <div class="mbd-sheet" @click.stop>
          <div class="mbd-grip" />
          <div class="mbd-head">
            <div class="mbd-eyebrow">🤝 Matched buyers</div>
            <div class="mbd-title">Buyers are already waiting for this home.</div>
            <div class="mbd-sub">
              As your Passport fills out, we match it to verified buyers. Reach
              out privately and gauge interest first — then publish when you're
              ready to go public.
            </div>
          </div>

          <div class="mbd-hint">Tap any buyer to see how well they match your property.</div>

          <div v-if="buyers.length === 0" class="mbd-empty">
            <div class="mbd-empty-ico">👥</div>
            <div>No buyers yet. As you complete more sections, matches will appear here.</div>
          </div>

          <div
            v-for="b in buyers"
            :key="b.name"
            class="mbd-card"
            @click="$emit('select', b)"
          >
            <div class="mbd-avatar">{{ initial(b.name) }}</div>
            <div class="mbd-info">
              <div class="mbd-name">{{ b.name }}</div>
              <div class="mbd-meta">
                {{ b.area }} · {{ b.budget }} · {{ b.timeline }}
              </div>
              <div class="mbd-tags">
                <span
                  v-for="t in b.tags"
                  :key="t"
                  class="mbd-tag"
                  :class="{ watch: /watch|active/i.test(t) }"
                >{{ t }}</span>
              </div>
            </div>
            <div class="mbd-gauge">
              <svg viewBox="0 0 80 80">
                <circle class="mg-track" cx="40" cy="40" r="32" stroke-width="7" fill="none" />
                <circle
                  class="mg-fill" cx="40" cy="40" r="32"
                  stroke="url(#mbdGrad)" stroke-width="7" fill="none"
                  stroke-dasharray="201.06"
                  :stroke-dashoffset="201.06 - (b.matchScore / 100) * 201.06"
                  stroke-linecap="round" transform="rotate(-90 40 40)"
                />
                <defs>
                  <linearGradient id="mbdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#5EEAD4" />
                    <stop offset="100%" stop-color="#00A19A" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="mbd-gauge-num">{{ b.matchScore }}<small>%</small></div>
            </div>
          </div>

          <div class="mbd-how">
            <div class="mbd-how-h">How matching works</div>
            <div class="mbd-how-v">
              We match against <b>verified buyers</b> with a saved search near
              your home. The score rises as your Passport completes — and as
              buyers' criteria line up on location, price &amp; type. Tap a
              buyer to see exactly why.
            </div>
          </div>
          <div style="height: 14px" />
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
</script>

<style scoped>
.mbd-overlay {
  position: fixed; inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex; align-items: flex-end; justify-content: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  --accent: #00a19a; --accent-dark: #008a84;
  --accent-pale: #e5f4f2; --accent-paler: #f2faf8;
  --bg: #f5f6fa; --card: #ffffff;
  --text: #231d45; --text-secondary: #6b7089; --text-faint: #a8a9ad;
  --border: #e4e5ed; --border-soft: #f0f1f5;
  color: var(--text);
}
.mbd-sheet {
  width: 100%; max-width: 28rem;
  background: var(--card);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  max-height: 92dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.mbd-grip { width: 42px; height: 4px; background: var(--border); border-radius: 100px; margin: 10px auto 0; }
.mbd-head { padding: 14px 22px 6px; }
.mbd-eyebrow { font-size: 10px; font-weight: 800; color: var(--accent-dark); letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 6px; }
.mbd-title { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; line-height: 1.2; margin-bottom: 4px; }
.mbd-sub { font-size: 12.5px; font-weight: 500; color: var(--text-secondary); line-height: 1.5; }
.mbd-hint { padding: 8px 22px 0; font-size: 12px; font-weight: 600; color: var(--text-secondary); }
.mbd-empty { padding: 28px 22px; text-align: center; color: var(--text-faint); font-size: 12.5px; }
.mbd-empty-ico { font-size: 32px; margin-bottom: 8px; }

.mbd-card { display: flex; align-items: center; gap: 12px; margin: 10px 22px 0; padding: 13px 14px; background: var(--card); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05); cursor: pointer; transition: transform 0.12s, box-shadow 0.15s, border-color 0.15s; }
.mbd-card:hover { transform: translateY(-1px); border-color: var(--accent-pale); box-shadow: 0 8px 20px rgba(35, 29, 69, 0.10); }
.mbd-avatar { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #00b8b0, var(--accent-dark)); color: white; font-size: 15px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0, 161, 154, 0.25); }
.mbd-info { flex: 1; min-width: 0; }
.mbd-name { font-size: 14px; font-weight: 800; color: var(--text); }
.mbd-meta { font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-top: 2px; }
.mbd-tags { display: flex; gap: 5px; margin-top: 6px; flex-wrap: wrap; }
.mbd-tag { font-size: 9.5px; font-weight: 800; padding: 3px 8px; background: var(--bg); border: 1px solid var(--border); border-radius: 100px; color: var(--text-secondary); letter-spacing: 0.2px; }
.mbd-tag.watch { background: var(--accent-paler); color: var(--accent-dark); border-color: var(--accent-pale); }
.mbd-gauge { position: relative; width: 52px; height: 52px; flex-shrink: 0; }
.mbd-gauge svg { width: 100%; height: 100%; }
.mbd-gauge .mg-track { stroke: var(--accent-pale); }
.mbd-gauge .mg-fill { transition: stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1); filter: drop-shadow(0 0 4px rgba(0, 161, 154, 0.30)); }
.mbd-gauge-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: var(--accent-dark); letter-spacing: -0.4px; }
.mbd-gauge-num small { font-size: 8px; font-weight: 800; margin-left: 1px; }

.mbd-how { margin: 14px 22px 0; padding: 13px 15px; background: var(--accent-paler); border: 1px solid var(--accent-pale); border-radius: 12px; }
.mbd-how-h { font-size: 9.5px; font-weight: 800; color: var(--accent-dark); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
.mbd-how-v { font-size: 11.5px; font-weight: 600; color: var(--text-secondary); line-height: 1.55; }
.mbd-how-v b { color: var(--text); font-weight: 800; }

.mbd-enter-active,
.mbd-leave-active { transition: opacity 0.25s ease; }
.mbd-enter-active .mbd-sheet,
.mbd-leave-active .mbd-sheet { transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.mbd-enter-from,
.mbd-leave-to { opacity: 0; }
.mbd-enter-from .mbd-sheet,
.mbd-leave-to .mbd-sheet { transform: translateY(100%); }
</style>
