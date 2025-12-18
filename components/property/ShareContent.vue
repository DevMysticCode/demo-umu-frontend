<template>
  <div class="drawer-container" @click.stop>
    <div class="drawer-content">
      <div class="property-info">
        <img
          v-if="propertyImage"
          :src="propertyImage"
          alt="Property"
          class="property-thumb"
        />
        <div class="property-details">
          <h3 class="property-title">{{ propertyTitle }}</h3>
          <p class="property-address">{{ propertyAddress }}</p>
          <p class="property-price">{{ propertyPrice }}</p>
        </div>
        <!-- <button class="close-btn" @click="close">✕</button> -->
      </div>

      <div class="contacts-section">
        <div class="contacts-scroll">
          <div
            v-for="contact in contacts"
            :key="contact.name"
            class="contact-item"
            @click="shareWithContact(contact)"
          >
            <div class="contact-avatar">
              <img :src="contact.avatar" :alt="contact.name" />
              <div class="message-badge">
                <OPIcon name="messages" class="w-[20px] h-[20px]" />
              </div>
            </div>
            <p class="contact-name">{{ contact.name }}</p>
          </div>
        </div>
      </div>

      <div class="share-options">
        <div
          v-for="option in shareOptions"
          :key="option.name"
          class="share-option"
          @click="handleShare(option)"
        >
          <div class="option-icon" :style="{ background: option.color }">
            <span
              ><OPIcon :name="option.icon" class="w-[60px] h-[60px]"
            /></span>
          </div>
          <p class="option-name">{{ option.name }}</p>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn">
          <span class="action-icon">♡</span>
          <span class="action-text">Add Property to Favourites</span>
          <span class="action-arrow">❤️</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">🖨️</span>
          <span class="action-text">Print</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">📝</span>
          <span class="action-text">Save in Notes</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">📤</span>
          <span class="action-text">Export</span>
        </button>
      </div>

      <div class="action-buttons">
        <button class="action-btn">
          <span class="action-icon">💬</span>
          <span class="action-text">Report</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">✓</span>
          <span class="action-text">Verify Data</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import OPIcon from '~/components/ui/OPIcon.vue'
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  propertyTitle: {
    type: String,
    default: '8, Greenfield Avenue',
  },
  propertyAddress: {
    type: String,
    default: 'Walton-on-Thames, TW18...',
  },
  propertyPrice: {
    type: String,
    default: '£1,200,000',
  },
  propertyImage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'share'])

const contacts = [
  {
    name: 'Sandy Wilder Cheng',
    avatar:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23FF6B9D"/%3E%3C/svg%3E',
  },
  {
    name: 'Kevin Leong',
    avatar:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%234A90E2"/%3E%3C/svg%3E',
  },
  {
    name: 'Sandy and Kevin',
    avatar:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%2350C878"/%3E%3C/svg%3E',
  },
  {
    name: 'Juliana Mejia',
    avatar:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23F39C12"/%3E%3C/svg%3E',
  },
]

const shareOptions = [
  {
    name: 'AirDrop',
    icon: 'airdrop',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  { name: 'Messages', icon: 'messagesLight', color: '#34C759' },
  {
    name: 'Instagram',
    icon: 'instagram',
    color:
      'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
  },
  { name: 'WhatsApp', icon: 'whatsapp', color: '#1877F2' },
]

const close = () => {
  emit('update:modelValue', false)
}

const shareWithContact = (contact) => {
  emit('share', { type: 'contact', data: contact })
  close()
}

const handleShare = (option) => {
  emit('share', { type: 'option', data: option })
  close()
}
</script>

<style scoped>
/* .drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  display: flex;
  align-items: flex-end;
} */

.drawer-container {
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 12px 0 20px;
}

.drawer-handle {
  width: 36px;
  height: 5px;
  background: #c7c7cc;
  border-radius: 3px;
  margin: 0 auto 16px;
}

.drawer-content {
  padding: 0 16px;
}

.property-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
}

.property-thumb {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.property-details {
  flex: 1;
  min-width: 0;
}

.property-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a1a1a;
}

.property-address {
  font-size: 13px;
  color: #666;
  margin: 0 0 4px;
}

.property-price {
  font-size: 15px;
  font-weight: 700;
  color: #00b8a9;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  flex-shrink: 0;
}

.contacts-section {
  margin-bottom: 16px;
}

.contacts-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 12px 0;
}

.contact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 70px;
  cursor: pointer;
}

.contact-avatar {
  position: relative;
  width: 60px;
  height: 60px;
}

.contact-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  background: #34c759;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid #f2f2f7;
}

.contact-name {
  font-size: 11px;
  text-align: center;
  margin: 0;
  color: #1a1a1a;
  line-height: 1.2;
}

.share-options {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 12px 0;
  margin-bottom: 16px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 70px;
  cursor: pointer;
}

.option-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.option-name {
  font-size: 11px;
  text-align: center;
  margin: 0;
  color: #1a1a1a;
}

.action-buttons {
  background: white;
  border-radius: 16px;
  margin-bottom: 12px;
  overflow: hidden;
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: white;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  font-size: 16px;
  color: #1a1a1a;
  cursor: pointer;
  text-align: left;
}

.action-btn:last-child {
  border-bottom: none;
}

.action-btn:active {
  background: #f5f5f5;
}

.action-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.action-text {
  flex: 1;
  font-weight: 400;
}

.action-arrow {
  font-size: 18px;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-container,
.drawer-leave-to .drawer-container {
  transform: translateY(100%);
}
</style>
