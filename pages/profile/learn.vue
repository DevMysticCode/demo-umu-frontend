<template>
  <div
    class="mobile-container min-h-screen page-bg text-[#101319] overflow-x-hidden bg-umu-gradient"
  >
    <main class="pb-24">
      <!-- Hero: swipeable video carousel -->
      <section
        class="relative h-[570px] overflow-hidden"
        @touchstart="onHeroTouchStart"
        @touchend="onHeroTouchEnd"
      >
        <!-- Video slides -->
        <div
          class="flex h-full transition-transform duration-300 ease-in-out"
          :style="{
            transform: `translateX(-${featuredVideos.length ? heroIndex * (100 / featuredVideos.length) : 0}%)`,
            width: `${featuredVideos.length * 100}%`,
          }"
        >
          <div
            v-for="(video, i) in featuredVideos"
            :key="video.id"
            class="relative flex-none h-full"
            :style="{ width: `${100 / featuredVideos.length}%` }"
          >
            <!-- Background video (paused, shows first frame) -->
            <video
              :ref="(el) => setHeroVideoRef(el, i)"
              :src="video.url"
              class="absolute inset-0 h-full w-full object-cover"
              preload="metadata"
              playsinline
              muted
            />
            <div class="absolute inset-0 hero-overlay" />
          </div>
        </div>

        <!-- Header overlay -->
        <div
          class="absolute top-0 left-0 right-0 px-5 pt-5 flex items-center justify-between z-10"
        >
          <AppHeader
            title=""
            :showBack="true"
            backTo="/profile"
            class="flex-1"
          />
        </div>

        <!-- Bottom content overlay -->
        <div
          class="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10 text-center text-white"
        >
          <span
            class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full pill-text bg-black/45 backdrop-blur-[2px]"
          >
            <Icon name="i-heroicons-trophy" class="w-4 h-4" />
            {{ currentFeaturedVideo?.points ?? 15 }} Points
          </span>

          <h1 class="mt-5 hero-title font-semibold px-4">
            {{ currentFeaturedVideo?.title ?? 'Featured Video' }}
          </h1>
          <p class="mt-2 hero-meta font-normal text-white/95">
            {{
              currentFeaturedVideo
                ? formatDuration(currentFeaturedVideo.durationSec)
                : ''
            }}
            · {{ currentFeaturedVideo?.category ?? 'Property' }}
          </p>

          <button
            type="button"
            class="mt-5 px-14 rounded-full bg-[#00A19A] text-white play-label font-normal"
            @click="openPlayer(currentFeaturedVideo)"
          >
            Play
          </button>

          <!-- Dots -->
          <div class="mt-4 flex justify-center gap-2.5">
            <span
              v-for="(_, i) in featuredVideos"
              :key="i"
              class="rounded-full transition-all duration-200 cursor-pointer"
              :class="
                i === heroIndex
                  ? 'h-2.5 w-4 bg-white/90'
                  : 'h-2.5 w-2.5 bg-white/40'
              "
              @click="heroIndex = i"
            />
          </div>
        </div>
      </section>

      <!-- Continue Watching -->
      <section class="bg-white px-5 pt-6 pb-8">
        <h2 class="section-title">Continue Watching</h2>

        <div v-if="isLoadingContinue" class="mt-4 text-sm text-[#8f9094]">
          Loading...
        </div>

        <div
          v-else-if="continueWatching.length === 0"
          class="mt-4 text-sm text-[#8f9094]"
        >
          No videos in progress yet. Start watching below!
        </div>

        <div v-else class="mt-4 flex gap-4 overflow-x-auto pb-2 content-scroll">
          <article
            v-for="item in continueWatching"
            :key="item.id"
            class="w-[325px] shrink-0 cursor-pointer"
            @click="openPlayer(item)"
          >
            <div class="relative h-[176px] rounded-[18px] overflow-hidden">
              <video
                :src="item.url"
                class="h-full w-full object-cover"
                preload="metadata"
                playsinline
                muted
              />
              <div class="absolute inset-0 card-overlay" />

              <div
                class="absolute left-4 bottom-9 text-white card-caption uppercase font-normal"
              >
                {{ formatRemaining(item.remainingSecs) }}
              </div>

              <div
                class="absolute right-4 bottom-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 text-white pill-text font-[590]"
              >
                <Icon name="i-heroicons-trophy" class="w-4 h-4" />
                {{ item.points }} Points
              </div>

              <div
                class="absolute left-4 right-4 bottom-3 h-1 rounded-full bg-white/35"
              >
                <div
                  class="h-[6px] rounded-full bg-white"
                  :style="{ width: item.progressPercent + '%' }"
                />
              </div>
            </div>

            <h3 class="mt-3 card-title font-normal text-[#17181A]">
              {{ item.title }}
            </h3>
            <p class="mt-1 card-meta text-[#6D727A]">
              {{ formatDuration(item.durationSec) }}
            </p>
          </article>
        </div>
      </section>

      <!-- Start with the basics -->
      <section class="section-soft px-5 pt-7 pb-8 border-y border-[#e5eaec]">
        <h2 class="section-title">Start with the basics courses</h2>
        <p class="section-sub mt-2">
          Learn how to evaluate a property, understand market trends, and avoid
          common mistakes.
        </p>

        <div class="mt-5 flex gap-4 overflow-x-auto pb-2 content-scroll">
          <article
            v-for="item in allVideos"
            :key="item.id"
            class="w-[325px] shrink-0 cursor-pointer"
            @click="openPlayer(item)"
          >
            <div class="relative h-[176px] rounded-[18px] overflow-hidden">
              <video
                :src="item.url"
                class="h-full w-full object-cover"
                preload="metadata"
                playsinline
                muted
              />
              <div class="absolute inset-0 card-overlay" />

              <div
                class="absolute left-4 bottom-8 text-white card-caption uppercase font-normal"
              >
                {{ formatDuration(item.durationSec) }}
              </div>

              <div
                class="absolute right-4 bottom-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 text-white pill-text font-[590]"
              >
                <Icon name="i-heroicons-trophy" class="w-4 h-4" />
                {{ item.points }} Points
              </div>
            </div>

            <h3 class="mt-3 card-title font-normal text-[#17181A]">
              {{ item.title }}
            </h3>
            <p class="mt-1 card-meta text-[#6D727A]">{{ item.category }}</p>
          </article>
        </div>
      </section>

      <!-- Curated playlists -->
      <section
        class="bg-white px-5 pt-7 pb-8 border-b border-[#e5eaec] overflow-hidden"
      >
        <h2 class="section-title">Learn with curated playlists</h2>
        <p class="section-sub mt-2">
          Complete learning paths designed by property experts to guide you
          through each step.
        </p>

        <div class="mt-5 flex flex-col gap-3">
          <div
            v-for="row in playlistRows"
            :key="row.left.number"
            class="grid grid-cols-[1fr_44px_1fr] gap-x-4 items-start"
          >
            <div class="flex items-start gap-3 min-w-0">
              <span
                class="mt-0.5 text-[#a8adb4] text-[22px] h-[28px] leading-none tracking-[-0.26px] font-semibold text-center"
              >
                {{ row.left.number }}
              </span>
              <div class="min-w-0">
                <h3 class="playlist-title line-clamp-1">
                  {{ row.left.title }}
                </h3>
                <p class="playlist-sub line-clamp-2">{{ row.left.subtitle }}</p>
              </div>
            </div>
            <div class="pt-1 flex justify-center">
              <button
                type="button"
                aria-label="Play playlist"
                class="w-[20px] h-[20px] rounded-full border border-[#d9dee3] bg-white text-[#00A19A] flex items-center justify-center"
              >
                <Icon name="i-heroicons-play-solid" class="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <div class="flex items-start gap-3 min-w-0">
              <span
                class="mt-0.5 text-[#a8adb4] text-[22px] h-[28px] leading-none tracking-[-0.26px] font-semibold text-center"
              >
                {{ row.right.number }}
              </span>
              <div class="min-w-0">
                <h3 class="playlist-title line-clamp-1">
                  {{ row.right.title }}
                </h3>
                <p class="playlist-sub line-clamp-2">
                  {{ row.right.subtitle }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Expert insights -->
      <section class="section-soft px-5 pt-7 pb-12">
        <h2 class="section-title">Go deeper with expert insights</h2>
        <p class="section-sub mt-2">
          Advanced content covering legal steps, renovation ROI, negotiation
          tactics, and more.
        </p>

        <div class="mt-5 flex gap-4 overflow-x-auto pb-2 content-scroll">
          <article
            v-for="item in experts"
            :key="item.title"
            class="w-[325px] shrink-0"
          >
            <div
              class="relative h-[176px] rounded-[18px] overflow-hidden bg-[#788088]"
            >
              <img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full object-cover grayscale"
              />
              <div class="absolute inset-0 premium-overlay" />
              <div
                class="absolute left-1/2 -translate-x-1/2 top-[86px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/55 text-white pill-second font-[590] whitespace-nowrap"
              >
                <Icon name="i-heroicons-lock-closed" class="w-4 h-4" />
                UNLOCK PREMIUM
              </div>
            </div>
            <h3 class="mt-3 card-title font-normal text-[#17181A]">
              {{ item.title }}
            </h3>
            <p class="mt-1 card-meta text-[#6D727A]">{{ item.meta }}</p>
          </article>
        </div>
      </section>
    </main>

    <BottomNav active="learn" />

    <!-- Fullscreen Player -->
    <section
      v-if="isPlayerOpen"
      class="fixed inset-0 z-[60] bg-black text-white"
    >
      <video
        ref="playerRef"
        :src="activeVideo?.url"
        class="absolute inset-0 h-full w-full object-cover"
        playsinline
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @loadedmetadata="onMetadataLoaded"
      />
      <div class="absolute inset-0 player-overlay" />

      <div class="relative h-full flex flex-col px-6 pt-6 pb-8">
        <!-- Top bar -->
        <div class="flex items-center justify-between">
          <div
            class="inline-flex items-center gap-2 bg-black/45 rounded-full px-2 py-1"
          >
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
              @click="closePlayer"
            >
              <Icon name="i-heroicons-x-mark" class="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
            >
              <Icon
                name="i-heroicons-rectangle-stack"
                class="w-4 h-4 text-white"
              />
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
              @click="toggleMute"
            >
              <Icon
                :name="
                  isMuted
                    ? 'i-heroicons-speaker-x-mark'
                    : 'i-heroicons-musical-note'
                "
                class="w-4 h-4 text-white"
              />
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
            >
              <Icon
                name="i-heroicons-arrow-up-tray"
                class="w-4 h-4 text-white"
              />
            </button>
          </div>

          <div class="inline-flex items-center gap-2">
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
            >
              <Icon name="i-heroicons-heart" class="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-[#2f3c45]/90 flex items-center justify-center"
              @click="toggleMute"
            >
              <Icon
                :name="
                  isMuted
                    ? 'i-heroicons-speaker-x-mark'
                    : 'i-heroicons-speaker-wave'
                "
                class="w-5 h-5 text-white"
              />
            </button>
          </div>
        </div>

        <!-- Play controls in middle -->
        <div class="mt-auto mb-32 flex items-center justify-center gap-4">
          <button
            type="button"
            class="w-[50px] h-[50px] rounded-full bg-black/45 flex items-center justify-center"
            @click="skip(-10)"
          >
            <Icon
              name="i-heroicons-arrow-uturn-left"
              class="w-6 h-6 text-white"
            />
          </button>
          <button
            type="button"
            class="w-[50px] h-[50px] rounded-full bg-black/45 flex items-center justify-center"
            @click="togglePlay"
          >
            <Icon
              :name="
                isPlaying ? 'i-heroicons-pause-solid' : 'i-heroicons-play-solid'
              "
              class="w-10 h-10 text-white ml-0.5"
            />
          </button>
          <button
            type="button"
            class="w-[50px] h-[50px] rounded-full bg-black/45 flex items-center justify-center"
            @click="skip(10)"
          >
            <Icon
              name="i-heroicons-arrow-uturn-right"
              class="w-6 h-6 text-white"
            />
          </button>
        </div>

        <!-- Bottom info + progress -->
        <div class="mb-2">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 text-[15px] leading-[17px] tracking-[-0.08px] font-[590]"
          >
            <Icon name="i-heroicons-trophy" class="w-3.5 h-3.5" />
            {{ activeVideo?.points }} Points
          </span>

          <h2
            class="mt-3 text-[20px] leading-[25px] tracking-[-0.43px] font-semibold text-white"
          >
            {{ activeVideo?.title }}
          </h2>
          <p
            class="mt-1 text-[13px] leading-[18px] tracking-[-0.23px] text-white/95"
          >
            {{ formatDuration(activeVideo?.durationSec ?? 0) }} ·
            {{ activeVideo?.category }}
          </p>

          <div class="mt-4">
            <!-- Seekable progress bar -->
            <div
              class="h-3 w-full rounded-full bg-black/45 overflow-hidden cursor-pointer"
              @click="seekTo"
            >
              <div
                class="h-3 bg-white rounded-full transition-none"
                :style="{ width: progressPercent + '%' }"
              />
            </div>
            <div
              class="mt-2 flex items-center justify-between text-[12px] leading-[16px] tracking-[-0.23px] text-white/95"
            >
              <span>{{ formatTime(currentTimeSecs) }}</span>
              <span
                >-{{
                  formatTime((activeVideo?.durationSec ?? 0) - currentTimeSecs)
                }}</span
              >
            </div>
          </div>

          <div class="mt-4 flex items-center gap-3">
            <button
              type="button"
              class="px-5 h-9 rounded-full bg-black/45 text-[14px]"
            >
              Related Videos
            </button>
            <button
              type="button"
              class="px-5 h-9 rounded-full bg-black/45 text-[14px]"
            >
              Links
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import AppHeader from '~/components/core/AppHeader.vue'
import BottomNav from '~/components/core/BottomNav.vue'
import { useLearn } from '~/composables/useLearn'

const {
  videos,
  continueWatching,
  isLoadingContinue,
  fetchVideos,
  fetchContinueWatching,
  updateProgress,
  formatDuration,
  formatRemaining,
} = useLearn()

// ── Hero carousel ──────────────────────────────────────────────────────────
const heroIndex = ref(0)
const heroVideoRefs = ref<(HTMLVideoElement | null)[]>([])

const setHeroVideoRef = (el: any, index: number) => {
  heroVideoRefs.value[index] = el as HTMLVideoElement | null
}

const featuredVideos = computed(() => videos.value.filter((v) => v.featured))
const allVideos = computed(() => videos.value)
const currentFeaturedVideo = computed(
  () => featuredVideos.value[heroIndex.value] ?? null,
)

let heroTouchStartX = 0
const onHeroTouchStart = (e: TouchEvent) => {
  heroTouchStartX = e.changedTouches[0].screenX
}
const onHeroTouchEnd = (e: TouchEvent) => {
  const diff = heroTouchStartX - e.changedTouches[0].screenX
  if (Math.abs(diff) > 40) {
    if (diff > 0 && heroIndex.value < featuredVideos.value.length - 1)
      heroIndex.value++
    else if (diff < 0 && heroIndex.value > 0) heroIndex.value--
  }
}

// ── Player ─────────────────────────────────────────────────────────────────
const isPlayerOpen = ref(false)
const activeVideo = ref<any>(null)
const playerRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTimeSecs = ref(0)
const videoDuration = ref(0)

const progressPercent = computed(() => {
  if (!videoDuration.value) return 0
  return Math.min(100, (currentTimeSecs.value / videoDuration.value) * 100)
})

const openPlayer = async (video: any) => {
  if (!video) return
  activeVideo.value = video
  isPlayerOpen.value = true
  currentTimeSecs.value = 0
  isPlaying.value = false
  await nextTick()
  if (playerRef.value) {
    playerRef.value.currentTime = 0
    playerRef.value.play().catch(() => {})
  }
}

const closePlayer = () => {
  if (playerRef.value) {
    saveProgress()
    playerRef.value.pause()
  }
  isPlayerOpen.value = false
  activeVideo.value = null
  isPlaying.value = false
}

const togglePlay = () => {
  if (!playerRef.value) return
  if (isPlaying.value) playerRef.value.pause()
  else playerRef.value.play().catch(() => {})
}

const toggleMute = () => {
  if (!playerRef.value) return
  isMuted.value = !isMuted.value
  playerRef.value.muted = isMuted.value
}

const skip = (seconds: number) => {
  if (!playerRef.value) return
  playerRef.value.currentTime = Math.max(
    0,
    Math.min(playerRef.value.duration, playerRef.value.currentTime + seconds),
  )
}

const seekTo = (event: MouseEvent) => {
  if (!playerRef.value || !videoDuration.value) return
  const bar = event.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = (event.clientX - rect.left) / rect.width
  playerRef.value.currentTime = ratio * videoDuration.value
}

const onTimeUpdate = () => {
  if (playerRef.value)
    currentTimeSecs.value = Math.floor(playerRef.value.currentTime)
}

const onMetadataLoaded = () => {
  if (playerRef.value) videoDuration.value = playerRef.value.duration
}

const onEnded = () => {
  isPlaying.value = false
  saveProgress(true)
  fetchContinueWatching()
}

const saveProgress = (completed = false) => {
  if (!activeVideo.value || !playerRef.value) return
  updateProgress(
    activeVideo.value.id,
    Math.floor(playerRef.value.currentTime),
    completed,
  )
}

// Auto-save progress every 5 seconds
let progressInterval: ReturnType<typeof setInterval> | null = null
const startProgressInterval = () => {
  progressInterval = setInterval(() => {
    if (isPlaying.value) saveProgress()
  }, 5000)
}
const stopProgressInterval = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

const formatTime = (secs: number) => {
  const s = Math.max(0, Math.floor(secs))
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${String(ss).padStart(2, '0')}`
}

// ── Static data ────────────────────────────────────────────────────────────
const playlistRows = [
  {
    left: {
      number: 1,
      title: 'First-Time Buyer Bootcamp',
      subtitle: 'Complete guide from search to keys',
    },
    right: {
      number: 4,
      title: 'Legal Checklist for Buyers',
      subtitle: 'Navigate legal documents and milestones without stress',
    },
  },
  {
    left: {
      number: 2,
      title: 'Property Investment Mastery',
      subtitle:
        'Build wealth through property - from single buy-to-let to full portfolio',
    },
    right: {
      number: 5,
      title: 'Market Timing Strategies',
      subtitle: 'Learn when to buy, sell, and hold with confidence',
    },
  },
  {
    left: {
      number: 3,
      title: 'Selling Your Home Successfully',
      subtitle:
        'Maximize your sale price with expert staging, pricing, and negotiation',
    },
    right: {
      number: 6,
      title: 'Professional Offer Tactics',
      subtitle: 'Make stronger offers and close deals faster',
    },
  },
]

const experts = [
  {
    title: 'Legal & Paperwork Explained',
    meta: '2 Chapters · 14 Lessons',
    image: '/op-icons/temp/unlock.png',
  },
  {
    title: 'Offer, Negotiate and Win',
    meta: '2 Chapters · 12 Lessons',
    image: '/op-icons/temp/property.svg',
  },
]

// ── Init ───────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchVideos()
  await fetchContinueWatching()
  startProgressInterval()
})

onUnmounted(() => {
  stopProgressInterval()
  if (playerRef.value) playerRef.value.pause()
})
</script>

<style scoped>
header {
  border-bottom: none !important;
}

.page-bg {
  background: linear-gradient(180deg, #ffffff 0%, #eff4f4 68%, #dff3f1 100%);
}
.hero-overlay {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0) 36%),
    linear-gradient(180deg, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.66) 100%);
}
.section-soft {
  background: linear-gradient(180deg, #f1f5f6 0%, #e7f3f2 100%);
}
.section-title {
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  font-weight: 590;
  color: #000000;
  font-family: 'SF Pro', sans-serif;
}
.section-sub {
  color: #6f757d;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  font-family: 'SF Pro', sans-serif;
  letter-spacing: -0.08px;
}
.playlist-title {
  color: #00a19a;
  font-size: 9px;
  font-family: 'SF Pro', sans-serif;
  line-height: 16px;
  letter-spacing: -0.08px;
  font-weight: 590;
}
.playlist-sub {
  color: #797f87;
  font-size: 10px;
  letter-spacing: -0.06px;
  font-weight: 400;
  font-family: 'SF Pro', sans-serif;
}
.hero-title {
  font-size: 20px;
  line-height: 25px;
  letter-spacing: -0.45px;
  font-weight: 590;
  font-family: 'SF Pro', sans-serif;
}
.hero-meta {
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  font-weight: 590;
  font-family: 'SF Pro', sans-serif;
}
.play-label {
  width: 160px;
  height: 34px;
  font-weight: 590;
  font-family: 'SF Pro', sans-serif;
  font-size: 15px;
  line-height: 20px;
}
.pill-text {
  font-size: 11px;
  padding: 4px 8px;
}
.pill-second {
  font-size: 9px;
  padding: 4px 8px;
  font-family: 'SF Pro', sans-serif;
  min-height: 21px;
}
.card-caption {
  font-size: 12px;
  line-height: 16px;
  font-weight: 590;
  font-family: 'SF Pro', sans-serif;
}
.card-title {
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  font-weight: 400;
  font-family: 'SF Pro', sans-serif;
}
.card-meta {
  font-size: 11px;
  line-height: 13px;
  letter-spacing: -0.06px;
  font-weight: 400;
  font-family: 'SF Pro', sans-serif;
}
.card-overlay {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.04) 40%,
    rgba(0, 0, 0, 0.66) 100%
  );
}
.premium-overlay {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.25) 35%,
    rgba(0, 0, 0, 0.68) 100%
  );
}
.content-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.content-scroll::-webkit-scrollbar {
  display: none;
}
.player-overlay {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.14) 35%),
    linear-gradient(180deg, rgba(0, 0, 0, 0) 58%, rgba(0, 0, 0, 0.66) 100%);
}
</style>
