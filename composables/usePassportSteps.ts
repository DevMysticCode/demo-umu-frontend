export interface PassportQuestion {
  id: string
  question: string
  description: string
  instructionText?: string
  points: number
  type: 'text' | 'radio' | 'checkbox' | 'upload' | 'multipart' | 'note' | 'date'
  help?: string
  options?: {
    label: string
    value: string
    hasDate?: boolean
    dateFormat?: 'monthYear' | 'fullDate' | 'year'
    datePlaceholder?: string
  }[]
  placeholder?: string
  display?: 'text' | 'upload' | 'both'
  uploadInstruction?: string
  allowUpload?: boolean
  showBoth?: boolean
  answer?: any
  completed?: boolean
  // Optional prewritten templates for notes
  prewritten?: {
    buyers?: string
    sellers?: string
  }
  dateFields?: Array<{
    label?: string
    placeholder?: string
    format?: 'monthYear' | 'fullDate' | 'year'
  }>
  label?: string
  format?: 'monthYear' | 'fullDate' | 'year'
}

export interface PassportTask {
  id: string
  title: string
  description: string
  icon: string
  pointsReward: number
  completed: boolean
  questions: PassportQuestion[]
  currentQuestionIndex: number
}

export interface PassportStep {
  id: string
  title: string
  subtitle: string
  description: string
  icon: string
  order: number
  tasks: PassportTask[]
  completed: boolean
  progress: number
}

export const usePassportSteps = () => {
  const steps = ref<PassportStep[]>([
    {
      id: 'instructions',
      title: 'Instructions',
      subtitle: 'Getting Started',
      description: 'Learn how to complete your property passport',
      icon: 'instructions',
      order: 1,
      completed: false,
      progress: 34,
      tasks: [
        {
          id: 'task-1',
          title: 'Read Instructions',
          description: 'Understand the passport process',
          icon: '📖',
          pointsReward: 50,
          completed: true,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'What is a Property Passport?',
              description:
                'A Property Passport is a comprehensive document that contains all the information about a property.',
              points: 50,
              type: 'text',
              display: 'text',
              help: 'This helps property owners and buyers understand the property better.',
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'boundaries',
      title: 'Boundaries',
      subtitle: 'Identifying Boundaries',
      description: 'Define property boundaries',
      icon: 'boundaries',
      order: 2,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Notes',
          description: 'Read notes before starting',
          icon: '📝',
          pointsReward: 0,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Important Notes',
              description: 'You must read notes before starting.',
              instructionText:
                'Please indicate ownership by written instruction or by reference to a plan:',
              points: 0,
              // Notes type supports separate notes for buyers and sellers
              type: 'note',
              answer: { buyers: '', sellers: '' },
              completed: false,
              placeholder: 'Enter your notes here...',
              prewritten: {
                buyers:
                  'If any alterations or improvements have been made since the property was last valued for council tax, the sale of the property may trigger a revaluation. This may mean that following completion of the sale, the property will be put into a higher council tax band. Further information about council tax valuation can be found at: http://www.gov.uk/government/organisations/valuation-office-agency',
                sellers:
                  'All relevant approvals and supporting paperwork referred to in this form, such as listed building consents, planning permissions, Building Regulations consents and completion certificates should be provided. If the seller has had works carried out the seller should produce the documentation authorising this. Copies may be obtained from the relevant local authority website. Competent Persons Certificates may be obtained from the contractor or the scheme provider (e.g. FENSA or Gas Safe Register). Further information about Competent Persons Certificates can be found at: https://www.gov.uk/guidance/competent-person-scheme-current-schemes-and-how-schemes-are-authorised',
              },
            },
          ],
        },
        {
          id: 'task-2',
          title: 'Boundary Responsibilities',
          description: 'Determine boundary maintenance responsibility',
          icon: '🔧',
          pointsReward: 50,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-2-1',
              question:
                'Looking at the property from the road, who owns or accepts responsibility to maintain or repair the boundary features on each side of the property?',
              description:
                'Identify who is responsible for boundary maintenance on each side',
              points: 25,
              type: 'radio',
              help: 'Boundary responsibility determines who pays for maintenance, repairs, or replacement of fences, walls, hedges, or other boundary features.',
              options: [
                { label: 'Neighbour', value: 'neighbour' },
                { label: 'You', value: 'you' },
                { label: 'Shared', value: 'shared' },
                { label: 'Unknown', value: 'unknown' },
              ],
              answer: '',
              completed: false,
            },

            {
              id: 'q-2-2',
              question:
                'Building works (e.g. extension, loft or garage conversion, removal of internal walls)',
              description: '',
              points: 50,
              type: 'date',
              help: 'Select if building works were done and provide the completion date.',
              options: [
                {
                  label: 'Yes, select year',
                  value: 'yes',
                  hasDate: true,
                  dateFormat: 'year',
                  datePlaceholder: 'Select year',
                },
                {
                  label: 'No',
                  value: 'no',
                  hasDate: false,
                },
              ],
              answer: '',
              completed: false,
            },
            {
              id: 'q-2-3',
              question: 'When was the work completed?',
              description: '',
              points: 25,
              type: 'date',
              help: 'Provide the completion date for the building works.',
              options: [
                {
                  label: 'Select month',
                  value: 'selected',
                  hasDate: true,
                  dateFormat: 'monthYear',
                  datePlaceholder: 'Select month',
                },
              ],
              answer: '',
              completed: false,
            },
            {
              id: 'q-3-4',
              question: 'When did you first notice the issue?',
              description: '',
              points: 25,
              type: 'date',
              help: 'Provide the exact date when you first noticed the issue.',
              options: [
                {
                  label: 'Select date',
                  value: 'selected',
                  hasDate: true,
                  dateFormat: 'fullDate',
                  datePlaceholder: 'Select date',
                },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'task-3',
          title: 'Irregular Boundaries',
          description: 'Check if boundaries are irregular',
          icon: '◊',
          pointsReward: 50,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-3-1',
              question: 'Are the boundaries irregular?',
              description: 'If yes, please give details below',
              points: 100,
              type: 'radio',
              help: 'Boundaries are irregular if they are not a straight line – for example, if they curve, bend, or follow unusual shapes.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'task-4',
          title: 'Moved Boundary Features',
          description: 'Check if boundary features have moved',
          icon: '📍',
          pointsReward: 50,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-4-1',
              question:
                'Have fences, walls, or hedges marking the boundary ever been moved from their original position?',
              description: 'Provide details if yes',
              points: 50,
              type: 'upload',
              // show both text and upload so users can describe and attach evidence
              uploadInstruction:
                'Attach any photos or documents that show the moved boundary.',
              help: 'This helps identify if boundary markers have shifted over time.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
            {
              id: 'q-4-2',
              question: 'Upload supporting documents (plans, photos, reports)',
              description:
                'Provide any files that support your answer about moved features',
              points: 25,
              type: 'upload',
              help: 'Upload any supporting documents showing changes to boundary features.',
              answer: [],
              completed: false,
            },
          ],
        },
        {
          id: 'task-5',
          title: 'Adjacent Land Purchased',
          description: 'Check if adjacent land was purchased',
          icon: '🔍',
          pointsReward: 50,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-5-1',
              question:
                'Has extra land next to the property been bought and added to it by the seller?',
              description:
                'This means whether any extra land next to the property has been purchased and added to it by the seller.',
              points: 50,
              type: 'radio',
              help: 'Understanding if the property has been expanded helps in valuation.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'task-6',
          title: 'Complex Boundaries',
          description: 'Identify complex boundary situations',
          icon: '⚠️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-6-1',
              question: 'Are boundaries complex or tricky to describe?',
              description:
                "Complex boundaries don't follow simple lines or overlap in unusual ways.",
              points: 75,
              type: 'radio',
              help: "Complex boundaries are those that are tricky to describe or don't follow a simple line.",
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'disputes',
      title: 'Disputes and Complaints',
      subtitle: 'Resolving Issues',
      description: 'Document any disputes or complaints',
      icon: 'disputesAndComplaints',
      order: 3,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Known Disputes',
          description: 'Report any known disputes',
          icon: '📢',
          pointsReward: 100,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question:
                'Are there any known disputes about the property or its boundaries?',
              description: 'Document any disputes or disagreements',
              points: 100,
              type: 'radio',
              help: 'This includes disputes with neighbours, previous disputes resolved, or ongoing issues.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'notices',
      title: 'Notices and Proposals',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'noticesAndProposals',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'alterations',
      title: 'Alterations and Planning',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'alterationsAndPlanning',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'gurantees',
      title: 'Guarantees and Warranties',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'guaranteesAndWarranties',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'insurance',
      title: 'Insurance',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'insurance',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'environmental',
      title: 'Environmental',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'environmental',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'rights',
      title: 'Rights and Informal Arrangements',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'rightsAndInformalArrangements',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'parking',
      title: 'Parking',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'parking',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'otherCharges',
      title: 'Other Charges',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'otherCharges',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'occupiers',
      title: 'Occupiers',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'occupiers',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'services',
      title: 'Services',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'services',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'transactionInformation',
      title: 'Transaction Information',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'transactionInformation',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'fixturesAndFittings',
      title: 'Fixtures and Fittings',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'fixturesAndFittings',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'leasehold',
      title: 'Leasehold',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'leasehold',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'titleDeedsAndPlan',
      title: 'Title Deeds and Plan',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'titleDeedsAndPlan',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'searches',
      title: 'Searches',
      subtitle: 'Official Notices',
      description: 'Document any official notices',
      icon: 'searches',
      order: 4,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Planning Notices',
          description: 'Report planning-related notices',
          icon: '🏗️',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'q-1-1',
              question: 'Have there been any planning notices or proposals?',
              description: 'Document any planning applications or notices',
              points: 75,
              type: 'radio',
              help: 'This includes planning permission notices or development proposals.',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
      ],
    },
  ])

  const currentStepId = ref<string | null>(null)
  const currentTaskId = ref<string | null>(null)

  const getCurrentStep = () => {
    return steps.value.find((s) => s.id === currentStepId.value)
  }

  const getCurrentTask = () => {
    const step = getCurrentStep()
    if (!step) return null
    return step.tasks.find((t) => t.id === currentTaskId.value)
  }

  const getCurrentQuestion = () => {
    const task = getCurrentTask()
    if (!task) return null
    return task.questions[task.currentQuestionIndex]
  }

  const setCurrentStep = (stepId: string) => {
    currentStepId.value = stepId
    const step = steps.value.find((s) => s.id === stepId)
    if (step && step.tasks.length > 0) {
      currentTaskId.value = step.tasks[0].id
    }
  }

  const setCurrentTask = (taskId: string) => {
    currentTaskId.value = taskId
  }

  const updateQuestionAnswer = (answer: any) => {
    const question = getCurrentQuestion()
    if (question) {
      question.answer = answer
      question.completed = true
    }
  }

  const moveToNextQuestion = () => {
    const task = getCurrentTask()
    if (!task) return

    if (task.currentQuestionIndex < task.questions.length - 1) {
      task.currentQuestionIndex++
      return false // More questions
    } else {
      task.completed = true
      return true // Task completed
    }
  }

  const moveToNextTask = () => {
    const step = getCurrentStep()
    if (!step) return false

    const currentTaskIndex = step.tasks.findIndex(
      (t) => t.id === currentTaskId.value
    )

    if (currentTaskIndex < step.tasks.length - 1) {
      currentTaskId.value = step.tasks[currentTaskIndex + 1].id
      return false // More tasks
    } else {
      step.completed = true
      step.progress = 100
      return true // Step completed
    }
  }

  const moveToNextStep = () => {
    const currentStepIndex = steps.value.findIndex(
      (s) => s.id === currentStepId.value
    )

    if (currentStepIndex < steps.value.length - 1) {
      const nextStep = steps.value[currentStepIndex + 1]
      setCurrentStep(nextStep.id)
      return false // More steps
    } else {
      return true // All steps completed
    }
  }

  const calculateTaskProgress = (task: PassportTask) => {
    const completedQuestions = task.questions.filter((q) => q.completed).length
    return Math.round((completedQuestions / task.questions.length) * 100)
  }

  const calculateStepProgress = (step: PassportStep) => {
    const completedTasks = step.tasks.filter((t) => t.completed).length
    const totalPoints = step.tasks.reduce((sum, t) => sum + t.pointsReward, 0)
    return Math.round((completedTasks / step.tasks.length) * 100)
  }

  const updateStepProgress = (stepId: string) => {
    const step = steps.value.find((s) => s.id === stepId)
    if (step) {
      step.progress = calculateStepProgress(step)
    }
  }

  return {
    steps,
    currentStepId,
    currentTaskId,
    getCurrentStep,
    getCurrentTask,
    getCurrentQuestion,
    setCurrentStep,
    setCurrentTask,
    updateQuestionAnswer,
    moveToNextQuestion,
    moveToNextTask,
    moveToNextStep,
    calculateTaskProgress,
    calculateStepProgress,
    updateStepProgress,
  }
}
