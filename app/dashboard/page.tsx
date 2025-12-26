'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

/**
 * Dashboard Page
 * Shows basic info about the currently authenticated user.
 * Protected by middleware cookie check + Express session validation on API calls.
 */
export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-white border-opacity-20 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Dashboard</h1>

        {isLoading && (
          <p className="text-purple-200 text-center mb-4">Loading your account...</p>
        )}

        {!isLoading && !isAuthenticated && (
          <p className="text-red-200 text-center mb-4">
            You are not logged in. Please sign in again.
          </p>
        )}

        {!isLoading && isAuthenticated && user && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Account</h2>
              <p className="text-purple-100">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-purple-200 text-sm">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-300 mb-1">Email Verified</h3>
              <p className="text-purple-100">{user.emailVerified ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  )
}
