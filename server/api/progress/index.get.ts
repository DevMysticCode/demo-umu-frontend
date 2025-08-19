export default defineEventHandler(async (event) => {
  // Mock progress data
  return {
    overall: {
      percentage: 75,
      completedTasks: 8,
      totalTasks: 15,
      currentPhase: 'Property Search'
    },
    phases: [
      {
        id: '1',
        name: 'Initial Planning',
        status: 'completed',
        percentage: 100,
        tasks: [
          { id: '1', name: 'Set budget', completed: true },
          { id: '2', name: 'Get pre-approved', completed: true },
          { id: '3', name: 'Find real estate agent', completed: true }
        ]
      },
      {
        id: '2',
        name: 'Property Search',
        status: 'in-progress',
        percentage: 60,
        tasks: [
          { id: '4', name: 'Define search criteria', completed: true },
          { id: '5', name: 'Schedule viewings', completed: true },
          { id: '6', name: 'Make offer', completed: false },
          { id: '7', name: 'Negotiate terms', completed: false }
        ]
      },
      {
        id: '3',
        name: 'Due Diligence',
        status: 'pending',
        percentage: 0,
        tasks: [
          { id: '8', name: 'Property inspection', completed: false },
          { id: '9', name: 'Appraisal', completed: false },
          { id: '10', name: 'Title search', completed: false }
        ]
      }
    ],
    milestones: [
      {
        id: '1',
        name: 'Pre-approval obtained',
        date: '2024-01-10',
        completed: true
      },
      {
        id: '2',
        name: 'Property selected',
        date: '2024-01-25',
        completed: false
      },
      {
        id: '3',
        name: 'Closing scheduled',
        date: '2024-02-15',
        completed: false
      }
    ]
  }
})