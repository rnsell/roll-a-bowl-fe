'use client'

import { AuthProvider } from '@/hooks/useAuth'
import { ApolloWrapper } from '@/lib/graphql/provider'
import { PublicConfigProvider } from '@/lib/config/public/providers'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PublicConfigProvider>
      <ApolloWrapper>
        <AuthProvider>{children}</AuthProvider>
      </ApolloWrapper>
    </PublicConfigProvider>
  )
}
