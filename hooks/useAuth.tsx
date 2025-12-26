'use client'

/**
 * useAuth Hook
 * 
 * Provides authentication state management and methods.
 * Handles login, logout, user data fetching, and loading/error states.
 */

import { useState, useCallback, useEffect, useContext, createContext } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  emailVerified: boolean
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  clearError: () => void
}

// ============================================================================
// CONTEXT
// ============================================================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =========================================================================
  // LOGIN
  // =========================================================================

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // =========================================================================
  // SIGNUP
  // =========================================================================

  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Signup failed')
      }

      // Signup successful - don't set user yet (email needs verification)
      // The response contains the user data but we won't log them in
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // =========================================================================
  // LOGOUT
  // =========================================================================

  const logout = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Logout failed')
      }

      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // =========================================================================
  // FETCH USER
  // =========================================================================

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null)
          return
        }
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch user')
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // =========================================================================
  // CLEAR ERROR
  // =========================================================================

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // =========================================================================
  // INITIALIZE
  // =========================================================================

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // =========================================================================
  // RENDER
  // =========================================================================

  const contextData: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    signup,
    logout,
    fetchUser,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  )
}
