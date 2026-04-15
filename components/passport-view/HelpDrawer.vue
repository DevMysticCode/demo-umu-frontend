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
            <div v-if="!guidanceText" class="help-empty">
              <p>No additional help is available for this question.</p>
            </div>

            <template v-else>
              <!-- Audience label -->
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

              <!-- Guidance text — preserves \n\n paragraph breaks and bullet lines -->
              <p class="help-guidance-text">{{ guidanceText }}</p>

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
  // No mode: show seller guidance first, fall back to buyer
  return props.content.sellerGuidance || props.content.buyerGuidance || null
})
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

.help-audience-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 14px;
}

.help-audience-label--seller {
  background: #f0faf9;
  color: #00a19a;
  border: 1px solid #b2e4e1;
}

.help-audience-label--buyer {
  background: #f5f0ff;
  color: #7c3aed;
  border: 1px solid #d4b8f8;
}

.help-guidance-text {
  font-size: 14px;
  color: #2c2c2c;
  line-height: 1.7;
  margin: 0 0 16px;
  white-space: pre-line;
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
