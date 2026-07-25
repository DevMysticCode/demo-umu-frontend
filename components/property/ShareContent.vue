<template>
  <div class="share-content">
    <!-- Property summary card at the top -->
    <div class="share-property-card">
      <img
        v-if="propertyImage"
        :src="propertyImage"
        alt=""
        class="share-property-thumb"
      />
      <div v-else class="share-property-thumb share-property-thumb--empty">
        🏠
      </div>
      <div class="share-property-info">
        <div class="share-property-title">{{ propertyTitle }}</div>
        <div class="share-property-address">{{ propertyAddress }}</div>
        <div v-if="propertyPrice" class="share-property-price">
          {{ propertyPrice }}
        </div>
      </div>
    </div>

    <!-- Primary CTA — Web Share API opens the OS share sheet
         (WhatsApp / Messages / Mail / Instagram / etc.). Falls back
         to copying the link when Web Share isn't available. -->
    <button
      v-if="canNativeShare"
      class="share-primary"
      type="button"
      @click="onNativeShare"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      Share via…
    </button>

    <!-- Link row — always visible so the owner can see the link and
         copy it manually even when the OS share sheet is available. -->
    <div class="share-link-row">
      <div class="share-link-input" @click="selectLink">
        {{ shareLink }}
      </div>
      <button
        type="button"
        class="share-copy-btn"
        :class="{ copied: copyState === 'copied' }"
        @click="onCopyLink"
      >
        {{ copyState === 'copied' ? '✓ Copied' : 'Copy' }}
      </button>
    </div>

    <!-- Secondary actions — Print + Save as PDF both use the browser's
         built-in print dialog which lets the user pick either. -->
    <div class="share-actions">
      <button type="button" class="share-action" @click="onPrint">
        <div class="share-action-ic"><img src="/op-icons/misc/printer.png" alt="" loading="lazy" /></div>
        <div class="share-action-body">
          <div class="share-action-title">Print</div>
          <div class="share-action-sub">Send this page to a printer</div>
        </div>
      </button>
      <button type="button" class="share-action" @click="onSavePdf">
        <div class="share-action-ic">📄</div>
        <div class="share-action-body">
          <div class="share-action-title">Save as PDF</div>
          <div class="share-action-sub">Uses your device's Save to PDF option</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  propertyTitle: { type: String, default: '' },
  propertyAddress: { type: String, default: '' },
  propertyPrice: { type: String, default: '' },
  propertyImage: { type: String, default: '' },
})

// Current page URL — resolves to the actual property page the user is
// on, so pasting the link elsewhere lands the recipient on the same
// property view. Falls back to '' during SSR.
const shareLink = computed(() => {
  if (typeof window === 'undefined') return ''
  return window.location.href
})

// Web Share API is on iOS Safari + Chrome Android + most Firefox
// mobile. We only render the primary "Share via…" button when the
// browser can actually service navigator.share() with the payload —
// otherwise the copy-link row is the primary action.
const canNativeShare = computed(() => {
  if (typeof navigator === 'undefined') return false
  return typeof navigator.share === 'function'
})

const copyState = ref('idle') // idle | copied | error

async function onNativeShare() {
  try {
    await navigator.share({
      title: props.propertyTitle
        ? `${props.propertyTitle} on UMovingU`
        : 'Property on UMovingU',
      text: [props.propertyTitle, props.propertyAddress, props.propertyPrice]
        .filter(Boolean)
        .join(' · '),
      url: shareLink.value,
    })
  } catch (err) {
    // AbortError is the user cancelling the share sheet — silent.
    if (err?.name !== 'AbortError' && import.meta.dev) {
      console.warn('[share] native share failed', err)
    }
  }
}

async function onCopyLink() {
  copyState.value = 'idle'
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareLink.value)
    } else {
      // Fallback for older webviews without the Clipboard API.
      const ta = document.createElement('textarea')
      ta.value = shareLink.value
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copyState.value = 'copied'
    setTimeout(() => (copyState.value = 'idle'), 1800)
  } catch {
    copyState.value = 'error'
  }
}

function selectLink(e) {
  // Allow the user to tap the link box and see it highlighted, in
  // case they want to copy manually (belt-and-braces if Clipboard
  // API is blocked by the browser).
  const range = document.createRange()
  range.selectNodeContents(e.target)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

function onPrint() {
  if (typeof window === 'undefined') return
  window.print()
}

function onSavePdf() {
  // iOS Safari and Chrome both expose "Save as PDF" as one of the
  // destinations inside the standard print dialog — same handler
  // works for both actions with a clarifying tap target on the UI.
  onPrint()
}
</script>

<style scoped>
.share-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Property card */
.share-property-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f7fc;
  border-radius: 14px;
  border: 1px solid #eaeaef;
  align-items: center;
}
.share-property-thumb {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}
.share-property-thumb--empty {
  background: #e5f4f2;
  color: #00857f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.share-property-info {
  flex: 1;
  min-width: 0;
}
.share-property-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.share-property-address {
  font-size: 12.5px;
  color: #6b7089;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.share-property-price {
  font-size: 13px;
  font-weight: 700;
  color: #00857f;
  margin-top: 4px;
}

/* Primary share */
.share-primary {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #00a19a;
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background 0.15s;
}
.share-primary:hover { background: #00857f }
.share-primary:active { transform: scale(0.99) }
.share-primary svg { width: 18px; height: 18px }

/* Link row */
.share-link-row {
  display: flex;
  gap: 8px;
  background: #f8f7fc;
  border: 1px solid #eaeaef;
  border-radius: 12px;
  padding: 6px 6px 6px 12px;
  align-items: center;
}
.share-link-input {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #4a5868;
  font-family: 'SF Mono', ui-monospace, Menlo, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  padding: 8px 0;
}
.share-copy-btn {
  border: none;
  background: #fff;
  color: #00857f;
  border: 1px solid #b8e0dc;
  padding: 8px 14px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.share-copy-btn:hover { background: #e5f4f2 }
.share-copy-btn.copied {
  background: #e5f4f2;
  color: #008a84;
}

/* Secondary actions */
.share-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.share-action {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #fff;
  border: 1px solid #eaeaef;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.14s, border-color 0.14s;
}
.share-action:hover {
  background: #f8f7fc;
  border-color: #ded9ea;
}
.share-action:active { transform: scale(0.998) }
.share-action-ic img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}
.share-action-ic {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e5f4f2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.share-action-body { flex: 1; min-width: 0 }
.share-action-title {
  font-size: 14px;
  font-weight: 700;
  color: #231d45;
}
.share-action-sub {
  font-size: 12px;
  color: #6b7089;
  margin-top: 2px;
}
</style>
