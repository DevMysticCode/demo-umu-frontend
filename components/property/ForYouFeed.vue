<template>
  <div>
    <div class="feed-header" data-tour="foryou-feed" style="margin-top: 4px">
      <div class="feed-title">For You</div>
      <div class="feed-header-actions">
        <button
          type="button"
          class="feed-filters-btn"
          :class="{ active: hasFilters }"
          @click="emit('open-filters')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="12" height="12">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters
        </button>
        <div class="feed-see-all" @click="navigateTo('/dashboard')">All</div>
      </div>
    </div>
    <div v-if="loading" class="skeletons">
      <div v-for="n in 3" :key="n" class="skeleton-card" />
    </div>
    <div v-else-if="properties.length" class="horiz-feed">
      <div
        v-for="prop in properties.slice(0, 6)"
        :key="prop.id"
        class="prop-card prop-card-horiz"
        @click="navigateTo('/property/' + prop.id)"
      >
        <div
          class="prop-img-wrap"
          :style="{ background: 'linear-gradient(135deg,#dff4f0,#c8ebe6)' }"
        >
          <PropertyImage
            :src="prop.imageUrl || prop.image"
            :alt="prop.addressLine1 || prop.address"
            :show-caption="false"
            class="prop-img"
          />
          <div class="prop-badge-pp" :class="stateOf(prop)">
            <img
              src="/op-icons/passportview/umu-passport.png"
              alt=""
              class="pp-emoji-ic"
            />
            {{ stateLabel(prop) }}
          </div>
          <div class="prop-price-tag">
            {{
              prop.estimatedPrice
                ? '£' + Math.round(prop.estimatedPrice).toLocaleString()
                : prop.priceDisplay || 'POA'
            }}
          </div>
        </div>
        <div class="prop-body">
          <div class="prop-address">
            {{ prop.addressLine1 || prop.address }}
          </div>
          <div class="prop-area">
            {{
              prop.city
                ? prop.city + ', ' + prop.postcode
                : prop.area || prop.postcode || ''
            }}
          </div>
          <div class="prop-pills">
            <span v-if="prop.propertyType || prop.type" class="pill-grey">{{
              prop.propertyType || prop.type
            }}</span>
            <span v-if="prop.tenure" class="pill-grey">{{ prop.tenure }}</span>
          </div>
          <div class="prop-footer">
            <div v-if="prop.epcScore" class="prop-score-row">
              <span class="prop-score-lbl">EPC</span>
              <div class="prop-score-bar">
                <div
                  class="prop-score-fill"
                  :style="{ width: prop.epcScore + '%' }"
                ></div>
              </div>
              <span class="prop-score-num">{{ prop.epcScore }}</span>
            </div>
            <span class="prop-passport-btn">View</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="needsPostcode" class="foryou-empty">
      <div class="foryou-empty-ic foryou-empty-ic-img"><img src="/op-icons/misc/addressPin.png" alt="" loading="lazy" /></div>
      <div class="foryou-empty-title">Add a postcode to see matches</div>
      <div class="foryou-empty-sub">
        We'll tailor properties to your budget, preferred types and
        must-have features.
      </div>
      <button class="foryou-empty-btn" @click="openPostcodeSheet">
        Set postcode
      </button>
    </div>
    <div v-else class="foryou-empty">
      <div class="foryou-empty-ic"><img src="/op-icons/homescore/magnifier.png" alt="" loading="lazy" /></div>
      <div class="foryou-empty-title">No matches yet</div>
      <div class="foryou-empty-sub">
        Nothing in your area matches your saved preferences. Try
        broadening your filters or refreshing your postcode.
      </div>
      <button class="foryou-empty-btn" @click="navigateTo('/profile')">
        Update preferences
      </button>
    </div>

    <!-- Postcode sheet — inline so "Set postcode" actually does something.
         It used to route to /profile, which has no postcode field at all
         (that page only lists labelled addresses, a separate model the
         backend's For You matcher never reads); same markup/behavior on
         Capacitor as on web, since this is the same Vue component either
         way. -->
    <Teleport to="body">
      <div class="pcs-backdrop" :class="{ open: postcodeSheetOpen }" @click="closePostcodeSheet" />
      <div class="pcs-sheet" :class="{ open: postcodeSheetOpen }" role="dialog" aria-modal="true">
        <div class="pcs-grabber-wrap" @click="closePostcodeSheet"><div class="pcs-grabber" /></div>
        <div class="pcs-title">Set your postcode</div>
        <div class="pcs-sub">We'll use this to find properties near you.</div>
        <input
          ref="postcodeInputEl"
          v-model="postcodeDraft"
          type="text"
          class="pcs-input"
          placeholder="e.g. CV5 6AJ"
          autocapitalize="characters"
          @keyup.enter="savePostcode"
        />
        <div v-if="postcodeError" class="pcs-error">{{ postcodeError }}</div>
        <button type="button" class="pcs-save-btn" :disabled="postcodeSaving" @click="savePostcode">
          {{ postcodeSaving ? 'Saving…' : 'Save postcode' }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import PropertyImage from '~/components/property/PropertyImage.vue'
import { useProfile } from '~/composables/useProfile'

defineProps<{
  properties: any[]
  loading: boolean
  needsPostcode: boolean
  hasFilters: boolean
}>()

const emit = defineEmits<{
  (e: 'open-filters'): void
  // Parent re-fetches For You once a postcode is actually saved — this
  // component only owns the sheet UI, not the feed's own data fetch.
  (e: 'postcode-saved'): void
}>()

const { updateProfile } = useProfile()

// Same 4-state passport model as PropertySearchExperienceClassic.vue's
// stateOf/stateTitle — was previously just "In Progress"/"Published" (and
// hidden entirely for unclaimed), which drifted from the wording used
// everywhere else in the app.
type PassportCardState = 'unclaimed' | 'private' | 'partiallyPublic' | 'public'
function stateOf(p: any): PassportCardState {
  if (!p.hasPassport) return 'unclaimed'
  if (!p.passportPublished) return 'private'
  return (p.milestonePct ?? 0) >= 100 ? 'public' : 'partiallyPublic'
}
function stateLabel(p: any): string {
  const s = stateOf(p)
  if (s === 'unclaimed') return 'Unclaimed'
  if (s === 'partiallyPublic') return 'Claimed · Partially Public'
  if (s === 'public') return 'Claimed · Public'
  return 'Claimed · Private'
}

const postcodeSheetOpen = ref(false)
const postcodeDraft = ref('')
const postcodeSaving = ref(false)
const postcodeError = ref('')
const postcodeInputEl = ref<HTMLInputElement | null>(null)

function openPostcodeSheet() {
  postcodeDraft.value = ''
  postcodeError.value = ''
  postcodeSheetOpen.value = true
  nextTick(() => postcodeInputEl.value?.focus())
}
function closePostcodeSheet() {
  postcodeSheetOpen.value = false
}

// Loose check only — the backend re-searches on whatever's typed anyway,
// so this just catches an empty/obviously-wrong submit before a wasted
// round trip, not full postcode validation.
const POSTCODE_RE = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/

async function savePostcode() {
  const value = postcodeDraft.value.trim()
  if (!POSTCODE_RE.test(value)) {
    postcodeError.value = "That doesn't look like a UK postcode."
    return
  }
  postcodeSaving.value = true
  postcodeError.value = ''
  try {
    await updateProfile({ postcode: value })
    postcodeSheetOpen.value = false
    emit('postcode-saved')
  } catch {
    postcodeError.value = 'Could not save your postcode — try again.'
  } finally {
    postcodeSaving.value = false
  }
}
</script>

<style scoped>
.feed-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.feed-title {
  font-size: 14px;
  font-weight: 800;
  color: #1f2024;
}
.feed-see-all {
  font-size: 13px;
  font-weight: 700;
  color: #00a19a;
  cursor: pointer;
}
.feed-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.feed-filters-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  color: #6b7089;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 4px 10px;
  cursor: pointer;
}
.feed-filters-btn.active {
  color: #00514d;
  background: #e0f4f1;
  border-color: #c2e6df;
}

.horiz-feed {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
}
.horiz-feed::-webkit-scrollbar {
  display: none;
}
.prop-card-horiz {
  min-width: 200px;
  max-width: 200px;
  flex-shrink: 0;
  margin-bottom: 0;
}

.prop-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.15s;
}
.prop-card:active {
  transform: scale(0.99);
}
.prop-img-wrap {
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.prop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.prop-badge-pp {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #231d45;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.prop-badge-pp.unclaimed,
.prop-badge-pp.private,
.prop-badge-pp.partiallyPublic,
.prop-badge-pp.public {
  background: #231d45;
}
.pp-emoji-ic {
  width: 11px;
  height: 11px;
  object-fit: contain;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: -1px;
}
.prop-price-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
}
.prop-body {
  padding: 12px 14px;
}
.prop-address {
  font-size: 15px;
  font-weight: 700;
  color: #1f2024;
  margin-bottom: 1px;
}
.prop-area {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
}
.prop-pills {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.pill-grey {
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
}
.prop-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}
.prop-score-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.prop-score-lbl {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}
.prop-score-bar {
  width: 54px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}
.prop-score-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 4px;
}
.prop-score-num {
  font-size: 15px;
  font-weight: 700;
  color: #1f2024;
}
.prop-passport-btn {
  background: #231d45;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
}

/* ── For You empty state ── */
.foryou-empty {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  margin-bottom: 12px;
}
.foryou-empty-ic {
  font-size: 32px;
  margin-bottom: 8px;
}
.foryou-empty-ic-img {
  width: 56px;
  height: 56px;
  margin: 0 auto 8px;
}
.foryou-empty-ic-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.foryou-empty-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 4px;
}
.foryou-empty-sub {
  font-size: 13px;
  color: #4a5568;
  line-height: 1.5;
  margin-bottom: 12px;
}
.foryou-empty-btn {
  background: #00a19a;
  color: #fff;
  border: none;
  font-size: 15px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
}

/* ── Postcode sheet ── */
.pcs-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 13, 40, 0);
  z-index: 220;
  pointer-events: none;
  transition: background 0.25s ease;
}
.pcs-backdrop.open {
  background: rgba(17, 13, 40, 0.55);
  pointer-events: auto;
}
.pcs-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24px 24px 0 0;
  z-index: 221;
  transform: translateY(100%);
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
  padding: 0 22px calc(20px + env(safe-area-inset-bottom));
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.18);
}
.pcs-sheet.open {
  transform: translateY(0);
}
.pcs-grabber-wrap {
  display: flex;
  justify-content: center;
  padding: 10px 0 8px;
  cursor: pointer;
}
.pcs-grabber {
  width: 36px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 999px;
}
.pcs-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.pcs-sub {
  font-size: 13px;
  color: #6b7089;
  margin-top: 4px;
  margin-bottom: 16px;
}
.pcs-input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  background: #f8f7fc;
  font-size: 16px;
  font-weight: 700;
  color: #231d45;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  outline: none;
  font-family: inherit;
}
.pcs-input:focus {
  border-color: #00a19a;
}
.pcs-error {
  font-size: 12.5px;
  color: #dc2626;
  font-weight: 600;
  margin-top: 8px;
}
.pcs-save-btn {
  width: 100%;
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  padding: 13px;
  border-radius: 12px;
  margin-top: 14px;
  cursor: pointer;
}
.pcs-save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
