<template>
  <Teleport to="body">
    <Transition name="ppd">
      <div v-if="open" class="ppd-overlay" @click.self="$emit('close')">
        <div class="ppd-sheet" @click.stop>
          <div class="ppd-grip" />
          <div class="ppd-head">
            <div class="ppd-eyebrow">🚀 Publish your passport</div>
            <div class="ppd-title">Go public to every matching buyer.</div>
            <div class="ppd-sub">
              Right now your passport is private — you choose who sees it.
              Publishing lists it openly so any verified buyer searching this
              area can find and request it.
            </div>
          </div>

          <div class="ppd-list">
            <div class="ppd-row">
              <span class="ppd-ico on">🔒</span>
              <div>
                <div class="ppd-row-t">Today — private</div>
                <div class="ppd-row-s">
                  Only buyers you contact can see it. Good for testing
                  interest first.
                </div>
              </div>
            </div>
            <div class="ppd-row">
              <span class="ppd-ico">🌐</span>
              <div>
                <div class="ppd-row-t">After publishing — public</div>
                <div class="ppd-row-s">
                  Listed to all matching verified buyers. They can view &amp;
                  request a viewing.
                </div>
              </div>
            </div>
            <div class="ppd-row">
              <span class="ppd-ico">↩️</span>
              <div>
                <div class="ppd-row-t">You stay in control</div>
                <div class="ppd-row-s">
                  Unpublish any time. Your contact details stay hidden until
                  you choose to share.
                </div>
              </div>
            </div>
          </div>

          <div class="ppd-tip">
            💡 Tip: <b>match &amp; make contact first</b> — gauge interest
            privately, then publish to open it up to everyone.
          </div>

          <div class="ppd-cta-row">
            <button class="ppd-btn secondary" type="button" @click="$emit('close')">
              Not yet
            </button>
            <button
              class="ppd-btn primary"
              type="button"
              :disabled="submitting"
              @click="$emit('publish')"
            >
              {{ submitting ? 'Publishing…' : 'Publish now →' }}
            </button>
          </div>
          <div style="height: 12px" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  submitting?: boolean
}>()
defineEmits<{
  (e: 'close'): void
  (e: 'publish'): void
}>()
</script>

<style scoped>
.ppd-overlay {
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
.ppd-sheet { width: 100%; max-width: 28rem; background: var(--card); border-radius: 22px 22px 0 0; box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25); max-height: 90dvh; overflow-y: auto; padding-bottom: env(safe-area-inset-bottom); }
.ppd-grip { width: 42px; height: 4px; background: var(--border); border-radius: 100px; margin: 10px auto 0; }
.ppd-head { padding: 14px 22px 6px; }
.ppd-eyebrow { font-size: 10px; font-weight: 800; color: var(--accent-dark); letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 6px; }
.ppd-title { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; line-height: 1.2; margin-bottom: 4px; }
.ppd-sub { font-size: 12.5px; font-weight: 500; color: var(--text-secondary); line-height: 1.5; }

.ppd-list { padding: 8px 22px 0; display: flex; flex-direction: column; gap: 10px; }
.ppd-row { display: flex; gap: 12px; align-items: flex-start; }
.ppd-ico { width: 34px; height: 34px; border-radius: 10px; background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.ppd-ico.on { background: var(--accent-pale); }
.ppd-row-t { font-size: 13px; font-weight: 800; color: var(--text); }
.ppd-row-s { font-size: 11.5px; font-weight: 600; color: var(--text-secondary); line-height: 1.5; margin-top: 1px; }

.ppd-tip { margin: 14px 22px 0; padding: 11px 13px; background: var(--accent-paler); border: 1px solid var(--accent-pale); border-radius: 11px; font-size: 11.5px; font-weight: 600; color: var(--text-secondary); line-height: 1.5; }
.ppd-tip b { color: var(--accent-dark); font-weight: 800; }

.ppd-cta-row { padding: 18px 22px 6px; display: flex; gap: 8px; }
.ppd-btn { flex: 1; padding: 14px; font-family: inherit; font-size: 13.5px; font-weight: 800; border-radius: 12px; cursor: pointer; border: none; transition: filter 0.15s; }
.ppd-btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent-dark)); color: white; box-shadow: 0 4px 14px rgba(0, 161, 154, 0.30); }
.ppd-btn.primary:hover:not(:disabled) { filter: brightness(1.06); }
.ppd-btn.primary:disabled { opacity: 0.55; cursor: default; box-shadow: none; }
.ppd-btn.secondary { background: var(--card); border: 1.5px solid var(--border); color: var(--text-secondary); }

.ppd-enter-active,
.ppd-leave-active { transition: opacity 0.25s ease; }
.ppd-enter-active .ppd-sheet,
.ppd-leave-active .ppd-sheet { transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.ppd-enter-from,
.ppd-leave-to { opacity: 0; }
.ppd-enter-from .ppd-sheet,
.ppd-leave-to .ppd-sheet { transform: translateY(100%); }
</style>
