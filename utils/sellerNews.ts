// Shared legislation & news dataset for sellers — same pattern as
// utils/landlordNews.ts (see that file's own comment for why this is a
// curated snapshot, not a live feed). Every item here was researched
// live and links to its real, current source.
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
  /** Topic-specific icon (public/op-icons/...) — every item gets its own,
      rather than sharing one of 3 generic tag icons, so the rail/list
      is scannable by picture, not just by color. */
  icon: string
}

export const SELLER_NEWS_ITEMS: NewsItem[] = [
  {
    id: 'home-buying-selling-roadmap',
    tag: 'law',
    tagLabel: 'Reform roadmap',
    title: 'Government publishes Home Buying and Selling Reform roadmap',
    summary: 'A "once-in-a-generation" overhaul: mandatory upfront sales packs (condition report, leasehold costs, chain status) before a property can be listed, plus digital property logbooks, digital ID checks and e-signatures.',
    source: 'MHCLG',
    url: 'https://questions-statements.parliament.uk/written-statements/detail/2026-06-22/hlws134',
    date: '2026-06-19',
    featured: true,
    icon: '/op-icons/investment/signpost.png',
  },
  {
    id: 'ta6-6th-edition',
    tag: 'update',
    tagLabel: 'Conveyancing forms',
    title: 'New TA6 property information form now compulsory',
    summary: "The Law Society's 6th edition TA6 replaced the old 4th/5th edition forms for any solicitor instructed from 30 March 2026 - streamlined from 25 sections to 15, but expect buyers' solicitors to ask for more detail earlier in the process.",
    source: 'The Law Society',
    url: 'https://www.lawsociety.org.uk/topics/property/ta6-6th-edition',
    date: '2026-03-30',
    icon: '/op-icons/investment/clipboardChecklist.png',
  },
  {
    id: 'material-information-scrutiny',
    tag: 'update',
    tagLabel: 'Material information',
    title: 'Trading Standards tightens scrutiny of listing "material information"',
    summary: "Part A (price, tenure, council tax), Part B (property type, utilities, parking) and Part C (flood risk, covenants, building safety) must all be disclosed before a listing goes live. The duty has applied since the DMCC Act 2024 - a 2026 Code of Practice raises how closely it's checked.",
    source: 'National Trading Standards',
    url: 'https://www.nationaltradingstandards.uk/news/full-material-information-guidance-published/',
    date: '2025-10-01',
    icon: '/op-icons/misc/eye.png',
  },
  {
    id: 'ground-rent-cap-draft',
    tag: 'news',
    tagLabel: 'Leasehold reform',
    title: 'Draft bill proposes capping ground rent at £250 a year',
    summary: "The Commonhold and Leasehold Reform Bill, published in draft on 27 January 2026, would cap existing ground rents at £250 pa (reducing to a peppercorn after 40 years) for pre-2022 leases. Not yet law - commencement isn't expected before late 2028.",
    source: 'HomeOwners Alliance',
    url: 'https://hoa.org.uk/advice/guides-for-homeowners/for-owners/leasehold-reform/',
    date: '2026-01-27',
    icon: '/op-icons/investment/moneyBagPound.png',
  },
]
