// Resolution-pathways client (client handoff, 2026-09-29). Thin $fetch
// wrappers over the backend's PathwayController/QuestionController.guidance
// endpoints - see umu-backend/src/passport/pathway.service.ts for what each
// call actually does.
export interface PathwayStepOption {
  label: string
  next: string
  requiresUpload?: boolean
}

export interface PathwayStep {
  id: string
  kind: 'action' | 'question' | 'upload' | 'form' | 'info'
  title: string
  body: string
  time?: string | null
  cost?: string | null
  warning?: string | null
  options: PathwayStepOption[]
}

export interface ResolutionPathway {
  id: string
  name: string
  issue: string
  whyItMatters: string
  timeNow: string
  timeAtSale: string
  checkFirst: string
  startStep: string
  steps: PathwayStep[]
  stopPoint: string | null
  toValidate: string | null
  status: 'draft' | 'conveyancer_reviewed' | 'live'
  contentVersion: number
}

// status is 'IN_PROGRESS' while a journey is open; once it reaches an
// outcome it's either one of the 4 generic codes (RESOLVED/CHECK/FLAG/
// ESCALATE, used by every pathway except the two below) or one of P09's 9
// or P39's 7 fine-grained codes (e.g. 'dispute_mismatch', 'record_held') -
// see umu-backend/src/passport/pathway-outcome-codes.ts, which is also
// where `severity` (the same 4-tier classification, for styling/sorting)
// comes from. Use `severity`, not `status`, to decide a badge colour or
// whether to show the handover panel - `status` is for display copy only.
export type PathwaySeverity = 'RESOLVED' | 'CHECK' | 'FLAG' | 'ESCALATE'

export interface PathwayJourney {
  id: string
  passportId: string
  pathwayId: string
  currentStepId: string
  stepAnswers: Array<{ stepId: string; answerLabel: string; evidenceFileUrls: string[]; timestamp: string }>
  status: 'IN_PROGRESS' | string
  severity?: PathwaySeverity | null
  startedAt: string
  completedAt: string | null
}

// The full structured panel (UMU_278 handoff, 2 Oct 2026) - preferred over
// the flat ownerExplanation/ownerNextStep/etc fields below, which are a
// lossy derived summary kept only for older call sites. See
// umu-backend's QuestionAnswerGuidance.panel comment for the exact shape
// each field comes from.
export interface GuidancePanel {
  title: string | null
  style: string | null
  meaning: string | null
  why_now: string | null
  owner_actions: string[]
  possible_outcomes: Array<{ title: string; explanation: string }>
  evidence: string[]
  time: { preparation?: string; resolution_or_transaction_impact?: string; basis?: string } | string | null
  completion: string | null
  source_ids: string[]
  professional_help: string | null
  transaction_context: string | null
}

export interface AnswerGuidance {
  answerValue: string
  ownerExplanation: string
  ownerNextStep: string | null
  evidenceToAdd: string | null
  timeIfUnresolved: string | null
  panel: GuidancePanel | null
  status: 'draft' | 'conveyancer_reviewed' | 'live'
}

export interface PathwayFlag {
  journeyId: string
  pathwayId: string
  status: string
  severity: PathwaySeverity
  issue: string
  updatedAt: string
}

export const usePathways = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Call right after saving a question's answer, with that same answer
  // value - returns inline guidance for it, and any pathway journey it
  // just opened (or previously opened).
  const getGuidanceAndPathway = (questionId: string, answer: string) => {
    return $fetch<{ guidance: AnswerGuidance | null; journey: PathwayJourney | null; pathway: ResolutionPathway | null }>(
      `${base}/questions/${questionId}/guidance`,
      { method: 'GET', headers: getHeaders(), query: { answer } },
    )
  }

  const startPathway = (passportId: string, pathwayId: string) => {
    return $fetch<PathwayJourney>(`${base}/passport/${passportId}/pathways/${pathwayId}/start`, {
      method: 'POST',
      headers: getHeaders(),
    })
  }

  const getPathwayContent = (passportId: string, pathwayId: string) => {
    return $fetch<ResolutionPathway>(`${base}/passport/${passportId}/pathways/${pathwayId}/content`, {
      headers: getHeaders(),
    })
  }

  const getJourney = (passportId: string, journeyId: string) => {
    return $fetch<{ journey: PathwayJourney; pathway: ResolutionPathway }>(
      `${base}/passport/${passportId}/pathways/journeys/${journeyId}`,
      { headers: getHeaders() },
    )
  }

  const advanceJourney = (
    passportId: string,
    journeyId: string,
    stepId: string,
    answerLabel: string,
    evidenceFileUrls?: string[],
  ) => {
    return $fetch<PathwayJourney>(`${base}/passport/${passportId}/pathways/journeys/${journeyId}/answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: { stepId, answerLabel, evidenceFileUrls },
    })
  }

  const deferJourney = (passportId: string, journeyId: string) => {
    return $fetch<PathwayJourney>(`${base}/passport/${passportId}/pathways/journeys/${journeyId}/defer`, {
      method: 'POST',
      headers: getHeaders(),
    })
  }

  const uploadEvidence = async (passportId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return $fetch<{ fileUrl: string; fileName: string }>(`${base}/passport/${passportId}/pathways/evidence`, {
      method: 'POST',
      headers: getHeaders(),
      body: form,
    })
  }

  const listFlags = (passportId: string) => {
    return $fetch<PathwayFlag[]>(`${base}/passport/${passportId}/pathways/flags`, { headers: getHeaders() })
  }

  const listJourneys = (passportId: string) => {
    return $fetch<PathwayJourney[]>(`${base}/passport/${passportId}/pathways`, { headers: getHeaders() })
  }

  return {
    getGuidanceAndPathway,
    startPathway,
    getPathwayContent,
    getJourney,
    advanceJourney,
    deferJourney,
    uploadEvidence,
    listFlags,
    listJourneys,
  }
}
