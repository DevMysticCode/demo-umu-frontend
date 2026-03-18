export interface Reminder {
  id: string
  userId: string
  title: string
  date: string
  time?: string | null
  repeats: string
  notes?: string | null
  type: string
  createdAt: string
}

export interface CreateReminderPayload {
  title: string
  date: string
  time?: string
  repeats: string
  notes?: string
  type?: string
}

export function useCalendar() {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.apiBase

  const reminders = ref<Reminder[]>([])
  const isLoading = ref(false)

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const fetchReminders = async (year: number, month: number) => {
    const token = getToken()
    if (!token) return
    isLoading.value = true
    try {
      const data = await $fetch<Reminder[]>(`${BASE_URL}/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year, month },
      })
      reminders.value = data
    } finally {
      isLoading.value = false
    }
  }

  const createReminder = async (payload: CreateReminderPayload) => {
    const token = getToken()
    if (!token) return null
    const created = await $fetch<Reminder>(`${BASE_URL}/calendar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    })
    reminders.value.push(created)
    reminders.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return created
  }

  const deleteReminder = async (id: string) => {
    const token = getToken()
    if (!token) return
    await $fetch(`${BASE_URL}/calendar/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    reminders.value = reminders.value.filter((r) => r.id !== id)
  }

  const updateReminder = async (id: string, payload: Partial<CreateReminderPayload>) => {
    const token = getToken()
    if (!token) return null
    const updated = await $fetch<Reminder>(`${BASE_URL}/calendar/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    })
    const idx = reminders.value.findIndex((r) => r.id === id)
    if (idx !== -1) reminders.value[idx] = updated
    return updated
  }

  // Returns set of date strings ("2025-09-14") that have reminders
  const reminderDateSet = computed(() => {
    const set = new Set<string>()
    for (const r of reminders.value) {
      set.add(r.date.slice(0, 10))
    }
    return set
  })

  // Group reminders by date string for the event list
  const remindersByDate = computed(() => {
    const map: Record<string, Reminder[]> = {}
    for (const r of reminders.value) {
      const key = r.date.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(r)
    }
    return map
  })

  return {
    reminders,
    isLoading,
    reminderDateSet,
    remindersByDate,
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
  }
}
