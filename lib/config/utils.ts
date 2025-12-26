/**
 * Configuration Utilities
 * 
 * Helper functions for working with configuration.
 */

import { sessionConfig } from './session'
import { apiClient, getAuthUrl, getGraphQLUrl } from './api-client'
import { config } from './env'

/**
 * Get cookie options for Next.js response
 * Use with res.setHeader('Set-Cookie', ...)
 */
export function getCookieOptions(): {
  secure: boolean
  httpOnly: boolean
  sameSite: string
  maxAge: number
  path: string
} {
  return {
    secure: sessionConfig.cookieSecure,
    httpOnly: sessionConfig.cookieHttpOnly,
    sameSite: sessionConfig.cookieSameSite,
    maxAge: sessionConfig.expiryMs / 1000, // Convert to seconds
    path: '/',
  }
}

/**
 * Format cookie string for Set-Cookie header
 */
export function formatCookieHeader(
  name: string,
  value: string,
  options = getCookieOptions()
): string {
  const optionsStr = Object.entries(options)
    .map(([key, val]) => {
      if (key === 'maxAge') return `Max-Age=${val}`
      if (key === 'sameSite') return `SameSite=${val}`
      if (key === 'path') return `Path=${val}`
      if (val === true) return key.charAt(0).toUpperCase() + key.slice(1)
      return null
    })
    .filter(Boolean)
    .join('; ')

  return `${name}=${value}; ${optionsStr}`
}

/**
 * Get session-related configuration
 */
export function getSessionConfig() {
  return {
    cookieName: sessionConfig.cookieName,
    expiryMs: sessionConfig.expiryMs,
    refreshThresholdMs: sessionConfig.refreshThresholdMs,
  }
}

/**
 * Get API-related configuration
 */
export function getApiConfig() {
  return {
    baseUrl: apiClient.baseUrl,
    timeout: apiClient.timeout,
    authUrl: getAuthUrl(''),
    graphqlUrl: getGraphQLUrl(),
  }
}

/**
 * Get all non-sensitive configuration for debugging
 */
export function getConfigDebug(): Record<string, any> {
  return {
    api: getApiConfig(),
    session: getSessionConfig(),
    nodeEnv: config.nodeEnv,
    debugMode: config.debugMode,
  }
}
