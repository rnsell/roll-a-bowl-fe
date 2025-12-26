/**
 * API Client Wrapper
 *
 * Configured instance of the auto-generated API client with
 * automatic Bearer token management via ApiTokenManager
 */

import { V1 } from './V1'
import { createAuthenticatedAxiosClient } from '../create-axios-client'
import { apiClient } from '@/lib/config/api-client'

// Get API key from environment
const apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || ''

// Create authenticated axios client with token manager
const { axiosInstance, tokenManager } = createAuthenticatedAxiosClient({
  apiKey,
  baseURL: apiClient.baseUrl,
  timeout: apiClient.timeout,
})

/**
 * Configured API client instance with automatic Bearer token management
 * All methods automatically include the Bearer token in requests
 */
export const api = new V1({
  baseURL: apiClient.baseUrl,
})

// Use our authenticated axios instance
api.instance = axiosInstance

/**
 * Export token manager for advanced use cases
 * (e.g., GraphQL proxy that needs direct token access)
 */
export { tokenManager }

export default api
