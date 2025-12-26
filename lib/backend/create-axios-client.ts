/**
 * Authenticated Axios Client Factory
 *
 * Creates axios instances configured with automatic Bearer token management
 * via request interceptors and the ApiTokenManager.
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import { ApiTokenManager } from './api-token-manager'
import { createLogger } from '@/lib/config/logging'

const logger = createLogger('AxiosClient')

export interface AuthenticatedAxiosClient {
  axiosInstance: AxiosInstance
  tokenManager: ApiTokenManager
}

export interface AxiosClientConfig {
  apiKey: string
  baseURL: string
  timeout?: number
}

/**
 * Create an authenticated axios client with automatic Bearer token management
 *
 * @param config - Configuration including API key and base URL
 * @returns Axios instance and token manager
 */
export function createAuthenticatedAxiosClient(config: AxiosClientConfig): AuthenticatedAxiosClient {
  const { apiKey, baseURL, timeout = 30000 } = config

  // Create base axios instance
  const axiosInstance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Create token manager with the axios instance
  const tokenManager = new ApiTokenManager(apiKey, axiosInstance)

  // Setup request interceptor for Bearer token injection
  axiosInstance.interceptors.request.use(
    async (config: any) => {
      const startTime = Date.now()
      config.requestStartTime = startTime

      logger.debug({
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
      }, 'Axios request starting')

      // Skip adding Bearer token to /v1/tenant-auth/token endpoint (needed to get the token!)
      const isTokenExchangeEndpoint = config.url?.includes('/v1/tenant-auth/token')

      // Add Authorization Bearer token for all other requests
      if (!isTokenExchangeEndpoint) {
        try {
          logger.debug({}, 'Getting Bearer token for request')
          const tokenStartTime = Date.now()
          const bearerToken = await tokenManager.getToken()
          const tokenTime = Date.now() - tokenStartTime
          config.headers.Authorization = `Bearer ${bearerToken}`
          logger.debug({
            tokenExchangeTimeMs: tokenTime,
            tokenPrefix: bearerToken.substring(0, 20)
          }, 'Bearer token obtained and added to request')
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          logger.error({ error: errorMsg }, 'Failed to get Bearer token for request')
          throw error
        }
      }

      return config
    },
    (error: any) => {
      const errorMsg = error instanceof Error ? error.message : String(error)
      logger.error({ error: errorMsg }, 'Axios request interceptor error')
      return Promise.reject(error)
    }
  )

  // Setup response interceptor for logging
  axiosInstance.interceptors.response.use(
    (response: any) => {
      const startTime = response.config.requestStartTime || Date.now()
      const duration = Date.now() - startTime
      logger.debug({
        status: response.status,
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        durationMs: duration,
      }, 'Axios response received')
      return response
    },
    (error: AxiosError) => {
      const status = error.response?.status || 0
      const message = (error.response?.data as any)?.message || error.message
      const startTime = (error.config as any)?.requestStartTime || Date.now()
      const duration = Date.now() - startTime
      logger.warn({
        status,
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        durationMs: duration,
        errorMessage: message,
      }, 'Axios request failed')
      return Promise.reject(error)
    }
  )

  return {
    axiosInstance,
    tokenManager,
  }
}
