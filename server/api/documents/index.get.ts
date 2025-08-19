export default defineEventHandler(async (event) => {
  // Mock documents data
  return {
    documents: [
      {
        id: '1',
        name: 'Property Deed',
        type: 'legal',
        size: '2.4 MB',
        uploadedAt: '2024-01-15T10:30:00Z',
        url: '/documents/property-deed.pdf'
      },
      {
        id: '2',
        name: 'Insurance Policy',
        type: 'insurance',
        size: '1.8 MB',
        uploadedAt: '2024-01-14T14:20:00Z',
        url: '/documents/insurance-policy.pdf'
      },
      {
        id: '3',
        name: 'Inspection Report',
        type: 'inspection',
        size: '5.2 MB',
        uploadedAt: '2024-01-13T09:15:00Z',
        url: '/documents/inspection-report.pdf'
      }
    ],
    total: 3,
    categories: [
      { name: 'Legal', count: 1 },
      { name: 'Insurance', count: 1 },
      { name: 'Inspection', count: 1 }
    ]
  }
})