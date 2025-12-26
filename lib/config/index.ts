/**
 * Configuration Module
 * 
 * Centralized configuration management for the entire application.
 * Provides type-safe access to all configuration values.
 */

export { config, validateConfig } from './env'
export type { EnvironmentConfig } from './env'
export { apiClient } from './api-client'
export { sessionConfig } from './session'
export { storageConfig } from './storage'
export { loggingConfig } from './logging'

// Re-export common utilities
export { getCookieOptions, getSessionConfig, getApiConfig } from './utils'
