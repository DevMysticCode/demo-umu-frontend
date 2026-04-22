<template>
  <div class="mobile-container explore-root">

    <!-- ── Hero header (teal gradient) ── -->
    <div class="explore-hero">
      <!-- Row 1: greeting + toggle + avatar -->
      <div class="hero-row1">
        <div class="greeting-text" id="explore-greeting">{{ greeting }}</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <!-- Toggle pill -->
          <div class="toggle-track">
            <div
              :class="['toggle-tab', { active: view === 'new' }]"
              @click="view = 'new'"
            >New</div>
            <div
              :class="['toggle-tab', { active: view === 'returning' }]"
              @click="view = 'returning'"
            >Returning</div>
          </div>
          <!-- User avatar/initials -->
          <div class="hero-avatar" @click="navigateTo('/profile')">
            <UserAvatar
              :src="profile?.avatarUrl"
              :firstName="profile?.firstName"
              :lastName="profile?.lastName"
              :size="36"
            />
          </div>
        </div>
      </div>

      <!-- Row 2: search bar -->
      <div class="search-row">
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by city, area or postcode…"
            class="search-input"
            @keyup.enter="doSearch"
          />
          <button class="search-btn" @click="doSearch">Search</button>
        </div>
      </div>
    </div>

    <!-- ── Scrollable dynamic content ── -->
    <div class="explore-scroll">

      <!-- ══ NEW USER VIEW ══ -->
      <template v-if="view === 'new'">

        <!-- ── Healthscore card (FREE) ── -->
        <div class="hs-free-card">
          <div class="hs-free-top">
            <div class="eyebrow-label teal">Healthscore&#x2122;</div>
            <div class="badge-free">Free</div>
          </div>
          <div class="card-title navy">Check a property's<br>Healthscore before you offer</div>
          <div class="card-body-text">Instant risk snapshot on any address — structural condition, legal flags, energy rating and running costs. Know before you commit.</div>
          <div class="inner-search-wrap" style="margin-bottom:12px;">
            <svg class="inner-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Enter postcode or address…" class="inner-search-input" @keyup.enter="navigateTo('/homescore')" />
          </div>
          <button class="btn-brand-full" @click="navigateTo('/homescore')">Get free Healthscore &#x2192;</button>
        </div>

        <!-- ── Property Passport card (PAID) ── -->
        <div class="pp-navy-card">
          <div class="pp-navy-glow"></div>
          <div class="hs-free-top" style="margin-bottom:8px;">
            <div class="eyebrow-label" style="color:rgba(255,255,255,0.45);">Property Passport</div>
            <div class="badge-pp-price">From £99</div>
          </div>
          <div class="card-title" style="color:#fff;margin-bottom:6px;">Know everything<br>before you buy</div>
          <div class="card-body-text" style="color:rgba(255,255,255,0.6);margin-bottom:14px;">Title deeds, planning history, legal searches and structural records — all verified. Enter an address and we'll show you what's available for that property.</div>
          <div class="inner-search-wrap" style="margin-bottom:12px;">
            <svg class="inner-search-icon" style="stroke:rgba(255,255,255,0.4)" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Enter postcode or address…" class="inner-search-input dark" @keyup.enter="navigateTo('/dashboard')" />
          </div>
          <button class="btn-teal-dark" @click="navigateTo('/dashboard')">Check passport status &#x2192;</button>
        </div>

        <!-- ── Property feed ── -->
        <div class="feed-header">
          <div class="feed-title">Verified passport properties</div>
          <div class="feed-see-all" @click="navigateTo('/dashboard')">See all &#x2192;</div>
        </div>
        <div class="feed-sub">These sellers have already verified their home. Full records, fewer surprises.</div>

        <div v-if="loadingProperties" class="skeletons">
          <div v-for="n in 3" :key="n" class="skeleton-card" />
        </div>
        <template v-else>
          <div
            v-for="prop in displayProperties"
            :key="prop.id"
            class="prop-card"
            @click="navigateTo(`/property/${prop.id}`)"
          >
            <div class="prop-img-wrap" :style="{ background: prop.imgGradient || 'linear-gradient(135deg,#dff4f0,#c8ebe6)' }">
              <img v-if="prop.image" :src="prop.image" :alt="prop.address" class="prop-img" />
              <div v-else class="prop-emoji">{{ prop.emoji || '&#x1F3E1;' }}</div>
              <div class="prop-badge-pp" :style="{ background: '#231d45' }">&#x1F4D8; Passport</div>
              <div class="prop-badge-risk risk-low">Low risk</div>
              <div class="prop-price-tag">{{ prop.priceDisplay || 'POA' }}</div>
            </div>
            <div class="prop-body">
              <div class="prop-address">{{ prop.address || prop.addressLine1 }}</div>
              <div class="prop-area">{{ prop.area || prop.postcode || '' }}</div>
              <div class="prop-pills">
                <span class="pill-grey">&#x1F6CF; {{ prop.bedrooms || '3 bed' }}</span>
                <span class="pill-grey">{{ prop.type || 'Semi-detached' }}</span>
                <span class="pill-grey">{{ prop.tenure || 'Freehold' }}</span>
              </div>
              <div class="prop-footer">
                <div class="prop-score-row">
                  <span class="prop-score-lbl">Healthscore&#x2122;</span>
                  <div class="prop-score-bar">
                    <div class="prop-score-fill" :style="{ width: (prop.healthScore || 74) + '%', background: '#00A19A' }"></div>
                  </div>
                  <span class="prop-score-num">{{ prop.healthScore || 74 }}</span>
                </div>
                <span class="prop-passport-btn">View Passport</span>
              </div>
            </div>
          </div>
        </template>

      </template>

      <!-- ══ RETURNING USER VIEW ══ -->
      <template v-else>

        <!-- ── Passport status card ── -->
        <div v-if="loadingPassport" class="skeleton-card" style="height:110px;margin-bottom:14px;" />
        <div
          v-else-if="passports.length"
          class="passport-status-card"
          @click="navigateTo(`/passportview/${passports[0].id}`)"
        >
          <div class="psc-glow"></div>
          <div class="psc-main" style="position:relative;z-index:1;">
            <!-- Icon + address -->
            <div class="psc-left">
              <div class="psc-icon-box">
                <svg width="26" height="26" viewBox="0 0 877.69 877.69">
                  <circle fill="rgba(255,255,255,0.1)" cx="438.85" cy="438.85" r="438.85"/>
                  <path fill="#fff" d="m573.6,497.11v21.8h-39.28l-.22-20.26c0-34.14-14.14-48.26-38.03-48.26s-38.03,14.12-38.03,48.26v41.36h-39.01v-42.9c0-52.88,28.77-82.14,77.29-82.14s77.29,29.26,77.29,82.14Z"/>
                  <path fill="#fff" d="m379.84,415.26c48.52,0,77.29,29.26,77.29,82.14v42.9s-39.01,0-39.01,0v-41.36c0-34.14-13.9-48.26-38.03-48.26-23.89,0-38.03,14.12-38.03,48.26l-.15,20.26h-39.24s-.1-21.8-.1-21.8c0-52.88,28.77-82.14,77.29-82.14Z"/>
                  <path fill="#5eead4" d="m689.16,439c-.03-11.46-8.86-20.75-19.76-20.75s-19.76,9.32-19.76,20.81h.04v92.38c0,34.14-14.14,48.26-38.03,48.26s-38.03-14.12-38.03-48.26v-12.54h-39.32v14.08c0,52.88,29.07,82.14,77.59,82.14s77.28-29.26,77.28-82.14v-93.98h-.02Z"/>
                  <path fill="#5eead4" d="m187.37,439c.03-11.46,8.86-20.75,19.76-20.75,10.91,0,19.76,9.32,19.76,20.81h-.04v92.38c0,34.14,14.14,48.26,38.03,48.26,24.14,0,37.79-14.12,37.79-48.26v-12.54s39.25,0,39.25,0v14.08c0,52.88-28.77,82.14-77.29,82.14-48.52,0-77.28-29.26-77.28-82.14v-93.98s.02,0,.02,0Z"/>
                  <path fill="#5eead4" d="m677.57,352.22l-226.28-134.71c-3.1-1.81-6.69-2.82-10.34-2.91h-.57l-.39-1.48h-.54c-3.68.1-7.26,1.11-10.38,2.93l-157.5,93.76v-16.4c0-10.74-9.3-19.48-20.72-19.48s-20.72,8.74-20.72,19.48v41.08l-27.33,16.27c-9.7,5.67-12.68,17.71-6.64,26.83,6.03,9.12,18.84,11.92,28.55,6.24l215.48-128.28,215.49,128.29c3.33,1.95,7.08,2.95,10.91,2.95,1.58,0,3.17-.17,4.74-.51,5.39-1.18,9.97-4.26,12.9-8.68,6.03-9.12,3.05-21.15-6.64-26.82Z"/>
                </svg>
              </div>
              <div>
                <div class="psc-label-small">Property Passport</div>
                <div class="psc-address">{{ passports[0].address || passports[0].addressLine1 }}</div>
                <div class="psc-postcode">{{ passports[0].postcode }}</div>
              </div>
            </div>
            <!-- Mini arc gauge -->
            <div class="psc-gauge">
              <svg width="54" height="34" viewBox="0 0 58 36">
                <path d="M 7 34 A 24 24 0 0 1 51 34" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4" stroke-linecap="round"/>
                <path d="M 7 34 A 24 24 0 0 1 51 34" fill="none" stroke="#5eead4" stroke-width="4" stroke-linecap="round" stroke-dasharray="75.4" stroke-dashoffset="19.6"/>
              </svg>
              <div class="psc-gauge-num">74</div>
              <div class="psc-gauge-lbl">Score</div>
            </div>
          </div>
          <!-- Footer: completion + CTA -->
          <div class="psc-footer" style="position:relative;z-index:1;">
            <div class="psc-footer-stats">
              <span class="psc-stat">Complete <strong>62%</strong></span>
              <span class="psc-stat">Day <strong>16</strong></span>
            </div>
            <div class="psc-view-cta">View Passport &#x2192;</div>
          </div>
        </div>

        <!-- No passport state -->
        <div v-else class="no-passport-card" @click="navigateTo('/dashboard')">
          <div class="no-pp-icon">&#x1F4CB;</div>
          <div class="no-pp-body">
            <div class="no-pp-title">No passport yet</div>
            <div class="no-pp-sub">Search for your property to claim your first Passport</div>
          </div>
          <div class="no-pp-cta">Claim &#x2192;</div>
        </div>

        <!-- ── Next action nudge ── -->
        <div class="next-action-card" @click="navigateTo('/dashboard')">
          <div class="na-icon">&#x26A1;</div>
          <div class="na-body">
            <div class="na-title">Next: Upload your gas safety cert</div>
            <div class="na-sub">3 items outstanding &#xB7; Passport 62% complete</div>
          </div>
          <div class="na-cta">Add &#x2192;</div>
        </div>

        <!-- ── Healthscore quick check ── -->
        <div class="hs-quick-card" @click="navigateTo('/homescore')">
          <div class="hs-quick-icon">&#x1F4CA;</div>
          <div class="hs-quick-body">
            <div class="hs-quick-title">Run a Healthscore on any property</div>
            <div class="hs-quick-sub">Free instant check &#x2014; useful for your own home or a buyer's.</div>
          </div>
          <div class="hs-quick-cta">Free &#x2192;</div>
        </div>

        <!-- ── Find a Pro dark card ── -->
        <div class="pro-dark-card" @click="navigateTo('/dashboard')">
          <div class="pro-dark-icon">&#x1F527;</div>
          <div class="pro-dark-body">
            <div class="pro-dark-title">Need certs? Find a Pro</div>
            <div class="pro-dark-sub">Gas, EICR, EPC &#x2014; certs auto-land in your Passport</div>
          </div>
          <div class="pro-dark-badge">Marketplace &#x2192;</div>
        </div>

        <!-- ── For you feed ── -->
        <div class="feed-header" style="margin-top:20px;">
          <div class="feed-title">For You</div>
          <div class="feed-see-all" @click="navigateTo('/dashboard')">See all &#x2192;</div>
        </div>

        <div v-if="loadingProperties" class="skeletons">
          <div v-for="n in 3" :key="n" class="skeleton-card" />
        </div>
        <template v-else>
          <div
            v-for="prop in displayProperties"
            :key="prop.id"
            class="prop-card"
            @click="navigateTo(`/property/${prop.id}`)"
          >
            <div class="prop-img-wrap" :style="{ background: prop.imgGradient || 'linear-gradient(135deg,#dff4f0,#c8ebe6)' }">
              <img v-if="prop.image" :src="prop.image" :alt="prop.address" class="prop-img" />
              <div v-else class="prop-emoji">&#x1F3E1;</div>
              <div class="prop-badge-pp">&#x1F4D8; Passport</div>
              <div class="prop-badge-risk risk-low">Low risk</div>
              <div class="prop-price-tag">{{ prop.priceDisplay || 'POA' }}</div>
            </div>
            <div class="prop-body">
              <div class="prop-address">{{ prop.address || prop.addressLine1 }}</div>
              <div class="prop-area">{{ prop.area || prop.postcode || '' }}</div>
              <div class="prop-pills">
                <span class="pill-grey">&#x1F6CF; {{ prop.bedrooms || '3 bed' }}</span>
                <span class="pill-grey">{{ prop.type || 'Semi-detached' }}</span>
                <span class="pill-grey">{{ prop.tenure || 'Freehold' }}</span>
              </div>
              <div class="prop-footer">
                <div class="prop-score-row">
                  <span class="prop-score-lbl">Healthscore&#x2122;</span>
                  <div class="prop-score-bar">
                    <div class="prop-score-fill" :style="{ width: (prop.healthScore || 74) + '%' }"></div>
                  </div>
                  <span class="prop-score-num">{{ prop.healthScore || 74 }}</span>
                </div>
                <span class="prop-passport-btn">View Passport</span>
              </div>
            </div>
          </div>
        </template>

      </template>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UserAvatar from '~/components/ui/UserAvatar.vue'
import BottomNav from '~/components/core/BottomNav.vue'

definePageMeta({ title: 'Explore - UmovingU', middleware: 'auth' })

const config = useRuntimeConfig()
const { profile, fetchProfile } = useProfile()

const view = ref<'new' | 'returning'>('new')
const searchQuery = ref('')
const loadingPassport = ref(true)
const loadingProperties = ref(true)
const passports = ref<any[]>([])
const properties = ref<any[]>([])

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning 👋'
  if (h < 17) return 'Good afternoon 👋'
  return 'Good evening 👋'
})

// Mock property cards to fill empty states (match prototype)
const mockProperties = [
  {
    id: 'mock-1', emoji: '🏡', imgGradient: 'linear-gradient(135deg,#dff4f0,#c8ebe6)',
    priceDisplay: '£320,000', address: '14 Hazel Grove', area: 'Stockport, SK7 4BL',
    bedrooms: '3 bed', type: 'Semi-detached', tenure: 'Freehold', healthScore: 74,
  },
  {
    id: 'mock-2', emoji: '🏘', imgGradient: 'linear-gradient(135deg,#dde8f5,#ccd8f0)',
    priceDisplay: '£485,000', address: '8 Birchwood Close', area: 'Wilmslow, SK9 1HN',
    bedrooms: '4 bed', type: 'Detached', tenure: 'Freehold', healthScore: 89,
  },
  {
    id: 'mock-3', emoji: '🏠', imgGradient: 'linear-gradient(135deg,#f0ece4,#e6dfd4)',
    priceDisplay: '£290,000', address: '42 Maple Avenue', area: 'Didsbury, M20 5WS',
    bedrooms: '3 bed', type: 'Terraced', tenure: 'Leasehold', healthScore: 61,
  },
]

const displayProperties = computed(() =>
  properties.value.length ? properties.value.slice(0, 6) : mockProperties
)

function doSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/dashboard?q=${encodeURIComponent(searchQuery.value.trim())}`)
  } else {
    navigateTo('/dashboard')
  }
}

onMounted(async () => {
  if (!profile.value) await fetchProfile()

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return

  const [passportResult, propResult] = await Promise.allSettled([
    $fetch<any[]>(`${config.public.apiBase}/profile/passports`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    $fetch<{ items: any[] }>(`${config.public.apiBase}/property/for-you`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ])

  if (passportResult.status === 'fulfilled') {
    passports.value = passportResult.value ?? []
    if (passports.value.length > 0) view.value = 'returning'
  }
  loadingPassport.value = false

  if (propResult.status === 'fulfilled') {
    properties.value = propResult.value?.items ?? []
  }
  loadingProperties.value = false
})
</script>

<style scoped>
/* ── CSS variables (matching prototype) ── */
:root {
  --navy: #231d45;
  --brand: #00A19A;
  --brand-dark: #008c86;
  --brand-pale: #eafaf9;
  --brand-soft: #b2e8e6;
  --ink: #1f2024;
  --ink-soft: #4a5568;
  --ink-faint: #94a3b8;
  --line: #e5e7eb;
  --good: #166534;
}

.explore-root {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #f8f7fc;
}

/* ── Hero header ── */
.explore-hero {
  background: linear-gradient(160deg, #f0fffe 0%, #e8f7ff 100%);
  padding: 20px 20px 18px;
  flex-shrink: 0;
  border-bottom: 1px solid #dff0ee;
}

.hero-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.greeting-text {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.02em;
}

.hero-avatar {
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Toggle ── */
.toggle-track {
  display: flex;
  background: #f0f0f8;
  border-radius: 999px;
  padding: 3px;
  gap: 2px;
}

.toggle-tab {
  font-size: 10px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #94a3b8;
}

.toggle-tab.active {
  background: #231d45;
  color: #fff;
}

/* ── Search bar ── */
.search-row { position: relative; }

.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
}

.search-input {
  width: 100%;
  padding: 13px 80px 13px 40px;
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  background: #f8f7fc;
  font-size: 14px;
  color: #1f2024;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}

.search-input:focus { border-color: #00A19A; }

.search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: #00A19A;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

/* ── Scrollable area ── */
.explore-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 100px;
}

/* ── Healthscore free card ── */
.hs-free-card {
  background: #eafaf9;
  border: 1.5px solid #b2e8e6;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 12px;
}

.hs-free-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.eyebrow-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.eyebrow-label.teal { color: #008c86; }

.badge-free {
  font-size: 10px;
  font-weight: 700;
  background: #00A19A;
  color: #fff;
  border-radius: 999px;
  padding: 3px 10px;
}

.badge-pp-price {
  font-size: 10px;
  font-weight: 700;
  background: rgba(255,255,255,0.12);
  color: #5eead4;
  border: 1px solid rgba(94,234,212,0.3);
  border-radius: 999px;
  padding: 3px 10px;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.card-title.navy { color: #231d45; }

.card-body-text {
  font-size: 12px;
  color: #4a5568;
  line-height: 1.55;
  margin-bottom: 14px;
}

/* ── Property Passport navy card ── */
.pp-navy-card {
  background: linear-gradient(135deg, #231d45 0%, #2d2560 100%);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.pp-navy-glow {
  position: absolute;
  right: -24px; top: -24px;
  width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(0,161,154,0.25), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* ── Inner search ── */
.inner-search-wrap {
  position: relative;
}

.inner-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.inner-search-input {
  width: 100%;
  padding: 12px 12px 12px 36px;
  border-radius: 12px;
  border: 1.5px solid #b2e8e6;
  background: #fff;
  font-size: 13px;
  color: #1f2024;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}

.inner-search-input.dark {
  border-color: rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.08);
  color: #fff;
}

.inner-search-input.dark::placeholder { color: rgba(255,255,255,0.4); }

/* ── Buttons ── */
.btn-brand-full {
  width: 100%;
  border: none;
  padding: 13px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #00A19A;
  color: #fff;
  box-shadow: 0 4px 14px rgba(0,161,154,0.3);
  font-family: inherit;
}

.btn-brand-full:active { transform: scale(0.98); }

.btn-teal-dark {
  width: 100%;
  border: none;
  padding: 13px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #5eead4;
  color: #231d45;
  letter-spacing: -0.01em;
  font-family: inherit;
}

.btn-teal-dark:active { transform: scale(0.98); }

/* ── Property feed header ── */
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
  font-size: 12px;
  font-weight: 700;
  color: #00A19A;
  cursor: pointer;
}

.feed-sub {
  font-size: 11.5px;
  color: #94a3b8;
  margin-bottom: 14px;
  line-height: 1.5;
}

/* ── Property card ── */
.skeletons { display: flex; flex-direction: column; gap: 12px; }

.skeleton-card {
  height: 180px;
  background: linear-gradient(90deg, #f0f0f8 25%, #e8e8f0 50%, #f0f0f8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 18px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.prop-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 12px;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  transition: box-shadow 0.15s;
}

.prop-card:active { transform: scale(0.99); }

.prop-img-wrap {
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prop-img { width: 100%; height: 100%; object-fit: cover; }

.prop-emoji { font-size: 46px; }

.prop-badge-pp {
  position: absolute;
  top: 10px; left: 10px;
  background: #231d45;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
}

.prop-badge-risk {
  position: absolute;
  top: 10px; right: 10px;
  background: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid #d1fae5;
}

.risk-low { color: #166534; }
.risk-med { color: #92400e; border-color: #fde68a; }

.prop-price-tag {
  position: absolute;
  bottom: 10px; right: 10px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
}

.prop-body { padding: 12px 14px; }

.prop-address {
  font-size: 15px;
  font-weight: 700;
  color: #1f2024;
  margin-bottom: 1px;
}

.prop-area {
  font-size: 12px;
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
  font-size: 11px;
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
  font-size: 11px;
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
  background: #00A19A;
  border-radius: 4px;
}

.prop-score-num {
  font-size: 13px;
  font-weight: 700;
  color: #1f2024;
}

.prop-passport-btn {
  background: #231d45;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
}

/* ── Returning user: Passport status card ── */
.passport-status-card {
  background: linear-gradient(135deg, #008c86, #00A19A);
  border-radius: 18px;
  padding: 16px 18px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.passport-status-card:active { transform: scale(0.99); }

.psc-glow {
  position: absolute;
  right: -30px; top: -30px;
  width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.psc-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.psc-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.psc-icon-box {
  width: 42px; height: 42px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,255,255,0.25);
}

.psc-label-small {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-bottom: 2px;
}

.psc-address {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.psc-postcode {
  font-size: 11px;
  color: rgba(255,255,255,0.55);
}

.psc-gauge {
  flex-shrink: 0;
  text-align: center;
}

.psc-gauge-num {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  margin-top: -8px;
}

.psc-gauge-lbl {
  font-size: 9px;
  color: rgba(255,255,255,0.5);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.psc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.15);
}

.psc-footer-stats { display: flex; gap: 12px; }

.psc-stat {
  font-size: 11px;
  color: rgba(255,255,255,0.6);
}

.psc-stat strong { color: #fff; }

.psc-view-cta {
  font-size: 11px;
  font-weight: 700;
  color: #5eead4;
}

/* No passport state */
.no-passport-card {
  background: #fff;
  border: 2px dashed #e0e0e8;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 14px;
}

.no-pp-icon { font-size: 28px; flex-shrink: 0; }
.no-pp-body { flex: 1; }
.no-pp-title { font-size: 14px; font-weight: 700; color: #1f2024; margin-bottom: 2px; }
.no-pp-sub { font-size: 12px; color: #94a3b8; }
.no-pp-cta { font-size: 13px; font-weight: 700; color: #00A19A; flex-shrink: 0; }

/* ── Next action nudge ── */
.next-action-card {
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.next-action-card:active { transform: scale(0.99); }

.na-icon { font-size: 22px; flex-shrink: 0; }
.na-body { flex: 1; }
.na-title { font-size: 12.5px; font-weight: 700; color: #92400e; margin-bottom: 2px; }
.na-sub { font-size: 11.5px; color: #b45309; line-height: 1.4; }
.na-cta { font-size: 12px; font-weight: 700; color: #d97706; flex-shrink: 0; }

/* ── Healthscore quick card ── */
.hs-quick-card {
  background: #eafaf9;
  border: 1.5px solid #b2e8e6;
  border-radius: 14px;
  padding: 13px 16px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.hs-quick-card:active { transform: scale(0.99); }

.hs-quick-icon { font-size: 22px; flex-shrink: 0; }
.hs-quick-body { flex: 1; }
.hs-quick-title { font-size: 12.5px; font-weight: 700; color: #231d45; margin-bottom: 2px; }
.hs-quick-sub { font-size: 11.5px; color: #4a5568; line-height: 1.4; }
.hs-quick-cta { font-size: 12px; font-weight: 700; color: #00A19A; flex-shrink: 0; }

/* ── Find a Pro dark card ── */
.pro-dark-card {
  background: #1e1842;
  border-radius: 16px;
  padding: 14px 18px;
  margin-bottom: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
}

.pro-dark-card:active { transform: scale(0.99); }

.pro-dark-icon { font-size: 26px; flex-shrink: 0; }
.pro-dark-body { flex: 1; }
.pro-dark-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
.pro-dark-sub { font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.4; }

.pro-dark-badge {
  background: rgba(94,234,212,0.15);
  border: 1px solid rgba(94,234,212,0.3);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #5eead4;
  flex-shrink: 0;
  white-space: nowrap;
}
</style>
