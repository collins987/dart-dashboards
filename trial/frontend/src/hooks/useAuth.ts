"use client"

export interface AuthUser {
  id: string
  name: string
  email: string
}

// Placeholder until the existing SSO integration is wired in.
// Replace the body with the real session lookup (e.g. a call to the SSO-backed
// /me endpoint) without changing the return shape.
export function useAuth(): { user: AuthUser | null; loading: boolean } {
  return { user: null, loading: false }
}
