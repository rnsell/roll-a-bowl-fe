/**
 * API Token Manager
 *
 * Manages Bearer token (API/tenant-level JWT) lifecycle independently
 * - Automatically refreshes before expiry
 * - Never stored in session (only in memory)
 * - Handles token exchange with API key
 */

import type { AxiosInstance } from 'axios'
import { createLogger } from '@/lib/config/logging'

const logger = createLogger('ApiTokenManager')

export interface TokenExchangeResponse {
  success: true
  token: string
  expiresAt: string
  tenant: {
    id: number
    name: string
    slug: string
  }
}

export class ApiTokenManager {
  private token: string | null = null
  private expiresAt: Date | null = null
  private refreshThresholdMs = 5 * 60 * 1000 // Refresh 5 minutes before expiry
  private refreshPromise: Promise<string> | null = null
  private apiKey: string
  private axiosInstance: AxiosInstance

  constructor(apiKey: string, axiosInstance: AxiosInstance) {
    this.apiKey = apiKey
    this.axiosInstance = axiosInstance
  }

  /**
   * Update the axios instance (useful if recreating the instance)
   */
  setAxiosInstance(axiosInstance: AxiosInstance): void {
    this.axiosInstance = axiosInstance
  }

  /**
   * Get current valid Bearer token, refreshing if necessary
   * Thread-safe: multiple calls won't trigger multiple refresh requests
   */
  async getToken(): Promise<string> {
    // If we have a valid token that doesn't need refresh, return it
    if (this.token && this.expiresAt && !this.needsRefresh()) {
      logger.debug('Using cached Bearer token')
      return this.token
    }

    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      logger.debug('Waiting for Bearer token refresh to complete')
      return this.refreshPromise
    }

    // Otherwise, initiate refresh
    logger.debug('Bearer token refresh needed, exchanging API key')
    this.refreshPromise = this.refreshToken()

    try {
      const token = await this.refreshPromise
      return token
    } finally {
      this.refreshPromise = null
    }
  }

  /**
   * Exchange API key for new Bearer token
   */
  private async refreshToken(): Promise<string> {
    try {
      logger.debug({}, 'Sending token exchange request to /v1/tenant-auth/token')
      const response = await this.axiosInstance.post<TokenExchangeResponse>('/v1/tenant-auth/token', {
        apiKey: this.apiKey,
      })

      logger.debug({ status: response.status }, 'Token exchange response received')

      this.token = response.data.token
      this.expiresAt = new Date(response.data.expiresAt)

      logger.info({ expiresAt: this.expiresAt.toISOString() }, 'Bearer token refreshed')

      return response.data.token
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      logger.error({ error: message }, 'Failed to refresh Bearer token')
      throw error
    }
  }

  /**
   * Check if token needs refresh
   */
  private needsRefresh(): boolean {
    if (!this.expiresAt) {
      return true
    }

    const now = new Date()
    const timeUntilExpiry = this.expiresAt.getTime() - now.getTime()

    return timeUntilExpiry < this.refreshThresholdMs
  }

  /**
   * Check if token is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return true
    }
    return new Date() > this.expiresAt
  }

  /**
   * Clear token (used during logout)
   */
  clear(): void {
    this.token = null
    this.expiresAt = null
    logger.debug('Bearer token cleared')
  }
}
