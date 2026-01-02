'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Roll a Bowl
        </h1>

        {/* Coming Soon Message */}
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
          Coming Soon
        </h2>
        <p className="text-xl text-muted-foreground mb-12">
          We&apos;re working on something amazing. Stay tuned!
        </p>

        {/* Sign In Button */}
        <Button asChild variant="default" size="lg">
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    </main>
  )
}
