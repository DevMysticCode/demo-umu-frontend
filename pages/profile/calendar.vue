<template>
  <div class="cal-page mobile-container">
    <!-- ── Top nav (Back · Calendar · Search) ─────────────────────── -->
    <div class="cal-nav-bar">
      <button class="cal-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="cal-nav-title">Calendar</div>
      <button class="cal-nav-icon-btn" aria-label="Search" @click="onSearchTap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
    </div>

    <main class="cal-body">
      <!-- ── Month picker pill ─────────────────────────────────────── -->
      <div class="cal-monthpill">
        <button class="cal-arrow" @click="prevMonth" aria-label="Previous month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2>{{ monthLabel }}</h2>
        <button class="cal-arrow" @click="nextMonth" aria-label="Next month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <!-- ── 3 stat cards (this week / viewings / deadlines) ──────── -->
      <div class="cal-stats">
        <div class="cal-stat">
          <img src="/op-icons/calendar/calendar.png" alt="" class="cal-stat-ic" loading="lazy" />
          <div>
            <div class="cal-stat-num">{{ countThisWeek }}</div>
            <div class="cal-stat-label">this week</div>
          </div>
        </div>
        <div class="cal-stat">
          <img src="/op-icons/calendar/eye.png" alt="" class="cal-stat-ic" loading="lazy" />
          <div>
            <div class="cal-stat-num">{{ countViewings }}</div>
            <div class="cal-stat-label">viewings</div>
          </div>
        </div>
        <div class="cal-stat">
          <img src="/op-icons/calendar/clock.png" alt="" class="cal-stat-ic" loading="lazy" />
          <div>
            <div class="cal-stat-num">{{ countDeadlines }}</div>
            <div class="cal-stat-label">deadlines</div>
          </div>
        </div>
      </div>

      <!-- ── Month grid card ──────────────────────────────────────── -->
      <div class="cal-grid-card">
        <div class="cal-grid">
          <div v-for="d in dayHeaders" :key="d" class="cal-dow">{{ d[0] }}</div>
          <template v-for="(cell, i) in calendarCells" :key="i">
            <div
              v-if="cell"
              class="cal-day"
              :class="cellClasses(cell)"
              @click="selectDate(cell)"
            >
              <span class="cal-day-num">{{ cell.day }}</span>
            </div>
            <div v-else class="cal-day cal-day--empty" />
          </template>
        </div>
      </div>

      <!-- ── Agenda ───────────────────────────────────────────────── -->
      <div v-if="isLoading" class="cal-empty">Loading…</div>

      <template v-else-if="groupedDates.length > 0">
        <div v-for="group in groupedDates" :key="group.dateStr" class="cal-agenda-group">
          <div class="cal-agenda-heading">
            {{ group.headingLabel }}
          </div>

          <div
            v-for="r in group.reminders"
            :key="r.id"
            class="cal-event"
            :class="'cal-event--' + eventTone(r)"
          >
            <div class="cal-event-accent" />
            <img src="/op-icons/calendar/calendar.png" alt="" class="cal-event-ic" loading="lazy" />
            <div class="cal-event-time">
              <div class="cal-event-time-top">{{ r.time || 'All day' }}</div>
              <div v-if="eventDuration(r)" class="cal-event-time-sub">{{ eventDuration(r) }}</div>
            </div>
            <div class="cal-event-content">
              <div class="cal-event-title">{{ r.title }}</div>
              <div class="cal-event-sub">{{ r.notes || 'Reminder' }}</div>
              <span class="cal-event-tag" :class="'cal-event-tag--' + eventTone(r)">
                {{ eventTagLabel(r).toUpperCase() }}
              </span>
            </div>
            <button
              type="button"
              class="cal-event-kebab"
              aria-label="More"
              @click="confirmDelete(r.id)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.7" />
                <circle cx="12" cy="12" r="1.7" />
                <circle cx="12" cy="19" r="1.7" />
              </svg>
            </button>
          </div>
        </div>
      </template>

      <div v-else class="cal-empty">Nothing scheduled</div>
    </main>

    <!-- ── Floating add button ───────────────────────────────────── -->
    <button class="fab" aria-label="Add event" @click="openAddDrawer()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    <!-- ── New Event drawer ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="ne-modal">
        <div v-if="showDrawer" class="ne-overlay" @click.self="closeDrawer">
          <div class="ne-sheet" @click.stop>
            <div class="ne-grip" />

            <div class="ne-head">
              <img src="/op-icons/calendar/calendar.png" alt="" class="ne-head-ic" loading="lazy" />
              <div class="ne-head-text">
                <div class="ne-head-title">New event</div>
                <div class="ne-head-sub">Add a reminder to your calendar</div>
              </div>
              <button class="ne-close" type="button" aria-label="Close" @click="closeDrawer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <div class="ne-body">
              <!-- Title -->
              <div class="ne-section">
                <div class="ne-label">Title</div>
                <div class="ne-input-wrap">
                  <img src="/op-icons/calendar/pen.png" alt="" class="ne-input-ic" loading="lazy" />
                  <input
                    v-model="form.title"
                    class="ne-input"
                    type="text"
                    placeholder="What's happening?"
                  />
                </div>
              </div>

              <!-- Type -->
              <div class="ne-section">
                <div class="ne-label">Type</div>
                <div class="ne-type-grid">
                  <button
                    v-for="t in eventTypes"
                    :key="t.value"
                    type="button"
                    class="ne-type"
                    :class="[t.value, { 'ne-type--active': form.eventType === t.value }]"
                    @click="form.eventType = t.value"
                  >
                    <img :src="t.icon" alt="" class="ne-type-ic" loading="lazy" />
                    <div class="ne-type-label">{{ t.label }}</div>
                    <span v-if="form.eventType === t.value" class="ne-type-check" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              <!-- When (2×2 grid of pill fields) -->
              <div class="ne-section">
                <div class="ne-label">When</div>
                <div class="ne-when-grid">
                  <label class="ne-cell">
                    <img src="/op-icons/calendar/calendar.png" alt="" class="ne-cell-ic" loading="lazy" />
                    <span class="ne-cell-value">{{ formatCellDate(form.date) }}</span>
                    <input
                      v-model="form.date"
                      type="date"
                      class="ne-cell-native"
                      aria-label="Date"
                    />
                  </label>
                  <label class="ne-cell">
                    <img src="/op-icons/calendar/clock.png" alt="" class="ne-cell-ic" loading="lazy" />
                    <span class="ne-cell-value">{{ form.allDay ? 'All day' : (form.time || 'Set time') }}</span>
                    <svg class="ne-cell-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <select
                      v-model="timeSelect"
                      class="ne-cell-native"
                      aria-label="Time"
                    >
                      <option value="all-day">All day</option>
                      <option value="custom">Custom time…</option>
                    </select>
                  </label>
                  <label class="ne-cell">
                    <img src="/op-icons/calendar/hourglass.png" alt="" class="ne-cell-ic" loading="lazy" />
                    <span class="ne-cell-value">{{ durationLabel(form.duration) }}</span>
                    <svg class="ne-cell-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <select
                      v-model="form.duration"
                      class="ne-cell-native"
                      aria-label="Duration"
                    >
                      <option value="">No duration</option>
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </label>
                  <label class="ne-cell">
                    <img src="/op-icons/calendar/repeat.png" alt="" class="ne-cell-ic" loading="lazy" />
                    <span class="ne-cell-value">{{ repeatLabel(form.repeats) }}</span>
                    <svg class="ne-cell-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <select
                      v-model="form.repeats"
                      class="ne-cell-native"
                      aria-label="Repeat"
                    >
                      <option value="never">Doesn't repeat</option>
                      <option value="daily">Repeat daily</option>
                      <option value="weekly">Repeat weekly</option>
                      <option value="monthly">Repeat monthly</option>
                      <option value="annually">Repeat yearly</option>
                    </select>
                  </label>
                </div>
              </div>

              <!-- If user picked "Custom time…" show a time picker -->
              <div v-if="timeSelect === 'custom'" class="ne-section">
                <div class="ne-label">Time</div>
                <div class="ne-input-wrap">
                  <img src="/op-icons/calendar/clock.png" alt="" class="ne-input-ic" loading="lazy" />
                  <input
                    v-model="form.time"
                    class="ne-input"
                    type="time"
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              <!-- Notes -->
              <div class="ne-section">
                <div class="ne-label">Notes (optional)</div>
                <div class="ne-input-wrap">
                  <img src="/op-icons/calendar/document.png" alt="" class="ne-input-ic" loading="lazy" />
                  <input
                    v-model="form.notes"
                    class="ne-input"
                    type="text"
                    placeholder="Any reminders or details…"
                  />
                </div>
              </div>
            </div>

            <div class="ne-footer">
              <button class="ne-btn ne-btn--secondary" type="button" @click="closeDrawer">
                Cancel
              </button>
              <button
                class="ne-btn ne-btn--primary"
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
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Calendar - UmovingU', middleware: 'auth' })

const {
  reminders,
  isLoading,
  reminderDateSet,
  fetchReminders,
  createReminder,
  deleteReminder,
} = useCalendar()

const {
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
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
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
  const startOffset = (firstDay.getUTCDay() + 6) % 7 // Mon-first
  const daysInMonth = new Date(
    Date.UTC(viewYear.value, viewMonth.value, 0),
  ).getUTCDate()

  const cells: (CalCell | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${viewYear.value}-${String(viewMonth.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, dateStr: ds })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
})

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

// ─── Event list ────────────────────────────────────────────────────────────
const groupedDates = computed(() => {
  const map: Record<string, typeof reminders.value> = {}

  for (const r of reminders.value) {
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
      const dayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][
        d.getUTCDay()
      ]
      const month = MONTH_NAMES[d.getUTCMonth()].toUpperCase()
      const isToday = dateStr === todayStr.value
      return {
        dateStr,
        headingLabel: isToday
          ? 'TODAY'
          : `${dayName} ${day} ${month.slice(0, 3)}`,
        isToday,
        reminders: map[dateStr],
      }
    })
})

// ─── Event tone (colour band + tag) ────────────────────────────────────────
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

const cellClasses = (cell: CalCell) => {
  const classes: string[] = []
  if (cell.dateStr === todayStr.value) classes.push('cal-day--today')
  if (cell.dateStr === selectedDateStr.value) classes.push('cal-day--selected')
  if (reminderDateSet.value.has(cell.dateStr)) {
    const r = reminders.value.find((x: any) => x.date.slice(0, 10) === cell.dateStr)
    const tone = r ? eventTone(r) : 'personal'
    classes.push('cal-day--has-event')
    classes.push('cal-day--dot-' + tone)
  }
  return classes.join(' ')
}

// ─── Header stats ──────────────────────────────────────────────────────────
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
    await cancelReminder(id)
    await deleteReminder(id)
  }
}

// ─── Search icon (top-right) — kept as no-op placeholder to match the
//     previous filter/search behaviour; wire real search in a follow-up.
function onSearchTap() {
  /* no-op — preserves parity with the previous tap-handler */
}

// ─── Add drawer ────────────────────────────────────────────────────────────
const showDrawer = ref(false)
const isSaving = ref(false)

const defaultForm = () => ({
  title: '',
  date: selectedDateStr.value ?? todayStr.value,
  time: '',
  allDay: true,
  repeats: 'never',
  notes: '',
  eventType: 'personal',
  duration: '',
})

const form = ref(defaultForm())

// Bridge between the "time" cell's select ("All day" / "Custom time…") and the
// underlying form. When the user picks "Custom time…" we reveal the HH:MM
// input; picking "All day" clears the time.
const timeSelect = ref<'all-day' | 'custom'>('all-day')
watch(timeSelect, (v) => {
  if (v === 'all-day') {
    form.value.allDay = true
    form.value.time = ''
  } else {
    form.value.allDay = false
  }
})

const eventTypes = [
  { value: 'viewing',    label: 'Viewing',    icon: '/op-icons/calendar/eye.png' },
  { value: 'personal',   label: 'Personal',   icon: '/op-icons/calendar/person.png' },
  { value: 'deadline',   label: 'Deadline',   icon: '/op-icons/calendar/clock.png' },
  { value: 'compliance', label: 'Compliance', icon: '/op-icons/calendar/shield.png' },
]

function formatCellDate(iso: string): string {
  if (!iso) return 'Pick a date'
  const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10))
  const dt = new Date(Date.UTC(y, m - 1, d))
  return `${dt.getUTCDate()} ${MONTH_NAMES[dt.getUTCMonth()].slice(0, 3)} ${dt.getUTCFullYear()}`
}

function durationLabel(v: string): string {
  if (!v) return 'No duration'
  if (v === '15') return '15 min'
  if (v === '30') return '30 min'
  if (v === '60') return '1 hour'
  if (v === '90') return '1.5 hours'
  if (v === '120') return '2 hours'
  return v + ' min'
}

function repeatLabel(v: string): string {
  if (v === 'daily') return 'Repeat daily'
  if (v === 'weekly') return 'Repeat weekly'
  if (v === 'monthly') return 'Repeat monthly'
  if (v === 'annually') return 'Repeat yearly'
  return 'Doesn\'t repeat'
}

const openAddDrawer = (prefilledDate?: string) => {
  form.value = defaultForm()
  timeSelect.value = 'all-day'
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
      time: form.value.allDay ? undefined : form.value.time || undefined,
      repeats: form.value.repeats,
      notes: form.value.notes || undefined,
      type: form.value.eventType || 'personal',
    })
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
  await requestPermission()
  await fetchReminders(viewYear.value, viewMonth.value)
})
</script>

<style scoped>
/* ── Design tokens (matches mockup) ───────────────────────────────── */
.cal-page {
  --navy:      #1F2C4C;
  --navy-70:   #4A5876;
  --navy-40:   #A8B0C2;
  --navy-20:   #D4D9E3;
  --teal:      #00A19A;
  --teal-dk:   #008A84;
  --teal-wash: #E9F6F5;
  --wash:      #F5F7F9;
  --line:      #E7EAEE;
  --card:      #FFFFFF;

  min-height: 100dvh;
  background: #F0F3F4;
  color: var(--navy);
  position: relative;
  padding-bottom: 96px;
  display: flex;
  flex-direction: column;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ── Top nav ─────────────────────────────────────────────────────── */
.cal-nav-bar {
  display: flex;
  align-items: center;
  padding: 14px 20px 10px;
  padding-top: calc(14px + env(safe-area-inset-top));
  gap: 10px;
}
.cal-nav-icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--teal);
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(31, 44, 76, 0.06);
  transition: transform 0.18s ease;
}
.cal-nav-icon-btn:active { transform: scale(0.94); }
.cal-nav-icon-btn svg { width: 20px; height: 20px; }
.cal-nav-title {
  flex: 1;
  text-align: center;
  font-size: 19px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.3px;
}

.cal-body { position: relative; flex: 1; padding: 4px 20px 0; }

/* ── Month pill ──────────────────────────────────────────────────── */
.cal-monthpill {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(180deg, #FFFFFF 0%, #F5F9F9 100%);
  border-radius: 16px;
  padding: 10px 14px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(31, 44, 76, 0.04);
}
.cal-monthpill h2 {
  flex: 1;
  font-size: 18px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.4px;
  margin: 0;
}
.cal-arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  color: var(--teal);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(31, 44, 76, 0.08);
  transition: transform 0.18s ease;
}
.cal-arrow:active { transform: scale(0.9); }
.cal-arrow svg { width: 16px; height: 16px; }

/* ── 3 stat cards ────────────────────────────────────────────────── */
.cal-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}
.cal-stat {
  background: #fff;
  border-radius: 14px;
  padding: 12px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 6px rgba(31, 44, 76, 0.05);
}
.cal-stat-ic {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
}
.cal-stat-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.5px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.cal-stat-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--navy-70);
  margin-top: 3px;
  line-height: 1.1;
}

/* ── Month grid card ─────────────────────────────────────────────── */
.cal-grid-card {
  background: #fff;
  border-radius: 20px;
  padding: 14px 10px 18px;
  box-shadow: 0 3px 10px rgba(31, 44, 76, 0.05);
  margin-bottom: 22px;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.cal-dow {
  font-size: 12px;
  font-weight: 800;
  color: var(--teal);
  text-align: center;
  padding: 6px 0 12px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}
.cal-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: background 0.14s;
}
.cal-day:not(.cal-day--selected):not(.cal-day--empty):hover {
  background: var(--wash);
}
.cal-day--empty { cursor: default; }
.cal-day--has-event::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--teal);
}
.cal-day--dot-viewing::after    { background: var(--teal); }
.cal-day--dot-compliance::after { background: #E37B4E; }
.cal-day--dot-deadline::after   { background: #E3A64B; }
.cal-day--dot-personal::after   { background: #8B75E8; }
.cal-day--today {
  color: var(--teal);
}
.cal-day--selected {
  background: var(--teal);
  color: #fff !important;
  font-weight: 800;
  box-shadow: 0 6px 14px rgba(0, 161, 154, 0.4);
  border-radius: 14px;
}
.cal-day--selected.cal-day--has-event::after { background: #fff; }

/* ── Agenda ─────────────────────────────────────────────────────── */
.cal-agenda-group { margin-bottom: 18px; }
.cal-agenda-heading {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
  color: var(--teal);
  margin-bottom: 8px;
  padding: 0 2px;
}
.cal-event {
  background: #fff;
  border-radius: 16px;
  padding: 14px 14px 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(31, 44, 76, 0.05);
}
.cal-event-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: var(--teal);
}
.cal-event--compliance .cal-event-accent { background: #E37B4E; }
.cal-event--deadline .cal-event-accent   { background: #E3A64B; }
.cal-event--personal .cal-event-accent   { background: #8B75E8; }

.cal-event-ic {
  width: 46px;
  height: 46px;
  object-fit: contain;
  flex-shrink: 0;
}
.cal-event-time {
  min-width: 52px;
  text-align: left;
  border-right: 1px solid var(--line);
  padding-right: 12px;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.cal-event-time-top {
  font-size: 12px;
  font-weight: 700;
  color: var(--navy-70);
  line-height: 1.1;
}
.cal-event-time-sub {
  font-size: 10px;
  font-weight: 600;
  color: var(--navy-40);
  margin-top: 3px;
}
.cal-event-content { flex: 1; min-width: 0; }
.cal-event-title {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.2px;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cal-event-sub {
  font-size: 12px;
  font-weight: 500;
  color: var(--navy-70);
  margin-top: 2px;
  line-height: 1.3;
}
.cal-event-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
  padding: 3px 10px;
  border-radius: 100px;
  margin-top: 6px;
  background: var(--teal-wash);
  color: var(--teal-dk);
}
.cal-event-tag--compliance { background: #FDECE0; color: #B45A2C; }
.cal-event-tag--deadline   { background: #FCF0D6; color: #8A6412; }
.cal-event-tag--personal   { background: #EFEAFB; color: #5B4497; }

.cal-event-kebab {
  background: transparent;
  border: none;
  color: var(--teal);
  padding: 4px 6px;
  cursor: pointer;
  flex-shrink: 0;
  align-self: flex-start;
}
.cal-event-kebab svg { width: 20px; height: 20px; }
.cal-event-kebab:hover { color: var(--teal-dk); }

.cal-empty {
  text-align: center;
  padding: 40px 22px;
  color: var(--navy-40);
  font-size: 13px;
  font-weight: 600;
}

/* ── FAB ─────────────────────────────────────────────────────────── */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 20;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: var(--teal);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 161, 154, 0.45);
  transition: transform 0.18s ease;
}
.fab:active { transform: scale(0.92); }
.fab svg { width: 26px; height: 26px; }

/* ── New Event drawer (ne-*) ─────────────────────────────────────── */
.ne-overlay {
  position: fixed;
  inset: 0;
  background: rgba(31, 44, 76, 0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.ne-sheet {
  --navy:    #1F2C4C;
  --navy-70: #4A5876;
  --navy-40: #A8B0C2;
  --teal:    #00A19A;
  --teal-dk: #008A84;
  --lilac:   #8B75E8;
  --lilac-bg:#EEEAFB;
  --line:    #E7EAEE;
  --wash:    #F5F7F9;

  width: 100%;
  max-width: 28rem;
  background: #fff;
  border-radius: 26px 26px 0 0;
  max-height: 92dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
  color: var(--navy);
}
.ne-grip {
  width: 44px;
  height: 4px;
  border-radius: 99px;
  background: #DADEE4;
  margin: 10px auto 6px;
}
.ne-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 22px 14px;
}
.ne-head-ic {
  width: 60px;
  height: 60px;
  object-fit: contain;
  flex-shrink: 0;
}
.ne-head-text { flex: 1; min-width: 0; }
.ne-head-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.5px;
  line-height: 1.15;
}
.ne-head-sub {
  font-size: 13px;
  color: var(--navy-70);
  font-weight: 500;
  margin-top: 4px;
  line-height: 1.35;
}
.ne-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: var(--wash);
  color: var(--navy-70);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ne-close svg { width: 16px; height: 16px; }
.ne-close:hover { background: #EBEEF2; }

.ne-body { padding: 4px 22px 6px; }
.ne-section { margin-bottom: 20px; }
.ne-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.6px;
  color: var(--teal);
  margin-bottom: 8px;
}

/* Icon-prefixed input */
.ne-input-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 12px 14px;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.ne-input-wrap:focus-within {
  border-color: var(--teal);
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.12);
}
.ne-input-ic {
  width: 30px;
  height: 30px;
  object-fit: contain;
  flex-shrink: 0;
}
.ne-input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--navy);
  min-width: 0;
}
.ne-input::placeholder { color: var(--navy-40); font-weight: 500; }

/* TYPE — 2×2 card grid */
.ne-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.ne-type {
  position: relative;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 16px 12px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.18s;
  font-family: inherit;
}
.ne-type-ic {
  width: 54px;
  height: 54px;
  object-fit: contain;
}
.ne-type-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--navy);
}
.ne-type-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--lilac);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ne-type-check svg { width: 12px; height: 12px; }

/* Active states — mockup uses lilac for Personal; the other three
   inherit their tone colour so the drawer is legible for all types. */
.ne-type--active { border-width: 2px; }
.ne-type.personal.ne-type--active {
  border-color: var(--lilac);
  background: var(--lilac-bg);
}
.ne-type.personal.ne-type--active .ne-type-label { color: #5B4497; }
.ne-type.viewing.ne-type--active {
  border-color: var(--teal);
  background: #E9F6F5;
}
.ne-type.viewing.ne-type--active .ne-type-label { color: var(--teal-dk); }
.ne-type.viewing.ne-type--active .ne-type-check { background: var(--teal); }
.ne-type.deadline.ne-type--active {
  border-color: #E3A64B;
  background: #FCF0D6;
}
.ne-type.deadline.ne-type--active .ne-type-label { color: #8A6412; }
.ne-type.deadline.ne-type--active .ne-type-check { background: #E3A64B; }
.ne-type.compliance.ne-type--active {
  border-color: #E37B4E;
  background: #FDECE0;
}
.ne-type.compliance.ne-type--active .ne-type-label { color: #B45A2C; }
.ne-type.compliance.ne-type--active .ne-type-check { background: #E37B4E; }

/* WHEN — 2×2 pill cells with hidden native input for interaction */
.ne-when-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.ne-cell {
  position: relative;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: border-color 0.18s;
  min-width: 0;
}
.ne-cell:focus-within { border-color: var(--teal); }
.ne-cell-ic {
  width: 30px;
  height: 30px;
  object-fit: contain;
  flex-shrink: 0;
}
.ne-cell-value {
  flex: 1;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--navy);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.ne-cell-chev {
  width: 14px;
  height: 14px;
  color: var(--navy-40);
  flex-shrink: 0;
}
.ne-cell-native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  font: inherit;
  border: 0;
  padding: 0;
  background: transparent;
}
/* Safari-specific: hide default date/time picker icon so only our cell shows. */
.ne-cell-native::-webkit-calendar-picker-indicator { opacity: 0; }

.ne-footer {
  padding: 16px 22px calc(20px + env(safe-area-inset-bottom));
  display: flex;
  gap: 10px;
  background: #fff;
  border-top: 1px solid var(--line);
  position: sticky;
  bottom: 0;
}
.ne-btn {
  flex: 1;
  border: 0;
  border-radius: 14px;
  padding: 15px 16px;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.15s ease, opacity 0.15s;
}
.ne-btn--secondary {
  background: var(--wash);
  color: var(--navy);
}
.ne-btn--secondary:hover { background: #EBEEF2; }
.ne-btn--primary {
  background: var(--teal);
  color: #fff;
  box-shadow: 0 6px 16px rgba(0, 161, 154, 0.35);
}
.ne-btn--primary:hover:not(:disabled) { background: var(--teal-dk); }
.ne-btn--primary:disabled { opacity: 0.5; box-shadow: none; cursor: not-allowed; }
.ne-btn svg { width: 16px; height: 16px; }

/* Slide-up transition for the new-event drawer */
.ne-modal-enter-active,
.ne-modal-leave-active { transition: opacity 0.22s ease; }
.ne-modal-enter-active .ne-sheet,
.ne-modal-leave-active .ne-sheet {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.ne-modal-enter-from,
.ne-modal-leave-to { opacity: 0; }
.ne-modal-enter-from .ne-sheet,
.ne-modal-leave-to .ne-sheet { transform: translateY(100%); }
</style>
