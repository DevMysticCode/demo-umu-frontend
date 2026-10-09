<template>
  <div>
    <div class="spc">
      <div class="spc-row">
        <span class="spc-icon">
          <img src="/op-icons/profile/passportPoints.png" alt="" class="spc-icon-img" />
        </span>
        <div class="spc-balance-col">
          <div class="spc-balance">{{ balance }} <em>pts</em></div>
          <p class="spc-balance-caption">Account total</p>
        </div>
      </div>
      <h3 class="spc-h3">{{ sectionTitle }}</h3>
      <p class="spc-sub">{{ completedCount }} of {{ totalCount }} complete</p>

      <div v-if="pointsTotal > 0" class="spc-section-points">
        <div class="spc-section-points-row">
          <span class="spc-section-points-label">Points in this section</span>
          <span class="spc-section-points-value">{{ pointsEarned }} / {{ pointsTotal }} pts</span>
        </div>
        <div class="spc-section-points-bar">
          <div class="spc-section-points-fill" :style="{ width: sectionPointsPercent + '%' }" />
        </div>
      </div>

      <template v-if="!sectionComplete && sectionBonusPoints > 0">
        <div class="spc-divider" />
        <button class="spc-bonus-row" @click="$emit('finish-section')">
          <span class="spc-bonus-icon">
            <img src="/op-icons/misc/trophy.png" alt="" class="spc-bonus-icon-img" />
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
        <p class="spc-level-caption">Your overall level</p>
        <div class="spc-level-track">
          <div class="spc-level-bar">
            <div class="spc-level-fill" :style="{ width: level.progressPercent + '%' }" />
          </div>
          <svg
            class="spc-level-marker"
            :style="{ left: level.progressPercent + '%' }"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l2.9 6.3 6.9.8-5.1 4.8 1.4 6.8L12 17.3 5.9 20.7l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
          </svg>
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
const props = defineProps({
  balance: { type: Number, required: true },
  sectionTitle: { type: String, default: '' },
  completedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  sectionComplete: { type: Boolean, default: false },
  sectionBonusPoints: { type: Number, default: 30 },
  // Points earned/available for just THIS section — separate from
  // `balance`/`level` below, which are account-wide totals across every
  // section. Without this the card only had "0 of 7 complete" (a task
  // count) next to an account-level bar that reads as full/maxed
  // regardless of this section's own progress once the account has
  // leveled up from other sections — confusing, since the two numbers
  // look related but answer different questions.
  pointsEarned: { type: Number, default: 0 },
  pointsTotal: { type: Number, default: 0 },
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

const sectionPointsPercent = computed(() =>
  props.pointsTotal > 0
    ? Math.min(100, Math.round((props.pointsEarned / props.pointsTotal) * 100))
    : 0,
)
</script>

<style scoped>
.spc {
  margin-bottom: 12px;
  border-radius: 20px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  color: #231d45;
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
  background: radial-gradient(circle, rgba(0, 161, 154, 0.12), transparent 60%);
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
/* Glossy 3D icon, same asset used for "Passport Points" on the Rewards
   page, so the two screens read as one system. No extra ring - the PNG
   already carries its own rendering. */
.spc-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spc-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.spc-balance-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.spc-balance {
  font-size: 1.875rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  color: #231d45;
}
.spc-balance em {
  font-style: normal;
  color: #00817c;
  font-weight: 600;
  font-size: 1rem;
  margin-left: 4px;
}
/* Clarifies this is the account-wide total, not points from just this
   section - without it the number sits directly above "0 of 7 complete"
   and reads as if it belongs to the section. */
.spc-balance-caption {
  margin: 0;
  font-size: 0.6563rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}

.spc-h3 {
  margin: 4px 0 2px;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  color: #231d45;
  position: relative;
  z-index: 1;
}
.spc-sub {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7089;
  position: relative;
  z-index: 1;
}

/* Section-scoped points bar - deliberately a flat fill (not the
   account-level bar's gradient below) and its own solid brand teal, so
   the two bars stay visually distinguishable at a glance, not just by
   their labels. */
.spc-section-points {
  margin-top: 12px;
  position: relative;
  z-index: 1;
}
.spc-section-points-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.spc-section-points-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7089;
}
.spc-section-points-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: #00817c;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.spc-section-points-bar {
  height: 6px;
  border-radius: 999px;
  background: #f0f2f5;
  overflow: hidden;
}
.spc-section-points-fill {
  height: 100%;
  border-radius: 999px;
  background: #00a19a;
  transition: width 0.4s ease;
}

.spc-divider {
  height: 1px;
  background: #f0f2f5;
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
/* Sized up from the old 28px flat glyph - glossy 3D renders lose their
   shine/detail below ~32-36px. */
.spc-bonus-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.spc-bonus-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.spc-bonus-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.spc-bonus-text strong {
  font-size: 0.875rem;
  font-weight: 700;
  color: #231d45;
}
.spc-bonus-text em {
  font-style: normal;
  font-size: 0.75rem;
  font-weight: 600;
  color: #00817c;
}
.spc-chevron {
  color: #c4c1d4;
  flex-shrink: 0;
}

.spc-level {
  margin-top: 18px;
  position: relative;
  z-index: 1;
}
/* Labels the bar below as account-wide, not this section's - without it
   "Max level reached" next to "0 of 7 complete" read as contradictory. */
.spc-level-caption {
  margin: 0 0 8px;
  font-size: 0.6563rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}
.spc-level-track {
  position: relative;
}
.spc-level-bar {
  height: 6px;
  border-radius: 999px;
  background: #f0f2f5;
  overflow: hidden;
}
.spc-level-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #14b8a6, #5eead4);
  transition: width 0.4s ease;
}
/* Gold, matching the bonus-icon star above and the points badge at the
   top of this card. */
.spc-level-marker {
  position: absolute;
  top: 50%;
  color: #fbbf24;
  filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.7));
  transform: translate(-50%, -50%);
  transition: left 0.4s ease;
  pointer-events: none;
}
.spc-level-text {
  margin: 8px 0 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #00817c;
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
  font-size: 0.8125rem;
  font-weight: 700;
  color: #00756f;
  line-height: 1.3;
}
.spc-streak-text span {
  font-size: 0.75rem;
  font-weight: 400;
  color: #115e59;
}
</style>
