<template>
  <div class="phone-input-wrapper" ref="wrapperRef">
    <label v-if="label" class="block text-sm font-medium text-gray-600 mb-2">{{ label }}</label>

    <!-- Main input row -->
    <div class="phone-field" :class="{ 'phone-field--focused': isFocused || dropdownOpen }">
      <!-- Country picker button -->
      <button
        type="button"
        class="country-btn"
        @click="toggleDropdown"
        :aria-label="`Country code: ${selectedCountry.name} +${selectedCountry.dial}`"
      >
        <span class="country-flag">{{ selectedCountry.flag }}</span>
        <span class="country-dial">+{{ selectedCountry.dial }}</span>
        <svg class="country-chevron" :class="{ 'rotate-180': dropdownOpen }" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <div class="field-divider" />

      <!-- Number input -->
      <input
        ref="numberInputRef"
        v-model="localNumber"
        type="tel"
        inputmode="numeric"
        :placeholder="selectedCountry.placeholder || 'Phone number'"
        :disabled="disabled"
        class="number-input"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @input="emitValue"
      />
    </div>

    <!-- Country dropdown -->
    <Teleport to="body">
      <div v-if="dropdownOpen" class="country-dropdown-backdrop" @click="dropdownOpen = false" />
      <div v-if="dropdownOpen" class="country-dropdown" :style="dropdownStyle">
        <div class="dropdown-search-wrap">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16" class="search-icon">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="#9ca3af" stroke-width="1.5"/>
            <path d="M13 13l3 3" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search country or code..."
            class="dropdown-search"
            @click.stop
          />
        </div>
        <div class="country-list">
          <button
            v-for="country in filteredCountries"
            :key="country.code"
            type="button"
            class="country-item"
            :class="{ 'country-item--selected': country.code === selectedCountry.code }"
            @click="selectCountry(country)"
          >
            <span class="item-flag">{{ country.flag }}</span>
            <span class="item-name">{{ country.name }}</span>
            <span class="item-dial">+{{ country.dial }}</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

// ─── Country data ──────────────────────────────────────────────────────────

function flagEmoji(code) {
  return [...code.toUpperCase()].map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('')
}

const COUNTRY_DATA = [
  { code: 'GB', name: 'United Kingdom', dial: '44', placeholder: '07911 123456' },
  { code: 'IE', name: 'Ireland', dial: '353', placeholder: '085 123 4567' },
  { code: 'US', name: 'United States', dial: '1', placeholder: '(555) 123 4567' },
  { code: 'CA', name: 'Canada', dial: '1', placeholder: '(416) 123 4567' },
  { code: 'AU', name: 'Australia', dial: '61', placeholder: '0412 345 678' },
  { code: 'NZ', name: 'New Zealand', dial: '64', placeholder: '021 123 4567' },
  { code: 'FR', name: 'France', dial: '33', placeholder: '06 12 34 56 78' },
  { code: 'DE', name: 'Germany', dial: '49', placeholder: '0151 23456789' },
  { code: 'ES', name: 'Spain', dial: '34', placeholder: '612 345 678' },
  { code: 'IT', name: 'Italy', dial: '39', placeholder: '312 345 6789' },
  { code: 'PT', name: 'Portugal', dial: '351', placeholder: '912 345 678' },
  { code: 'NL', name: 'Netherlands', dial: '31', placeholder: '06 12345678' },
  { code: 'BE', name: 'Belgium', dial: '32', placeholder: '0470 12 34 56' },
  { code: 'CH', name: 'Switzerland', dial: '41', placeholder: '076 123 45 67' },
  { code: 'AT', name: 'Austria', dial: '43', placeholder: '0664 1234567' },
  { code: 'SE', name: 'Sweden', dial: '46', placeholder: '070-123 45 67' },
  { code: 'NO', name: 'Norway', dial: '47', placeholder: '412 34 567' },
  { code: 'DK', name: 'Denmark', dial: '45', placeholder: '20 12 34 56' },
  { code: 'FI', name: 'Finland', dial: '358', placeholder: '040 1234567' },
  { code: 'PL', name: 'Poland', dial: '48', placeholder: '512 345 678' },
  { code: 'RO', name: 'Romania', dial: '40', placeholder: '0712 345 678' },
  { code: 'HU', name: 'Hungary', dial: '36', placeholder: '06 20 123 4567' },
  { code: 'CZ', name: 'Czech Republic', dial: '420', placeholder: '601 123 456' },
  { code: 'GR', name: 'Greece', dial: '30', placeholder: '694 123 4567' },
  { code: 'TR', name: 'Turkey', dial: '90', placeholder: '0532 123 4567' },
  { code: 'UA', name: 'Ukraine', dial: '380', placeholder: '050 123 4567' },
  { code: 'RU', name: 'Russia', dial: '7', placeholder: '9123456789' },
  { code: 'IN', name: 'India', dial: '91', placeholder: '91234 56789' },
  { code: 'PK', name: 'Pakistan', dial: '92', placeholder: '0300 1234567' },
  { code: 'BD', name: 'Bangladesh', dial: '880', placeholder: '01712 345678' },
  { code: 'LK', name: 'Sri Lanka', dial: '94', placeholder: '071 234 5678' },
  { code: 'AE', name: 'UAE', dial: '971', placeholder: '050 123 4567' },
  { code: 'SA', name: 'Saudi Arabia', dial: '966', placeholder: '050 123 4567' },
  { code: 'QA', name: 'Qatar', dial: '974', placeholder: '3312 3456' },
  { code: 'KW', name: 'Kuwait', dial: '965', placeholder: '5012 3456' },
  { code: 'BH', name: 'Bahrain', dial: '973', placeholder: '3600 0000' },
  { code: 'OM', name: 'Oman', dial: '968', placeholder: '9212 3456' },
  { code: 'EG', name: 'Egypt', dial: '20', placeholder: '0100 123 4567' },
  { code: 'NG', name: 'Nigeria', dial: '234', placeholder: '0802 123 4567' },
  { code: 'GH', name: 'Ghana', dial: '233', placeholder: '024 123 4567' },
  { code: 'KE', name: 'Kenya', dial: '254', placeholder: '0712 345678' },
  { code: 'ZA', name: 'South Africa', dial: '27', placeholder: '071 123 4567' },
  { code: 'CN', name: 'China', dial: '86', placeholder: '131 2345 6789' },
  { code: 'JP', name: 'Japan', dial: '81', placeholder: '090-1234-5678' },
  { code: 'KR', name: 'South Korea', dial: '82', placeholder: '010-1234-5678' },
  { code: 'SG', name: 'Singapore', dial: '65', placeholder: '8123 4567' },
  { code: 'MY', name: 'Malaysia', dial: '60', placeholder: '011-1234 5678' },
  { code: 'PH', name: 'Philippines', dial: '63', placeholder: '0917 123 4567' },
  { code: 'BR', name: 'Brazil', dial: '55', placeholder: '(11) 91234-5678' },
  { code: 'MX', name: 'Mexico', dial: '52', placeholder: '1 555 123 4567' },
  { code: 'AR', name: 'Argentina', dial: '54', placeholder: '011 15-1234-5678' },
]

const COUNTRIES = COUNTRY_DATA.map(c => ({ ...c, flag: flagEmoji(c.code) }))

// ─── Props & emits ─────────────────────────────────────────────────────────

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// ─── State ─────────────────────────────────────────────────────────────────

const GB = COUNTRIES.find(c => c.code === 'GB')
const selectedCountry = ref(GB)
const localNumber = ref('')
const isFocused = ref(false)
const dropdownOpen = ref(false)
const searchQuery = ref('')
const wrapperRef = ref(null)
const numberInputRef = ref(null)
const searchInputRef = ref(null)
const dropdownStyle = ref({})

// ─── Parse incoming E.164 value ────────────────────────────────────────────

function parseE164(val) {
  if (!val || !val.startsWith('+')) return
  const withoutPlus = val.slice(1)

  // Try to find best (longest) matching dial code
  let bestMatch = null
  let bestLen = 0
  for (const c of COUNTRIES) {
    if (withoutPlus.startsWith(c.dial) && c.dial.length > bestLen) {
      bestMatch = c
      bestLen = c.dial.length
    }
  }
  if (bestMatch) {
    selectedCountry.value = bestMatch
    localNumber.value = withoutPlus.slice(bestLen)
  }
}

// ─── Emit E.164 ───────────────────────────────────────────────────────────

function emitValue() {
  const digits = localNumber.value.replace(/\D/g, '').replace(/^0+/, '')
  if (!digits) {
    emit('update:modelValue', '')
    return
  }
  emit('update:modelValue', `+${selectedCountry.value.dial}${digits}`)
}

// ─── Dropdown ─────────────────────────────────────────────────────────────

const filteredCountries = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return COUNTRIES
  return COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.dial.includes(q) ||
    c.code.toLowerCase().includes(q)
  )
})

function computeDropdownPosition() {
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const dropdownHeight = 320

  if (spaceBelow >= dropdownHeight || spaceBelow >= 200) {
    // Open below
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999,
    }
  } else {
    // Open above
    dropdownStyle.value = {
      position: 'fixed',
      bottom: `${window.innerHeight - rect.top + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999,
    }
  }
}

async function toggleDropdown() {
  if (dropdownOpen.value) {
    dropdownOpen.value = false
    return
  }
  computeDropdownPosition()
  dropdownOpen.value = true
  searchQuery.value = ''
  await nextTick()
  searchInputRef.value?.focus()
}

function selectCountry(country) {
  selectedCountry.value = country
  dropdownOpen.value = false
  emitValue()
  nextTick(() => numberInputRef.value?.focus())
}

// ─── Watchers ─────────────────────────────────────────────────────────────

watch(() => props.modelValue, (val) => {
  if (!val) return
  // Only re-parse if it actually differs from what we'd emit
  const digits = localNumber.value.replace(/\D/g, '').replace(/^0+/, '')
  const current = digits ? `+${selectedCountry.value.dial}${digits}` : ''
  if (val !== current) {
    parseE164(val)
  }
}, { immediate: true })
</script>

<style scoped>
.phone-input-wrapper {
  position: relative;
  width: 100%;
}

.phone-field {
  display: flex;
  align-items: center;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #e2e2e7;
  background: #f4f4f5;
  overflow: visible;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.phone-field--focused {
  border-color: #00A19A;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.15);
}

/* Country button */
.country-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px 0 14px;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}

.country-flag {
  font-size: 20px;
  line-height: 1;
}

.country-dial {
  font-size: 15px;
  font-weight: 600;
  color: #1f2024;
  letter-spacing: -0.2px;
}

.country-chevron {
  color: #9ca3af;
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Divider */
.field-divider {
  width: 1px;
  height: 28px;
  background: #d1d1d6;
  flex-shrink: 0;
}

/* Number input */
.number-input {
  flex: 1;
  height: 100%;
  padding: 0 14px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  color: #1f2024;
  min-width: 0;
}

.number-input::placeholder {
  color: #9ca3af;
}

/* Dropdown backdrop */
.country-dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

/* Dropdown panel */
.country-dropdown {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e5ea;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  max-height: 320px;
  overflow: hidden;
}

/* Search */
.dropdown-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #f2f2f7;
  flex-shrink: 0;
}

.search-icon {
  flex-shrink: 0;
}

.dropdown-search {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #1f2024;
  background: transparent;
}

.dropdown-search::placeholder {
  color: #9ca3af;
}

/* Country list */
.country-list {
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
}

.country-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}

.country-item:hover,
.country-item--selected {
  background: #f2f2f7;
}

.item-flag {
  font-size: 20px;
  flex-shrink: 0;
  width: 24px;
}

.item-name {
  flex: 1;
  font-size: 15px;
  color: #1f2024;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-dial {
  font-size: 14px;
  color: #8e8e93;
  flex-shrink: 0;
}
</style>
