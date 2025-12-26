'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  // Countdown timer for redirect
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (success && countdown === 0) {
      router.push('/auth/login')
    }
  }, [success, countdown, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
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
              <div className="w-16 h-16 bg-green-500 bg-opacity-20 border-2 border-green-400 rounded-full flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Password Reset Successfully!</h1>
              <p className="text-purple-200">Your password has been updated</p>
            </div>

            {/* Success Message */}
            <div className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg p-4 mb-6">
              <p className="text-white text-sm leading-relaxed text-center">
                You can now sign in with your new password
              </p>
            </div>

            {/* Countdown */}
            <div className="text-center mb-6">
              <p className="text-purple-200 text-sm">
                Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>

            {/* Actions */}
            <Link
              href="/auth/login"
              className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg text-center"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Error state (no token)
  if (!token) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Error Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-white border-opacity-20 shadow-xl">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500 bg-opacity-20 border-2 border-red-400 rounded-full flex items-center justify-center">
                <span className="text-4xl">✕</span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Invalid Reset Link</h1>
              <p className="text-purple-200">This password reset link is not valid</p>
            </div>

            {/* Error Message */}
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4 mb-6">
              <p className="text-red-200 text-sm leading-relaxed">
                The reset link is missing or invalid. Please request a new password reset.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/auth/forgot-password"
                className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg text-center"
              >
                Request New Reset Link
              </Link>
              <Link
                href="/auth/login"
                className="block w-full px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium rounded-lg transition-all border border-white border-opacity-20 text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Reset password form
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-white border-opacity-20 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-purple-200">Enter your new password</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40 rounded-lg">
              <p className="text-red-200 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 placeholder-opacity-50 focus:outline-none focus:border-opacity-40 focus:bg-opacity-20 transition-all disabled:opacity-50"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 placeholder-opacity-50 focus:outline-none focus:border-opacity-40 focus:bg-opacity-20 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password Requirements */}
            <div className="bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-30 rounded-lg p-3">
              <p className="text-purple-200 text-xs font-medium mb-1">Password requirements:</p>
              <ul className="text-purple-200 text-xs space-y-1">
                <li className="flex items-center">
                  <span className={newPassword.length >= 8 ? 'text-green-400' : 'text-purple-300'}>
                    {newPassword.length >= 8 ? '✓' : '○'}
                  </span>
                  <span className="ml-2">At least 8 characters</span>
                </li>
                <li className="flex items-center">
                  <span className={newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-400' : 'text-purple-300'}>
                    {newPassword === confirmPassword && newPassword.length > 0 ? '✓' : '○'}
                  </span>
                  <span className="ml-2">Passwords match</span>
                </li>
              </ul>
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
                  Resetting password...
                </span>
              ) : (
                'Reset Password'
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
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-white text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p>Loading...</p>
        </div>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
