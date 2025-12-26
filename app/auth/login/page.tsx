'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const { login, isLoading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    // Validation
    if (!email || !password) {
      setLocalError('Please fill in all fields')
      return
    }

    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address')
      return
    }

    try {
      await login(email, password)
      // Use window.location for hard redirect to ensure cookie is included
      window.location.href = redirect
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  const displayError = localError || error

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-white border-opacity-20 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-purple-200">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40 rounded-lg">
              <p className="text-red-200 text-sm font-medium">{displayError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 placeholder-opacity-50 focus:outline-none focus:border-opacity-40 focus:bg-opacity-20 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 placeholder-opacity-50 focus:outline-none focus:border-opacity-40 focus:bg-opacity-20 transition-all disabled:opacity-50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-white bg-opacity-10"></div>
            <span className="px-3 text-white text-opacity-50 text-sm">or</span>
            <div className="flex-1 h-px bg-white bg-opacity-10"></div>
          </div>

          {/* Footer Links */}
          <div className="space-y-3 text-center">
            <div>
              <Link
                href="/auth/forgot-password"
                className="text-purple-300 hover:text-purple-200 transition-colors text-sm"
              >
                Forgot your password?
              </Link>
            </div>
            <div>
              <span className="text-white text-opacity-60 text-sm">Don&apos;t have an account? </span>
              <Link
                href="/auth/signup"
                className="text-purple-300 hover:text-purple-200 transition-colors text-sm font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-white text-opacity-60 text-sm">
          <p>Protected by enterprise-grade security</p>
        </div>
      </div>
    </main>
  )
}
