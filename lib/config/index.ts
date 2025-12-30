/**
 * Configuration Module
 * 
 * Centralized configuration management for the entire application.
 * Provides type-safe access to all configuration values.
 * 
 * - Server-only config: Use `config` from './private/config' (imported directly)
 * - Client-safe config: Use `clientConfig` from './public/config' or PublicConfigProvider
 */

// Server-only configuration (use in server components, API routes, middleware)
export { config, validateConfig } from './private/config'
export type { EnvironmentConfig } from './private/config'

// Client-safe configuration (safe to use in any component)
export { clientConfig, validateClientConfig } from './public/config'
export type { ClientConfig } from './public/config'

// Configuration providers (React context)
export {
  PublicConfigProvider,
  PrivateConfigProvider,
  usePublicConfig,
  usePrivateConfig,
} from './public/providers'
export type { PublicConfigProviderProps } from './public/providers'

// Other config exports
export { apiClient } from './api-client'
export { sessionConfig } from './session'
export { storageConfig } from './storage'
export { loggingConfig } from './logging'

// Re-export common utilities
export { getCookieOptions, getSessionConfig, getApiConfig } from './utils'
