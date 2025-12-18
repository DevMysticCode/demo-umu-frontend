<template>
  <div class="image-slider">
    <div
      class="slider-container"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div
        class="slider-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div v-for="(image, index) in images" :key="index" class="slide">
          <img :src="image" :alt="`Image ${index + 1}`" class="slide-image" />
        </div>
      </div>

      <slot name="overlay"></slot>

      <div class="slide-indicator">
        {{ currentIndex + 1 }}/{{ images.length }}
      </div>

      <div class="slider-dots">
        <div
          v-for="(image, index) in images"
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

const goToSlide = (index) => {
  if (index >= 0 && index < props.images.length) {
    currentIndex.value = index
    emit('slideChange', index)
  }
}

const nextSlide = () => {
  if (currentIndex.value < props.images.length - 1) {
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
    currentIndex.value = props.images.length - 1
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
</style>
