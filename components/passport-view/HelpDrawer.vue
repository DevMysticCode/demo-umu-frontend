<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="show" class="help-drawer-overlay" @click.self="$emit('close')">
        <div class="help-drawer">
          <!-- Handle + Header -->
          <div class="help-drawer-handle" />
          <div class="help-drawer-header">
            <div class="help-drawer-title-wrap">
              <span class="help-drawer-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#00a19a" stroke-width="2"/>
                  <path d="M12 17v-5" stroke="#00a19a" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="12" cy="8" r="1" fill="#00a19a"/>
                </svg>
              </span>
              <h2 class="help-drawer-title">About this question</h2>
            </div>
            <button class="help-close-btn" @click="$emit('close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#666" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Scrollable body -->
          <div class="help-drawer-body">
            <!-- No content fallback -->
            <div v-if="!content" class="help-empty">
              <p>No additional help is available for this question.</p>
            </div>

            <template v-else>
              <!-- Main explanation -->
              <div class="help-section">
                <p
                  v-for="(paragraph, i) in paragraphs"
                  :key="i"
                  class="help-paragraph"
                  v-html="formatLine(paragraph)"
                />
              </div>

              <!-- Key Points -->
              <div v-if="content.keyPoints?.length" class="help-section">
                <h3 class="help-section-title">Key Points</h3>
                <ul class="help-key-points">
                  <li v-for="(point, i) in content.keyPoints" :key="i">
                    <span class="help-bullet">•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>

              <!-- Seller Guidance — shown only in seller/passport view -->
              <div v-if="content.sellerGuidance && mode !== 'buyer'" class="help-guidance help-guidance--seller">
                <div class="help-guidance-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#00a19a" stroke-width="2"/>
                  </svg>
                  For Sellers
                </div>
                <p class="help-guidance-text">{{ content.sellerGuidance }}</p>
              </div>

              <!-- Buyer Guidance — shown only in buyer view -->
              <div v-if="content.buyerGuidance && mode !== 'seller'" class="help-guidance help-guidance--buyer">
                <div class="help-guidance-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7" r="4" stroke="#00a19a" stroke-width="2"/>
                    <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke="#00a19a" stroke-width="2"/>
                  </svg>
                  For Buyers
                </div>
                <p class="help-guidance-text">{{ content.buyerGuidance }}</p>
              </div>

              <!-- Disclaimer -->
              <p v-if="content.disclaimer" class="help-disclaimer">
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
  mainExplanation?: string
  keyPoints?: string[]
  sellerGuidance?: string
  buyerGuidance?: string
  disclaimer?: string
}

const props = defineProps<{
  show: boolean
  content: HelpContent | null
  mode?: 'seller' | 'buyer'
}>()

defineEmits<{ close: [] }>()

const paragraphs = computed(() => {
  if (!props.content?.mainExplanation) return []
  return props.content.mainExplanation
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
})

// Bold any text that starts with a bullet or is a heading-like line
function formatLine(line: string): string {
  // Lines starting with • are already bullet-ish — keep as-is
  // Lines that look like "Section Title:" — bold them
  if (/^[A-Z][^a-z]{2,}:/.test(line)) {
    return `<strong>${line}</strong>`
  }
  return line
}
</script>

<style scoped>
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
  max-height: 82vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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
  padding: 12px 20px 12px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.help-drawer-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-drawer-icon {
  display: flex;
  align-items: center;
}

.help-drawer-title {
  font-size: 16px;
  font-weight: 600;
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

.help-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
}

.help-empty {
  color: #888;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

.help-section {
  margin-bottom: 20px;
}

.help-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #00a19a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 10px;
}

.help-paragraph {
  font-size: 14px;
  color: #2c2c2c;
  line-height: 1.65;
  margin: 0 0 10px;
}

.help-key-points {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-key-points li {
  display: flex;
  gap: 8px;
  font-size: 14px;
  color: #2c2c2c;
  line-height: 1.5;
}

.help-bullet {
  color: #00a19a;
  font-weight: 700;
  flex-shrink: 0;
}

.help-guidance {
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 14px;
}

.help-guidance--seller {
  background: #f0faf9;
  border: 1px solid #b2e4e1;
}

.help-guidance--buyer {
  background: #f5f0ff;
  border: 1px solid #d4b8f8;
}

.help-guidance-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #00a19a;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.help-guidance--buyer .help-guidance-label {
  color: #7c3aed;
}

.help-guidance--buyer .help-guidance-label svg path,
.help-guidance--buyer .help-guidance-label svg circle {
  stroke: #7c3aed;
}

.help-guidance-text {
  font-size: 13px;
  color: #333;
  line-height: 1.6;
  margin: 0;
}

.help-disclaimer {
  font-size: 11px;
  color: #aaa;
  line-height: 1.5;
  margin: 4px 0 0;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

/* Transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-active .help-drawer,
.drawer-leave-active .help-drawer {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .help-drawer,
.drawer-leave-to .help-drawer {
  transform: translateY(100%);
}
</style>
