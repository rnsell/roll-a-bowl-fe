/**
 * API Client Configuration
 * 
 * Provides type-safe configuration for API client initialization.
 */

import { config } from './private/config'

export interface ApiClientConfig {
  baseUrl: string
  timeout: number
  headers?: Record<string, string>
  retries?: number
  retryDelay?: number
}

/**
 * Get API client configuration
 * Can be used by REST client, GraphQL client, etc.
 */
export const apiClient: ApiClientConfig = {
  baseUrl: config.apiBaseUrl,
  timeout: config.apiRequestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
  retries: 3,
  retryDelay: 1000, // 1 second
}

/**
 * Get API URL for a specific endpoint
 */
export function getApiUrl(endpoint: string): string {
  return `${apiClient.baseUrl}${endpoint}`
}

/**
 * Get auth endpoint URL
 */
export function getAuthUrl(path: string): string {
  return getApiUrl(`/auth${path}`)
}

/**
 * Get GraphQL endpoint URL
 */
export function getGraphQLUrl(): string {
  return getApiUrl('/graphql')
}
