'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function SignupPage() {
  const { signup, isLoading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)
    clearError()
    setSuccess(false)

    // Validation
    if (!email || !password || !firstName || !lastName) {
      setLocalError('Please fill in all fields')
      return
    }

    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address')
      return
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters')
      return
    }

    try {
      await signup(email, password, firstName, lastName)
      setSuccess(true)
      // Clear form
      setEmail('')
      setPassword('')
      setFirstName('')
      setLastName('')
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    }
  }

  const displayError = localError || error

  // Success state
  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500 bg-opacity-20 border-2 border-green-400 rounded-full flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Check Your Email</h1>
              <p className="text-muted-foreground">
                We&apos;ve sent a verification link to your email address.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-muted border border-border rounded-lg p-4 mb-6">
              <p className="text-foreground text-sm leading-relaxed">
                Please check your inbox and click the verification link to activate your account.
                If you don&apos;t see the email, check your spam folder.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full px-4 py-3 bg-primary hover:bg-primary/90 text-foreground font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg text-center"
              >
                Go to Login
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="w-full px-4 py-3 bg-border hover:bg-opacity-20 text-foreground font-medium rounded-lg transition-all border border-input"
              >
                Sign Up Another Account
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 text-center text-muted-foreground text-sm">
            <p>The verification link will expire in 24 hours</p>
          </div>
        </div>
      </main>
    )
  }

  // Signup form
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Sign up to get started</p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm font-medium">{displayError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-border border border-input rounded-lg text-foreground placeholder-muted-foreground placeholder-opacity-50 focus:outline-none focus:border-opacity-40 focus:bg-opacity-20 transition-all disabled:opacity-50"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-border border border-input rounded-lg text-foreground placeholder-muted-foreground placeholder-opacity-50 focus:outline-none focus:border-opacity-40 focus:bg-opacity-20 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-border border border-input rounded-lg text-foreground placeholder-muted-foreground placeholder-opacity-50 focus:outline-none focus:border-opacity-40 focus:bg-opacity-20 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-border border border-input rounded-lg text-foreground placeholder-muted-foreground placeholder-opacity-50 focus:outline-none focus:border-opacity-40 focus:bg-opacity-20 transition-all disabled:opacity-50"
              />
              <p className="mt-2 text-xs text-muted-foreground text-opacity-60">
                Must be at least 8 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-foreground font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Terms */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary hover:text-muted-foreground transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:text-muted-foreground transition-colors">
              Privacy Policy
            </a>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-3 text-muted-foreground text-sm">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Footer Links */}
          <div className="text-center">
            <span className="text-muted-foreground text-sm">Already have an account? </span>
            <Link
              href="/auth/login"
              className="text-primary hover:text-muted-foreground transition-colors text-sm font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-muted-foreground text-sm">
          <p>Protected by enterprise-grade security</p>
        </div>
      </div>
    </main>
  )
}
