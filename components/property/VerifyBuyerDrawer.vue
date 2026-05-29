<template>
  <Teleport to="body">
    <Transition name="verify-modal">
      <div v-if="open" class="vb-overlay" @click.self="$emit('close')">
        <div class="vb-sheet" @click.stop>
          <div class="vb-grip" />
          <div class="vb-head">
            <div class="vb-eyebrow">🛡 Verified buyer · Onfido</div>
            <div class="vb-title">Be the buyer sellers want to call back.</div>
            <div class="vb-sub">15-min ID check + proof of funds + chain check. Reusable across every UmovingU listing — verify once, use forever.</div>
          </div>

          <div class="vb-price-pill">
            <div>
              <div class="vb-price-amt">£35<small> one-off</small></div>
              <div class="vb-price-note">ID + proof of funds, done once</div>
            </div>
            <div class="vb-price-text">It's the same checks your conveyancer will need anyway — done upfront, so there's <b>no scramble or back-and-forth</b> chasing ID &amp; funds when you're ready to offer.</div>
          </div>

          <div class="vb-benefits">
            <div v-for="b in benefits" :key="b.title" class="vb-bnf-row">
              <div class="vb-bnf-ico">{{ b.icon }}</div>
              <div class="vb-bnf-body">
                <div class="vb-bnf-title">{{ b.title }}</div>
                <div class="vb-bnf-sub" v-html="b.sub" />
              </div>
            </div>
          </div>

          <div class="vb-read-row">
            <div class="vb-read-icon">⏱</div>
            <div class="vb-read-text"><b>4 minutes to start · 15 minutes total.</b> Most buyers finish in one sitting. We'll save your progress if you need to step away.</div>
          </div>

          <div class="vb-cta-row">
            <button class="vb-btn secondary" type="button" @click="$emit('close')">Not now</button>
            <button class="vb-btn primary" type="button" @click="$emit('start')">Start verification →</button>
          </div>
          <div class="vb-privacy">
            <span class="vb-privacy-icon">🔒</span>
            <span>Powered by <b>Onfido</b>. Compliant with FCA &amp; Money Laundering Regulations 2017. We never sell your data and you can request deletion any time.</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ (e: 'close'): void; (e: 'start'): void }>()

const benefits = [
  { icon: '⚡', title: '3× more likely to have your offer accepted', sub: 'Sellers see a "verified buyer" badge next to your offer. <b>Lloyds research, 2024</b>.' },
  { icon: '📋', title: 'Free Passport access on every property you\'re watching', sub: 'Worth £15 per published Passport. Watching 5 homes → ~£75 saved.' },
  { icon: '🥇', title: 'Front of the seller\'s queue', sub: 'Sellers sort interested buyers by status. Verified shows above un-verified, by default.' },
  { icon: '⏱', title: 'Skip the seller\'s solicitor KYC', sub: 'Cuts <b>2–3 weeks</b> off the exchange timeline. Onfido + AIP reuse, no re-doing ID.' },
  { icon: '💌', title: 'Ping owners of Unclaimed homes', sub: 'Only verified buyers can send a "serious interest" nudge to unclaimed addresses. Owners listen.' },
  { icon: '🔒', title: 'Onfido ID + Proof of funds + chain check', sub: 'Bank-grade verification. <b>Your data is never shared</b> with sellers without you tapping Share.' },
]
</script>

<style scoped>
.vb-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --warning-deep: #7a5500;
  color: var(--text);
}
.vb-sheet {
  width: 100%;
  max-width: 28rem;
  background: var(--card);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  max-height: 90dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.vb-grip { width: 42px; height: 4px; background: var(--border); border-radius: 100px; margin: 10px auto 0; }
.vb-head { padding: 14px 22px 6px; }
.vb-eyebrow { font-size: 10px; font-weight: 800; color: var(--accent-dark); letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 6px; }
.vb-title { font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; line-height: 1.2; margin-bottom: 6px; }
.vb-sub { font-size: 12.5px; font-weight: 500; color: var(--text-secondary); line-height: 1.55; }

.vb-price-pill { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: linear-gradient(135deg, #fffae0, var(--card)); border: 1.5px solid #ffe08a; border-radius: 14px; margin: 14px 22px 0; }
.vb-price-amt { font-size: 24px; font-weight: 800; color: var(--warning-deep); letter-spacing: -0.6px; }
.vb-price-amt small { font-size: 11px; font-weight: 700; color: var(--text-secondary); }
.vb-price-note { font-size: 10px; font-weight: 700; color: var(--text-faint); margin-top: 1px; }
.vb-price-text { flex: 1; font-size: 11.5px; font-weight: 600; color: var(--warning-deep); line-height: 1.45; }
.vb-price-text b { font-weight: 800; }

.vb-benefits { padding: 14px 22px 0; }
.vb-bnf-row { display: flex; gap: 11px; padding: 11px 0; }
.vb-bnf-row + .vb-bnf-row { border-top: 1px dashed var(--border-soft); }
.vb-bnf-ico { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, var(--accent-paler), var(--accent-pale)); color: var(--accent-dark); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.vb-bnf-body { flex: 1; padding-top: 3px; }
.vb-bnf-title { font-size: 13px; font-weight: 800; color: var(--text); letter-spacing: -0.1px; line-height: 1.25; }
.vb-bnf-sub { font-size: 11.5px; font-weight: 500; color: var(--text-secondary); margin-top: 2px; line-height: 1.45; }
.vb-bnf-sub :deep(b) { color: var(--text); font-weight: 800; }

.vb-read-row { display: flex; align-items: center; gap: 12px; margin: 14px 22px 0; padding: 12px 14px; background: var(--bg); border: 1px solid var(--border-soft); border-radius: 12px; }
.vb-read-icon { font-size: 18px; flex-shrink: 0; }
.vb-read-text { font-size: 12px; font-weight: 500; color: var(--text-secondary); line-height: 1.5; }
.vb-read-text b { color: var(--text); font-weight: 800; }

.vb-cta-row { padding: 18px 22px 6px; display: flex; gap: 8px; }
.vb-btn { flex: 1; padding: 14px; font-family: inherit; font-size: 14px; font-weight: 800; border-radius: 12px; cursor: pointer; transition: all 0.15s; border: none; }
.vb-btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent-dark)); color: white; box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3); }
.vb-btn.primary:hover { filter: brightness(1.06); }
.vb-btn.secondary { background: var(--card); border: 1.5px solid var(--border); color: var(--text-secondary); }
.vb-privacy { display: flex; align-items: flex-start; gap: 8px; padding: 6px 22px 18px; font-size: 10.5px; font-weight: 500; color: var(--text-faint); line-height: 1.5; }
.vb-privacy b { color: var(--text); font-weight: 800; }
.vb-privacy-icon { flex-shrink: 0; font-size: 13px; }

.verify-modal-enter-active,
.verify-modal-leave-active { transition: opacity 0.25s ease; }
.verify-modal-enter-active .vb-sheet,
.verify-modal-leave-active .vb-sheet { transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.verify-modal-enter-from,
.verify-modal-leave-to { opacity: 0; }
.verify-modal-enter-from .vb-sheet,
.verify-modal-leave-to .vb-sheet { transform: translateY(100%); }
</style>
