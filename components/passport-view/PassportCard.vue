<template>
  <div class="passport-card">
    <div class="passport-container">
      <img
        src="/op-icons/passportview/umu-passport.png"
        alt="Passport Background"
        class="passport-image h-full object-cover rounded-lg"
      />
      <div class="passport-address">
        <div class="address-line">{{ line1 }}</div>
        <div class="address-line-small">{{ line2 }}</div>
      </div>
    </div>

    <!-- <div class="passport-visual">
      <div class="passport-book">
        <div class="passport-cover">
          <div class="passport-text">Property Passport</div>
          <div class="house-icon">
            <OPIcon name="logo" class="w-[50px] h-[50px]" />
          </div>
          <div class="passport-address">
            <div class="address-line">{{ line1 }}</div>
            <div class="address-line-small">{{ line2 }}</div>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import OPIcon from '../ui/OPIcon.vue'

defineProps({
  line1: {
    type: String,
    required: true,
  },
  line2: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
/* Extracted CSS for passport-card only. You can move/adjust as needed */
.passport-card {
  display: flex;
  justify-content: center;
  margin: 32px 0;
  perspective: 1000px;
}

.passport-container {
  position: relative;
  width: 100%;
  max-width: 360px;
}

.passport-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}
/* .passport-visual {
  transform: rotateY(-15deg);
  transition: transform 0.3s;
}

.passport-visual:hover {
  transform: rotateY(0deg);
}

.passport-book {
  width: 200px;
  height: 260px;
  position: relative;
}

.passport-cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #00b8a9 0%, #00a89a 100%);
  border-radius: 8px;
  box-shadow:
    8px 8px 20px rgba(0, 0, 0, 0.3),
    inset 2px 2px 8px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  color: white;
  position: relative;
}

.passport-cover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.3), transparent);
  border-radius: 8px 0 0 8px;
} */

/* .passport-text {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
}

.house-icon {
  width: 40%;
  margin: 20px 0;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
} */

.passport-address {
  margin-top: auto;
  text-align: center;
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
}

.address-line {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.address-line-small {
  font-size: 11px;
  opacity: 0.9;
}
</style>
