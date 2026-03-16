const BASE_URL = 'http://localhost:3002';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface DocumentItem {
  id: string;
  title: string;
  fileUrl: string;
  size: string;
  mimeType: string;
  tags: string[];
  passportId?: string;
  passportAddress?: string;
  expiresAt?: string | null;
  uploadedAt: string;
  source: 'passport' | 'user';
}

export interface DocumentsResponse {
  passportDocuments: DocumentItem[];
  userDocuments: DocumentItem[];
  recentUploads: DocumentItem[];
}

export function useDocuments() {
  const documents = ref<DocumentsResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchDocuments() {
    loading.value = true;
    error.value = null;
    try {
      documents.value = await $fetch<DocumentsResponse>(`${BASE_URL}/documents`, {
        headers: getAuthHeaders(),
      });
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to load documents';
    } finally {
      loading.value = false;
    }
  }

  async function uploadDocument(
    file: File,
    name: string,
    tags: string[],
    expiresAt?: string,
  ): Promise<DocumentItem> {
    const form = new FormData();
    form.append('file', file);
    form.append('name', name);
    if (tags.length) form.append('tags', tags.join(','));
    if (expiresAt) form.append('expiresAt', expiresAt);

    const doc = await $fetch<DocumentItem>(`${BASE_URL}/documents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: form,
    });

    // Prepend to local state
    if (documents.value) {
      documents.value.userDocuments.unshift(doc);
      documents.value.recentUploads.unshift(doc);
      if (documents.value.recentUploads.length > 5) {
        documents.value.recentUploads = documents.value.recentUploads.slice(0, 5);
      }
    }

    return doc;
  }

  async function deleteDocument(id: string) {
    await $fetch(`${BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (documents.value) {
      documents.value.userDocuments = documents.value.userDocuments.filter(
        (d) => d.id !== id,
      );
      documents.value.recentUploads = documents.value.recentUploads.filter(
        (d) => d.id !== id,
      );
    }
  }

  return { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument };
}
