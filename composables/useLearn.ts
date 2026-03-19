export interface Video {
  id: string
  title: string
  description: string | null
  url: string
  thumbnail: string | null
  durationSec: number
  points: number
  category: string | null
  tags: string[]
  order: number
  featured: boolean
  createdAt: string
}

export interface ContinueWatchingItem extends Video {
  positionSecs: number
  progressPercent: number
  remainingSecs: number
}

export function useLearn() {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.apiBase

  const videos = ref<Video[]>([])
  const continueWatching = ref<ContinueWatchingItem[]>([])
  const isLoadingVideos = ref(false)
  const isLoadingContinue = ref(false)

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const fetchVideos = async () => {
    isLoadingVideos.value = true
    try {
      const data = await $fetch<Video[]>(`${BASE_URL}/learn/videos`)
      videos.value = data
    } catch {
      // ignore
    } finally {
      isLoadingVideos.value = false
    }
  }

  const fetchContinueWatching = async () => {
    const token = getToken()
    if (!token) return
    isLoadingContinue.value = true
    try {
      const data = await $fetch<ContinueWatchingItem[]>(`${BASE_URL}/learn/continue-watching`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      continueWatching.value = data
    } catch {
      // ignore
    } finally {
      isLoadingContinue.value = false
    }
  }

  const updateProgress = async (videoId: string, positionSecs: number, completed = false) => {
    const token = getToken()
    if (!token) return
    try {
      await $fetch(`${BASE_URL}/learn/progress/${videoId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: { positionSecs, completed },
      })
    } catch {
      // ignore
    }
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')} mins`
  }

  const formatRemaining = (secs: number) => {
    const m = Math.floor(secs / 60)
    return m > 0 ? `${m} MINUTES LEFT` : `${secs} SECONDS LEFT`
  }

  return {
    videos,
    continueWatching,
    isLoadingVideos,
    isLoadingContinue,
    fetchVideos,
    fetchContinueWatching,
    updateProgress,
    formatDuration,
    formatRemaining,
  }
}
