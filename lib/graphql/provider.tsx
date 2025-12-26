'use client'

/**
 * Apollo Provider Wrapper
 * 
 * Currently not used - Apollo Client is used directly with its query() method.
 * This file can be removed or used if we want to add hooks-based queries later.
 */

import { ReactNode } from 'react'

export function ApolloWrapper({ children }: { children: ReactNode }): ReactNode {
  // Apollo Client is now used directly without a provider wrapper
  return <>{children}</>
}

export default ApolloWrapper
