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
    getCollaborators,
    removeCollaborator,
    updateCollaboratorScope,
  }
}
