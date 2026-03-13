const BASE_URL = 'http://localhost:3002';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface UserAddress {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city?: string;
  county?: string;
  postcode: string;
  isCurrent: boolean;
}

export interface UserCompany {
  id: string;
  name: string;
  address?: string;
  companyNumber?: string;
  director?: string;
}

export interface UserSolicitor {
  id: string;
  name: string;
  address?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  reference?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  contactVisible: boolean;
  pushNotifications: boolean;
  emailNewsletter: boolean;
  smsNotifications: boolean;
  createdAt: string;
  addresses: UserAddress[];
  companies: UserCompany[];
  solicitors: UserSolicitor[];
}

export interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Collaborator {
  id: string;
  collaboratorId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  permission?: string;
  accessDuration?: string;
  expiresAt?: string;
  clientAccess?: string;
  allowComms: boolean;
  addedAt: string;
}

export interface AddCollaboratorPayload {
  collaboratorId: string;
  role?: string;
  permission?: string;
  accessDuration?: string;
  expiresAt?: string;
  clientAccess?: string;
  allowComms?: boolean;
}

export function useProfile() {
  const profile = useState<UserProfile | null>('profile', () => null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchProfile() {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<UserProfile>(`${BASE_URL}/profile/me`, {
        headers: getAuthHeaders(),
      });
      profile.value = data;
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to load profile';
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(payload: Partial<UserProfile>) {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<UserProfile>(`${BASE_URL}/profile/me`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: payload,
      });
      profile.value = data;
      return data;
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to update profile';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // ─── Addresses ──────────────────────────────────────────────────────────

  async function createAddress(payload: Omit<UserAddress, 'id'>) {
    const data = await $fetch<UserAddress>(`${BASE_URL}/profile/address`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });
    profile.value?.addresses.push(data);
    return data;
  }

  async function updateAddress(id: string, payload: Partial<UserAddress>) {
    const data = await $fetch<UserAddress>(`${BASE_URL}/profile/address/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: payload,
    });
    if (profile.value) {
      const idx = profile.value.addresses.findIndex((a) => a.id === id);
      if (idx !== -1) profile.value.addresses[idx] = data;
    }
    return data;
  }

  async function deleteAddress(id: string) {
    await $fetch(`${BASE_URL}/profile/address/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (profile.value) {
      profile.value.addresses = profile.value.addresses.filter((a) => a.id !== id);
    }
  }

  // ─── Companies ──────────────────────────────────────────────────────────

  async function createCompany(payload: Omit<UserCompany, 'id'>) {
    const data = await $fetch<UserCompany>(`${BASE_URL}/profile/company`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });
    profile.value?.companies.push(data);
    return data;
  }

  async function updateCompany(id: string, payload: Partial<UserCompany>) {
    const data = await $fetch<UserCompany>(`${BASE_URL}/profile/company/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: payload,
    });
    if (profile.value) {
      const idx = profile.value.companies.findIndex((c) => c.id === id);
      if (idx !== -1) profile.value.companies[idx] = data;
    }
    return data;
  }

  async function deleteCompany(id: string) {
    await $fetch(`${BASE_URL}/profile/company/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (profile.value) {
      profile.value.companies = profile.value.companies.filter((c) => c.id !== id);
    }
  }

  // ─── Solicitors ─────────────────────────────────────────────────────────

  async function createSolicitor(payload: Omit<UserSolicitor, 'id'>) {
    const data = await $fetch<UserSolicitor>(`${BASE_URL}/profile/solicitor`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });
    profile.value?.solicitors.push(data);
    return data;
  }

  async function updateSolicitor(id: string, payload: Partial<UserSolicitor>) {
    const data = await $fetch<UserSolicitor>(`${BASE_URL}/profile/solicitor/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: payload,
    });
    if (profile.value) {
      const idx = profile.value.solicitors.findIndex((s) => s.id === id);
      if (idx !== -1) profile.value.solicitors[idx] = data;
    }
    return data;
  }

  async function deleteSolicitor(id: string) {
    await $fetch(`${BASE_URL}/profile/solicitor/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (profile.value) {
      profile.value.solicitors = profile.value.solicitors.filter((s) => s.id !== id);
    }
  }

  // ─── Collaborators ──────────────────────────────────────────────────────

  async function searchUsers(query: string): Promise<UserSearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    return $fetch<UserSearchResult[]>(`${BASE_URL}/profile/users/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
  }

  async function fetchCollaborators(): Promise<Collaborator[]> {
    return $fetch<Collaborator[]>(`${BASE_URL}/profile/collaborators`, {
      headers: getAuthHeaders(),
    });
  }

  async function addCollaborator(payload: AddCollaboratorPayload): Promise<Collaborator> {
    return $fetch<Collaborator>(`${BASE_URL}/profile/collaborators`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });
  }

  async function removeCollaborator(id: string): Promise<void> {
    await $fetch(`${BASE_URL}/profile/collaborators/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  }

  const fullName = computed(() => {
    if (!profile.value) return '';
    return [profile.value.firstName, profile.value.lastName].filter(Boolean).join(' ') || profile.value.email;
  });

  const memberSince = computed(() => {
    if (!profile.value) return '';
    return new Date(profile.value.createdAt).getFullYear().toString();
  });

  return {
    profile,
    loading,
    error,
    fullName,
    memberSince,
    fetchProfile,
    updateProfile,
    createAddress,
    updateAddress,
    deleteAddress,
    createCompany,
    updateCompany,
    deleteCompany,
    createSolicitor,
    updateSolicitor,
    deleteSolicitor,
    searchUsers,
    fetchCollaborators,
    addCollaborator,
    removeCollaborator,
  };
}
