// Hand-written, one-line "what belongs here" explanations for the guided
// tour's per-section steps on every passport view (seller, buyer, landlord).
//
// Deliberately NOT sourced from PassportSection.subtitle/description -
// several of those (guaranteesAndWarranties, parking, otherCharges,
// insurance, environmental, occupiers) share the exact same leftover
// placeholder text ("Your property protection is building up!"), because
// that field was written for a different UI (a progress nudge), not a
// tour explanation. Client feedback: write real, section-specific copy
// instead of reusing that field. Keyed by PassportSection.key so any page
// can look a section up directly - the buyer passport view can show
// either a seller's or a landlord's sections depending on what was
// purchased, so both sets live in one shared map.
export const SECTION_TOUR_COPY: Record<string, string> = {
  // ── Seller passport (18 templates) ──
  ownershipProfile: "Who owns the property and how it's held - freehold, leasehold, or through a company.",
  boundaries: "Where your boundaries actually sit, and who's responsible for which fence, wall or hedge.",
  disputesAndComplaints: 'Any disputes, complaints or legal proceedings involving the property or your neighbours.',
  noticesAndProposals: 'Planning notices, compulsory purchase orders or development proposals affecting the property.',
  alterationsAndPlanning: "Extensions, conversions or other alterations you've made - and the planning permission or building regs sign-off behind them.",
  guaranteesAndWarranties: 'Warranties and guarantees still running - damp-proofing, roofing, boiler, NHBC and the like.',
  insurance: "Your buildings insurance details, and any past claims a buyer's insurer will want to know about.",
  environmental: 'Flood risk, contaminated land, radon and other environmental factors affecting the property.',
  rightsAndInformalArrangements: "Rights of way, shared access, or informal arrangements with neighbours that aren't written into the deeds.",
  parking: 'How the property is parked - an allocated space, a permit, or a shared arrangement.',
  otherCharges: 'Service charges, ground rent, or any other recurring charge tied to the property.',
  occupiers: 'Everyone aged 17 or over living at the property, so a buyer knows who needs to vacate on completion.',
  services: 'Gas, electricity, water and drainage - where they connect and who supplies them.',
  transactionInformation: 'Your completion timeline, chain status, and anything else about how you want the sale to run.',
  fixturesAndFittings: "What's included in the sale and what you're taking with you - the standard TA10 list.",
  leasehold: 'Lease length, ground rent, service charge and managing agent details, if the property is leasehold.',
  titleDeedsAndPlan: 'Your official Land Registry title and plan, confirming exactly what you own.',
  searches: "Local authority, water and environmental searches a buyer's solicitor will need.",

  // ── Landlord passport (13 templates) ──
  landlord_gas_safety: 'Your annual CP12 gas safety record - required every 12 months if the property has gas appliances.',
  landlord_eicr: "The five-yearly electrical safety report (EICR) for the property's fixed wiring.",
  landlord_epc: 'Your Energy Performance Certificate - lets need a minimum E rating.',
  landlord_alarms: 'Smoke and carbon monoxide alarms - where each one is, and when it was last tested.',
  landlord_legionella: 'Your water-system risk assessment for Legionella, reviewed periodically.',
  landlord_insurance: 'Buildings and landlord liability cover for the property.',
  landlord_ast: 'The signed tenancy agreement setting out the terms you and your tenant agreed.',
  landlord_deposit: 'Proof the deposit is protected in a government-backed scheme - DPS, mydeposits or TDS.',
  landlord_right_to_rent: 'ID checks confirming every adult occupier has the right to rent in the UK.',
  landlord_how_to_rent: "Confirmation you've given the tenant the current 'How to Rent' guide - required before you can serve notice.",
  landlord_inventory: 'The move-in condition report - your baseline evidence if there is ever a deposit dispute.',
  landlord_pat_testing: 'Portable appliance testing records - best practice for HMOs and shared properties.',
  landlord_white_goods: 'Manuals, warranties and breakdown cover for any appliances you provide.',
}

/**
 * Tour-step body text for a passport section. Falls back to the section's
 * own subtitle/description (still better than nothing for a key not yet
 * in the map above - e.g. a brand-new template), then a generic line.
 */
export function sectionTourBody(section: {
  key?: string
  subtitle?: string
  description?: string
}): string {
  return (
    (section.key && SECTION_TOUR_COPY[section.key]) ||
    section.subtitle ||
    section.description ||
    'Tap to view and complete this section.'
  )
}
