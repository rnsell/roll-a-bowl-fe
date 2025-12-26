'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-white border-opacity-20 shadow-xl">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-purple-500 bg-opacity-20 border-2 border-purple-400 rounded-full flex items-center justify-center">
                <span className="text-4xl">📧</span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-purple-200">
                If an account exists with that email, you will receive a password reset link.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg p-4 mb-6">
              <p className="text-white text-sm leading-relaxed mb-2">
                Please check your inbox and click the password reset link to set a new password.
              </p>
              <p className="text-white text-sm leading-relaxed">
                If you don&apos;t see the email, check your spam folder.
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-3 mb-6">
              <p className="text-yellow-200 text-xs">
                ⏰ The reset link will expire in 24 hours
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg text-center"
              >
                Back to Login
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="w-full px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium rounded-lg transition-all border border-white border-opacity-20"
              >
                Send Another Reset Email
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Request form
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-white border-opacity-20 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-purple-200">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40 rounded-lg">
              <p className="text-red-200 text-sm font-medium">{error}</p>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Sending reset link...
                </span>
              ) : (
                'Send Reset Link'
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
          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-purple-300 hover:text-purple-200 transition-colors text-sm font-medium"
            >
              ← Back to Login
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-white text-opacity-60 text-sm">
          <p>Remember your password? <Link href="/auth/login" className="text-purple-300 hover:text-purple-200">Sign in</Link></p>
        </div>
      </div>
    </main>
  )
}
