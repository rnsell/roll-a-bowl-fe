'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Roll a Bowl</h1>
          <Button asChild variant="default">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-4">Welcome to Roll a Bowl</h2>
          <p className="text-xl text-muted-foreground mb-8"> Simple Fast and Tasty Bowls </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="text-3xl mb-4">🔐</div>
              <CardTitle className="text-foreground">Secure Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Bearer tokens (tenant-level) and User JWTs managed server-side. No tokens exposed to frontend.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="text-3xl mb-4">📊</div>
              <CardTitle className="text-foreground">GraphQL Proxy</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Type-safe GraphQL queries with auto-generated React hooks. Full schema introspection.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="text-3xl mb-4">⚡</div>
              <CardTitle className="text-foreground">Auto Token Refresh</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Bearer tokens automatically refresh 5 minutes before expiry. Transparent to application.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <Card className="border-border mb-16 shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground text-2xl">🚀 Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">1. Login</h4>
                <p className="text-muted-foreground mb-4">
                  Use your credentials created by the setup script to log in.
                </p>
                <Button asChild variant="default">
                  <Link href="/auth/login">Go to Login →</Link>
                </Button>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">2. API Key</h4>
                <p className="text-muted-foreground mb-4">
                  Your API key is configured in <code className="bg-muted px-2 py-1 rounded text-sm">.env.local</code>
                </p>
                <code className="block bg-muted p-4 rounded text-sm text-foreground break-all font-mono">
                  API_KEY=637a701b768b6aeccd9814e60f1e48b9
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Info */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground text-2xl">🏗️ Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start gap-4">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <h4 className="font-semibold text-foreground">Frontend (React)</h4>
                  <p>httpOnly session cookie, no tokens visible to JavaScript</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <h4 className="font-semibold text-foreground">Next.js BFF</h4>
                  <p>Authenticates requests, manages bearer token, proxies to backend</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <h4 className="font-semibold text-foreground">Backend API</h4>
                  <p>Event Directory API with GraphQL and REST endpoints</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-20 py-8 text-center text-muted-foreground">
        <Separator className="mb-8 border-border" />
        <p>Enterprise-grade security • Type-safe • Production-ready</p>
      </div>
    </main>
  )
}
