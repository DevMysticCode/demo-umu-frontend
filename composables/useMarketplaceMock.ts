// Mock marketplace data for the homescore-v6 prototype port.
// Phase 3 will swap to real backend wiring once the API exists.

export interface MockSupplier {
  id: string
  initial: string
  name: string
  rating: number
  reviews: number
  jobsDone?: number
  cert: string
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  spec: string
  category: string[]
  matchChips: string[]
  priceFrom: string
  priceSub: string
  ctaLabel: string
  gradient: [string, string]
  respondsIn?: string
  onTime?: number
  onBudget?: number
  quality?: number
  reviewQuotes?: { stars: number; by: string; body: string }[]
  certifications?: string[]
  qualities?: string[]
}

export interface MockJob {
  id: string
  icon: string
  title: string
  meta: string
  status: 'awaiting' | 'live' | 'done'
  statusLabel: string
  offers?: number
  bestPrice?: string
  postedAgo?: string
  supplier?: string
  scheduledFor?: string
}

export interface MockMessage {
  id: string
  name: string
  initial: string
  gradient: [string, string]
  preview: string
  time: string
  unread?: boolean
  jobTitle?: string
}

export interface MockBadge {
  id: string
  icon: string
  name: string
  earned: boolean
  isNew?: boolean
  unlockText: string
}

export interface MockLeader {
  rank: number
  medal: string
  name: string
  pts: number
  isYou?: boolean
}

export interface MockCategory {
  id: string
  icon: string
  name: string
}

export function useMarketplaceMock() {
  const suppliers: MockSupplier[] = [
    {
      id: 'betterhome',
      initial: 'B',
      name: 'BetterHome Insulation Co.',
      rating: 4.8,
      reviews: 84,
      jobsDone: 12,
      cert: 'TrustMark',
      spec: 'Cavity wall · Loft · Floor insulation · ECO4 registered',
      category: ['insulation'],
      matchChips: ['Cavity wall', 'Loft top-up', 'Often free'],
      priceFrom: 'Free via ECO4',
      priceSub: '(if eligible)',
      ctaLabel: 'Check eligibility →',
      gradient: ['#4A7FBF', '#2D5A8E'],
      respondsIn: '<1h',
      onTime: 98,
      onBudget: 96,
      quality: 4.8,
      reviewQuotes: [
        {
          stars: 5,
          by: 'Sarah · CV5',
          body: '"Showed up exactly when they said, finished the cavity fill in 4 hours, left the place spotless. Heat hit the room before the team had packed up. Recommended."',
        },
        {
          stars: 5,
          by: 'James · CV6',
          body: '"Walked me through ECO4 eligibility, sorted the paperwork themselves, no surprises. Free under the scheme."',
        },
        {
          stars: 4,
          by: 'Priya · CV4',
          body: '"Great work, slight delay on start date but communication was excellent throughout."',
        },
      ],
      certifications: [
        'TrustMark certified · CWI installer #44012',
        'ECO4 registered · valid 2024 / 2025',
        'Public Liability £5m · Hiscox · valid Mar 2026',
        'Employers Liability £10m · Simply Business',
        '25-year workmanship guarantee',
      ],
      qualities: [
        '⏱ Punctuality 4.9',
        '💷 Stuck to quote 96%',
        '🧹 Left it spotless',
        '💬 Communication 4.9',
      ],
    },
    {
      id: 'positive-solar',
      initial: 'P',
      name: 'Positive Solar',
      rating: 4.9,
      reviews: 203,
      jobsDone: 41,
      cert: 'MCS certified',
      tier: 'gold',
      spec: 'Solar PV · Battery storage · Solar thermal · SEG setup',
      category: ['solar'],
      matchChips: ['Solar PV', 'Solar thermal', 'MCS'],
      priceFrom: 'From £9,000',
      priceSub: '(finance available)',
      ctaLabel: 'View profile →',
      gradient: ['#F5A623', '#C67C18'],
      respondsIn: '<2h',
      onTime: 97,
      onBudget: 94,
      quality: 4.9,
      reviewQuotes: [
        { stars: 5, by: 'Mike · CV5', body: '"Smooth install. SEG sorted in days."' },
      ],
      certifications: [
        'MCS certified · MCS-SP-2018',
        'NICEIC approved',
        'Public Liability £5m',
        'SEG setup included',
      ],
      qualities: ['☀️ Spec quality', '💬 Clear quote', '⚡ Fast SEG'],
    },
    {
      id: 'lightworks',
      initial: 'L',
      name: 'LightWorks LED Coventry',
      rating: 4.7,
      reviews: 38,
      jobsDone: 22,
      cert: 'NICEIC',
      tier: 'silver',
      spec: 'LED installs · smart lighting · supply + fit',
      category: ['electrical', 'smart'],
      matchChips: ['LED swap', '£110 fixed'],
      priceFrom: 'From £110',
      priceSub: '(supply + fit)',
      ctaLabel: 'View profile →',
      gradient: ['#7AB040', '#5A8A30'],
      respondsIn: '<3h',
      onTime: 95,
      onBudget: 99,
      quality: 4.7,
    },
    {
      id: 'martins',
      initial: 'M',
      name: "Martin's Plumbing & Heating",
      rating: 4.9,
      reviews: 127,
      jobsDone: 64,
      cert: 'Gas Safe',
      tier: 'platinum',
      spec: 'Solar thermal · Hot water · Heat pumps · Boilers',
      category: ['boiler', 'smart', 'plumbing'],
      matchChips: ['Solar thermal', 'Gas Safe', 'ECO4'],
      priceFrom: 'From £4,000',
      priceSub: '(supply + fit)',
      ctaLabel: 'View profile →',
      gradient: ['#00B8B0', '#008A84'],
      respondsIn: '<1h',
      onTime: 99,
      onBudget: 97,
      quality: 4.9,
    },
    {
      id: 'smarthome-cov',
      initial: 'S',
      name: 'SmartHome Coventry',
      rating: 4.7,
      reviews: 61,
      jobsDone: 18,
      cert: 'Which? Trusted',
      spec: 'Nest · Hive · Tado smart controls',
      category: ['smart'],
      matchChips: ['Smart thermostat', 'Supply + fit'],
      priceFrom: 'From £180',
      priceSub: '(supply + fit)',
      ctaLabel: 'Get a quote →',
      gradient: ['#C4547A', '#8B2E4A'],
      respondsIn: '<4h',
      onTime: 92,
      onBudget: 95,
      quality: 4.7,
    },
  ]

  const categories: MockCategory[] = [
    { id: 'heating', icon: '🔥', name: 'Heating' },
    { id: 'electrical', icon: '⚡', name: 'Electrical' },
    { id: 'insulation', icon: '🧱', name: 'Insulation' },
    { id: 'solar', icon: '☀️', name: 'Solar' },
    { id: 'plumbing', icon: '💧', name: 'Plumbing' },
    { id: 'bathrooms', icon: '🛁', name: 'Bathrooms' },
    { id: 'garden', icon: '🌿', name: 'Garden' },
    { id: 'removals', icon: '🚚', name: 'Removals' },
  ]

  const jobs: MockJob[] = [
    {
      id: 'cavity-job',
      icon: '📨',
      title: 'Cavity wall insulation',
      meta: '2 offers in · best £620 · posted 3 days ago',
      status: 'awaiting',
      statusLabel: 'Awaiting',
      offers: 2,
      bestPrice: '£620',
      postedAgo: '3 days ago',
    },
    {
      id: 'loft-job',
      icon: '🔧',
      title: 'Loft top-up to 270mm',
      meta: 'BetterHome Insulation · scheduled 14 June',
      status: 'live',
      statusLabel: 'Booked',
      supplier: 'BetterHome Insulation',
      scheduledFor: '14 June',
    },
  ]

  const messages: MockMessage[] = [
    {
      id: 'msg-betterhome',
      name: 'BetterHome Insulation',
      initial: 'B',
      gradient: ['#4A7FBF', '#2D5A8E'],
      preview: "Hi Maxine — we've checked ECO4 eligibility, you qualify…",
      time: '2h',
      unread: true,
      jobTitle: 'Cavity wall insulation',
    },
    {
      id: 'msg-positive',
      name: 'Positive Solar',
      initial: 'P',
      gradient: ['#F5A623', '#C67C18'],
      preview: 'Site survey booked for Friday 11am. Pavement parking ok?',
      time: '1d',
      jobTitle: 'Solar PV quote',
    },
    {
      id: 'msg-martins',
      name: "Martin's Plumbing",
      initial: 'M',
      gradient: ['#00B8B0', '#008A84'],
      preview: 'Quote sent — £4,200 inc VAT. Valid 28 days.',
      time: '3d',
    },
  ]

  const badges: MockBadge[] = [
    { id: 'first', icon: '🎯', name: 'First job', earned: true, unlockText: 'First job posted! +25 UPoints' },
    { id: 'verified', icon: '🪪', name: 'Verified', earned: true, unlockText: 'ID & address confirmed' },
    { id: 'fivestar', icon: '⭐', name: '5-star review', earned: true, isNew: true, unlockText: '5-star review unlocked!' },
    { id: 'climbed', icon: '📈', name: 'Climbed', earned: true, unlockText: 'Climbed your street rank!' },
    { id: 'cosy', icon: '🏠', name: 'Cosy home', earned: false, unlockText: 'Complete 3 EPC steps to unlock' },
    { id: 'eco', icon: '🌍', name: 'Eco hero', earned: false, unlockText: 'Save 1 tonne of CO₂/yr to unlock' },
    { id: 'connector', icon: '🤝', name: 'Connector', earned: false, unlockText: 'Refer a friend to unlock' },
    { id: 'gold', icon: '🥇', name: 'Gold', earned: false, unlockText: 'Reach Gold tier to unlock' },
  ]

  const leaderboard: MockLeader[] = [
    { rank: 1, medal: '🥇', name: 'No. 7 · A · 92', pts: 920 },
    { rank: 2, medal: '🥈', name: 'No. 13 · B · 84', pts: 810 },
    { rank: 3, medal: '🥉', name: 'No. 4 · C · 76', pts: 680 },
    { rank: 8, medal: '✦', name: 'No. 15 — You', pts: 240, isYou: true },
  ]

  function getSupplier(id: string): MockSupplier | undefined {
    return suppliers.find((s) => s.id === id)
  }

  return {
    suppliers,
    categories,
    jobs,
    messages,
    badges,
    leaderboard,
    getSupplier,
  }
}
