# Frontend Parts Rendering Analysis

## Overview

This document outlines how question parts are rendered in the frontend, particularly for MULTIPART question types, and how they are grouped by `groupKey`.

---

## 1. Main Component for Parts Rendering

### File Path

[components/passport-view/questions/MultipartQuestion.vue](components/passport-view/questions/MultipartQuestion.vue)

### Purpose

This Vue component handles rendering of MULTIPART type questions. It manages:

- Individual parts rendering
- Part grouping by `groupKey`
- Conditional visibility of parts
- Different part types (text, radio, checkbox, chips, date, etc.)
- Synced inputs (currency, voice text, date, number)

---

## 2. Part Rendering Structure

### Template Structure

```vue
<div v-for="section in groupedSections" :key="section.groupKey || section.parts[0].partKey" class="part-section">
  <div v-for="part in section.parts" :key="part.partKey" class="group-part">
    <!-- Part content rendered here -->
  </div>
</div>
```

### Key Template Features:

- **Grouped sections**: Parts are organized into sections based on `groupKey`
- **Part cards**: Each part is wrapped in a `.group-part` div with padding/border styling
- **Dynamic components**: Uses Vue's `<component :is="getPartComponent(part)">` to render appropriate question type
- **Part-specific metadata**: Displays title, description, help text, external links
- **Synced inputs**: Currency inputs, date inputs, counter buttons, voice text inputs

---

## 3. Grouping Logic (EXISTING)

### Location

[MultipartQuestion.vue, lines 336-353](components/passport-view/questions/MultipartQuestion.vue#L336-L353)

### Code

```typescript
const groupedSections = computed(() => {
  const sections = []
  const groupMap = new Map()

  for (const part of visibleParts.value) {
    const gk = part.groupKey

    if (gk) {
      // Parts with groupKey are grouped together
      if (!groupMap.has(gk)) {
        const group = { groupKey: gk, parts: [] }
        groupMap.set(gk, group)
        sections.push(group)
      }
      groupMap.get(gk).parts.push(part)
    } else {
      // Parts without groupKey are rendered individually
      sections.push({ groupKey: null, parts: [part] })
    }
  }

  return sections
})
```

### How It Works:

1. Iterates through all visible parts
2. Creates a Map to track groups by `groupKey`
3. For parts WITH `groupKey`:
   - Creates a new group object if it doesn't exist
   - Adds part to the group's parts array
4. For parts WITHOUT `groupKey`:
   - Creates a single-part section
5. Returns all sections in order

---

## 4. Part Visibility & Conditional Display

### Location

[MultipartQuestion.vue, lines 309-334](components/passport-view/questions/MultipartQuestion.vue#L309-L334)

### Code

```typescript
const isPartVisible = (part) => {
  // If no conditional, always show
  if (!part.conditionalOn) return true

  // Find the answer for the part we're dependent on
  const rawAnswer = localAnswers.value[part.conditionalOn]

  // If answer doesn't exist, don't show
  if (rawAnswer === undefined || rawAnswer === null) return false

  // Extract scalar value for DATE questions with {value, date}
  const dependentPartAnswer =
    rawAnswer !== null && typeof rawAnswer === 'object' && 'value' in rawAnswer
      ? rawAnswer.value
      : rawAnswer

  // Check if answer matches showOnValues
  if (!part.showOnValues || !Array.isArray(part.showOnValues)) return false
  return part.showOnValues.includes(dependentPartAnswer)
}

const visibleParts = computed(() => {
  return sortedParts.value.filter((part) => isPartVisible(part))
})
```

### Features:

- Supports conditional visibility based on `conditionalOn` property
- Uses `showOnValues` array to determine when to display
- Handles complex answer types (e.g., DATE with {value, date} objects)

---

## 5. Part Types & Component Mapping

### Location

[MultipartQuestion.vue, lines 355-375](components/passport-view/questions/MultipartQuestion.vue#L355-L375)

### Supported Part Types:

```javascript
const map = {
  radio: RadioQuestion,
  date: DateQuestion,
  text: TextQuestion,
  upload: TextUploadQuestion,
  checkbox: CheckboxQuestion,
  chips: ChipsQuestion,
  scale: ScaleQuestion,
  number: ScaleQuestion,
  address: AddressQuestion,
  collaborators: CollaboratorsQuestion,
  multitextinput: MultiTextInputQuestion,
  multifieldform: MultiFieldFormQuestion,
}
```

### Part Type Files:

| Type             | File                       | Purpose                                           |
| ---------------- | -------------------------- | ------------------------------------------------- |
| `radio`          | RadioQuestion.vue          | Single selection from options                     |
| `checkbox`       | CheckboxQuestion.vue       | Multiple selection with optional "other" field    |
| `chips`          | ChipsQuestion.vue          | Tag/chip style selection (can be single or multi) |
| `date`           | DateQuestion.vue           | Date picker input                                 |
| `text`           | TextQuestion.vue           | Text input (single or multi-line)                 |
| `upload`         | TextUploadQuestion.vue     | File upload capability                            |
| `scale`          | ScaleQuestion.vue          | Slider/scale input                                |
| `address`        | AddressQuestion.vue        | Address search/lookup                             |
| `multitextinput` | MultiTextInputQuestion.vue | Multiple text fields                              |
| `multifieldform` | MultiFieldFormQuestion.vue | Repeatable form with multiple fields              |
| `collaborators`  | CollaboratorsQuestion.vue  | Collaborator selection/management                 |

---

## 6. Part-Specific Features

### Currency Input

```vue
<div v-if="part.showCurrencyInput" class="number-input-row">
  <span class="number-input-label">{{ part.currencyInputLabel || 'Enter Amount' }}</span>
  <input
    class="currency-input"
    type="text"
    placeholder="£ 0000"
    :value="localAnswers[part.partKey + '_amount'] || ''"
    @input="(e) => updateCurrencyPartInput(part.partKey, e.target.value)"
  />
</div>
```

### Voice + Text Input

```vue
<VoiceTextInput
  v-if="part.showVoiceInput"
  :value="localAnswers[part.partKey + '_text'] || ''"
  @update="(val) => updateVoiceText(part.partKey, val)"
/>
```

### Date Input

```vue
<div v-if="part.showDateInput" class="number-input-row date-input-above">
  <span class="number-input-label">{{ part.dateInputLabel || 'Date' }}</span>
  <input
    type="date"
    :value="localAnswers[part.partKey + '_date'] || ''"
    @input="(e) => updateDatePartInput(part.partKey, e.target.value)"
  />
</div>
```

### Counter

```vue
<div v-if="part.type?.toLowerCase?.() === 'counter'" class="number-input-row counter-row">
  <span class="number-input-label">{{ part.label || part.title }}</span>
  <div class="counter-controls">
    <button @click.prevent="decrementCounter(part.partKey)">—</button>
    <span class="counter-value">{{ localAnswers[part.partKey] ?? 0 }}</span>
    <button @click.prevent="incrementCounter(part.partKey)">+</button>
  </div>
</div>
```

---

## 7. Where MultipartQuestion is Used

### Page Using It

[pages/passportview/steps/tasks/[id].vue](pages/passportview/steps/tasks/[id].vue)

### Usage Context

```vue
<component
  v-else
  :key="currentQuestion?.id"
  :is="getQuestionComponent"  <!-- Returns MultipartQuestion for type='multipart' -->
  :question="currentQuestion"
  :answer="currentQuestion.answer"
  :passport-id="route.query.propertyId || ''"
  @update="updateAnswer"
/>
```

### Component Registration

```typescript
import MultipartQuestion from '~/components/passport-view/questions/MultipartQuestion.vue'
```

---

## 8. Data Flow

### Question Data Structure (from API)

```typescript
{
  id: string,
  type: 'MULTIPART',
  title: string,
  description: string,
  parts: [
    {
      partKey: string,
      order: number,
      type: string,        // radio, text, checkbox, chips, etc.
      title: string,
      description: string,
      display: string,     // 'text', 'upload', 'both'
      options: [{ value, label, icon }],
      groupKey: string,    // KEY FIELD FOR GROUPING
      conditionalOn: string, // Part key this depends on
      showOnValues: [string], // Values that trigger display
      helpText: string,
      externalLink: { url, label },
      showVoiceInput: boolean,
      showeDateInput: boolean,
      showCurrencyInput: boolean,
      showNumberInput: boolean,
    }
  ],
  answer: { [partKey]: any },
  completed: boolean,
  points: number,
}
```

### Answer Storage Format

Parts store answers in an object keyed by `partKey`:

```typescript
{
  room_count: "3",               // Radio/Chips answer
  bedroom_count: "4",            // Counter
  garden_size: "25000",          // Currency
  constructed_date: "2020-01-15", // Date
  features: ["garden", "parking"], // Checkbox/Multi-select
}
```

---

## 9. Styling

### Key CSS Classes

```css
.part-section {
  background: #ffffff;
  border: 0.33px solid #3c3c432e;
  border-radius: 16px;
  padding: 12px 16px;
}

.group-part {
  /* Individual part styling */
}

.group-part + .group-part {
  margin-top: 16px;
  padding-top: 16px;
}

.part-text {
  font-size: 15px;
  font-weight: 500;
  color: #3c3c43;
  margin: 0 0 12px 0;
}

.part-description {
  font-size: 13px;
  color: #3c3c4399;
  margin: 0 0 12px 0;
}
```

---

## 10. Backend Integration

### API Endpoints

- **Get Questions**: `/api/questions/:taskId` - Returns array of question objects including multipart questions
- **Save Answer**: `/api/questions/:questionId/answer` - Saves answer object keyed by partKey

### Data from Backend

The backend (from `prisma/seed.ts`) provides:

- `type: 'MULTIPART'` for multipart questions
- `parts` array with individual part definitions
- Each part has `groupKey` for grouping
- `order` field for sorting within group

---

## 11. Current Grouping Implementation Status

### ✅ ALREADY IMPLEMENTED:

1. **Part grouping by `groupKey`** - Fully implemented in `groupedSections` computed property
2. **Group rendering** - Parts grouped under same `groupKey` are wrapped in one `.part-section` container
3. **Visual grouping** - Grouped parts share border, background, and padding styles
4. **Part visibility filtering** - Respects conditional display logic before grouping
5. **Answer mapping** - Each part's answer is keyed by `partKey` in a flat object

### EXISTING EXAMPLES FROM BACKEND:

From `prisma/seed.ts` (lines 888-977), examples include:

```javascript
{
  partKey: 'rooms',
  title: 'How many rooms?',
  groupKey: 'rooms_bathrooms'  // Groups with other bathroom parts
}

{
  partKey: 'bathrooms',
  title: 'How many bathrooms?',
  groupKey: 'rooms_bathrooms'  // Same group
}

{
  partKey: 'garden_feature',
  title: 'Garden Feature',
  groupKey: 'special_features'  // Different group
}
```

---

## 12. What Doesn't Need to Change

The grouping logic is **already functional and complete**. No changes are needed to:

- ✅ How parts are grouped by `groupKey`
- ✅ How groups are rendered as sections
- ✅ How parts within groups are displayed
- ✅ How answers are stored and managed

The frontend is **ready to handle grouped parts** from the backend!

---

## 13. Testing Grouped Parts

To test multipart questions with grouping:

1. Create a multipart question in the backend with parts that have the same `groupKey`
2. Parts with the same `groupKey` will automatically:
   - Be wrapped in one `.part-section` card
   - Be separated by dividers (`.group-part + .group-part` margin/padding)
   - Appear visually grouped

Example:

```
┌─ .part-section (groupKey: 'rooms_bathrooms') ─┐
│  ┌─ Rooms input ─┐                              │
│  │ "How many rooms?" [input]                    │
│  └────────────────┘                              │
│  ┌─ Bathrooms input ─┐                          │
│  │ "How many bathrooms?" [input]                │
│  └────────────────────┘                         │
└──────────────────────────────────────────────────┘
```

---

## Summary

| Aspect               | Status      | Details                                          |
| -------------------- | ----------- | ------------------------------------------------ |
| Parts rendering      | ✅ Complete | MultipartQuestion.vue handles all types          |
| Grouping by groupKey | ✅ Complete | Implemented in groupedSections computed          |
| Visual grouping      | ✅ Complete | CSS styles parts in same group together          |
| Conditional display  | ✅ Complete | isPartVisible() checks conditions                |
| Answer management    | ✅ Complete | Parts keyed by partKey in object                 |
| Multiple part types  | ✅ Complete | 11 different question types supported            |
| Synced inputs        | ✅ Complete | Currency, dates, counters, voice input supported |

**No changes required to frontend for grouping functionality - it's already implemented!**
