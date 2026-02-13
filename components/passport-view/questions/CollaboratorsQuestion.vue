<template>
  <div class="collabs-question">
    <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3>

    <div class="collabs-list">
      <div v-for="c in collaborators" :key="c.id" class="collab-item">
        <div class="avatar">{{ getInitials(c.firstName, c.lastName) }}</div>
        <div class="info">
          <div class="name">{{ c.firstName }} {{ c.lastName }}</div>
          <div class="email">{{ c.email }}</div>
        </div>
      </div>
    </div>

    <button class="btn-add" @click="openAdd = true">Add collaborator</button>

    <AddCollaboratorModal
      :show="openAdd"
      :passportId="passportId"
      @update:show="openAdd = $event"
      @added="loadCollaborators"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AddCollaboratorModal from '@/components/modals/AddCollaboratorModal.vue'
import { usePassportCollaborators } from '~/composables/usePassportCollaborators'

const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: null, default: null },
  passportId: { type: String, default: '' },
})
const emit = defineEmits(['update'])

const { getCollaborators } = usePassportCollaborators()
const collaborators = ref([])
const openAdd = ref(false)

const loadCollaborators = async () => {
  try {
    if (!props.passportId) return
    collaborators.value = await getCollaborators(props.passportId)
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadCollaborators)

const getInitials = (f, l) => ((f ? f[0] : '?') + (l ? l[0] : '')).toUpperCase()
</script>

<style scoped>
.collabs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.collab-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background: #f9fafb;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #00b8a9;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.btn-add {
  padding: 10px 14px;
  border-radius: 8px;
  background: #00b8a9;
  color: white;
  border: none;
}
.section-title {
  font-size: 15px;
  margin-bottom: 8px;
  color: #111;
}
</style>
