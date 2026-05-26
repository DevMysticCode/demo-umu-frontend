<template>
  <div class="mp-postjob">
    <div class="app-header">
      <button class="back-btn" type="button" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">Post a job</div>
        <div class="app-header-sub">Free · suppliers send quotes</div>
      </div>
    </div>

    <div class="form-wrap">
      <div class="mp-form-field">
        <label class="mp-form-label">Category</label>
        <div class="mp-form-chips">
          <button
            v-for="c in categories"
            :key="c.id"
            class="mp-form-chip"
            :class="{ active: category === c.id }"
            type="button"
            @click="category = c.id"
          >
            {{ c.icon }} {{ c.name }}
          </button>
          <button class="mp-form-chip" type="button">+ Other</button>
        </div>
      </div>

      <div class="mp-form-field">
        <label class="mp-form-label">Job title</label>
        <input v-model="title" type="text" class="mp-form-input" />
      </div>

      <div class="mp-form-field">
        <label class="mp-form-label">Detailed description</label>
        <textarea v-model="description" class="mp-form-input mp-form-textarea" />
      </div>

      <div class="mp-form-field">
        <label class="mp-form-label">Urgency</label>
        <div class="mp-form-chips">
          <button
            v-for="u in urgencies"
            :key="u.id"
            class="mp-form-chip"
            :class="{ active: urgency === u.id }"
            type="button"
            @click="urgency = u.id"
          >
            {{ u.label }}
          </button>
        </div>
      </div>

      <div class="mp-form-field">
        <label class="mp-form-label">Budget range</label>
        <div class="mp-budget-row">
          <input v-model="budgetMin" type="text" class="mp-form-input" />
          <span class="mp-budget-to">to</span>
          <input v-model="budgetMax" type="text" class="mp-form-input" />
        </div>
      </div>

      <div class="mp-form-field">
        <label class="mp-form-label">Photos (optional)</label>
        <div class="mp-photo-row">
          <div class="mp-photo-slot">＋</div>
        </div>
      </div>

      <div class="mp-uprotect-card">
        <div class="mp-uprotect-icon">🛡️</div>
        <div class="mp-uprotect-body">
          <div class="mp-uprotect-title">Protected by UProtect</div>
          <div class="mp-uprotect-sub">
            Once you accept a quote, your payment is held in escrow until the work passes
            verification photos.
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-cta">
      <button class="bottom-cta-btn" type="button" @click="onPost">
        📤 Post job to 4 matched suppliers
      </button>
      <button class="bottom-cta-secondary" type="button" @click="router.back()">
        Save as draft
      </button>
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const router = useRouter()

const category = ref('insulation')
const title = ref('Cavity wall insulation — 15 Woodfield Rd')
const description = ref(
  'Detached 3-bed, EPC E (52). Cavity walls currently uninsulated per EPC. Want quotes for full cavity fill, including any ECO4 grant assistance. Property has loft access; happy to combine with loft top-up if cost-effective.'
)
const urgency = ref('4w')
const budgetMin = ref('£500')
const budgetMax = ref('£1,500')

const categories = [
  { id: 'insulation', icon: '🧱', name: 'Insulation' },
  { id: 'heating', icon: '🔥', name: 'Heating' },
  { id: 'electrical', icon: '⚡', name: 'Electrical' },
  { id: 'solar', icon: '☀️', name: 'Solar' },
]
const urgencies = [
  { id: 'urgent', label: '🚨 Urgent' },
  { id: '4w', label: '📅 Within 4 weeks' },
  { id: 'flexible', label: '🕐 Flexible' },
]

function onPost() {
  // Mock — would POST to backend in a real wire-up.
  router.push('/homescore/jobs')
}
</script>

<style scoped>
.mp-postjob {
  --primary: #231d45;
  --primary-2: #352d5c;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --page: #f0f2f8;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: var(--card);
  border-bottom: 1px solid var(--border);
}
.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  flex-shrink: 0;
}
.back-btn svg { width: 16px; height: 16px; }
.app-header-info { flex: 1; min-width: 0; }
.app-header-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
}
.app-header-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
}

.form-wrap { padding: 14px 20px 0; }
.mp-form-field { margin-bottom: 16px; }
.mp-form-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.3px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.mp-form-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.mp-form-chip {
  padding: 9px 14px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 100px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
}
.mp-form-chip.active {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border-color: var(--accent-dark);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.25);
}
.mp-form-input {
  width: 100%;
  padding: 12px 14px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
  outline: none;
}
.mp-form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.12);
}
.mp-form-textarea {
  min-height: 96px;
  resize: vertical;
  font-weight: 500;
  line-height: 1.5;
}
.mp-budget-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mp-budget-to {
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 12px;
}
.mp-photo-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.mp-photo-slot {
  width: 64px;
  height: 64px;
  background: var(--bg);
  border: 1.5px dashed var(--border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--text-faint);
  cursor: pointer;
}

.mp-uprotect-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 6px 0 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  border-radius: 14px;
  color: white;
  box-shadow: 0 8px 22px rgba(35, 29, 69, 0.18);
}
.mp-uprotect-icon {
  font-size: 22px;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mp-uprotect-body { flex: 1; min-width: 0; }
.mp-uprotect-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.1px;
  margin-bottom: 3px;
}
.mp-uprotect-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.5;
}

.bottom-cta { padding: 18px 20px 24px; }
.bottom-cta-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.3);
}
.bottom-cta-secondary {
  width: 100%;
  padding: 14px;
  background: var(--card);
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}
</style>
