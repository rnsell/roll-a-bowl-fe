/**
 * Session and User Token Management
 * 
 * Handles server-side user token (X-User-Token) storage only.
 * Bearer token (API/tenant-level) is managed separately by ApiTokenManager
 * and never stored in session - it's refreshed on demand and kept in memory.
 */

import { sessionConfig, shouldRefreshSession } from '@/lib/config/session'
import {
  isMemoryStorageEnabled,
  isRedisStorageEnabled,
  isDatabaseStorageEnabled,
} from '@/lib/config/storage'
import { createLogger } from '@/lib/config/logging'

const logger = createLogger('SessionManager')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Session data contains user information only
 * User's JWT token (X-User-Token) is stored here
 * Tenant/API Bearer token is NOT stored (see ApiTokenManager)
 */
export interface SessionData {
  id: string
  userId: number
  email: string
  firstName: string
  lastName: string
  emailVerified: boolean
  userToken: string // X-User-Token (user-level JWT)
  userTokenExpiresAt: Date
  createdAt: Date
  lastAccessedAt: Date
}

export interface CreateSessionOptions {
  userId: number
  email: string
  firstName: string
  lastName: string
  emailVerified: boolean
  userToken: string // X-User-Token from login response
  userTokenExpiresAt: Date
}

export interface ValidateSessionResult {
  valid: boolean
  session?: SessionData
  error?: string
  needsRefresh?: boolean
}

// ============================================================================
// STORAGE INTERFACE
// ============================================================================

interface ISessionStorage {
  save(session: SessionData): Promise<void>
  get(sessionId: string): Promise<SessionData | null>
  delete(sessionId: string): Promise<void>
  clear(): Promise<void>
}

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

class MemorySessionStorage implements ISessionStorage {
  private sessions: Map<string, SessionData> = new Map()

  async save(session: SessionData): Promise<void> {
    const key = session.id
    this.sessions.set(key, session)
    logger.debug({ 
      sessionId: session.id, 
      keyUsed: key,
      keysMatch: key === session.id,
      totalSessions: this.sessions.size 
    }, 'Session saved to memory')
    
    // Verify it was stored correctly
    const retrieved = this.sessions.get(key)
    if (!retrieved) {
      logger.error({ sessionId: session.id, key }, 'CRITICAL: Session save failed - not found immediately after save!')
    } else if (retrieved.id !== session.id) {
      logger.error({ 
        expectedId: session.id, 
        retrievedId: retrieved.id 
      }, 'CRITICAL: Session ID mismatch after save!')
    }
  }

  async get(sessionId: string): Promise<SessionData | null> {
    logger.debug({ 
      sessionId, 
      sessionIdLength: sessionId?.length,
      lookingForKey: sessionId,
      totalSessions: this.sessions.size,
      allKeys: Array.from(this.sessions.keys())
    }, 'Looking up session in memory storage')
    
    const session = this.sessions.get(sessionId)
    if (session) {
      logger.debug({ 
        sessionId, 
        foundId: session.id,
        idsMatch: sessionId === session.id 
      }, 'Session retrieved from memory')
      
      if (sessionId !== session.id) {
        logger.error({ 
          requestedId: sessionId, 
          foundId: session.id 
        }, 'CRITICAL: Session ID mismatch on retrieval!')
      }
    } else {
      logger.warn({ 
        sessionId, 
        totalSessions: this.sessions.size,
        availableKeys: Array.from(this.sessions.keys()).slice(0, 10) // First 10 keys
      }, 'Session not found in memory storage')
    }
    return session || null
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
    logger.debug({ sessionId }, 'Session deleted from memory')
  }

  async clear(): Promise<void> {
    this.sessions.clear()
    logger.debug({}, 'All sessions cleared from memory')
  }

  // For debugging
  getStats() {
    return {
      totalSessions: this.sessions.size,
      sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
        id,
        userId: session.userId,
        userTokenExpiresAt: session.userTokenExpiresAt,
      })),
    }
  }
}

// ============================================================================
// SESSION MANAGER
// ============================================================================

export class SessionManager {
  private storage: ISessionStorage

  constructor() {
    // Initialize storage backend
    if (isMemoryStorageEnabled()) {
      this.storage = new MemorySessionStorage()
      logger.info({}, 'Using in-memory session storage')
    } else if (isRedisStorageEnabled()) {
      // TODO: Implement Redis storage
      logger.warn({}, 'Redis storage not yet implemented, falling back to memory')
      this.storage = new MemorySessionStorage()
    } else if (isDatabaseStorageEnabled()) {
      // TODO: Implement database storage
      logger.warn({}, 'Database storage not yet implemented, falling back to memory')
      this.storage = new MemorySessionStorage()
    } else {
      this.storage = new MemorySessionStorage()
    }
  }

  /**
   * Create a new session
   */
  async createSession(options: CreateSessionOptions): Promise<SessionData> {
    const sessionId = this.generateSessionId()
    const now = new Date()

    const session: SessionData = {
      id: sessionId,
      userId: options.userId,
      email: options.email,
      firstName: options.firstName,
      lastName: options.lastName,
      emailVerified: options.emailVerified,
      userToken: options.userToken,
      userTokenExpiresAt: options.userTokenExpiresAt,
      createdAt: now,
      lastAccessedAt: now,
    }

    await this.storage.save(session)
    logger.info({ sessionId, userId: options.userId, sessionIdLength: sessionId.length }, 'Session created and saved')
    
    // Verify it was saved
    const verifySession = await this.storage.get(sessionId)
    if (!verifySession) {
      logger.error({ sessionId }, 'CRITICAL: Session was not saved properly!')
    } else {
      logger.debug({ sessionId }, 'Session verified in storage after creation')
    }

    return session
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    logger.debug({ sessionId, sessionIdLength: sessionId?.length }, 'Getting session')
    const session = await this.storage.get(sessionId)

    if (!session) {
      logger.warn({ sessionId, sessionIdLength: sessionId?.length }, 'Session not found in storage')
      // Log storage stats for debugging
      if (this.storage instanceof MemorySessionStorage) {
        const stats = this.storage.getStats()
        logger.debug({ totalSessions: stats.totalSessions, sessionIds: stats.sessions.map(s => s.id) }, 'Current sessions in storage')
      }
      return null
    }

    // Check if user token expired
    if (new Date() > session.userTokenExpiresAt) {
      logger.info({ sessionId }, 'User token expired')
      await this.storage.delete(sessionId)
      return null
    }

    // Update last accessed time
    session.lastAccessedAt = new Date()
    await this.storage.save(session)

    return session
  }

  /**
   * Validate session
   */
  async validateSession(sessionId: string): Promise<ValidateSessionResult> {
    const session = await this.getSession(sessionId)

    if (!session) {
      return {
        valid: false,
        error: 'Session not found or expired',
      }
    }

    // Check if user token needs refresh
    // Note: Bearer token (API JWT) is managed separately by ApiTokenManager
    const needsRefresh = shouldRefreshSession(session.userTokenExpiresAt)

    return {
      valid: true,
      session,
      needsRefresh,
    }
  }

  /**
   * Refresh user token
   */
  async refreshUserToken(
    sessionId: string,
    newUserToken: string,
    userTokenExpiresAt: Date
  ): Promise<SessionData | null> {
    const session = await this.storage.get(sessionId)

    if (!session) {
      logger.warn({ sessionId }, 'Cannot refresh non-existent session')
      return null
    }

    // Update user token only
    // Bearer token (API JWT) is refreshed separately by ApiTokenManager
    session.userToken = newUserToken
    session.userTokenExpiresAt = userTokenExpiresAt
    session.lastAccessedAt = new Date()

    await this.storage.save(session)
    logger.info({ sessionId }, 'User token refreshed')

    return session
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.storage.delete(sessionId)
    logger.info({ sessionId }, 'Session deleted')
  }

  /**
   * Delete all sessions
   */
  async deleteAllSessions(): Promise<void> {
    await this.storage.clear()
    logger.info({}, 'All sessions cleared')
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get stats (for development/debugging)
   */
  getStats(): Record<string, any> {
    if (this.storage instanceof MemorySessionStorage) {
      return this.storage.getStats()
    }
    return { message: 'Stats not available for this storage backend' }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const sessionManager = new SessionManager()

// ============================================================================
// SESSION COOKIE UTILITIES
// ============================================================================

export interface SessionCookie {
  name: string
  value: string
  options: {
    maxAge: number
    path: string
    httpOnly: boolean
    secure: boolean
    sameSite: 'strict' | 'lax' | 'none'
  }
}

/**
 * Create session cookie
 */
export function createSessionCookie(sessionId: string): SessionCookie {
  return {
    name: sessionConfig.cookieName,
    value: sessionId,
    options: {
      maxAge: Math.floor(sessionConfig.expiryMs / 1000), // Convert to seconds
      path: '/',
      httpOnly: sessionConfig.cookieHttpOnly,
      secure: sessionConfig.cookieSecure,
      sameSite: sessionConfig.cookieSameSite,
    },
  }
}

/**
 * Format Set-Cookie header value
 */
export function formatSetCookieHeader(cookie: SessionCookie): string {
  const { name, value, options } = cookie
  const parts = [`${name}=${value}`]

  if (options.maxAge) {
    parts.push(`Max-Age=${options.maxAge}`)
  }
  if (options.path) {
    parts.push(`Path=${options.path}`)
  }
  if (options.httpOnly) {
    parts.push('HttpOnly')
  }
  if (options.secure) {
    parts.push('Secure')
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`)
  }

  return parts.join('; ')
}

/**
 * Parse session ID from cookie header
 */
export function parseSessionIdFromCookie(cookieHeader: string): string | null {
  if (!cookieHeader) {
    logger.debug({}, 'No cookie header provided')
    return null
  }

  const cookies = cookieHeader.split(';').map((c) => c.trim())
  logger.debug({ cookieCount: cookies.length, lookingFor: sessionConfig.cookieName }, 'Parsing cookies')

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split('=')
    const value = valueParts.join('=') // Handle values that might contain '='
    if (name === sessionConfig.cookieName) {
      const sessionId = value || null
      logger.debug({ sessionId, sessionIdLength: sessionId?.length }, 'Found session ID in cookie')
      return sessionId
    }
  }

  logger.debug({ cookieHeader: cookieHeader.substring(0, 200) }, 'Session cookie not found in header')
  return null
}

/**
 * Create logout cookie (empty value, immediate expiry)
 */
export function createLogoutCookie(): SessionCookie {
  return {
    name: sessionConfig.cookieName,
    value: '',
    options: {
      maxAge: 0, // Immediate expiry
      path: '/',
      httpOnly: sessionConfig.cookieHttpOnly,
      secure: sessionConfig.cookieSecure,
      sameSite: sessionConfig.cookieSameSite,
    },
  }
}
