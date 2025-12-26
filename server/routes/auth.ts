/**
 * Express Authentication Routes
 *
 * Handles user login, logout, and session management
 * Uses Result-based auth client with typed exception handling
 */

import { Router, Request, Response } from 'express'
import { authClient } from '@/lib/backend/auth-client'
import api from '@/lib/backend/generated/api-client'
import { sessionManager, createSessionCookie, formatSetCookieHeader } from '@/lib/session'
import { createLogger } from '@/lib/config/logging'
import { config } from '@/lib/config'
import { HttpStatusCode } from '@/lib/exceptions'
import type { LoginError, SignupError } from '@/lib/backend/auth-client'
import {
  InvalidCredentialsError,
  InvalidEmailError,
  InvalidPasswordError,
  TooManyLoginAttemptsError,
  WeakPasswordError,
  EmailAlreadyExistsError,
} from '@/lib/exceptions'
import { emailService } from '@/lib/email'
import { type Result, ok, err } from '@/lib/common/result'

const logger = createLogger('AuthRoutes')
const router = Router()

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

interface LoginRequestBody {
  email: string
  password: string
}

interface LoginResponseBody {
  success: true
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
    emailVerified: boolean
  }
  sessionId: string
}

interface SignupRequestBody {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface SignupResponseBody {
  success: true
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
    emailVerified: boolean
  }
  message: string
}

interface ErrorResponseBody {
  success: false
  error: string
  message?: string
}

interface MeResponseBody {
  success: true
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
    emailVerified: boolean
  }
  session: {
    id: string
    createdAt: string
    expiresAt: string
    lastAccessedAt: string
  }
}

interface LogoutResponseBody {
  success: true
  message: string
}

interface RequestPasswordResetRequestBody {
  email: string
}

interface RequestPasswordResetResponseBody {
  success: true
  message: string
}

interface ResetPasswordRequestBody {
  token: string
  newPassword: string
}

interface ResetPasswordResponseBody {
  success: true
  message: string
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

function validateLoginRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' }
  }

  const { email, password } = body

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { valid: false, error: 'Valid email is required' }
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  return { valid: true }
}

function validateSignupRequest(body: any): Result<SignupRequestBody, string> {
  if (!body) {
    return err('Request body is required')
  }

  const { email, password, firstName, lastName } = body

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return err('Valid email is required')
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return err('Password must be at least 8 characters')
  }

  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
    return err('First name is required')
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
    return err('Last name is required')
  }

  return ok({ email, password, firstName, lastName })
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Maps LoginError union type to HTTP status code and user message
 */
function handleLoginError(error: LoginError): { statusCode: number; message: string } {
  if (error instanceof InvalidCredentialsError) {
    return {
      statusCode: HttpStatusCode.UNAUTHORIZED,
      message: 'Invalid email or password',
    }
  }

  if (error instanceof InvalidEmailError) {
    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      message: 'Valid email is required',
    }
  }

  if (error instanceof InvalidPasswordError) {
    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      message: 'Password must be at least 8 characters',
    }
  }

  if (error instanceof TooManyLoginAttemptsError) {
    return {
      statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
      message: 'Too many login attempts. Please try again later',
    }
  }

  // InternalServerErrorException or unknown
  return {
    statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred. Please try again',
  }
}

/**
 * Maps SignupError union type to HTTP status code and user message
 */
function handleSignupError(error: SignupError): { statusCode: number; message: string } {
  if (error instanceof InvalidEmailError) {
    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      message: 'Valid email is required',
    }
  }

  if (error instanceof InvalidPasswordError) {
    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      message: 'Password must be at least 8 characters',
    }
  }

  if (error instanceof WeakPasswordError) {
    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      message: 'Password is too weak. Please use a stronger password',
    }
  }

  if (error instanceof EmailAlreadyExistsError) {
    return {
      statusCode: HttpStatusCode.CONFLICT,
      message: 'An account with this email already exists',
    }
  }

  // InternalServerErrorException or unknown
  return {
    statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred. Please try again',
  }
}

// ============================================================================
// POST /api/auth/login
// ============================================================================

router.post('/login', async (req: Request, res: Response) => {
  try {
    // Parse request body
    const body = req.body
    logger.debug({ email: body.email }, 'Login attempt')

    // Validate request
    const validation = validateLoginRequest(body)
    if (!validation.valid) {
      logger.warn({ error: validation.error }, 'Login validation failed')
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: validation.error || 'Validation failed',
      } as ErrorResponseBody)
    }

    const { email, password } = body as LoginRequestBody

    // Call backend login endpoint using auth client (Result-based)
    logger.debug({}, 'Calling backend login endpoint')
    const loginResult = await authClient.login({ email, password })

    // Handle error case
    if (!loginResult.ok) {
      const { statusCode, message } = handleLoginError(loginResult.error)
      logger.warn(
        { error: loginResult.error.message, errorType: loginResult.error.constructor.name },
        'Backend login failed'
      )
      return res.status(statusCode).json({
        success: false,
        error: message,
      } as ErrorResponseBody)
    }

    // Success case - extract login data
    const loginResponse = loginResult.value

    // Create server-side session with user token
    const session = await sessionManager.createSession({
      userId: loginResponse.user.id,
      email: loginResponse.user.email,
      firstName: loginResponse.user.firstName,
      lastName: loginResponse.user.lastName,
      emailVerified: loginResponse.user.emailVerified,
      userToken: loginResponse.token,
      userTokenExpiresAt: new Date(loginResponse.expiresAt),
    })

    logger.info({ userId: session.userId, sessionId: session.id }, 'Login successful')

    // Create session cookie
    const sessionCookie = createSessionCookie(session.id)
    const setCookieHeader = formatSetCookieHeader(sessionCookie)

    // Build response
    const response: LoginResponseBody = {
      success: true,
      user: {
        id: loginResponse.user.id,
        email: loginResponse.user.email,
        firstName: loginResponse.user.firstName,
        lastName: loginResponse.user.lastName,
        emailVerified: loginResponse.user.emailVerified,
      },
      sessionId: session.id,
    }

    res.setHeader('Set-Cookie', setCookieHeader)
    return res.status(HttpStatusCode.OK).json(response)
  } catch (error: any) {
    logger.error({ error }, 'Login endpoint error')
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'An unexpected error occurred. Please try again',
      message: error.message,
    } as ErrorResponseBody)
  }
})

// ============================================================================
// POST /api/auth/signup
// ============================================================================

router.post('/signup', async (req: Request, res: Response) => {
  try {
    // Parse request body
    const body = req.body
    logger.debug({ email: body.email }, 'Signup attempt')

    // Validate request
    const validationResult = validateSignupRequest(body)
    if (!validationResult.ok) {
      logger.warn({ error: validationResult.error }, 'Signup validation failed')
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: validationResult.error,
      } as ErrorResponseBody)
    }

    const { email, password, firstName, lastName } = validationResult.value

    // Call backend signup endpoint using auth client (Result-based)
    logger.debug({}, 'Calling backend signup endpoint')
    const signupResult = await authClient.signup({ email, password, firstName, lastName })

    // Handle error case
    if (!signupResult.ok) {
      const { statusCode, message } = handleSignupError(signupResult.error)
      logger.warn(
        { error: signupResult.error.message, errorType: signupResult.error.constructor.name },
        'Backend signup failed'
      )
      return res.status(statusCode).json({
        success: false,
        error: message,
      } as ErrorResponseBody)
    }

    // Success case - extract signup data
    const signupResponse = signupResult.value

    logger.info({ userId: signupResponse.user.id }, 'Signup successful')

    // Send verification email
    const verificationUrl = `${config.transactionBaseEmailUrl}/auth/verify?email=${encodeURIComponent(signupResponse.user.email)}`

    const emailResult = await emailService.sendVerificationEmail({
      email: signupResponse.user.email,
      firstName: signupResponse.user.firstName,
      lastName: signupResponse.user.lastName,
      verificationUrl,
      expiresInHours: config.verificationTokenExpiryHours,
    })

    if (emailResult.ok) {
      logger.info({ userId: signupResponse.user.id }, 'Verification email sent')
    } else {
      // Don't fail signup if email fails - user account is already created
      logger.error(
        {
          error: emailResult.error,
          userId: signupResponse.user.id,
          errorCode: emailResult.error.code,
        },
        'Failed to send verification email'
      )
      // Note: In production, you might want to queue this for retry
    }

    // Build response
    const response: SignupResponseBody = {
      success: true,
      user: {
        id: signupResponse.user.id,
        email: signupResponse.user.email,
        firstName: signupResponse.user.firstName,
        lastName: signupResponse.user.lastName,
        emailVerified: signupResponse.user.emailVerified,
      },
      message: 'Account created successfully. Please check your email to verify your account.',
    }

    return res.status(HttpStatusCode.CREATED).json(response)
  } catch (error: any) {
    logger.error({ error }, 'Signup endpoint error')
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'An unexpected error occurred. Please try again',
      message: error.message,
    } as ErrorResponseBody)
  }
})

// ============================================================================
// GET /api/auth/me
// ============================================================================

router.get('/me', async (req: Request, res: Response) => {
  try {
    // Get session ID from custom header (added by middleware)
    const sessionId = (req as any).sessionId

    if (!sessionId) {
      logger.warn({}, 'Me endpoint called without session')
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        error: 'Unauthorized',
      } as ErrorResponseBody)
    }

    // Get session
    const session = await sessionManager.getSession(sessionId)

    if (!session) {
      logger.warn({ sessionId }, 'Session not found')
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        error: 'Session not found',
      } as ErrorResponseBody)
    }

    logger.info({ userId: session.userId, sessionId }, 'Me endpoint accessed')

    // Build response
    const response: MeResponseBody = {
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
        emailVerified: session.emailVerified,
      },
      session: {
        id: session.id,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.userTokenExpiresAt.toISOString(),
        lastAccessedAt: session.lastAccessedAt.toISOString(),
      },
    }

    return res.status(HttpStatusCode.OK).json(response)
  } catch (error: any) {
    logger.error({ error }, 'Me endpoint error')
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'An unexpected error occurred',
    } as ErrorResponseBody)
  }
})

// ============================================================================
// POST /api/auth/logout
// ============================================================================

router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Get session ID from custom header (added by middleware)
    const sessionId = (req as any).sessionId

    if (!sessionId) {
      logger.warn({}, 'Logout attempted without session')
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        error: 'No active session',
      } as ErrorResponseBody)
    }

    // Get session to extract token for revocation
    const session = await sessionManager.getSession(sessionId)

    if (session) {
      // Optionally revoke token on backend
      try {
        await api.tenantAuthControllerRevokeToken({ token: session.userToken })
        logger.debug({}, 'Token revoked on backend')
      } catch (error) {
        logger.warn({ error }, 'Failed to revoke token on backend')
        // Continue with logout even if backend revocation fails
      }
    }

    // Delete session from server
    await sessionManager.deleteSession(sessionId)
    logger.info({ sessionId }, 'Session deleted')

    // Create logout cookie (empty value, immediate expiry)
    const sessionCookieOptions = createSessionCookie('')
    const logoutCookie = {
      ...sessionCookieOptions,
      value: '',
      options: {
        ...sessionCookieOptions.options,
        maxAge: 0,
      },
    }
    const setCookieHeader = formatSetCookieHeader(logoutCookie)

    // Build response
    const response: LogoutResponseBody = {
      success: true,
      message: 'Logged out successfully',
    }

    res.setHeader('Set-Cookie', setCookieHeader)
    return res.status(HttpStatusCode.OK).json(response)
  } catch (error: any) {
    logger.error({ error }, 'Logout endpoint error')
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'An unexpected error occurred during logout',
    } as ErrorResponseBody)
  }
})

// ============================================================================
// POST /api/auth/request-password-reset
// ============================================================================

router.post('/request-password-reset', async (req: Request, res: Response) => {
  try {
    // Parse request body
    const body = req.body
    const { email } = body

    logger.debug({ email }, 'Password reset request')

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      logger.warn({ email }, 'Invalid email for password reset')
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: 'Valid email is required',
      } as ErrorResponseBody)
    }

    // Call backend password reset request endpoint
    logger.debug({}, 'Calling backend request password reset endpoint')
    const resetResult = await authClient.requestPasswordReset({ email })

    // Handle error case
    if (!resetResult.ok) {
      // For security: don't leak whether user exists
      // Return success even if user not found
      if (resetResult.error.constructor.name === 'UserNotFoundError') {
        logger.info({ email }, 'Password reset requested for non-existent user (returning success for security)')
        return res.status(HttpStatusCode.OK).json({
          success: true,
          message: 'If an account exists with that email, you will receive a password reset link.',
        } as RequestPasswordResetResponseBody)
      }

      // Handle other errors
      logger.warn(
        { error: resetResult.error.message, errorType: resetResult.error.constructor.name },
        'Password reset request failed'
      )
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'An unexpected error occurred. Please try again',
      } as ErrorResponseBody)
    }

    // Success case - send password reset email
    const resetResponse = resetResult.value
    const resetUrl = `${config.transactionBaseEmailUrl}/auth/reset-password?token=${encodeURIComponent(resetResponse.token)}`

    try {
      const emailResult = await emailService.sendPasswordResetEmail({
        email: resetResponse.email,
        firstName: resetResponse.firstName,
        lastName: resetResponse.lastName,
        resetUrl,
        expiresInHours: config.verificationTokenExpiryHours,
      })

      if (emailResult.ok) {
        logger.info({ email }, 'Password reset email sent')
      } else {
        // Don't fail the request if email fails - just log it
        logger.error(
          {
            error: emailResult.error,
            email,
            errorCode: emailResult.error.code,
          },
          'Failed to send password reset email'
        )
      }
    } catch (emailError) {
      logger.error({ error: emailError, email }, 'Failed to send password reset email')
    }

    // Always return success (don't leak whether email was sent)
    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'If an account exists with that email, you will receive a password reset link.',
    } as RequestPasswordResetResponseBody)
  } catch (error: any) {
    logger.error({ error }, 'Request password reset endpoint error')
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'An unexpected error occurred. Please try again',
      message: error.message,
    } as ErrorResponseBody)
  }
})

// ============================================================================
// POST /api/auth/reset-password
// ============================================================================

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    // Parse request body
    const body = req.body
    const { token, newPassword } = body

    logger.debug({}, 'Password reset attempt')

    // Validate inputs
    if (!token || typeof token !== 'string') {
      logger.warn({}, 'Invalid token for password reset')
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: 'Valid reset token is required',
      } as ErrorResponseBody)
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      logger.warn({}, 'Invalid password for password reset')
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: 'Password must be at least 8 characters',
      } as ErrorResponseBody)
    }

    // Call backend password reset endpoint
    logger.debug({}, 'Calling backend reset password endpoint')
    const resetResult = await authClient.resetPassword({ token, newPassword })

    // Handle error case
    if (!resetResult.ok) {
      const error = resetResult.error
      let statusCode = HttpStatusCode.BAD_REQUEST
      let message = 'Password reset failed'

      // Map specific errors to user-friendly messages
      if (error.constructor.name === 'TokenExpiredError') {
        message = 'Reset link has expired. Please request a new password reset.'
      } else if (error.constructor.name === 'TokenInvalidError') {
        message = 'Invalid or already used reset link. Please request a new password reset.'
      } else if (error.constructor.name === 'InvalidPasswordError') {
        message = 'Password must be at least 8 characters'
      } else if (error.constructor.name === 'WeakPasswordError') {
        message = 'Password is too weak. Please use a stronger password.'
      } else {
        statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR
        message = 'An unexpected error occurred. Please try again'
      }

      logger.warn(
        { error: error.message, errorType: error.constructor.name },
        'Password reset failed'
      )
      return res.status(statusCode).json({
        success: false,
        error: message,
      } as ErrorResponseBody)
    }

    // Success case
    logger.info({}, 'Password reset successful')
    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Password reset successfully',
    } as ResetPasswordResponseBody)
  } catch (error: any) {
    logger.error({ error }, 'Reset password endpoint error')
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'An unexpected error occurred. Please try again',
      message: error.message,
    } as ErrorResponseBody)
  }
})

export default router




