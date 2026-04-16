<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="show" class="help-drawer-overlay" @click.self="$emit('close')">
        <div class="help-drawer">
          <!-- Handle -->
          <div class="help-drawer-handle" />

          <!-- Header -->
          <div class="help-drawer-header">
            <div class="help-drawer-title-wrap">
              <span class="help-drawer-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#00a19a" stroke-width="2"/>
                  <path d="M12 17v-5" stroke="#00a19a" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="12" cy="8" r="1" fill="#00a19a"/>
                </svg>
              </span>
              <h2 class="help-drawer-title">Guidance</h2>
            </div>
            <button class="help-close-btn" @click="$emit('close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#666" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Scrollable body -->
          <div class="help-drawer-body">
            <!-- No content -->
            <div v-if="!blocks.length" class="help-empty">
              <p>No additional guidance is available for this question.</p>
            </div>

            <template v-else>
              <!-- Audience pill -->
              <div v-if="mode" class="help-audience-label" :class="`help-audience-label--${mode}`">
                <svg v-if="mode === 'seller'" width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ mode === 'seller' ? 'For Sellers' : 'For Buyers' }}
              </div>

              <!-- Structured blocks -->
              <template v-for="(block, i) in blocks" :key="i">
                <!-- Section heading (## ...) -->
                <div v-if="block.type === 'heading'" class="help-section-heading">
                  <span class="help-section-heading-icon">
                    <svg v-if="block.text === 'Red flags'" width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <svg v-else-if="block.text === 'Questions to ask your solicitor'" width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <circle cx="12" cy="17" r="1" fill="currentColor"/>
                    </svg>
                    <svg v-else-if="block.text === 'What this means'" width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 17v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <circle cx="12" cy="8" r="1" fill="currentColor"/>
                    </svg>
                    <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </span>
                  {{ block.text }}
                </div>

                <!-- Bullet list -->
                <ul v-else-if="block.type === 'bullets'" class="help-bullet-list">
                  <li v-for="(item, j) in block.items" :key="j" class="help-bullet-item">
                    {{ item }}
                  </li>
                </ul>

                <!-- Plain paragraph -->
                <p v-else class="help-para">{{ block.text }}</p>
              </template>

              <!-- Disclaimer -->
              <p v-if="content?.disclaimer" class="help-disclaimer">
                {{ content.disclaimer }}
              </p>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface HelpContent {
  sellerGuidance?: string
  buyerGuidance?: string
  disclaimer?: string
}

type Block =
  | { type: 'heading'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'para'; text: string }

const props = defineProps<{
  show: boolean
  content: HelpContent | null
  mode?: 'seller' | 'buyer'
}>()

defineEmits<{ close: [] }>()

const guidanceText = computed(() => {
  if (!props.content) return null
  if (props.mode === 'buyer') return props.content.buyerGuidance || null
  if (props.mode === 'seller') return props.content.sellerGuidance || null
  return props.content.sellerGuidance || props.content.buyerGuidance || null
})

/** Parse guidance text into typed blocks for structured rendering */
const blocks = computed((): Block[] => {
  const text = guidanceText.value
  if (!text) return []

  const lines = text.split('\n')
  const result: Block[] = []
  let bulletBuffer: string[] = []

  const flushBullets = () => {
    if (bulletBuffer.length) {
      result.push({ type: 'bullets', items: [...bulletBuffer] })
      bulletBuffer = []
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushBullets()
      continue
    }
    if (line.startsWith('## ')) {
      flushBullets()
      result.push({ type: 'heading', text: line.slice(3) })
    } else if (line.startsWith('• ')) {
      bulletBuffer.push(line.slice(2))
    } else {
      flushBullets()
      result.push({ type: 'para', text: line })
    }
  }
  flushBullets()
  return result
})
</script>

<style scoped>
/* ── Overlay & Sheet ───────────────────────────────────────────────────────── */
.help-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.help-drawer {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Handle & Header ───────────────────────────────────────────────────────── */
.help-drawer-handle {
  width: 36px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin: 12px auto 4px;
  flex-shrink: 0;
}

.help-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.help-drawer-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-drawer-icon { display: flex; align-items: center; }

.help-drawer-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.help-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Body ──────────────────────────────────────────────────────────────────── */
.help-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
}

.help-empty {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

/* ── Audience pill ─────────────────────────────────────────────────────────── */
.help-audience-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.help-audience-label--seller {
  background: #f0faf9;
  color: #00a19a;
  border: 1px solid #b2e4e1;
}

.help-audience-label--buyer {
  background: #f0f7ff;
  color: #3b6dbf;
  border: 1px solid #b8d0f5;
}

/* ── Plain paragraph ───────────────────────────────────────────────────────── */
.help-para {
  font-size: 14px;
  color: #2c2c2c;
  line-height: 1.75;
  margin: 0 0 14px;
}

/* ── Section heading (## ...) ──────────────────────────────────────────────── */
.help-section-heading {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 20px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1.5px solid #f0f0f0;
}

.help-section-heading:first-of-type { margin-top: 4px; }

.help-section-heading-icon {
  display: flex;
  align-items: center;
  color: #00a19a;
  flex-shrink: 0;
}

/* Colour the Red flags heading differently */
.help-section-heading:has(.help-section-heading-icon svg[data-flag]) {
  color: #c0392b;
}

/* ── Bullet list ───────────────────────────────────────────────────────────── */
.help-bullet-list {
  list-style: none;
  padding: 0;
  margin: 0 0 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.help-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 14px;
  color: #3a3a3a;
  line-height: 1.6;
}

.help-bullet-item::before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00a19a;
  margin-top: 7px;
  flex-shrink: 0;
}

/* ── Disclaimer ────────────────────────────────────────────────────────────── */
.help-disclaimer {
  font-size: 11px;
  color: #b0b0b0;
  line-height: 1.5;
  margin: 20px 0 0;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

/* ── Slide-up transition ───────────────────────────────────────────────────── */
.drawer-enter-active,
.drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-active .help-drawer,
.drawer-leave-active .help-drawer { transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; }
.drawer-enter-from .help-drawer,
.drawer-leave-to .help-drawer { transform: translateY(100%); }
</style>
