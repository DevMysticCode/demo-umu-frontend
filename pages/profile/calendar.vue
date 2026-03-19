<template>
  <div
    class="mobile-container min-h-screen bg-[#f2f2f7] flex flex-col bg-umu-gradient"
  >
    <!-- Header -->
    <header
      class="flex items-center justify-between px-4 pt-5 pb-3 bg-[#f2f2f7]"
    >
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center"
        @click="goBack"
      >
        <Icon
          name="i-heroicons-chevron-left"
          class="w-[15px] h-[15px] text-black"
        />
      </button>
      <h1
        class="font-sf-pro text-[17px] leading-[22px] tracking-[-0.43px] font-semibold text-black"
      >
        Calendar
      </h1>
      <button
        type="button"
        class="flex items-center gap-1 bg-brand-aqua text-white rounded-full px-3 py-1.5 font-sf-pro text-[13px] font-medium"
        @click="openAddDrawer()"
      >
        <Icon name="i-heroicons-plus" class="w-4 h-4" />
        Add
      </button>
    </header>

    <!-- Calendar Card -->
    <div class="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
      <!-- Month navigation -->
      <div class="flex items-center justify-between px-5 pt-4 pb-2">
        <button
          type="button"
          @click="prevMonth"
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <Icon
            name="i-heroicons-chevron-left"
            class="w-4 h-4 text-[#1f2024]"
          />
        </button>
        <span class="font-sf-pro text-[15px] font-semibold text-[#1f2024]">
          {{ monthLabel }}
        </span>
        <button
          type="button"
          @click="nextMonth"
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <Icon
            name="i-heroicons-chevron-right"
            class="w-4 h-4 text-[#1f2024]"
          />
        </button>
      </div>

      <!-- Day headers -->
      <div class="grid grid-cols-7 px-2 pb-1">
        <div
          v-for="d in dayHeaders"
          :key="d"
          class="text-center font-sf-pro text-[11px] font-medium text-[#8f9094] py-1"
        >
          {{ d }}
        </div>
      </div>

      <!-- Date grid -->
      <div class="grid grid-cols-7 px-2 pb-4 gap-y-1">
        <div
          v-for="(cell, i) in calendarCells"
          :key="i"
          class="flex flex-col items-center justify-start py-0.5"
        >
          <button
            v-if="cell"
            type="button"
            class="relative w-9 h-9 flex items-center justify-center rounded-full font-sf-pro text-[15px] transition-colors"
            :class="getCellClass(cell)"
            @click="selectDate(cell)"
          >
            {{ cell.day }}
            <!-- dot indicator -->
            <span
              v-if="reminderDateSet.has(cell.dateStr) && !isSelectedCell(cell)"
              class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-aqua"
            />
          </button>
          <div v-else class="w-9 h-9" />
        </div>
      </div>
    </div>

    <!-- Filter chips -->
    <div class="flex gap-2 px-4 mt-4 overflow-x-auto no-scrollbar pb-1">
      <button
        v-for="f in filters"
        :key="f.key"
        type="button"
        class="flex-shrink-0 rounded-full px-3 py-1.5 font-sf-pro text-[12px] font-medium transition-colors"
        :class="
          activeFilter === f.key
            ? 'bg-brand-aqua text-white'
            : 'bg-white text-[#1f2024] border border-[#e5e5ea]'
        "
        @click="activeFilter = activeFilter === f.key ? 'all' : f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Event list -->
    <div class="flex-1 overflow-y-auto px-4 mt-4 pb-8 space-y-5">
      <div
        v-if="isLoading"
        class="text-center py-10 text-[#8f9094] font-sf-pro text-[14px]"
      >
        Loading...
      </div>

      <template v-else-if="groupedDates.length > 0">
        <div v-for="group in groupedDates" :key="group.dateStr">
          <!-- Date label -->
          <div class="flex items-center gap-2 mb-2">
            <p class="font-sf-pro text-[13px] font-semibold text-[#1f2024]">
              {{ group.label }}
            </p>
            <div
              v-if="group.isToday"
              class="text-brand-aqua font-sf-pro text-[12px] font-medium"
            >
              · Today
            </div>
          </div>

          <!-- Event cards -->
          <div class="space-y-2">
            <div
              v-for="r in group.reminders"
              :key="r.id"
              class="rounded-2xl px-4 py-3 flex items-start justify-between"
              :class="getCardClass(r.type)"
            >
              <div class="flex-1 min-w-0">
                <p
                  v-if="r.time"
                  class="font-sf-pro text-[12px] mb-0.5"
                  :class="getCardTextMuted(r.type)"
                >
                  {{ r.time }}
                </p>
                <p
                  class="font-sf-pro text-[15px] font-semibold leading-[20px]"
                  :class="getCardTitle(r.type)"
                >
                  {{ r.title }}
                </p>
                <p
                  v-if="r.notes"
                  class="font-sf-pro text-[13px] mt-0.5 leading-[18px]"
                  :class="getCardTextMuted(r.type)"
                >
                  {{ r.notes }}
                </p>
              </div>
              <button
                type="button"
                class="ml-3 flex-shrink-0 opacity-60"
                @click="confirmDelete(r.id)"
              >
                <Icon
                  name="i-heroicons-trash"
                  class="w-4 h-4"
                  :class="getCardTitle(r.type)"
                />
              </button>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="text-center py-12">
        <Icon
          name="i-heroicons-calendar-days"
          class="w-12 h-12 text-[#d9dae0] mx-auto mb-3"
        />
        <p class="font-sf-pro text-[15px] text-[#8f9094]">
          No reminders this month
        </p>
        <p class="font-sf-pro text-[13px] text-[#b4b5b8] mt-1">
          Tap Add to create one
        </p>
      </div>
    </div>

    <!-- Add Reminder Drawer -->
    <Teleport to="body">
      <div
        v-if="showDrawer"
        class="fixed inset-0 z-50 flex flex-col justify-end"
      >
        <div class="absolute inset-0 bg-black/40" @click="closeDrawer" />
        <div class="relative bg-white rounded-t-3xl px-5 pt-4 pb-10 z-10">
          <!-- Handle -->
          <div class="w-10 h-1 bg-[#d9dae0] rounded-full mx-auto mb-5" />

          <div class="flex items-center justify-between mb-5">
            <h2 class="font-sf-pro text-[17px] font-semibold text-[#1f2024]">
              Add regular reminder
            </h2>
            <button type="button" @click="closeDrawer">
              <Icon name="i-heroicons-x-mark" class="w-5 h-5 text-[#8f9094]" />
            </button>
          </div>

          <!-- Title -->
          <div class="mb-4">
            <label
              class="font-sf-pro text-[13px] font-medium text-[#8f9094] mb-1 block"
              >Event title</label
            >
            <input
              v-model="form.title"
              type="text"
              placeholder="e.g. Electrician popping over"
              class="w-full border border-[#e5e5ea] rounded-xl px-4 py-3 font-sf-pro text-[15px] text-[#1f2024] outline-none focus:border-brand-aqua"
            />
          </div>

          <!-- Date -->
          <div class="mb-4">
            <label
              class="font-sf-pro text-[13px] font-medium text-[#8f9094] mb-1 block"
              >Date</label
            >
            <div class="relative">
              <input
                v-model="form.date"
                type="date"
                class="w-full border border-[#e5e5ea] rounded-xl px-4 py-3 font-sf-pro text-[15px] text-[#1f2024] outline-none focus:border-brand-aqua appearance-none"
              />
            </div>
          </div>

          <!-- Time -->
          <div class="mb-4">
            <label
              class="font-sf-pro text-[13px] font-medium text-[#8f9094] mb-1 block"
              >Time (optional)</label
            >
            <input
              v-model="form.time"
              type="time"
              class="w-full border border-[#e5e5ea] rounded-xl px-4 py-3 font-sf-pro text-[15px] text-[#1f2024] outline-none focus:border-brand-aqua"
            />
          </div>

          <!-- Repeats -->
          <div class="mb-4">
            <label
              class="font-sf-pro text-[13px] font-medium text-[#8f9094] mb-2 block"
              >Repeats</label
            >
            <div class="flex gap-2">
              <button
                v-for="opt in repeatOptions"
                :key="opt.value"
                type="button"
                class="flex-1 py-2.5 rounded-xl font-sf-pro text-[14px] font-medium border transition-colors"
                :class="
                  form.repeats === opt.value
                    ? 'bg-brand-aqua text-white border-brand-aqua'
                    : 'bg-[#f6f6f7] text-[#1f2024] border-[#e5e5ea]'
                "
                @click="form.repeats = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div class="mb-6">
            <label
              class="font-sf-pro text-[13px] font-medium text-[#8f9094] mb-1 block"
            >
              Additional info (optional)
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Feel free to include things like contact details or a booking reference"
              class="w-full border border-[#e5e5ea] rounded-xl px-4 py-3 font-sf-pro text-[15px] text-[#1f2024] outline-none focus:border-brand-aqua resize-none"
            />
          </div>

          <!-- Save button -->
          <button
            type="button"
            class="w-full h-[50px] rounded-2xl bg-brand-aqua text-white font-sf-pro text-[17px] font-medium disabled:opacity-50"
            :disabled="!form.title.trim() || !form.date || isSaving"
            @click="saveReminder"
          >
            {{ isSaving ? 'Saving...' : 'Save reminder' }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Calendar - UmovingU' })

const {
  reminders,
  isLoading,
  reminderDateSet,
  remindersByDate,
  fetchReminders,
  createReminder,
  deleteReminder,
} = useCalendar()

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

// ─── Delete ────────────────────────────────────────────────────────────────
const confirmDelete = async (id: string) => {
  if (confirm('Delete this reminder?')) {
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
})

const form = ref(defaultForm())

const repeatOptions = [
  { label: 'Never', value: 'never' },
  { label: 'Annually', value: 'annually' },
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
    await createReminder({
      title: form.value.title.trim(),
      date: form.value.date,
      time: form.value.time || undefined,
      repeats: form.value.repeats,
      notes: form.value.notes || undefined,
      type: 'manual',
    })
    closeDrawer()
  } finally {
    isSaving.value = false
  }
}

// ─── Init ──────────────────────────────────────────────────────────────────
const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
    return
  }
  navigateTo('/profile')
}

onMounted(() => fetchReminders(viewYear.value, viewMonth.value))
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
