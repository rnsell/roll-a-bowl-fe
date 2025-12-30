'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Dashboard Page
 * Shows basic info about the currently authenticated user.
 * Protected by middleware cookie check + Express session validation on API calls.
 */
export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth()

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-muted-foreground text-center mb-4">Loading your account...</p>
          )}

          {!isLoading && !isAuthenticated && (
            <p className="text-destructive text-center mb-4">
              You are not logged in. Please sign in again.
            </p>
          )}

          {!isLoading && isAuthenticated && user && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Account</h2>
                <p className="text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Email Verified</h3>
                <p className="text-foreground">{user.emailVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button asChild variant="default">
              <Link href="/">Back Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
