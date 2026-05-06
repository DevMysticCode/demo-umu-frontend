<template>
  <div class="image-slider">
    <!-- No-image placeholder -->
    <div v-if="visibleImages.length === 0" class="no-image-placeholder">
      <div class="no-image-glow" />
      <div class="no-image-logo">
        <svg viewBox="0 0 43 33" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M33.0496 22.7447V24.4998H29.6886L29.6698 22.8687C29.6698 20.1202 28.4599 18.9834 26.4158 18.9834C24.3716 18.9834 23.1617 20.1202 23.1617 22.8687V26.1985H19.8239V22.7447C19.8239 18.4875 22.2856 16.1318 26.4372 16.1318C30.5888 16.1318 33.0496 18.4875 33.0496 22.7447Z" fill="currentColor" />
          <path d="M16.4704 16.1548C20.622 16.1548 23.0837 18.5104 23.0837 22.7677V26.2214H19.7458V22.8917C19.7458 20.1431 18.5564 19.0064 16.4918 19.0064C14.4476 19.0064 13.2377 20.1431 13.2377 22.8917L13.2249 24.5227H9.86732L9.85876 22.7677C9.85876 18.5104 12.3205 16.1548 16.4721 16.1548H16.4704Z" fill="currentColor" />
          <path d="M24.4625 26.1176C24.4625 24.4712 23.1157 23.1372 21.454 23.1372C19.7923 23.1372 18.4456 24.472 18.4456 26.1176C18.4456 27.0764 18.9042 27.9266 19.6135 28.4716L18.9119 32.8005H23.997L23.2954 28.4716C24.0047 27.9266 24.4625 27.0756 24.4625 26.1176Z" fill="currentColor" />
          <path d="M42.9371 18.066C42.9345 17.1434 42.179 16.3955 41.2463 16.3955C40.3137 16.3955 39.5556 17.1458 39.5556 18.0709H39.559V25.5082C39.559 28.2567 38.3491 29.3934 36.305 29.3934C34.2608 29.3934 33.0509 28.2567 33.0509 25.5082V24.4986H29.6865V25.6321C29.6865 29.8894 32.1739 32.245 36.3255 32.245C40.4771 32.245 42.938 29.8894 42.938 25.6321L42.9371 18.066Z" fill="currentColor" />
          <path d="M0.00171036 18.066C0.0042773 17.1434 0.759816 16.3955 1.69247 16.3955C2.62599 16.3955 3.38323 17.1458 3.38323 18.0709H3.37981V25.5082C3.37981 28.2567 4.5897 29.3934 6.63384 29.3934C8.69938 29.3934 9.86734 28.2567 9.86734 25.5082V24.4986H13.2258V25.6321C13.2258 29.8894 10.7641 32.245 6.61245 32.245C2.46084 32.245 0 29.8894 0 25.6321V18.066H0.00171036Z" fill="currentColor" />
          <path d="M41.9458 11.0794L22.5842 0.234276C22.3189 0.0885573 22.0118 0.00724567 21.6995 0H21.6507V0.119151L21.6173 0H21.5711C21.2562 0.00805074 20.9499 0.0893627 20.6829 0.235886L7.20648 7.78426V6.46394C7.20648 5.59929 6.41072 4.89566 5.43357 4.89566C4.45642 4.89566 3.66067 5.59929 3.66067 6.46394V9.77119L1.32218 11.081C0.4922 11.5375 0.237216 12.5068 0.754028 13.2411C1.26998 13.9753 2.36607 14.2007 3.19691 13.7434L21.6344 3.41593L40.0728 13.7442C40.3577 13.9012 40.6786 13.9817 41.0063 13.9817C41.1415 13.9817 41.2776 13.968 41.4119 13.9407C41.8731 13.8457 42.265 13.5977 42.5157 13.2419C43.0316 12.5076 42.7767 11.5391 41.9475 11.0827L41.9458 11.0794Z" fill="currentColor" />
        </svg>
      </div>
      <p class="no-image-title">No image available</p>
      <p class="no-image-sub">The owner hasn't added photos for this property yet — check back soon.</p>
      <slot name="overlay"></slot>
    </div>

    <!-- Normal slider -->
    <div
      v-else
      class="slider-container"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div
        class="slider-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div v-for="(image, index) in visibleImages" :key="index" class="slide">
          <img
            :src="image"
            :alt="`Image ${index + 1}`"
            class="slide-image"
            @error="onImgError(index)"
          />
        </div>
      </div>

      <slot name="overlay"></slot>

      <div class="slide-indicator">
        {{ currentIndex + 1 }}/{{ visibleImages.length }}
      </div>

      <div class="slider-dots">
        <div
          v-for="(image, index) in visibleImages"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
  interval: {
    type: Number,
    default: 3000,
  },
})

const emit = defineEmits(['slideChange'])

const currentIndex = ref(0)
const touchStartX = ref(0)
const touchEndX = ref(0)
const failedIndexes = ref(new Set())

// Only show images that haven't failed to load
const visibleImages = computed(() =>
  props.images.filter((_, i) => !failedIndexes.value.has(i))
)

const onImgError = (index) => {
  failedIndexes.value = new Set([...failedIndexes.value, index])
  // If current slide was removed, reset to first
  if (currentIndex.value >= visibleImages.value.length) {
    currentIndex.value = 0
  }
}

const goToSlide = (index) => {
  if (index >= 0 && index < visibleImages.value.length) {
    currentIndex.value = index
    emit('slideChange', index)
  }
}

const nextSlide = () => {
  if (currentIndex.value < visibleImages.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
  emit('slideChange', currentIndex.value)
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = visibleImages.value.length - 1
  }
  emit('slideChange', currentIndex.value)
}

const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
  const diff = touchStartX.value - touchEndX.value
  const threshold = 50

  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }

  touchStartX.value = 0
  touchEndX.value = 0
}

watch(() => props.images, () => {
  failedIndexes.value = new Set()
  currentIndex.value = 0
})

let autoPlayTimer = null

onMounted(() => {
  if (props.autoPlay) {
    autoPlayTimer = setInterval(() => {
      nextSlide()
    }, props.interval)
  }
})

onUnmounted(() => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
})

defineExpose({
  nextSlide,
  prevSlide,
  goToSlide,
  currentIndex,
})
</script>

<style scoped>
.image-slider {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

.slider-track {
  display: flex;
  height: 100%;
  transition: transform 0.3s ease;
}

.slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-indicator {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  z-index: 10;
}

.slider-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: white;
  width: 24px;
  border-radius: 4px;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* No-image placeholder */
.no-image-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(ellipse 70% 80% at 50% 30%, rgba(61, 189, 163, 0.18), transparent 70%),
    linear-gradient(135deg, #f1f9f4 0%, #e2f1ea 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 32px;
  overflow: hidden;
}
.no-image-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(0, 161, 154, 0.12), transparent 60%);
  pointer-events: none;
}
.no-image-logo {
  width: 96px;
  color: #00a19a;
  filter: drop-shadow(0 6px 14px rgba(0, 161, 154, 0.22));
  position: relative;
  z-index: 1;
}
.no-image-logo svg { width: 100%; height: auto; }
.no-image-title {
  text-align: center;
  color: #1f7a66;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.3px;
  position: relative;
  z-index: 1;
  margin: 0;
}
.no-image-sub {
  text-align: center;
  color: #4a5868;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.45;
  max-width: 280px;
  letter-spacing: -0.1px;
  position: relative;
  z-index: 1;
  margin: 0;
}
</style>


