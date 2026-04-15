<template>
  <Teleport to="body">
    <Transition name="video-modal">
      <div v-if="show" class="video-modal-overlay" @click.self="$emit('close')">
        <div class="video-modal">
          <!-- Header -->
          <div class="video-modal-header">
            <h2 class="video-modal-title">Help Video</h2>
            <button class="video-close-btn" @click="$emit('close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Video or Coming Soon -->
          <div class="video-body">
            <template v-if="videoUrl">
              <div class="video-wrap" ref="videoWrap">
                <iframe
                  ref="iframeEl"
                  :src="videoUrl"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowfullscreen
                  class="video-iframe"
                />
              </div>
              <button class="fullscreen-btn" @click="requestFullscreen">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Fullscreen
              </button>
              <p class="rotate-hint">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4v5h.582M4.582 9A10 10 0 1121 12" stroke="#00a19a" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Rotate your phone for a better experience
              </p>
            </template>

            <template v-else>
              <!-- Coming soon state -->
              <div class="video-coming-soon">
                <div class="video-coming-soon-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#00a19a" stroke-width="1.5"/>
                    <path d="M10 8l6 4-6 4V8z" fill="#00a19a"/>
                  </svg>
                </div>
                <h3 class="video-coming-soon-title">Video Coming Soon</h3>
                <p class="video-coming-soon-sub">
                  We're producing an explanation video for this topic. Check back soon — or use the Help button for a written guide.
                </p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  show: boolean
  videoUrl?: string | null
}>()

defineEmits<{ close: [] }>()

const iframeEl = ref<HTMLIFrameElement | null>(null)
const videoWrap = ref<HTMLDivElement | null>(null)

function requestFullscreen() {
  const el = iframeEl.value as any
  if (!el) return
  if (el.requestFullscreen) el.requestFullscreen()
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
  else if (el.mozRequestFullScreen) el.mozRequestFullScreen()
  else if (el.msRequestFullscreen) el.msRequestFullscreen()
}
</script>

<style scoped>
.video-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.video-modal {
  width: 100%;
  max-width: 480px;
  background: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.video-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.video-modal-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.video-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: none;
  cursor: pointer;
}

.video-body {
  padding: 16px;
}

.video-wrap {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  border-radius: 10px;
  overflow: hidden;
  background: #000;
}

.video-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.fullscreen-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px auto 0;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.rotate-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 11px;
  color: #888;
  margin: 10px 0 0;
  text-align: center;
}

.video-coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  text-align: center;
}

.video-coming-soon-icon {
  margin-bottom: 16px;
  opacity: 0.8;
}

.video-coming-soon-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 10px;
}

.video-coming-soon-sub {
  font-size: 13px;
  color: #999;
  line-height: 1.6;
  margin: 0;
}

/* Transition */
.video-modal-enter-active,
.video-modal-leave-active {
  transition: opacity 0.2s ease;
}
.video-modal-enter-active .video-modal,
.video-modal-leave-active .video-modal {
  transition: transform 0.22s ease, opacity 0.22s ease;
}
.video-modal-enter-from,
.video-modal-leave-to {
  opacity: 0;
}
.video-modal-enter-from .video-modal,
.video-modal-leave-to .video-modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
