// Client-side auth helper (no backend). Stores the current demo session in
// sessionStorage so the role can be read across pages/components.

import type { UserRole } from './seed-data'

const ROLE_KEY = 'userRole'
const NAME_KEY = 'userName'
const EMAIL_KEY = 'userEmail'
const STORE_ID_KEY = 'userStoreId'

export const ALL_ROLES: UserRole[] = ['Administrator', 'Store Manager', 'Seller']

export interface Session {
  role: UserRole
  name: string
  email: string
  storeId: number | null
}

export function setSession(session: Session) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(ROLE_KEY, session.role)
  sessionStorage.setItem(NAME_KEY, session.name)
  sessionStorage.setItem(EMAIL_KEY, session.email)
  sessionStorage.setItem(STORE_ID_KEY, session.storeId === null ? '' : String(session.storeId))
}

export function getRole(): UserRole {
  if (typeof window === 'undefined') return 'Seller'
  return (sessionStorage.getItem(ROLE_KEY) as UserRole) || 'Seller'
}

export function getName(): string {
  if (typeof window === 'undefined') return 'User'
  return sessionStorage.getItem(NAME_KEY) || 'User'
}

export function clearSession() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(ROLE_KEY)
  sessionStorage.removeItem(NAME_KEY)
  sessionStorage.removeItem(EMAIL_KEY)
  sessionStorage.removeItem(STORE_ID_KEY)
}

export function getStoreId(): number | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(STORE_ID_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? null : parsed
}

// Role-based capabilities used to gate UI across the app.
export function can(role: UserRole) {
  return {
    manageInventory: role === 'Administrator' || role === 'Store Manager',
    recordOperations: role === 'Administrator' || role === 'Store Manager',
    createInvoices: role === 'Administrator' || role === 'Store Manager' || role === 'Seller',
    processReturns: role === 'Administrator' || role === 'Store Manager',
    viewFinance: role === 'Administrator' || role === 'Store Manager',
    importExcel: role === 'Administrator' || role === 'Store Manager',
    administer: role === 'Administrator',
    viewAllBranches: role === 'Administrator',
    viewTaxBreakdown: role === 'Administrator',
  }
}
