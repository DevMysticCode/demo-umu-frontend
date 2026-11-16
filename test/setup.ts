import { vi, beforeEach } from 'vitest'
import { getToken, setToken, clearToken } from '../composables/useAuthToken'
import { clearSessionFlag, setSessionFlag } from '../composables/useSessionFlag'

// Stand-ins for Nuxt's auto-imports (see vitest.config.ts for why).
// getToken/setToken/clearToken/clearSessionFlag/setSessionFlag are
// stubbed to the REAL implementations (not re-mocked state) so a test
// that imports useAuthToken directly and a composable's bare
// auto-imported call both read/write the same underlying store.
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('useRuntimeConfig', () => ({
  public: { apiBase: 'https://api.test.local' },
}))
vi.stubGlobal('getToken', getToken)
vi.stubGlobal('setToken', setToken)
vi.stubGlobal('clearToken', clearToken)
vi.stubGlobal('clearSessionFlag', clearSessionFlag)
vi.stubGlobal('setSessionFlag', setSessionFlag)

beforeEach(() => {
  setToken('test-access-token')
  ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockReset()
})
