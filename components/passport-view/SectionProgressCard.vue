<template>
  <div>
    <div class="spc">
      <div class="spc-row">
        <img src="/op-icons/rewards/pointsStar.png" alt="" class="spc-icon" />
        <div class="spc-balance">{{ balance }} <em>pts</em></div>
      </div>
      <h3 class="spc-h3">{{ sectionTitle }}</h3>
      <p class="spc-sub">{{ completedCount }} of {{ totalCount }} complete</p>

      <template v-if="!sectionComplete && sectionBonusPoints > 0">
        <div class="spc-divider" />
        <button class="spc-bonus-row" @click="$emit('finish-section')">
          <span class="spc-bonus-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.9 6.3 6.9.8-5.1 4.8 1.4 6.8L12 17.3 5.9 20.7l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
            </svg>
          </span>
          <span class="spc-bonus-text">
            <strong>Finish this section</strong>
            <em>+{{ sectionBonusPoints }} bonus</em>
          </span>
          <svg class="spc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </template>

      <div class="spc-level">
        <div class="spc-level-bar">
          <div class="spc-level-fill" :style="{ width: level.progressPercent + '%' }">
            <span class="spc-level-marker">★</span>
          </div>
        </div>
        <p class="spc-level-text">
          <template v-if="level.next">
            {{ level.progressPercent }}% to Level {{ level.next.level }} · {{ level.next.name }}
          </template>
          <template v-else>
            Max level reached · {{ level.name }}
          </template>
        </p>
      </div>
    </div>

    <div v-if="streak.current > 0" class="spc-streak">
      <span class="spc-streak-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
          <path d="M12 12V2" />
          <path d="M8 6l4-4 4 4" />
        </svg>
      </span>
      <div class="spc-streak-text">
        <strong>Nice work! You're on a {{ streak.current }} day streak</strong>
        <span>Keep it up to earn bonus points!</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  balance: { type: Number, required: true },
  sectionTitle: { type: String, default: '' },
  completedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  sectionComplete: { type: Boolean, default: false },
  sectionBonusPoints: { type: Number, default: 30 },
  level: {
    type: Object,
    default: () => ({ level: 1, name: 'Property Novice', progressPercent: 0, next: null }),
  },
  streak: {
    type: Object,
    default: () => ({ current: 0, longest: 0 }),
  },
})

defineEmits(['finish-section'])
</script>

<style scoped>
.spc {
  margin-bottom: 12px;
  border-radius: 20px;
  background: linear-gradient(135deg, #0a0f2c, #131a3a);
  color: #fff;
  padding: 20px;
  position: relative;
  overflow: hidden;
}
.spc::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.35), transparent 60%);
  pointer-events: none;
}

.spc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
  margin-bottom: 8px;
}
.spc-icon {
  width: 60px;
  height: 60px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35));
}
.spc-balance {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
}
.spc-balance em {
  font-style: normal;
  color: #99f6e4;
  font-weight: 600;
  font-size: 16px;
  margin-left: 4px;
}

.spc-h3 {
  margin: 4px 0 2px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  color: #fff;
  position: relative;
  z-index: 1;
}
.spc-sub {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 1;
}

.spc-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 14px 0;
  position: relative;
  z-index: 1;
}

.spc-bonus-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  position: relative;
  z-index: 1;
}
.spc-bonus-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.18);
  color: #fbbf24;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.spc-bonus-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.spc-bonus-text strong {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}
.spc-bonus-text em {
  font-style: normal;
  font-size: 12px;
  font-weight: 600;
  color: #5eead4;
}
.spc-chevron {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.spc-level {
  margin-top: 18px;
  position: relative;
  z-index: 1;
}
.spc-level-bar {
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}
.spc-level-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #14b8a6, #5eead4);
  transition: width 0.4s ease;
  position: relative;
}
.spc-level-marker {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #fff;
  text-shadow: 0 0 4px rgba(94, 234, 212, 0.9);
}
.spc-level-text {
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #5eead4;
}

.spc-streak {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #e6f9f7;
  border: 1px solid #e2f1ea;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 24px;
}
.spc-streak-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #fef3c7;
  color: #d97706;
  flex-shrink: 0;
  display: grid;
  place-items: center;
}
.spc-streak-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.spc-streak-text strong {
  font-size: 13px;
  font-weight: 700;
  color: #00756f;
  line-height: 1.3;
}
.spc-streak-text span {
  font-size: 12px;
  font-weight: 400;
  color: #115e59;
}
</style>
