'use client'

/**
 * Apollo Provider Wrapper
 * 
 * Provides Apollo Client context to the app for useSuspenseQuery and other hooks
 */

import { ReactNode } from 'react'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from './client'

export function ApolloWrapper({ children }: { children: ReactNode }): ReactNode {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}

export default ApolloWrapper
