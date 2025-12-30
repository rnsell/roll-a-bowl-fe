'use client'

/**
 * Configuration Providers
 * 
 * React context providers for accessing configuration values.
 * 
 * - PublicConfigProvider: Safe for client-side use, only exposes public values
 * - PrivateConfigProvider: Server-only, contains sensitive configuration
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { clientConfig, type ClientConfig } from './config'

// ============================================================================
// PUBLIC CONFIG PROVIDER (Client-Safe)
// ============================================================================

const PublicConfigContext = createContext<ClientConfig | null>(null)

export interface PublicConfigProviderProps {
  children: ReactNode
  config?: ClientConfig // Allow override for testing
}

/**
 * Public Configuration Provider
 * 
 * Provides access to client-safe configuration values.
 * Safe to use in any React component (client or server).
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const config = usePublicConfig()
 *   return <div>{config.appName}</div>
 * }
 * ```
 */
export function PublicConfigProvider({ 
  children, 
  config: overrideConfig 
}: PublicConfigProviderProps) {
  const config: ClientConfig = overrideConfig || clientConfig
  
  return (
    <PublicConfigContext.Provider value={config}>
      {children}
    </PublicConfigContext.Provider>
  )
}

/**
 * Hook to access public configuration
 * 
 * @throws Error if used outside PublicConfigProvider
 */
export function usePublicConfig(): ClientConfig {
  const config = useContext(PublicConfigContext)
  
  if (!config) {
    throw new Error('usePublicConfig must be used within PublicConfigProvider')
  }
  
  return config
}

// ============================================================================
// PRIVATE CONFIG PROVIDER (Server-Only)
// ============================================================================

/**
 * Private Configuration Provider
 * 
 * ⚠️ WARNING: This provider should ONLY be used in Server Components or API routes.
 * It contains sensitive configuration that should never be exposed to the client.
 * 
 * For client components, use PublicConfigProvider instead.
 * 
 * This is a placeholder - actual private config should be accessed directly
 * from @/lib/config in server-side code, not through a React context.
 */
export function PrivateConfigProvider({ children }: { children: ReactNode }) {
  // In a real implementation, this would only work server-side
  // For now, we'll just pass through children
  // Private config should be accessed directly via imports in server code
  
  if (typeof window !== 'undefined') {
    console.warn(
      'PrivateConfigProvider should not be used in client components. ' +
      'Use PublicConfigProvider or access config directly in server code.'
    )
  }
  
  return <>{children}</>
}

/**
 * Hook to access private configuration
 * 
 * ⚠️ WARNING: This should only be used in Server Components.
 * For client components, use usePublicConfig() instead.
 * 
 * @throws Error if used in client components
 */
export function usePrivateConfig() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'usePrivateConfig cannot be used in client components. ' +
      'Use usePublicConfig() instead, or access config directly in server code.'
    )
  }
  
  // In server components, you should import config directly:
  // import { config } from '@/lib/config'
  // This hook is mainly for type safety and documentation
  throw new Error(
    'usePrivateConfig should not be used. ' +
    'Import config directly: import { config } from "@/lib/config"'
  )
}

