export interface RecentlyExploredEntry {
  id: string
  addressLine1: string
  postcode: string | null
  city: string | null
  estimatedPrice: number | null
  lastSoldPrice: number | null
  lastSoldDate: string | null
  image: string | null
  viewedAt: number
}

const STORAGE_KEY = 'umu.recentlyExplored'
const MAX_ENTRIES = 10

function readAll(): RecentlyExploredEntry[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(entries: RecentlyExploredEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* storage full / disabled - fine, just don't persist */
  }
}

export function useRecentlyExplored() {
  function getRecentlyExplored(): RecentlyExploredEntry[] {
    return readAll()
  }

  // Called from the property detail page once it has real data — dedupes
  // by id (moves the entry to the front rather than duplicating it) and
  // caps the list so it doesn't grow unbounded in localStorage.
  function recordExplored(entry: Omit<RecentlyExploredEntry, 'viewedAt'>) {
    if (typeof localStorage === 'undefined') return
    const existing = readAll().filter((e) => e.id !== entry.id)
    const next = [{ ...entry, viewedAt: Date.now() }, ...existing].slice(
      0,
      MAX_ENTRIES,
    )
    writeAll(next)
  }

  return { getRecentlyExplored, recordExplored }
}
