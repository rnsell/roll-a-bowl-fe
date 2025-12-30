/**
 * Express Session Middleware
 * 
 * Handles session validation and injects session ID into request
 */

import { Request, Response, NextFunction } from 'express'
import { sessionManager } from '@/lib/session'
import { createLogger } from '@/lib/config/logging'

const logger = createLogger('SessionMiddleware')

/**
 * Parse session ID from cookies
 */
function parseSessionIdFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) {
    return null
  }

  const cookies = cookieHeader.split(';').map((c) => c.trim())
  for (const cookie of cookies) {
    if (cookie.startsWith('auth-session=')) {
      return cookie.substring('auth-session='.length)
    }
  }

  return null
}

/**
 * Express middleware to validate and inject session
 */
export async function sessionMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    // Parse session ID from cookies
    const cookieHeader = req.headers.cookie
    const sessionId = parseSessionIdFromCookie(cookieHeader)

    if (!sessionId) {
      logger.debug({}, 'No session cookie found')
      return next()
    }

    // Validate session
    const result = await sessionManager.validateSession(sessionId)

    if (!result.valid) {
      logger.debug({ sessionId }, 'Session validation failed')
      return next()
    }

    // Inject session ID into request for use by route handlers
    (req as any).sessionId = sessionId
    logger.debug({ sessionId }, 'Session validated and injected')

    return next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ error: message }, 'Session middleware error')
    return next()
  }
}

export default sessionMiddleware




