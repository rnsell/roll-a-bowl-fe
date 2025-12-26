'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black bg-opacity-50 backdrop-blur-md border-b border-white border-opacity-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Tenant Frontend BFF</h1>
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">Welcome to Your BFF</h2>
          <p className="text-xl text-purple-200 mb-8">
            Backend for Frontend - Secure, type-safe GraphQL proxying with authentication
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-white border-opacity-20 hover:border-opacity-40 transition-all">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Authentication</h3>
            <p className="text-purple-200">
              Bearer tokens (tenant-level) and User JWTs managed server-side. No tokens exposed to frontend.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-white border-opacity-20 hover:border-opacity-40 transition-all">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">GraphQL Proxy</h3>
            <p className="text-purple-200">
              Type-safe GraphQL queries with auto-generated React hooks. Full schema introspection.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-white border-opacity-20 hover:border-opacity-40 transition-all">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Auto Token Refresh</h3>
            <p className="text-purple-200">
              Bearer tokens automatically refresh 5 minutes before expiry. Transparent to application.
            </p>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-white border-opacity-20 mb-16">
          <h3 className="text-2xl font-bold text-white mb-6">🚀 Quick Start</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-purple-300 mb-4">1. Login</h4>
              <p className="text-purple-200 mb-4">
                Use your credentials created by the setup script to log in.
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Go to Login →
              </Link>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-purple-300 mb-4">2. API Key</h4>
              <p className="text-purple-200 mb-4">
                Your API key is configured in <code className="bg-black bg-opacity-50 px-2 py-1 rounded">.env.local</code>
              </p>
              <code className="block bg-black bg-opacity-50 p-4 rounded text-sm text-green-400 break-all">
                API_KEY=637a701b768b6aeccd9814e60f1e48b9
              </code>
            </div>
          </div>
        </div>

        {/* Architecture Info */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-white border-opacity-20">
          <h3 className="text-2xl font-bold text-white mb-6">🏗️ Architecture</h3>
          <div className="space-y-4 text-purple-200">
            <div className="flex items-start gap-4">
              <span className="text-2xl">1️⃣</span>
              <div>
                <h4 className="font-semibold text-white">Frontend (React)</h4>
                <p>httpOnly session cookie, no tokens visible to JavaScript</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">2️⃣</span>
              <div>
                <h4 className="font-semibold text-white">Next.js BFF</h4>
                <p>Authenticates requests, manages bearer token, proxies to backend</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">3️⃣</span>
              <div>
                <h4 className="font-semibold text-white">Backend API</h4>
                <p>Event Directory API with GraphQL and REST endpoints</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white border-opacity-10 mt-20 py-8 text-center text-white text-opacity-60">
        <p>Enterprise-grade security • Type-safe • Production-ready</p>
      </div>
    </main>
  )
}
