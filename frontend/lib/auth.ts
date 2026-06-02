// Client-side auth helper (no backend). Stores the current demo session in
// sessionStorage so the role can be read across pages/components.

import type { UserRole } from './seed-data'

const ROLE_KEY = 'userRole'
const NAME_KEY = 'userName'
const EMAIL_KEY = 'userEmail'
const BRANCH_KEY = 'userBranch'

export const ALL_ROLES: UserRole[] = ['Administrator', 'Branch Manager', 'Viewer']

export interface Session {
  role: UserRole
  name: string
  email: string
  branch: string
}

export function setSession(session: Session) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(ROLE_KEY, session.role)
  sessionStorage.setItem(NAME_KEY, session.name)
  sessionStorage.setItem(EMAIL_KEY, session.email)
  sessionStorage.setItem(BRANCH_KEY, session.branch)
}

export function getRole(): UserRole {
  if (typeof window === 'undefined') return 'Viewer'
  return (sessionStorage.getItem(ROLE_KEY) as UserRole) || 'Viewer'
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
  sessionStorage.removeItem(BRANCH_KEY)
}

// Role-based capabilities used to gate UI across the app.
export function can(role: UserRole) {
  return {
    manageInventory: role === 'Administrator' || role === 'Branch Manager',
    recordOperations: role === 'Administrator' || role === 'Branch Manager',
    importExcel: role === 'Administrator' || role === 'Branch Manager',
    administer: role === 'Administrator',
    viewAllBranches: role === 'Administrator',
  }
}
