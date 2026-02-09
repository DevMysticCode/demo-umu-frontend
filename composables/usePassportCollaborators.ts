export const usePassportCollaborators = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const addCollaborator = (passportId: string, email: string) => {
    return $fetch(`${base}/passport/${passportId}/collaborators`, {
      method: 'POST',
      headers: getHeaders(),
      body: { email },
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

  return {
    addCollaborator,
    getCollaborators,
    removeCollaborator,
  }
}
