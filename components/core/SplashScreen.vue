<template>
  <Transition name="splash-fade">
    <div v-if="visible" class="splash" :class="{ 'splash--hiding': hiding }">
      <div class="splash-logo-wrap">
        <svg
          width="220"
          height="220"
          viewBox="0 0 877.69 877.69"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#fff"
            d="m573.6,497.11v21.8h-39.28l-.22-20.26c0-34.14-14.14-48.26-38.03-48.26s-38.03,14.12-38.03,48.26v41.36h-39.01v-42.9c0-52.88,28.77-82.14,77.29-82.14s77.29,29.26,77.29,82.14Z"
          />
          <path
            fill="#fff"
            d="m379.84,415.26c48.52,0,77.29,29.26,77.29,82.14v42.9s-39.01,0-39.01,0v-41.36c0-34.14-13.9-48.26-38.03-48.26-23.89,0-38.03,14.12-38.03,48.26l-.15,20.26h-39.24s-.1-21.8-.1-21.8c0-52.88,28.77-82.14,77.29-82.14Z"
          />
          <path
            fill="#00a19a"
            d="m689.16,439c-.03-11.46-8.86-20.75-19.76-20.75s-19.76,9.32-19.76,20.81h.04v92.38c0,34.14-14.14,48.26-38.03,48.26s-38.03-14.12-38.03-48.26v-12.54h-39.32v14.08c0,52.88,29.07,82.14,77.59,82.14s77.28-29.26,77.28-82.14v-93.98h-.02Z"
          />
          <path
            fill="#00a19a"
            d="m187.37,439c.03-11.46,8.86-20.75,19.76-20.75,10.91,0,19.76,9.32,19.76,20.81h-.04v92.38c0,34.14,14.14,48.26,38.03,48.26,24.14,0,37.79-14.12,37.79-48.26v-12.54s39.25,0,39.25,0v14.08c0,52.88-28.77,82.14-77.29,82.14-48.52,0-77.28-29.26-77.28-82.14v-93.98s.02,0,.02,0Z"
          />
          <path
            fill="#00a19a"
            d="m677.57,352.22l-226.28-134.71c-3.1-1.81-6.69-2.82-10.34-2.91h-.57s0,1.48,0,1.48l-.39-1.48h-.54c-3.68.1-7.26,1.11-10.38,2.93l-157.5,93.76v-16.4c0-10.74-9.3-19.48-20.72-19.48s-20.72,8.74-20.72,19.48v41.08l-27.33,16.27c-9.7,5.67-12.68,17.71-6.64,26.83,6.03,9.12,18.84,11.92,28.55,6.24l215.48-128.28,215.49,128.29c3.33,1.95,7.08,2.95,10.91,2.95,1.58,0,3.17-.17,4.74-.51,5.39-1.18,9.97-4.26,12.9-8.68,6.03-9.12,3.05-21.15-6.64-26.82Z"
          />
          <rect
            fill="#fff"
            x="392.79"
            y="309.67"
            width="39.07"
            height="39.07"
            rx="4.79"
          />
          <rect
            fill="#fff"
            x="443.76"
            y="309.67"
            width="39.07"
            height="39.07"
            rx="4.79"
          />
          <rect
            fill="#fff"
            x="392.79"
            y="358.62"
            width="39.07"
            height="39.07"
            rx="4.79"
          />
          <rect
            fill="#fff"
            x="443.76"
            y="358.62"
            width="39.07"
            height="39.07"
            rx="4.79"
          />
        </svg>
      </div>
      <div class="splash-wordmark">umovingu</div>

      <div class="splash-powered-by">
        <div class="splash-powered-label">Powered by</div>
        <div class="splash-powered-row">
          <svg
            width="26"
            height="26"
            viewBox="0 0 480 480"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="240" cy="240" r="240" fill="#00a19a" />
            <circle
              cx="168"
              cy="210"
              r="72"
              fill="none"
              stroke="#fff"
              stroke-width="42"
            />
            <rect
              x="222"
              y="148"
              width="44"
              height="260"
              rx="22"
              fill="#231d45"
            />
            <rect
              x="222"
              y="358"
              width="72"
              height="34"
              rx="14"
              fill="#231d45"
            />
            <rect
              x="222"
              y="390"
              width="52"
              height="34"
              rx="14"
              fill="#231d45"
            />
            <circle
              cx="298"
              cy="196"
              r="68"
              fill="none"
              stroke="#231d45"
              stroke-width="42"
            />
            <rect x="272" y="170" width="20" height="20" rx="4" fill="#fff" />
            <rect x="300" y="170" width="20" height="20" rx="4" fill="#fff" />
            <rect x="272" y="198" width="20" height="20" rx="4" fill="#fff" />
            <rect x="300" y="198" width="20" height="20" rx="4" fill="#fff" />
          </svg>
          <span class="splash-powered-name">OpenProperty</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  /** Minimum time the splash stays fully visible before fading (ms) */
  duration?: number
  /** Show on every page load instead of once per session */
  everyLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2400,
  everyLoad: false,
})

const SESSION_KEY = 'umu_splash_shown'

const visible = ref(false)
const hiding = ref(false)

onMounted(() => {
  if (typeof window === 'undefined') return
  if (!props.everyLoad && sessionStorage.getItem(SESSION_KEY) === '1') return

  visible.value = true
  // sessionStorage.setItem(SESSION_KEY, '1')

  setTimeout(() => {
    hiding.value = true
    setTimeout(() => {
      visible.value = false
    }, 600)
  }, props.duration)
})
</script>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: #231d45;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.splash-logo-wrap {
  display: grid;
  place-items: center;
  margin-bottom: 10px;
  opacity: 0;
  animation: splashLogoIn 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
}

.splash-wordmark {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.04em;
  opacity: 0;
  animation: splashWordmarkIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 1.2s forwards;
}

.splash-powered-by {
  position: absolute;
  bottom: calc(44px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  animation: splashWordmarkIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 1.8s forwards;
}

.splash-powered-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.splash-powered-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.splash-powered-name {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.01em;
}

.splash--hiding {
  animation: splashFadeOut 0.6s cubic-bezier(0.4, 0, 1, 1) forwards;
  pointer-events: none;
}

@keyframes splashLogoIn {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }
  30% {
    opacity: 1;
  }
  80% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes splashWordmarkIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes splashFadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
