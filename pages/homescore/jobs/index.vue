<template>
  <div class="mp-jobs">
    <div class="app-header">
      <button class="back-btn" type="button" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">My jobs</div>
        <div class="app-header-sub">{{ activeCount }} active · {{ completedCount }} completed</div>
      </div>
      <div class="app-header-right">
        <button class="app-icon-btn plus" type="button" aria-label="New job" @click="newJob">+</button>
      </div>
    </div>

    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: tab === 'active' }"
        type="button"
        @click="tab = 'active'"
      >
        Active ({{ activeCount }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: tab === 'completed' }"
        type="button"
        @click="tab = 'completed'"
      >
        Completed ({{ completedCount }})
      </button>
    </div>

    <div class="job-list">
      <div
        v-for="j in displayJobs"
        :key="j.id"
        class="mp-job-card"
        :class="{ complete: j.status === 'done' }"
      >
        <div class="mp-job-head">
          <div class="mp-job-icon">{{ j.icon }}</div>
          <div class="mp-job-info">
            <div class="mp-job-title">{{ j.title }}</div>
            <div class="mp-job-meta">{{ j.meta }}</div>
          </div>
          <span class="mp-activity-status" :class="j.status">{{ j.statusLabel }}</span>
        </div>
        <div class="mp-job-foot">
          <div class="mp-job-foot-text" v-html="j.foot" />
        </div>
      </div>
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const router = useRouter()

const tab = ref<'active' | 'completed'>('active')

interface JobRow {
  id: string
  icon: string
  title: string
  meta: string
  status: 'awaiting' | 'live' | 'done'
  statusLabel: string
  foot: string
  isComplete?: boolean
}

const allJobs: JobRow[] = [
  {
    id: 'cavity',
    icon: '🧱',
    title: 'Cavity wall insulation',
    meta: 'Posted 3 days ago · 4 suppliers notified · 2 offers in',
    status: 'awaiting',
    statusLabel: '2 offers',
    foot: 'Best offer: <b>BetterHome £620</b> · review and accept',
  },
  {
    id: 'loft',
    icon: '🏠',
    title: 'Loft top-up to 270mm',
    meta: 'Booked · BetterHome Insulation · 14 June 09:00',
    status: 'live',
    statusLabel: 'Booked',
    foot: '£280 held in <b>UProtect escrow</b> · released after completion',
  },
  {
    id: 'lights',
    icon: '💡',
    title: 'Low energy lighting swap',
    meta: 'Draft · ready to post · 4 matched suppliers',
    status: 'awaiting',
    statusLabel: 'Draft',
    foot: 'Est. cost <b>£110</b> · expected saving £45/yr',
  },
  {
    id: 'smart',
    icon: '🌡',
    title: 'Smart thermostat install',
    meta: 'SmartHome Coventry · completed Mar 18 · ★ you rated 5',
    status: 'done',
    statusLabel: 'Complete',
    foot: '<b>£180</b> paid · UProtect released · invoice on file',
    isComplete: true,
  },
]

const activeJobs = computed(() => allJobs.filter((j) => j.status !== 'done'))
const completedJobs = computed(() => allJobs.filter((j) => j.status === 'done'))
const activeCount = computed(() => activeJobs.value.length)
const completedCount = computed(() => completedJobs.value.length)

const displayJobs = computed(() =>
  tab.value === 'active' ? activeJobs.value : completedJobs.value
)

function newJob() {
  router.push('/homescore/jobs/new')
}
</script>

<style scoped>
.mp-jobs {
  --primary: #231d45;
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
  --warning: #f5a623;
  --warning-pale: #fff5e0;
  --warning-deep: #7a5500;
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
.back-btn,
.app-icon-btn {
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
  font-family: inherit;
  font-size: 20px;
}
.back-btn svg { width: 16px; height: 16px; }
.app-icon-btn.plus {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  font-weight: 800;
}
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

.tab-bar {
  display: flex;
  gap: 6px;
  margin: 14px 20px 0;
  padding: 4px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
}
.tab-btn {
  flex: 1;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}
.tab-btn.active {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.25);
}

.job-list { padding: 14px 20px 0; display: flex; flex-direction: column; gap: 10px; }
.mp-job-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
}
.mp-job-card.complete { opacity: 0.85; }
.mp-job-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}
.mp-job-icon {
  font-size: 18px;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mp-job-info { flex: 1; min-width: 0; }
.mp-job-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.2;
}
.mp-job-meta {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 3px;
}
.mp-job-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--border-soft);
  margin-top: 8px;
}
.mp-job-foot-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}
.mp-job-foot-text :deep(b) {
  color: var(--accent-dark);
  font-weight: 800;
}
.mp-activity-status {
  font-size: 9.5px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 100px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  flex-shrink: 0;
}
.mp-activity-status.live {
  background: var(--accent-paler);
  color: var(--accent-dark);
  border: 1px solid var(--accent-pale);
}
.mp-activity-status.awaiting {
  background: var(--warning-pale);
  color: var(--warning-deep);
  border: 1px solid rgba(245, 166, 35, 0.3);
}
.mp-activity-status.done {
  background: var(--accent-paler);
  color: var(--accent-dark);
  border: 1px solid var(--accent-pale);
}
</style>
