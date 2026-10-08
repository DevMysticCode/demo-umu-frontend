// Manage Visibility (client definitive handoff, 2 Oct 2026) - a real
// Private/Shared/Public hierarchy spanning Passport -> section -> task ->
// field (the synthetic "Property overview" card only). Owner-only; see
// PassportService.getManageVisibility on the backend for the full shape
// and the effective-visibility computation.
export type VisibilityLevel = 'PRIVATE' | 'SHARED' | 'PUBLIC'

export interface VisibilityField {
  key: string
  label: string
  visibility: VisibilityLevel
  effectiveVisibility: VisibilityLevel
}

export interface VisibilityTask {
  key: string
  title: string
  visibility: VisibilityLevel
  effectiveVisibility: VisibilityLevel
}

export interface VisibilitySection {
  key: string
  title: string
  visibility: VisibilityLevel
  effectiveVisibility: VisibilityLevel
  tasks: VisibilityTask[]
}

export interface ManageVisibility {
  visibility: VisibilityLevel
  propertyOverview: VisibilitySection & { fields: VisibilityField[] }
  sections: VisibilitySection[]
}

export const useManageVisibility = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const getManageVisibility = (passportId: string): Promise<ManageVisibility> =>
    $fetch(`${base}/passport/${passportId}/manage-visibility`, {
      headers: getHeaders(),
    })

  const setPassportVisibility = (passportId: string, visibility: VisibilityLevel) =>
    $fetch(`${base}/passport/${passportId}/manage-visibility`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: { visibility },
    })

  const setSectionVisibility = (
    passportId: string,
    sectionKey: string,
    visibility: VisibilityLevel,
  ) =>
    $fetch(`${base}/passport/${passportId}/manage-visibility/sections/${sectionKey}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: { visibility },
    })

  const setTaskVisibility = (
    passportId: string,
    sectionKey: string,
    taskKey: string,
    visibility: VisibilityLevel,
  ) =>
    $fetch(
      `${base}/passport/${passportId}/manage-visibility/sections/${sectionKey}/tasks/${taskKey}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: { visibility },
      },
    )

  const setFieldVisibility = (
    passportId: string,
    fieldKey: string,
    visibility: VisibilityLevel,
  ) =>
    $fetch(`${base}/passport/${passportId}/manage-visibility/fields/${fieldKey}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: { visibility },
    })

  return {
    getManageVisibility,
    setPassportVisibility,
    setSectionVisibility,
    setTaskVisibility,
    setFieldVisibility,
  }
}
