<template>
  <div class="st-page mobile-container">
    <!-- Nav bar -->
    <div class="st-nav-bar">
      <button class="st-nav-icon-btn" aria-label="Back" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="st-nav-title">Settings</div>
      <div style="width: 38px" />
    </div>

    <main class="st-body">
      <div class="atm-bg teal" />

      <!-- Hero h1 -->
      <div class="st-hero">
        <div class="st-h1">Settings</div>
      </div>

      <!-- Security strength card -->
      <div class="st-section">
        <div class="st-strength-card">
          <div class="st-strength-row">
            <div class="st-strength-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div class="st-strength-body">
              <div class="st-strength-title">Account secured</div>
              <div class="st-strength-sub">
                Strong password · 2FA recommended
              </div>
            </div>
          </div>
          <div class="st-strength-bar">
            <div class="st-strength-fill" :style="{ width: securityScore + '%' }" />
          </div>
          <div class="st-strength-meter">
            <span class="st-strength-pct">{{ securityScore }}%</span>
            <span>· {{ securityLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Account & security -->
      <div class="st-section-heading">Account &amp; security</div>
      <div class="st-section">
        <div class="st-group">
          <button class="st-row" @click="navigateTo('/profile/personal-information')">
            <div class="st-row-content">
              <div class="st-row-label">Personal information</div>
              <div class="st-row-meta">Name, email, phone, address</div>
            </div>
            <span class="st-row-chev">›</span>
          </button>
          <button class="st-row">
            <div class="st-row-content">
              <div class="st-row-label">Change password</div>
              <div class="st-row-meta">Last changed 24 days ago</div>
            </div>
            <span class="st-row-chev">›</span>
          </button>
          <button class="st-row">
            <div class="st-row-content">
              <div class="st-row-label">Two-factor authentication</div>
              <div class="st-row-meta">Off · Recommended</div>
            </div>
            <span class="st-row-chev">›</span>
          </button>
          <button class="st-row">
            <div class="st-row-content">
              <div class="st-row-label">Active sessions</div>
              <div class="st-row-meta">2 devices signed in</div>
            </div>
            <span class="st-row-chev">›</span>
          </button>
        </div>
      </div>

      <!-- Notifications -->
      <div class="st-section-heading">Notifications</div>
      <div class="st-section">
        <div class="st-group">
          <div class="st-row">
            <div class="st-row-content">
              <div class="st-row-label">In-app push</div>
              <div class="st-row-meta">Viewing reminders &amp; messages</div>
            </div>
            <div
              class="st-toggle"
              :class="{ on: prefs.pushNotifications }"
              @click="setPref('pushNotifications', !prefs.pushNotifications)"
            />
          </div>
          <div class="st-row">
            <div class="st-row-content">
              <div class="st-row-label">Email newsletter</div>
              <div class="st-row-meta">Weekly market &amp; saved property updates</div>
            </div>
            <div
              class="st-toggle"
              :class="{ on: prefs.emailNewsletter }"
              @click="setPref('emailNewsletter', !prefs.emailNewsletter)"
            />
          </div>
          <div class="st-row">
            <div class="st-row-content">
              <div class="st-row-label">SMS</div>
              <div class="st-row-meta">Time-sensitive alerts only</div>
            </div>
            <div
              class="st-toggle"
              :class="{ on: prefs.smsNotifications }"
              @click="setPref('smsNotifications', !prefs.smsNotifications)"
            />
          </div>
        </div>
      </div>

      <!-- Appearance & language -->
      <div class="st-section-heading">Appearance &amp; language</div>
      <div class="st-section">
        <div class="st-group">
          <div class="st-row">
            <div class="st-row-content">
              <div class="st-row-label">Theme</div>
              <div class="st-row-meta">Choose how the app looks</div>
            </div>
            <div class="st-segment">
              <button
                v-for="opt in themeOptions"
                :key="opt.value"
                class="st-segment-btn"
                :class="{ active: theme === opt.value }"
                @click="setTheme(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <button class="st-row">
            <div class="st-row-content">
              <div class="st-row-label">Language</div>
              <div class="st-row-meta">English (UK)</div>
            </div>
            <span class="st-row-chev">›</span>
          </button>
        </div>
      </div>

      <!-- Privacy & data -->
      <div class="st-section-heading">Privacy &amp; data</div>
      <div class="st-section">
        <div class="st-group">
          <div class="st-row">
            <div class="st-row-content">
              <div class="st-row-label">Contact visibility</div>
              <div class="st-row-meta">
                Sellers see your details only when you message them
              </div>
            </div>
            <div
              class="st-toggle"
              :class="{ on: prefs.contactVisible }"
              @click="setPref('contactVisible', !prefs.contactVisible)"
            />
          </div>
          <button class="st-row">
            <div class="st-row-content">
              <div class="st-row-label">Download your data</div>
              <div class="st-row-meta">Export everything as JSON</div>
            </div>
            <span class="st-row-chev">›</span>
          </button>
          <button class="st-row danger">
            <div class="st-row-content">
              <div class="st-row-label">Delete account</div>
              <div class="st-row-meta">Permanent. We'll wipe everything.</div>
            </div>
            <span class="st-row-chev">›</span>
          </button>
        </div>
      </div>

      <!-- Legal -->
      <div class="st-section-heading">Legal</div>
      <div class="st-section">
        <div class="st-group">
          <a class="st-row" href="/legal/terms">
            <div class="st-row-content">
              <div class="st-row-label">Terms of Service</div>
            </div>
            <span class="st-row-chev">›</span>
          </a>
          <a class="st-row" href="/legal/privacy">
            <div class="st-row-content">
              <div class="st-row-label">Privacy Policy</div>
            </div>
            <span class="st-row-chev">›</span>
          </a>
          <a class="st-row" href="/legal/cookies">
            <div class="st-row-content">
              <div class="st-row-label">Cookie preferences</div>
            </div>
            <span class="st-row-chev">›</span>
          </a>
          <div class="st-row" style="cursor: default">
            <div class="st-row-content">
              <div class="st-row-label">App version</div>
              <div class="st-row-meta">v1.0.0</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save toast -->
      <Transition name="st-toast">
        <div v-if="toast" class="st-toast">{{ toast }}</div>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useProfile } from '~/composables/useProfile'

definePageMeta({ title: 'Settings - UmovingU', middleware: 'auth' })

const config = useRuntimeConfig()
const { profile, fetchProfile } = useProfile()
const { theme, setTheme: applyTheme } = useTheme()

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
] as const

const prefs = reactive({
  pushNotifications: true,
  emailNewsletter: true,
  smsNotifications: false,
  contactVisible: true,
})
const toast = ref('')

onMounted(async () => {
  await fetchProfile()
  prefs.pushNotifications = profile.value?.pushNotifications ?? true
  prefs.emailNewsletter = profile.value?.emailNewsletter ?? true
  prefs.smsNotifications = profile.value?.smsNotifications ?? false
  prefs.contactVisible = profile.value?.contactVisible ?? true
})

async function setPref(key: keyof typeof prefs, value: boolean) {
  prefs[key] = value
  try {
    const tok =
      typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    if (!tok) return
    await $fetch(`${config.public.apiBase}/profile/me`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tok}` },
      body: { [key]: value },
    })
    showToast('Saved')
  } catch {
    showToast('Could not save')
  }
}

function setTheme(next: 'light' | 'dark' | 'auto') {
  applyTheme(next)
  showToast(`Theme: ${next.charAt(0).toUpperCase() + next.slice(1)}`)
}

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 1800)
}

// ── Security score (heuristic) ──────────────────────────────────
const securityScore = computed(() => {
  let score = 60 // baseline for having an account
  if (profile.value?.phone) score += 15
  if (profile.value?.isVerified) score += 25
  return Math.min(100, score)
})
const securityLabel = computed(() => {
  const s = securityScore.value
  if (s >= 90) return 'Excellent'
  if (s >= 75) return 'Strong'
  if (s >= 60) return 'Good'
  return 'Needs attention'
})
</script>

<style scoped>
.st-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 32px;
}

.st-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.st-nav-icon-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0e2840;
  flex-shrink: 0;
  transition: background 0.2s;
}
.st-nav-icon-btn:hover { background: #f0f2f1; }
.st-nav-icon-btn svg { width: 18px; height: 18px; }
.st-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}

.st-body { position: relative; }
.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.teal {
  background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(61, 189, 163, 0.14), transparent 65%);
}

/* Hero */
.st-hero { padding: 8px 22px 14px; position: relative; z-index: 1; }
.st-h1 {
  font-size: 32px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -1.2px;
  line-height: 1;
}

/* Section heading */
.st-section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 22px 22px 8px;
  position: relative;
  z-index: 1;
}

/* Group / row */
.st-section { padding: 0 22px; position: relative; z-index: 1; }
.st-group {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
}
.st-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border: none;
  background: transparent;
  border-bottom: 1px solid #f0f2f1;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
  text-align: left;
  font-family: inherit;
  text-decoration: none;
  color: inherit;
}
.st-row:last-child { border-bottom: none; }
.st-row:hover { background: #f5f4f0; }
.st-row.danger .st-row-label { color: #b85b36; }
.st-row-content { flex: 1; min-width: 0; }
.st-row-label {
  font-size: 13.5px;
  font-weight: 700;
  color: #0e2840;
  letter-spacing: -0.2px;
  line-height: 1.3;
}
.st-row-meta {
  font-size: 11.5px;
  font-weight: 600;
  color: #4a5868;
  margin-top: 2px;
  line-height: 1.3;
}
.st-row-chev {
  color: #8a95a0;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

/* Toggle */
.st-toggle {
  width: 38px;
  height: 22px;
  background: #e8eceb;
  border-radius: 100px;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.st-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.st-toggle.on { background: #3dbda3; }
.st-toggle.on::after { transform: translateX(16px); }

/* Theme segmented */
.st-segment {
  display: inline-flex;
  background: #f0f2f1;
  border-radius: 100px;
  padding: 3px;
  flex-shrink: 0;
}
.st-segment-btn {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  color: #4a5868;
  padding: 5px 10px;
  border-radius: 100px;
  cursor: pointer;
  letter-spacing: -0.1px;
}
.st-segment-btn.active {
  background: #fff;
  color: #0e2840;
  box-shadow: 0 1px 2px rgba(14, 40, 64, 0.06);
}

/* Security strength card */
.st-strength-card {
  background: linear-gradient(135deg, #f1f9f4, #e2f1ea);
  border: 1px solid rgba(61, 189, 163, 0.25);
  border-radius: 16px;
  padding: 16px;
}
.st-strength-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.st-strength-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: #3dbda3;
  color: #fff;
  display: grid;
  place-items: center;
}
.st-strength-icon svg { width: 18px; height: 18px; }
.st-strength-body { flex: 1; min-width: 0; }
.st-strength-title {
  font-size: 14px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
}
.st-strength-sub {
  font-size: 11.5px;
  color: #4a5868;
  font-weight: 600;
  margin-top: 2px;
}
.st-strength-bar {
  height: 6px;
  background: #fff;
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 6px;
}
.st-strength-fill {
  height: 100%;
  background: linear-gradient(90deg, #3dbda3, #1f7a66);
  border-radius: 100px;
  transition: width 0.4s ease;
}
.st-strength-meter {
  font-size: 11px;
  font-weight: 700;
  color: #4a5868;
  font-feature-settings: 'tnum';
  display: flex;
  gap: 6px;
}
.st-strength-pct {
  color: #1f7a66;
  font-weight: 800;
}

/* Toast */
.st-toast {
  position: fixed;
  left: 50%;
  bottom: 80px;
  transform: translateX(-50%);
  z-index: 40;
  background: #0e2840;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 999px;
  box-shadow: 0 8px 22px rgba(35, 29, 69, 0.32);
}
.st-toast-enter-active,
.st-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.st-toast-enter-from,
.st-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
