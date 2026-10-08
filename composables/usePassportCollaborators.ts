// "view" (read-only), "view_add" (can add info to an unanswered question,
// never change an existing answer), "view_add_update_own" (can also change
// an answer THEY last wrote, never someone else's) - see
// PassportService.checkWriteAccess on the backend for enforcement.
export type CollaboratorPermission = 'view' | 'view_add' | 'view_add_update_own'
// "until_removed" (default - stays until the owner removes them),
// "until_completion" (intent only today - nothing yet revokes access
// automatically when the passport completes/publishes), "specific_date"
// (expiresAt is the actual, enforced cutoff).
export type CollaboratorAccessDuration = 'until_removed' | 'until_completion' | 'specific_date'

export interface CollaboratorOpts {
  role?: string
  sectionKeys?: string[] | null
  // Drill-down from sectionKeys ("Section details" step): { [sectionKey]:
  // taskKey[] }. A section present here is narrowed to only those tasks; a
  // section granted via sectionKeys but absent here keeps every task.
  taskKeys?: Record<string, string[]> | null
  historyAccess?: boolean
  permission?: CollaboratorPermission
  accessDuration?: CollaboratorAccessDuration
  expiresAt?: string | null
}

export const usePassportCollaborators = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const addCollaborator = (
    passportId: string,
    email: string,
    opts?: CollaboratorOpts,
  ) => {
    return $fetch(`${base}/passport/${passportId}/collaborators`, {
      method: 'POST',
      headers: getHeaders(),
      body: { email, ...opts },
    })
  }

  // Step 1 of the interactive add-collaborator flow: look up the typed
  // email before asking for role/access. Returns one of status
  // 'found' | 'not-found' | 'already-collaborator' | 'already-invited' | 'is-owner'.
  const checkCollaboratorEmail = (
    passportId: string,
    email: string,
  ): Promise<{ status: string; firstName?: string | null }> => {
    return $fetch(`${base}/passport/${passportId}/collaborators/check-email`, {
      method: 'POST',
      headers: getHeaders(),
      body: { email },
    })
  }

  // Step 2b: the typed email has no account yet - invite them to join
  // Umovingu. They're added as a collaborator automatically once they
  // sign up with this same email.
  const inviteCollaborator = (
    passportId: string,
    email: string,
    opts?: CollaboratorOpts,
  ) => {
    return $fetch(`${base}/passport/${passportId}/collaborators/invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: { email, ...opts },
    })
  }

  const getCollaborators = (passportId: string) => {
    return $fetch(`${base}/passport/${passportId}/collaborators`, {
      method: 'GET',
      headers: getHeaders(),
    })
  }

  const removeCollaborator = (passportId: string, collaboratorId: string) => {
    return $fetch(
      `${base}/passport/${passportId}/collaborators/${collaboratorId}/remove`,
      {
        method: 'POST',
        headers: getHeaders(),
      },
    )
  }

  // Change an existing collaborator's role/section-scope/history-access
  // (client History handoff, 2026-09-25).
  const updateCollaboratorScope = (
    passportId: string,
    collaboratorId: string,
    opts: CollaboratorOpts,
  ) => {
    return $fetch(
      `${base}/passport/${passportId}/collaborators/${collaboratorId}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: opts,
      },
    )
  }

  return {
    addCollaborator,
    checkCollaboratorEmail,
    inviteCollaborator,
    getCollaborators,
    removeCollaborator,
    updateCollaboratorScope,
  }
}
