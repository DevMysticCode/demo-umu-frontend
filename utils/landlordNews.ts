// Shared legislation & news dataset — used by the Landlord Passport's
// compliance-screen rail (top 5, teaser) and the full News page under
// Profile (all items, newest/most significant first).
//
// This is a curated snapshot, not a live feed. Every item here was
// researched live and links to its real, current source — nothing here
// is fabricated. Keeping it accurate going forward is an ongoing
// editorial commitment: someone needs to periodically verify these are
// still current and add new ones, the same way a small newsroom would.
// This file is a plain array specifically so that refresh is a content
// edit, not a code change.
export interface NewsItem {
  id: string
  tag: 'law' | 'update' | 'news'
  tagLabel: string
  title: string
  summary: string
  source: string
  url: string
  date: string // ISO yyyy-mm-dd
  featured?: boolean
}

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'rra-roadmap',
    tag: 'law',
    tagLabel: 'Law change',
    title: "Renters' Rights Act - implementation roadmap published",
    summary: 'Confirmed 1 May 2026 for the abolition of Section 21 and the switch to periodic tenancies. The PRS Database and Ombudsman follow in a later phase, with property-condition standards after that.',
    source: 'Hogan Lovells',
    url: 'https://www.hoganlovells.com/en/publications/renters-rights-act-implementation-roadmap-now-published',
    date: '2025-11-13',
    featured: true,
  },
  {
    id: 'rent-bidding-ban',
    tag: 'law',
    tagLabel: 'Law change',
    title: 'Rental bidding banned - one fixed asking rent only',
    summary: "Landlords and agents must advertise a single, specific rent figure and can't accept offers above it. Breaches can bring a civil penalty of up to £7,000.",
    source: 'The Independent Landlord',
    url: 'https://theindependentlandlord.com/rental-bidding/',
    date: '2026-05-01',
  },
  {
    id: 'deposit-s8-gate',
    tag: 'law',
    tagLabel: 'Deposit rules',
    title: 'Deposit protection now gates your Section 8 grounds',
    summary: "Since Section 21's abolition, most Section 8 grounds can't be used unless the deposit was protected correctly - a compliance failure can now block eviction outright.",
    source: 'NRLA',
    url: 'https://www.nrla.org.uk/news/10-deposit-dos-and-donts-every-landlord-should-know-in-2026',
    date: '2026-05-01',
  },
  {
    id: 'epc-2030',
    tag: 'update',
    tagLabel: 'EPC update',
    title: 'EPC minimum rises to C - but not until 2030',
    summary: 'Confirmed in the Warm Homes Plan: EPC C required from 1 October 2030, under a new assessment methodology, with a £10,000 cost cap per property.',
    source: 'The Independent Landlord',
    url: 'https://theindependentlandlord.com/new-epc-rules/',
    date: '2026-01-15',
  },
  {
    id: 'electrical-social',
    tag: 'update',
    tagLabel: 'Electrical safety',
    title: 'Mandatory electrical checks extend to social housing',
    summary: "Private landlords' 2021 EICRs are now hitting their 5-year expiry. Social landlords have until 1 November 2026 for their first round of checks.",
    source: 'Browne Jacobson',
    url: 'https://www.brownejacobson.com/insights/mandatory-electrical-safety-checks-for-social-housing-tenancies',
    date: '2026-05-01',
  },
  {
    id: 'awaabs-law-prs',
    tag: 'update',
    tagLabel: "Awaab's Law",
    title: "Awaab's Law widens in social housing - private sector still pending",
    summary: "From 30 November 2026, social landlords must fix 7 more hazard types on top of damp and mould. The Renters' Rights Act allows extending this to private landlords, but no start date is confirmed yet.",
    source: 'August',
    url: 'https://www.augustapp.com/blog/awaabs-law-private-landlords',
    date: '2026-11-30',
  },
  {
    id: 'hmo-licensing',
    tag: 'news',
    tagLabel: 'HMO licensing',
    title: 'Smaller HMOs face growing licensing scrutiny',
    summary: 'Over 70 councils now run additional licensing for 3-4 occupant HMOs, on top of mandatory 5+ occupant licensing. Penalties for unlicensed HMOs reach £40,000, plus up to 24 months’ rent reclaimable by tenants.',
    source: 'RealYield',
    url: 'https://www.realyield.co.uk/insights/hmo-licensing-england-2026',
    date: '2026-05-01',
  },
  {
    id: 'right-to-rent-code',
    tag: 'news',
    tagLabel: 'Right to Rent',
    title: 'New Right to Rent Code of Practice from 1 October 2026',
    summary: "The Home Office's 7th-edition code takes effect for tenancies starting on or after 1 October 2026. Checks, methods and penalties are otherwise unchanged.",
    source: 'GOV.UK',
    url: 'https://www.gov.uk/government/publications/right-to-rent-landlords-code-of-practice/code-of-practice-for-landlords-and-their-agents-the-right-to-rent-scheme-for-landlords-and-their-agents-1-october-2026',
    date: '2026-10-01',
  },
]
