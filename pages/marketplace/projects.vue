<template>
  <!-- Your Projects — every job the user has posted as a customer.
       Listed by recency with status pills (Open · In progress ·
       Completed · Cancelled). Tapping a row opens the job detail. -->
  <div class="pj-page mobile-container">
    <MarketplaceAppBack />

    <div class="pj-header-block">
      <div class="pj-header-eyebrow">📋 Your projects</div>
      <div class="pj-header-title">Projects</div>
    </div>

    <template v-if="pending">
      <div class="pj-loading">Loading projects…</div>
    </template>

    <template v-else-if="!jobs.length">
      <div class="pj-empty">
        <div class="pj-empty-emoji">📋</div>
        <div class="pj-empty-title">No projects yet</div>
        <div class="pj-empty-sub">
          Post a job and your suppliers will offer within hours.
        </div>
        <button class="pj-empty-btn" type="button" @click="goPost">Post a job</button>
      </div>
    </template>

    <template v-else>
      <div class="pj-stats pj-anim-1">
        <div class="pj-stat">
          <div class="pj-stat-num">{{ counts.open }}</div>
          <div class="pj-stat-label">Open</div>
        </div>
        <div class="pj-stat">
          <div class="pj-stat-num amber">{{ counts.inProgress }}</div>
          <div class="pj-stat-label">In progress</div>
        </div>
        <div class="pj-stat">
          <div class="pj-stat-num mint">{{ counts.completed }}</div>
          <div class="pj-stat-label">Completed</div>
        </div>
      </div>

      <div class="pj-list pj-anim-2">
        <button
          v-for="job in jobs"
          :key="job.id"
          class="pj-row"
          type="button"
          @click="openJob(job.id, job.status)"
        >
          <div class="pj-row-photo" :style="{ background: jobBackground(job) }">
            <span class="pj-row-cat">{{ job.categoryLabel }}</span>
          </div>
          <div class="pj-row-body">
            <div class="pj-row-title">{{ job.title }}</div>
            <div class="pj-row-meta">
              {{ job.locationLabel }} · Posted {{ job.postedAgo }}
            </div>
            <div class="pj-row-foot">
              <span class="pj-status" :class="`pj-status-${job.status}`">
                {{ statusLabel(job.status) }}
              </span>
              <span class="pj-row-offers">
                {{ job.offerCount }} offer{{ job.offerCount === 1 ? '' : 's' }}
              </span>
            </div>
          </div>
        </button>
      </div>
    </template>

    <div style="height: 100px" />
    <MarketplaceBottomNav active="projects" :unread-count="unreadCount" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarketplaceAppBack from '~/components/marketplace/MarketplaceAppBack.vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type { MarketplaceJobListItem } from '~/composables/useMarketplace'

definePageMeta({ title: 'Your projects — Marketplace', middleware: 'auth' })

const router = useRouter()
const { fetchMyJobs, fetchThreads, resolvePhotoUrl } = useMarketplace()

const pending = ref(true)
const jobs = ref<MarketplaceJobListItem[]>([])

async function load() {
  pending.value = true
  try {
    jobs.value = await fetchMyJobs()
  } catch {
    jobs.value = []
  } finally {
    pending.value = false
  }
}
await load()

// Unread badge for the Inbox tab — fetch in parallel.
const { data: threads } = await useAsyncData('mp-projects-threads', async () => {
  try { return await fetchThreads() } catch { return [] }
})
const unreadCount = computed(() =>
  (threads.value ?? []).reduce((sum, t) => sum + (t.unreadCount ?? 0), 0),
)

const counts = computed(() => {
  let open = 0, inProgress = 0, completed = 0
  for (const j of jobs.value) {
    if (j.status === 'in_progress') inProgress++
    else if (j.status === 'completed') completed++
    else if (j.status === 'open') open++
  }
  return { open, inProgress, completed }
})

function statusLabel(s?: string): string {
  switch (s) {
    case 'in_progress': return 'In progress'
    case 'completed':   return 'Completed'
    case 'cancelled':   return 'Cancelled'
    default:            return 'Open'
  }
}

function jobBackground(job: MarketplaceJobListItem) {
  if (job.photoUrl) {
    return `linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.05)), url(${resolvePhotoUrl(job.photoUrl)}) center/cover no-repeat`
  }
  return job.photoBg ?? 'linear-gradient(135deg, #352D5C, #008A84)'
}

// Active and completed jobs land on the live contract (timeline +
// evidence + release/review CTAs). Open jobs with no accepted offer
// don't have a contract yet — they continue to land on the detail
// page so the customer can keep reviewing offers.
function openJob(id: string, status?: string) {
  if (status === 'in_progress' || status === 'completed') {
    router.push(`/marketplace/jobs/${id}/contract`)
  } else {
    router.push(`/marketplace/jobs/${id}`)
  }
}
function goPost() { router.push('/marketplace/post') }
</script>

<style scoped>
.pj-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

.pj-header-block {
  padding: 10px 20px 6px;
}
.pj-header-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #6b7089;
}
.pj-header-title {
  font-size: 24px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.6px;
  margin-top: 4px;
}

.pj-loading {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}

.pj-empty {
  padding: 60px 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}
.pj-empty-emoji { font-size: 40px; margin-bottom: 8px; }
.pj-empty-title { font-size: 16px; font-weight: 800; color: #231d45; margin-bottom: 4px; }
.pj-empty-sub { margin-bottom: 16px; }
.pj-empty-btn {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff; border: none; border-radius: 12px;
  padding: 12px 18px; font-family: inherit; font-size: 13px; font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.32);
}

/* ── Stats strip ─────────────────────────────────────────────── */
.pj-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding: 6px 20px 0;
}
.pj-stat {
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  padding: 14px 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.pj-stat-num {
  font-size: 22px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.5px;
  line-height: 1;
}
.pj-stat-num.amber { color: #b07a13; }
.pj-stat-num.mint  { color: #008A84; }
.pj-stat-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #6b7089;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-top: 6px;
}

/* ── Project rows ────────────────────────────────────────────── */
.pj-list {
  padding: 14px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pj-row {
  display: flex;
  gap: 12px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  padding: 10px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.pj-row:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(35, 29, 69, 0.1); }
.pj-row-photo {
  position: relative;
  width: 86px;
  height: 86px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
  overflow: hidden;
}
.pj-row-cat {
  position: absolute;
  bottom: 6px;
  left: 6px;
  font-size: 9.5px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 100px;
  color: #fff;
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(4px);
}
.pj-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0;
}
.pj-row-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pj-row-meta {
  font-size: 11px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 2px;
}
.pj-row-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.pj-status {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 100px;
}
.pj-status-open        { background: #e5f4f2; color: #00635E; }
.pj-status-in_progress { background: #fff7e3; color: #b07a13; }
.pj-status-completed   { background: linear-gradient(135deg, #00a19a, #008a84); color: #fff; }
.pj-status-cancelled   { background: #f5f6fa; color: #6b7089; }
.pj-row-offers {
  font-size: 11px;
  font-weight: 800;
  color: #6b7089;
}

@keyframes pjFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.pj-anim-1 { animation: pjFadeUp 0.32s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.pj-anim-2 { animation: pjFadeUp 0.32s 0.14s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .pj-anim-1, .pj-anim-2 { animation: none; }
}
</style>
