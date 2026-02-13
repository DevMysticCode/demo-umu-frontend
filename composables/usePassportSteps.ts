export interface QuestionPart {
  partKey: string
  type:
    | 'text'
    | 'radio'
    | 'checkbox'
    | 'upload'
    | 'date'
    | 'chips'
    | 'address'
    | 'collaborators'
    | 'scale'
    | 'number'
  title: string
  description?: string
  options?: {
    label: string
    value: string
    hasDate?: boolean
    dateFormat?: 'monthYear' | 'fullDate' | 'year'
    datePlaceholder?: string
  }[]
  placeholder?: string
  uploadInstruction?: string
  min?: number
  max?: number
  step?: number
  inputType?: 'text' | 'number'
  prefix?: string
  suffix?: string
  dateFields?: Array<{
    label?: string
    placeholder?: string
    format?: 'monthYear' | 'fullDate' | 'year'
  }>
  order: number
}

export interface PassportQuestion {
  id: string
  question: string
  description: string
  instructionText?: string
  points: number
  type:
    | 'text'
    | 'radio'
    | 'checkbox'
    | 'upload'
    | 'multipart'
    | 'note'
    | 'date'
    | 'address'
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
  parts?: QuestionPart[]
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
      id: 'ownershipProfile',
      title: 'Ownership Profile',
      subtitle: 'Set out the ownership structure for this property',
      description: 'Complete all sections about property ownership',
      icon: 'ownershipProfile',
      order: 1,
      completed: false,
      progress: 0,
      tasks: [
        {
          id: 'ownership-notes',
          title: 'About this form',
          description: 'Read important notes before starting',
          icon: '📝',
          pointsReward: 0,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-notes',
              question: 'Important Notes',
              description: 'You must read notes before starting.',
              points: 0,
              type: 'note',
              answer: { buyers: '', sellers: '' },
              completed: false,
              prewritten: {
                buyers:
                  'If the seller gives you, separately from this form, any information concerning the property (in writing or in conversation, whether through an estate agent or solicitor or directly to you) on which you wish to rely when buying the property, you should tell your solicitor. You are entitled to rely on the replies given to enquiries but in relation to the physical condition of the property, the replies should not be treated as a substitute for undertaking your own survey or making your own independent enquiries, which you are recommended to do.',
                sellers:
                  "The answers should be prepared by the person or persons who are named as owner on the deeds or Land Registry title or by the owner's legal representative(s) if selling under a power of attorney or grant of probate or representation. If there is more than one seller, you should prepare the answers together or, if only one seller prepares the form, the other(s) should check the answers given and all sellers should sign the form.",
              },
            },
          ],
        },
        {
          id: 'ownership-seller-details',
          title: 'Seller details',
          description: 'Provide names and residential address',
          icon: '👤',
          pointsReward: 100,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-names',
              question: 'Full names of the seller(s)',
              description:
                'State the full names of everyone who is named as owner on the HM Land Registry title or on the deeds.',
              points: 50,
              type: 'text',
              help: 'If you are completing on behalf of the seller, provide their names along with your capacity.',
              answer: '',
              completed: false,
            },
            {
              id: 'ownership-q-address',
              question: 'Residential address of the seller(s)',
              description: 'Provide the address where sellers currently live.',
              points: 50,
              type: 'address',
              placeholder: '12, Example Road, AB1 2CD',
              help: 'This is the current residential address.',
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'ownership-capacity',
          title: 'Legal capacity',
          description: 'Specify your capacity in completing this form',
          icon: '📋',
          pointsReward: 100,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-capacity',
              question: 'Are you completing this form on behalf of the seller?',
              description:
                'Please state the capacity in which you are providing the information.',
              points: 100,
              type: 'radio',
              help: 'Select the option that applies - either as the seller or in a specific legal capacity.',
              options: [
                {
                  label: 'Will / Grant of Probate',
                  value: 'will_grant_of_probate',
                },
                { label: 'Trustee', value: 'trustee' },
                { label: 'Representative', value: 'representative' },
                { label: 'Power of Attorney', value: 'power_of_attorney' },
                { label: 'Limited Company', value: 'limited_company' },
                { label: 'No - I am the seller', value: 'no_seller' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'ownership-solicitor',
          title: 'Solicitor details',
          description: 'Provide solicitor firm information',
          icon: '⚖️',
          pointsReward: 50,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-solicitor',
              question: "Please provide details of solicitor's firm",
              description:
                'If you have a solicitor handling the sale, provide their contact details.',
              points: 50,
              type: 'radio',
              help: 'You can provide the solicitor information if applicable.',
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
          id: 'ownership-photos',
          title: 'Property photos',
          description: 'Great photos help buyers connect emotionally',
          icon: '📸',
          pointsReward: 100,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-photos',
              question: 'Great photos help buyers connect emotionally',
              description:
                'Add photos of your property to help buyers visualize it.',
              points: 100,
              type: 'upload',
              uploadInstruction: 'Upload up to 6 photos of the property',
              answer: [],
              completed: false,
            },
          ],
        },
        {
          id: 'ownership-council-tax',
          title: 'Council tax band',
          description: 'Specify the current council tax band',
          icon: '📊',
          pointsReward: 50,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-council-tax',
              question: 'What is your council tax band?',
              description:
                'State the council tax band for the property. Find this on your latest bill or GOV.UK website.',
              points: 50,
              type: 'radio',
              help: 'The council tax band determines your annual council tax charge.',
              options: [
                { label: 'Band A', value: 'band_a' },
                { label: 'Band B', value: 'band_b' },
                { label: 'Band C', value: 'band_c' },
                { label: 'Band D', value: 'band_d' },
                { label: 'Band E', value: 'band_e' },
                { label: 'Band F', value: 'band_f' },
                { label: 'Band G', value: 'band_g' },
                { label: 'Band H', value: 'band_h' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'ownership-asking-price',
          title: 'Asking price',
          description: 'Specify your asking price for the property',
          icon: '💷',
          pointsReward: 50,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-asking-price',
              question: 'What is your asking price for the property?',
              description:
                'State the asking price of the property. You can use a slider or enter the actual selling price.',
              points: 50,
              type: 'radio',
              help: 'Provide the asking price in pounds.',
              options: [
                { label: 'Under £250,000', value: 'under_250k' },
                { label: '£250,000 - £500,000', value: '250k_500k' },
                { label: '£500,000 - £750,000', value: '500k_750k' },
                { label: '£750,000 - £1,000,000', value: '750k_1m' },
                { label: 'Over £1,000,000', value: 'over_1m' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'ownership-tenure',
          title: 'Type of ownership',
          description: 'Specify the tenure type',
          icon: '🏠',
          pointsReward: 100,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-tenure',
              question: 'What is the type of the ownership?',
              description:
                "National Trading Standard's guidance includes non-traditional tenure categories (park homes and riverboats).",
              points: 100,
              type: 'radio',
              help: 'Select the ownership structure that applies to this property.',
              options: [
                { label: 'Freehold', value: 'freehold' },
                { label: 'Share of Freehold', value: 'share_of_freehold' },
                { label: 'Leasehold', value: 'leasehold' },
                { label: 'Commonhold', value: 'commonhold' },
                { label: 'Shared Ownership', value: 'shared_ownership' },
                { label: 'Flying Freehold', value: 'flying_freehold' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'ownership-shared-ownership',
          title: 'Shared ownership',
          description: 'Enter shared ownership percentage and rent',
          icon: '%',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-shared-ownership',
              question:
                'Please enter the percentage of shared ownership and the annual rent',
              description:
                "State how much you own and the rent paid for the share you don't own.",
              points: 75,
              type: 'text',
              help: 'For shared ownership properties, provide both % owned and annual rent amount.',
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'ownership-lease',
          title: 'Lease details',
          description: 'Provide lease expiry date and length',
          icon: '📅',
          pointsReward: 100,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-lease-expiry',
              question: 'Please enter the expiry date of your lease',
              description:
                'You should be able to find this information on your title deeds.',
              points: 50,
              type: 'date',
              options: [
                {
                  label: 'Select expiry date',
                  value: 'yes',
                  hasDate: true,
                  dateFormat: 'fullDate',
                  datePlaceholder: 'Select expiry date',
                },
              ],
              answer: '',
              completed: false,
            },
            {
              id: 'ownership-q-lease-length',
              question: 'Please enter the length of your lease',
              description: 'How many years remain on the lease?',
              points: 50,
              type: 'text',
              help: 'Provide the length in years.',
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'ownership-service-charges',
          title: 'Service charges',
          description: 'Provide service charge information',
          icon: '💰',
          pointsReward: 75,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-service-charge-freq',
              question:
                'If your lease includes a service charge, what is the frequency and amount?',
              description:
                'Service charges are usually for the maintenance and upkeep of the property.',
              points: 75,
              type: 'radio',
              help: 'Select how often you pay service charges and provide the annual amount.',
              options: [
                { label: 'Annual', value: 'annual' },
                { label: 'Quarterly', value: 'quarterly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'No service charge', value: 'no_service_charge' },
              ],
              answer: '',
              completed: false,
            },
          ],
        },
        {
          id: 'ownership-property-type',
          title: 'Property type',
          description: 'Select the property type(s)',
          icon: '🏘️',
          pointsReward: 50,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-property-type',
              question: 'What is the type of the property?',
              description: 'Select all that apply to describe your property.',
              points: 50,
              type: 'checkbox',
              help: 'Choose the property type(s) that match your home.',
              options: [
                { label: 'Detached', value: 'detached' },
                { label: 'Semi-Detached', value: 'semi_detached' },
                { label: 'Terraced', value: 'terraced' },
                { label: 'Flat', value: 'flat' },
                { label: 'Maisonette', value: 'maisonette' },
                { label: 'Bungalow', value: 'bungalow' },
                { label: 'Dormer Bungalow', value: 'dormer_bungalow' },
                { label: 'Mobile Home', value: 'mobile_home' },
                { label: 'Boat', value: 'boat' },
                { label: 'Land', value: 'land' },
              ],
              answer: [],
              completed: false,
            },
          ],
        },
        {
          id: 'ownership-features',
          title: 'What we love',
          description: 'Share what makes your home special',
          icon: '❤️',
          pointsReward: 50,
          completed: false,
          currentQuestionIndex: 0,
          questions: [
            {
              id: 'ownership-q-features',
              question: 'What do we love about our home?',
              description:
                'Select the features that make your home special. This helps attract the right buyers.',
              points: 50,
              type: 'checkbox',
              help: 'Choose features that appeal to potential buyers.',
              options: [
                {
                  label: 'Morning light in the kitchen',
                  value: 'morning_light_kitchen',
                },
                {
                  label: 'Kids can walk to school in 6 mins',
                  value: 'kids_walk_to_school',
                },
                {
                  label: 'Neighbors are friendly but not intrusive',
                  value: 'friendly_neighbors',
                },
                { label: 'Large garden', value: 'large_garden' },
                { label: 'Great transport links', value: 'transport_links' },
                { label: 'Close to amenities', value: 'close_amenities' },
                { label: 'Quiet neighbourhood', value: 'quiet_area' },
                { label: 'Good schools nearby', value: 'good_schools' },
              ],
              answer: [],
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
      (t) => t.id === currentTaskId.value,
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
      (s) => s.id === currentStepId.value,
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
