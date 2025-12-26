/**
 * Session Configuration
 * 
 * Provides type-safe configuration for session management.
 */

import { config } from './env'

export interface SessionConfig {
  cookieName: string
  cookieSecure: boolean
  cookieHttpOnly: boolean
  cookieSameSite: 'strict' | 'lax' | 'none'
  expiryMs: number
  refreshThresholdMs: number
}

/**
 * Session configuration object
 */
export const sessionConfig: SessionConfig = {
  cookieName: config.sessionCookieName,
  cookieSecure: config.sessionCookieSecure,
  cookieHttpOnly: config.sessionCookieHttpOnly,
  cookieSameSite: config.sessionCookieSameSite,
  expiryMs: config.sessionExpiryMs,
  refreshThresholdMs: config.jwtRefreshThreshold,
}

/**
 * Check if session should be refreshed
 * Returns true if token expires within refresh threshold
 */
export function shouldRefreshSession(expiresAt: Date): boolean {
  const now = new Date()
  const timeUntilExpiry = expiresAt.getTime() - now.getTime()
  return timeUntilExpiry < sessionConfig.refreshThresholdMs
}

/**
 * Calculate expiry date from current time
 */
export function getSessionExpiry(): Date {
  return new Date(Date.now() + sessionConfig.expiryMs)
}

/**
 * Format session config for logging (non-sensitive values only)
 */
export function getSessionConfigDebug(): Record<string, any> {
  return {
    cookieName: sessionConfig.cookieName,
    cookieSecure: sessionConfig.cookieSecure,
    cookieHttpOnly: sessionConfig.cookieHttpOnly,
    cookieSameSite: sessionConfig.cookieSameSite,
    expiryMs: sessionConfig.expiryMs,
    refreshThresholdMs: sessionConfig.refreshThresholdMs,
  }
}
