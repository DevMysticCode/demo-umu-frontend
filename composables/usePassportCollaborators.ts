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
    opts?: { role?: string; sectionKeys?: string[] | null; historyAccess?: boolean },
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
    opts?: { role?: string; sectionKeys?: string[] | null; historyAccess?: boolean },
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
    opts: { role?: string; sectionKeys?: string[] | null; historyAccess?: boolean },
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
