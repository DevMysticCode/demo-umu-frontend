// Vault rebuild (client mockup, 2 Oct 2026) - thin wrappers over the
// extended /documents endpoints (see umu-backend DocumentsController).
// Icons are the app's existing 3D illustration set (/public/op-icons/),
// reused from wherever a matching one already existed rather than adding
// new flat/emoji icons.
export const VAULT_CATEGORIES = [
  { key: 'property_information', label: 'Property information', icon: '/op-icons/investment/house.png' },
  { key: 'ownership_legal', label: 'Ownership & legal', icon: '/op-icons/yourDocuments/legal.jpeg' },
  { key: 'energy_utilities', label: 'Energy & utilities', icon: '/op-icons/yourDocuments/energy.jpeg' },
  { key: 'compliance', label: 'Compliance', icon: '/op-icons/calendar/shield.png' },
  { key: 'improvements_maintenance', label: 'Improvements & maintenance', icon: '/op-icons/misc/wrench.png' },
  { key: 'appliances_warranties', label: 'Appliances & warranties', icon: '/op-icons/investment/armchair.png' },
  { key: 'manuals', label: 'Manuals', icon: '/op-icons/misc/book.png' },
  { key: 'photos', label: 'Photos', icon: '/op-icons/misc/camera.png' },
]

// Visibility picker icons, shared by the document-detail page and the
// category list's visibility pills. ELIGIBLE added 2026-10-06: the backend's
// DocumentAccessLevel has always had 4 tiers, but this app's vault UI only
// ever offered 3 (no way to pick "include when I share" as its own tier,
// separate from "public"), so a document set to ELIGIBLE elsewhere (e.g. one
// of the other two frontends, which do offer it) rendered with no icon and
// its raw enum name as the label here.
export const VAULT_VISIBILITY_ICON: Record<string, string> = {
  PRIVATE: '/op-icons/investment/padlock.png',
  SELECTED: '/op-icons/profile/collaborators.jpeg',
  ELIGIBLE: '/op-icons/passportview/pendingCircle.svg',
  PUBLISHED: '/op-icons/misc/globe.png',
}

export const useVault = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const getOverview = (passportId: string) =>
    $fetch(`${base}/documents/passport/${passportId}/vault-overview`, { headers: getHeaders() })

  const getCategoryDocuments = (passportId: string, category: string, scope: 'property' | 'private') =>
    $fetch(`${base}/documents/passport/${passportId}/vault-category/${category}`, {
      headers: getHeaders(),
      query: { scope },
    })

  const getSharedWithMe = () =>
    $fetch(`${base}/documents/shared-with-me`, { headers: getHeaders() })

  const getDocumentDetail = (documentId: string) =>
    $fetch(`${base}/documents/${documentId}/detail`, { headers: getHeaders() })

  const updateDocumentMeta = (
    documentId: string,
    opts: { name?: string; category?: string | null; passportId?: string | null },
  ) =>
    $fetch(`${base}/documents/${documentId}/meta`, {
      method: 'POST',
      headers: getHeaders(),
      body: opts,
    })

  const setDocumentAccess = (documentId: string, accessLevel: 'PRIVATE' | 'SELECTED' | 'ELIGIBLE' | 'PUBLISHED') =>
    $fetch(`${base}/documents/user/${documentId}/access`, {
      method: 'POST',
      headers: getHeaders(),
      body: { accessLevel },
    })

  // Grants a specific collaborator access to a SELECTED-tier document.
  // This app's vault only ever deals in personal UserDocuments (never the
  // QuestionAnswer evidence files the other two frontends also show under
  // "Home records" - see the backend's mapAnswerDocs), so the :kind
  // segment is always 'user' here.
  const addDocumentGrant = (documentId: string, collaboratorUserId: string) =>
    $fetch(`${base}/documents/user/${documentId}/grants`, {
      method: 'POST',
      headers: getHeaders(),
      body: { collaboratorUserId },
    })

  const removeDocumentGrant = (documentId: string, collaboratorUserId: string) =>
    $fetch(`${base}/documents/user/${documentId}/grants/${collaboratorUserId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

  const uploadDocument = (file: File, opts: { name?: string; category?: string; passportId?: string }) => {
    const form = new FormData()
    form.append('file', file)
    if (opts.name) form.append('name', opts.name)
    if (opts.category) form.append('category', opts.category)
    if (opts.passportId) form.append('passportId', opts.passportId)
    return $fetch(`${base}/documents`, { method: 'POST', headers: getHeaders(), body: form })
  }

  return {
    getOverview,
    getCategoryDocuments,
    getSharedWithMe,
    getDocumentDetail,
    updateDocumentMeta,
    setDocumentAccess,
    addDocumentGrant,
    removeDocumentGrant,
    uploadDocument,
  }
}
