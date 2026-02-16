<template>
  <div class="multi-field-form-wrapper">
    <!-- Question Display Section (skip if hideQuestionDisplay is true) -->
    <template v-if="!hideQuestionDisplay">
      <p v-if="displayedQuestion" class="question-text">
        {{ displayedQuestion }}
        <span v-if="showQuestionCursor" class="typing-cursor">|</span>
      </p>

      <!-- Description Display Section -->
      <p v-if="displayedDescription" class="question-description">
        {{ displayedDescription }}
        <span v-if="showDescriptionCursor" class="typing-cursor">|</span>
      </p>

      <!-- Help Display Section -->
      <div v-if="displayedHelp" class="help-section">
        <span class="help-icon">ⓘ</span>
        <span class="help-text">
          {{ displayedHelp }}
          <span v-if="showHelpCursor" class="typing-cursor">|</span>
        </span>
      </div>
    </template>

    <!-- Forms Container -->
    <div class="forms-container">
      <!-- Form title (shown inside container for multifieldform in multipart) -->
      <p v-if="question.title && hideQuestionDisplay" class="form-title">
        {{ question.title }}
      </p>

      <!-- Each form instance -->
      <div
        v-for="(formInstance, formIndex) in formInstances"
        :key="formIndex"
        class="form-instance"
        :class="{ 'has-remove': repeatable && formInstances.length > 1 }"
      >
        <!-- Remove button for repeatable forms -->
        <button
          v-if="repeatable && formInstances.length > 1"
          class="remove-form-btn"
          @click="removeForm(formIndex)"
          title="Remove this form"
        >
          ✕
        </button>

        <!-- Form fields -->
        <div class="form-fields">
          <div
            v-for="field in question.fields"
            :key="field.key"
            class="form-field"
          >
            <label class="field-label">{{ field.label }}</label>
            <input
              :value="getFieldValue(formIndex, field.key)"
              type="text"
              class="field-input"
              :placeholder="field.placeholder || ''"
              @input="
                updateFieldValue(formIndex, field.key, $event.target.value)
              "
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Add More Button (if repeatable) -->
    <button v-if="repeatable" class="add-form-btn" @click="addForm">
      <span class="add-icon"
        ><OPIcon name="addMoreButton" class="w-[15px] h-[15px]"
      /></span>
      {{ question.buttonText || 'Add More' }}
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import OPIcon from '~/components/ui/OPIcon.vue'
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  answer: {
    type: [Array, Object],
    default: () => [],
  },
  displayedQuestion: {
    type: String,
    default: '',
  },
  showQuestionCursor: {
    type: Boolean,
    default: false,
  },
  displayedDescription: {
    type: String,
    default: '',
  },
  showDescriptionCursor: {
    type: Boolean,
    default: false,
  },
  displayedHelp: {
    type: String,
    default: '',
  },
  showHelpCursor: {
    type: Boolean,
    default: false,
  },
  hideQuestionDisplay: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update'])

const repeatable = computed(() => props.question.repeatable === true)

const formInstances = ref([])

const createEmptyForm = () => {
  const form = {}
  if (props.question.fields) {
    props.question.fields.forEach((field) => {
      form[field.key] = ''
    })
  }
  return form
}

// Initialize forms from saved answers
watch(
  () => props.answer,
  (val) => {
    if (repeatable.value) {
      // For repeatable: answer is array of objects
      if (Array.isArray(val) && val.length > 0) {
        formInstances.value = JSON.parse(JSON.stringify(val))
      } else {
        formInstances.value = [createEmptyForm()]
      }
    } else {
      // For non-repeatable: answer is single object
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        formInstances.value = [JSON.parse(JSON.stringify(val))]
      } else {
        formInstances.value = [createEmptyForm()]
      }
    }
  },
  { immediate: true },
)

const getFieldValue = (formIndex, fieldKey) => {
  if (formInstances.value[formIndex]) {
    return formInstances.value[formIndex][fieldKey] || ''
  }
  return ''
}

const updateFieldValue = (formIndex, fieldKey, value) => {
  if (formInstances.value[formIndex]) {
    formInstances.value[formIndex][fieldKey] = value
    emitUpdate()
  }
}

const addForm = () => {
  formInstances.value.push(createEmptyForm())
  emitUpdate()
}

const removeForm = (formIndex) => {
  formInstances.value.splice(formIndex, 1)
  emitUpdate()
}

const emitUpdate = () => {
  if (repeatable.value) {
    // Return array for repeatable forms
    emit('update', formInstances.value)
  } else {
    // Return single object for non-repeatable form
    emit('update', formInstances.value[0] || createEmptyForm())
  }
}
</script>

<style scoped>
.multi-field-form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-text {
  font-size: 15px;
  font-weight: 500;
  color: #3c3c43;
  margin: 0 0 20px 0;
  letter-spacing: -0.23px;
  line-height: 1.5;
}

.question-description {
  font-size: 14px;
  color: #3c3c4399;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.help-section {
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: #00a19a1a;
  border-radius: 12px;
  margin: 0 0 20px 0;
  font-size: 13px;
  color: #3c3c43;
}

.help-icon {
  flex-shrink: 0;
  font-size: 16px;
  color: #00a19a;
}

.help-text {
  line-height: 1.4;
}

.typing-cursor {
  display: inline-block;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.forms-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* padding: 16px; */
  /* background: #f9f9f9; */
  /* border: 1px solid #e0e0e0; */
  /* border-radius: 12px; */
  transition: border-color 0.2s;
}

.forms-container:hover {
  border-color: #00a19a;
}

.form-title {
  font-size: 15px;
  font-weight: 500;
  color: #3c3c43;
  margin: 0;
  letter-spacing: -0.23px;
  line-height: 1.5;
}

.form-instance {
  position: relative;
}

.form-instance.has-remove {
  padding-right: 40px;
}

.remove-form-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffebee;
  border: none;
  border-radius: 50%;
  color: #c62828;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.remove-form-btn:hover {
  background: #ff9800;
  color: white;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
}

.field-input {
  padding: 12px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.field-input:focus {
  outline: none;
  border-color: #00a19a;
  background: white;
}

.field-input::placeholder {
  color: #999;
}

.add-form-btn {
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: -0.08px;
  padding: 16px 12px;
  background: #eafffc;
  border: none;
  border-radius: 16px;
  color: #00a19a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
  align-self: center;
  white-space: nowrap;
  width: 100%;
}

.add-form-btn:hover {
  background: #d0ede9;
}

.add-icon {
  font-size: 18px;
  font-weight: 700;
}
</style>
