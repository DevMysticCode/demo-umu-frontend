<template>
  <div class="cal-page mobile-container">
    <!-- Nav bar -->
    <div class="cal-nav-bar">
      <button class="cal-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="cal-nav-title">Calendar</div>
      <button class="cal-nav-icon-btn" aria-label="Filter">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
    </div>

    <main class="cal-body">
      <div class="atm-bg purple" />

      <!-- Hero -->
      <div class="cal-hero">
        <div class="cal-monthnav">
          <button class="cal-arrow" @click="prevMonth">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2>{{ monthLabel }}</h2>
          <button class="cal-arrow" @click="nextMonth">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div class="hero-stats">
          <span><span class="stat-num">{{ countThisWeek }}</span>this week</span>
          <span class="stat-sep" />
          <span><span class="stat-num teal">{{ countViewings }}</span>viewings</span>
          <span class="stat-sep" />
          <span><span class="stat-num coral">{{ countDeadlines }}</span>deadlines</span>
        </div>
      </div>

      <!-- Mini month grid -->
      <div class="cal-grid">
        <div v-for="d in dayHeaders" :key="d" class="cal-dow">{{ d[0] }}</div>
        <template v-for="(cell, i) in calendarCells" :key="i">
          <div
            v-if="cell"
            class="cal-day"
            :class="cellClasses(cell)"
            @click="selectDate(cell)"
          >
            {{ cell.day }}
          </div>
          <div v-else class="cal-day muted" />
        </template>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="cal-empty">Loading…</div>

      <!-- Agenda groups -->
      <template v-else-if="groupedDates.length > 0">
        <div v-for="group in groupedDates" :key="group.dateStr">
          <div class="cal-agenda-heading">
            {{ group.isToday ? 'Today' : group.label }}
            <span v-if="!group.isToday" class="agenda-day">
              · {{ group.label }}
            </span>
          </div>

          <div
            v-for="r in group.reminders"
            :key="r.id"
            class="cal-event"
            :class="eventTone(r)"
          >
            <div class="cal-event-time">
              {{ r.time || 'All day' }}
              <div class="cal-event-time-small">{{ eventDuration(r) }}</div>
            </div>
            <div class="cal-event-content">
              <div class="cal-event-title">{{ r.title }}</div>
              <div v-if="r.notes" class="cal-event-meta">{{ r.notes }}</div>
              <span class="cal-event-tag" :class="eventTone(r)">
                {{ eventTagLabel(r) }}
              </span>
            </div>
            <button
              type="button"
              class="cal-event-delete"
              aria-label="Delete"
              @click="confirmDelete(r.id)"
            >
              ×
            </button>
          </div>
        </div>
      </template>

      <div v-else class="cal-empty">Nothing scheduled</div>
    </main>

    <!-- Floating add button -->
    <button class="fab" aria-label="Add event" @click="openAddDrawer()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    <!-- New Event Modal -->
    <Teleport to="body">
      <div v-if="showDrawer" class="modal-overlay" @click.self="closeDrawer">
        <div class="modal">
          <div class="modal-handle" />
          <div class="modal-header">
            <div class="modal-title">New event</div>
            <button class="modal-close" type="button" aria-label="Close" @click="closeDrawer">×</button>
          </div>

          <div class="modal-body">
            <div class="mform-section">
              <div class="mform-label">Title</div>
              <input
                v-model="form.title"
                class="mform-input"
                type="text"
                placeholder="What's happening?"
              />
            </div>

            <div class="mform-section">
              <div class="mform-label">Type</div>
              <div class="mform-radio-group">
                <button
                  v-for="t in eventTypes"
                  :key="t.value"
                  type="button"
                  class="mform-radio"
                  :class="[t.value, { active: form.eventType === t.value }]"
                  @click="form.eventType = t.value"
                >
                  <div class="mfr-icon" v-html="t.icon" />
                  {{ t.label }}
                </button>
              </div>
            </div>

            <div class="mform-section">
              <div class="mform-label">When</div>
              <div class="mform-when-row">
                <input
                  v-model="form.date"
                  class="mform-input"
                  type="date"
                />
                <input
                  v-model="form.time"
                  class="mform-input"
                  type="time"
                  placeholder="Time"
                />
              </div>
              <div class="mform-when-row mform-when-row--bottom">
                <select v-model="form.duration" class="mform-input">
                  <option value="">No duration</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
                <button
                  type="button"
                  class="mform-radio"
                  :class="{ active: form.repeats === 'annually' }"
                  style="justify-content: center;"
                  @click="form.repeats = form.repeats === 'annually' ? 'never' : 'annually'"
                >
                  {{ form.repeats === 'annually' ? '✓ Repeats yearly' : '+ Repeat yearly' }}
                </button>
              </div>
            </div>

            <div class="mform-section">
              <div class="mform-label">Notes (optional)</div>
              <input
                v-model="form.notes"
                class="mform-input"
                type="text"
                placeholder="Any reminders or details…"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" type="button" @click="closeDrawer">Cancel</button>
            <button
              class="btn-primary"
              type="button"
              :disabled="!form.title.trim() || !form.date || isSaving"
              @click="saveReminder"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ isSaving ? 'Saving…' : 'Save event' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Calendar - UmovingU', middleware: 'auth' })

const {
  reminders,
  isLoading,
  reminderDateSet,
  remindersByDate,
  fetchReminders,
  createReminder,
  deleteReminder,
} = useCalendar()

const {
  permissionGranted,
  requestPermission,
  scheduleReminder,
  cancelReminder,
} = useLocalNotifications()

// ─── Calendar state ────────────────────────────────────────────────────────
const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth() + 1) // 1-based
const selectedDateStr = ref<string | null>(null)

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const dayHeaders = DAY_HEADERS

const monthLabel = computed(
  () => `${MONTH_NAMES[viewMonth.value - 1]} ${viewYear.value}`,
)

const todayStr = computed(
  () =>
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
)

interface CalCell {
  day: number
  dateStr: string
}

const calendarCells = computed<(CalCell | null)[]>(() => {
  const firstDay = new Date(Date.UTC(viewYear.value, viewMonth.value - 1, 1))
  // 0=Sun…6=Sat → convert to Mon-first (0=Mon…6=Sun)
  let startOffset = (firstDay.getUTCDay() + 6) % 7
  const daysInMonth = new Date(
    Date.UTC(viewYear.value, viewMonth.value, 0),
  ).getUTCDate()

  const cells: (CalCell | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${viewYear.value}-${String(viewMonth.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, dateStr: ds })
  }
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
})

const getCellClass = (cell: CalCell) => {
  if (isSelectedCell(cell)) return 'bg-brand-aqua text-white'
  if (cell.dateStr === todayStr.value)
    return 'border-2 border-brand-aqua text-brand-aqua font-semibold'
  if (reminderDateSet.value.has(cell.dateStr)) return 'text-[#1f2024]'
  return 'text-[#1f2024]'
}

const isSelectedCell = (cell: CalCell) => cell.dateStr === selectedDateStr.value

const selectDate = (cell: CalCell) => {
  selectedDateStr.value =
    selectedDateStr.value === cell.dateStr ? null : cell.dateStr
}

const prevMonth = async () => {
  if (viewMonth.value === 1) {
    viewMonth.value = 12
    viewYear.value--
  } else viewMonth.value--
  await fetchReminders(viewYear.value, viewMonth.value)
}

const nextMonth = async () => {
  if (viewMonth.value === 12) {
    viewMonth.value = 1
    viewYear.value++
  } else viewMonth.value++
  await fetchReminders(viewYear.value, viewMonth.value)
}

// ─── Filters ───────────────────────────────────────────────────────────────
const filters = [
  { key: 'manual', label: 'Manually by you' },
  { key: 'tradesperson', label: 'Tradesperson appointments' },
  { key: 'business', label: 'Important business dates' },
]
const activeFilter = ref<string>('all')

// ─── Event list ────────────────────────────────────────────────────────────
const filteredReminders = computed(() => {
  if (activeFilter.value === 'all') return reminders.value
  return reminders.value.filter((r) => r.type === activeFilter.value)
})

const groupedDates = computed(() => {
  const map: Record<string, typeof reminders.value> = {}

  for (const r of filteredReminders.value) {
    // If a date is selected, only show that date
    const key = r.date.slice(0, 10)
    if (selectedDateStr.value && key !== selectedDateStr.value) continue
    if (!map[key]) map[key] = []
    map[key].push(r)
  }

  return Object.keys(map)
    .sort()
    .map((dateStr) => {
      const d = new Date(dateStr + 'T00:00:00Z')
      const day = d.getUTCDate()
      const month = MONTH_NAMES[d.getUTCMonth()]
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
        d.getUTCDay()
      ]
      return {
        dateStr,
        label: `${month} ${day} · ${dayName}`,
        isToday: dateStr === todayStr.value,
        reminders: map[dateStr],
      }
    })
})

// ─── Card colours ──────────────────────────────────────────────────────────
const getCardClass = (type: string) => {
  if (type === 'manual') return 'bg-[#00A19A]'
  if (type === 'tradesperson') return 'bg-brand-aqua'
  return 'bg-[#f6f6f7] border border-[#e5e5ea]'
}

const getCardTitle = (type: string) =>
  type === 'business' ? 'text-[#1f2024]' : 'text-white'

const getCardTextMuted = (type: string) =>
  type === 'business' ? 'text-[#8f9094]' : 'text-white/70'

// ─── Prototype hero stats + event tones ───────────────────────────────────
const eventTone = (r: any): string => {
  const t = (r.type || '').toLowerCase()
  if (t.includes('viewing')) return 'viewing'
  if (t.includes('compliance') || t.includes('expiry') || t.includes('expir'))
    return 'compliance'
  if (t.includes('deadline') || t.includes('mortgage') || t.includes('aip'))
    return 'deadline'
  return 'personal'
}
const eventTagLabel = (r: any): string => {
  const tone = eventTone(r)
  if (tone === 'viewing') return 'Viewing'
  if (tone === 'compliance') return 'Compliance'
  if (tone === 'deadline') return 'Deadline'
  return 'Personal'
}
const eventDuration = (r: any): string =>
  r.durationMinutes ? `${r.durationMinutes} min` : ''

const cellClasses = (cell: any) => {
  const classes: string[] = []
  if (cell.dateStr === todayStr.value) classes.push('today')
  if (cell.dateStr === selectedDateStr.value) classes.push('selected')
  if (reminderDateSet.value.has(cell.dateStr)) {
    // Pick dot colour from the first reminder of that day
    const r = reminders.value.find((x: any) => x.date.slice(0, 10) === cell.dateStr)
    const tone = r ? eventTone(r) : 'personal'
    if (tone === 'compliance' || tone === 'deadline') classes.push('has-event-warn')
    else classes.push('has-event')
  }
  return classes.join(' ')
}

const startOfWeek = computed(() => {
  const d = new Date()
  const dow = (d.getDay() + 6) % 7 // Mon-first
  d.setDate(d.getDate() - dow)
  d.setHours(0, 0, 0, 0)
  return d
})
const endOfWeek = computed(() => {
  const d = new Date(startOfWeek.value)
  d.setDate(d.getDate() + 7)
  return d
})
const inThisWeek = (r: any) => {
  const t = new Date(r.date).getTime()
  return t >= startOfWeek.value.getTime() && t < endOfWeek.value.getTime()
}
const countThisWeek = computed(() => reminders.value.filter(inThisWeek).length)
const countViewings = computed(
  () => reminders.value.filter((r: any) => eventTone(r) === 'viewing').length,
)
const countDeadlines = computed(
  () =>
    reminders.value.filter((r: any) =>
      ['deadline', 'compliance'].includes(eventTone(r)),
    ).length,
)

// ─── Delete ────────────────────────────────────────────────────────────────
const confirmDelete = async (id: string) => {
  if (confirm('Delete this reminder?')) {
    // Cancel the scheduled notification before removing from DB
    await cancelReminder(id)
    await deleteReminder(id)
  }
}

// ─── Add drawer ────────────────────────────────────────────────────────────
const showDrawer = ref(false)
const isSaving = ref(false)

const defaultForm = () => ({
  title: '',
  date: selectedDateStr.value ?? todayStr.value,
  time: '',
  repeats: 'never',
  notes: '',
  eventType: 'personal',
  duration: '',
})

const form = ref(defaultForm())

const eventTypes = [
  {
    value: 'viewing',
    label: 'Viewing',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  },
  {
    value: 'personal',
    label: 'Personal',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  },
  {
    value: 'deadline',
    label: 'Deadline',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  },
  {
    value: 'compliance',
    label: 'Compliance',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/></svg>',
  },
]

const openAddDrawer = (prefilledDate?: string) => {
  form.value = defaultForm()
  if (prefilledDate) form.value.date = prefilledDate
  showDrawer.value = true
}

const closeDrawer = () => {
  showDrawer.value = false
}

const saveReminder = async () => {
  if (!form.value.title.trim() || !form.value.date) return
  isSaving.value = true
  try {
    const created = await createReminder({
      title: form.value.title.trim(),
      date: form.value.date,
      time: form.value.time || undefined,
      repeats: form.value.repeats,
      notes: form.value.notes || undefined,
      type: form.value.eventType || 'personal',
    })
    // Schedule a local device notification for the saved reminder
    if (created) {
      await scheduleReminder({
        id: created.id,
        title: created.title,
        date: created.date.slice(0, 10),
        time: created.time ?? undefined,
        notes: created.notes ?? undefined,
      })
    }
    closeDrawer()
  } finally {
    isSaving.value = false
  }
}

// ─── Init ──────────────────────────────────────────────────────────────────
const goBack = useGoBack('/profile')

onMounted(async () => {
  // Request notification permission on first open (iOS/Android only — no-op on web)
  await requestPermission()
  await fetchReminders(viewYear.value, viewMonth.value)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Page surface */
.cal-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 96px;
  display: flex;
  flex-direction: column;
}

/* Nav bar */
.cal-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.cal-nav-icon-btn {
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
.cal-nav-icon-btn:hover { background: #f0f2f1; }
.cal-nav-icon-btn svg { width: 18px; height: 18px; }
.cal-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}

.cal-body { position: relative; flex: 1; }
.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.purple {
  background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(157, 123, 255, 0.1), transparent 65%);
}

/* Hero */
.cal-hero { padding: 8px 22px 10px; position: relative; z-index: 1; }
.cal-monthnav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.cal-monthnav h2 {
  font-size: 17px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
  flex: 1;
  margin: 0;
}
.cal-arrow {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: #f5f4f0;
  color: #0e2840;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cal-arrow svg { width: 13px; height: 13px; }
.cal-arrow:hover { background: #e8eceb; }

.hero-stats {
  display: inline-flex;
  align-items: center;
  font-size: 12.5px;
  font-weight: 700;
  color: #4a5868;
  letter-spacing: -0.2px;
  flex-wrap: wrap;
}
.hero-stats .stat-num { color: #0e2840; font-weight: 800; font-feature-settings: 'tnum'; margin-right: 4px; }
.hero-stats .stat-num.teal { color: #1f7a66; }
.hero-stats .stat-num.coral { color: #b85b36; }
.hero-stats .stat-sep { width: 3px; height: 3px; border-radius: 50%; background: #b5bdc4; margin: 0 8px; display: inline-block; }

/* Mini month grid */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 18px;
  padding: 0 22px;
  position: relative;
  z-index: 1;
}
.cal-dow {
  font-size: 9px;
  font-weight: 800;
  color: #8a95a0;
  text-align: center;
  padding: 4px 0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.cal-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #4a5868;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.12s;
}
.cal-day:hover { background: #f5f4f0; }
.cal-day.muted { color: #b5bdc4; font-weight: 600; }
.cal-day.has-event::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px; height: 4px;
  border-radius: 50%;
  background: #3dbda3;
}
.cal-day.has-event-warn::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px; height: 4px;
  border-radius: 50%;
  background: #ff8b5a;
}
.cal-day.today {
  background: #0e2840;
  color: #fff;
  font-weight: 800;
}
.cal-day.today.has-event::after { background: #f5c44c; }
.cal-day.selected {
  background: #f1f9f4;
  color: #1f7a66;
  font-weight: 800;
  box-shadow: inset 0 0 0 1.5px #3dbda3;
}

/* Agenda */
.cal-agenda-heading {
  padding: 0 22px 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #8a95a0;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}
.cal-agenda-heading .agenda-day { color: #1f7a66; }

.cal-event {
  margin: 0 22px 8px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  align-items: center;
  border-left: 4px solid #3dbda3;
  z-index: 1;
}
.cal-event.viewing { border-left-color: #3dbda3; }
.cal-event.compliance { border-left-color: #ff8b5a; }
.cal-event.deadline { border-left-color: #f5c44c; }
.cal-event.personal { border-left-color: #9d7bff; }
.cal-event:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(14, 40, 64, 0.06);
  border-color: #e2f1ea;
}
.cal-event-time {
  font-size: 11px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.1px;
  font-feature-settings: 'tnum';
  flex-shrink: 0;
  text-align: right;
  width: 50px;
}
.cal-event-time-small {
  font-size: 9px;
  font-weight: 700;
  color: #8a95a0;
  margin-top: 1px;
}
.cal-event-content { flex: 1; min-width: 0; }
.cal-event-title {
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  line-height: 1.2;
}
.cal-event-meta {
  font-size: 10.5px;
  font-weight: 600;
  color: #4a5868;
  margin-top: 2px;
  line-height: 1.3;
}
.cal-event-tag {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 100px;
  margin-top: 4px;
  display: inline-block;
}
.cal-event-tag.viewing { background: #f1f9f4; color: #1f7a66; }
.cal-event-tag.compliance { background: #ffe9dd; color: #b85b36; }
.cal-event-tag.deadline { background: #fef3c7; color: #92400e; }
.cal-event-tag.personal { background: #ede5ff; color: #6b4e9f; }

.cal-event-delete {
  background: transparent;
  border: none;
  color: #b5bdc4;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  flex-shrink: 0;
}
.cal-event-delete:hover { color: #ff8b5a; }

.cal-empty {
  text-align: center;
  padding: 40px 22px;
  color: #8a95a0;
  font-size: 13px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 20;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #3dbda3;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(61, 189, 163, 0.4);
  transition: all 0.18s;
}
.fab:hover { background: #2a9484; transform: translateY(-2px) scale(1.05); }
.fab svg { width: 22px; height: 22px; }

/* ── Modal pattern ─────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14, 40, 64, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 60;
  padding: 0;
}
.modal {
  width: 100%;
  max-width: 28rem;
  background: #fafaf8;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  overflow: hidden;
  animation: modal-up 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes modal-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.modal-handle {
  width: 36px;
  height: 4px;
  background: #d9dae0;
  border-radius: 100px;
  margin: 8px auto 0;
}
.modal-header {
  display: flex;
  align-items: center;
  padding: 12px 18px 10px;
}
.modal-title {
  flex: 1;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}
.modal-close {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: none;
  background: #f0f2f1;
  color: #4a5868;
  font-size: 20px;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close:hover { background: #e8eceb; }
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 6px 18px 14px;
}
.modal-footer {
  padding: 12px 18px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid #e8eceb;
  background: #fafaf8;
  display: flex;
  gap: 8px;
}

/* Form */
.mform-section { margin-bottom: 14px; }
.mform-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-bottom: 8px;
}
.mform-input {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #0e2840;
  outline: none;
  transition: all 0.18s;
}
.mform-input:focus {
  border-color: #3dbda3;
  box-shadow: 0 0 0 3px rgba(61, 189, 163, 0.18);
}
.mform-input::placeholder { color: #8a95a0; font-weight: 500; }
.mform-when-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.mform-when-row--bottom {
  grid-template-columns: 1fr 1fr;
  margin-top: 8px;
}
.mform-when-row > .mform-input,
.mform-when-row > select.mform-input {
  min-width: 0;            /* allow grid children to actually shrink */
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  text-align: left;
}
/* Make the radio-styled "+ Repeat yearly" button match the input height
   so it lines up with the duration select on the same row. */
.mform-when-row > .mform-radio {
  min-width: 0;
  width: 100%;
  height: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mform-radio-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.mform-radio {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #0e2840;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.18s;
  text-align: left;
}
.mform-radio:hover { border-color: #d9dee2; }
.mform-radio.active {
  border-color: #3dbda3;
  background: #f1f9f4;
  color: #1f7a66;
}
.mform-radio.viewing.active { border-color: #3dbda3; background: #f1f9f4; color: #1f7a66; }
.mform-radio.viewing.active .mfr-icon { background: #3dbda3; color: #fff; }
.mform-radio.personal.active { border-color: #9d7bff; background: #ede5ff; color: #6b4e9f; }
.mform-radio.personal.active .mfr-icon { background: #9d7bff; color: #fff; }
.mform-radio.deadline.active { border-color: #f5c44c; background: #fef3c7; color: #92400e; }
.mform-radio.deadline.active .mfr-icon { background: #f5c44c; color: #6f4d14; }
.mform-radio.compliance.active { border-color: #ff8b5a; background: #ffe9dd; color: #b85b36; }
.mform-radio.compliance.active .mfr-icon { background: #ff8b5a; color: #fff; }
.mfr-icon {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: #f1f9f4;
  color: #1f7a66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mfr-icon svg { width: 13px; height: 13px; }

.btn-secondary {
  flex: 1;
  background: #f0f2f1;
  color: #0e2840;
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
}
.btn-secondary:hover { background: #e8eceb; }
.btn-primary {
  flex: 2;
  background: #3dbda3;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(61, 189, 163, 0.32);
}
.btn-primary:hover { background: #2a9484; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.btn-primary svg { width: 14px; height: 14px; }
</style>
