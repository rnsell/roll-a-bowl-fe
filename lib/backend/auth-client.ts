/**
 * Authentication Client
 *
 * High-level authentication methods built on top of the generated API client.
 * Provides clean, simple interfaces for common auth operations.
 * Uses Result type for explicit error handling without throwing exceptions.
 */

import api from './generated/api-client'
import { createLogger } from '@/lib/config/logging'
import { Result, ok, err } from '@/lib/common/result'
import {
  InvalidCredentialsError,
  InvalidEmailError,
  InvalidPasswordError,
  WeakPasswordError,
  EmailAlreadyExistsError,
  UserNotFoundError,
  TokenInvalidError,
  TokenExpiredError,
  TooManyLoginAttemptsError,
  InternalServerErrorException,
  mapBackendErrorToServiceException,
} from '@/lib/exceptions'
import type {
  UserLoginDto,
  UserRegisterDto,
  EmailVerificationDto,
  PasswordResetRequestDto,
  PasswordResetDto,
} from './generated/data-contracts'

const logger = createLogger('AuthClient')

// ============================================================================
// ENHANCED TYPES WITH BETTER STRUCTURE
// ============================================================================

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token: string
  expiresAt: string
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
    emailVerified: boolean
  }
}

export interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface SignupResponse {
  success: boolean
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
    emailVerified: boolean
  }
}

export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
}

export interface RequestPasswordResetRequest {
  email: string
}

export interface RequestPasswordResetResponse {
  email: string
  firstName: string
  lastName: string
  token: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

// ============================================================================
// ERROR TYPES FOR EACH METHOD
// ============================================================================

/**
 * All possible errors that can occur during login
 */
export type LoginError =
  | InvalidCredentialsError
  | InvalidEmailError
  | InvalidPasswordError
  | TooManyLoginAttemptsError
  | InternalServerErrorException

/**
 * All possible errors that can occur during signup
 */
export type SignupError =
  | InvalidEmailError
  | InvalidPasswordError
  | WeakPasswordError
  | EmailAlreadyExistsError
  | InternalServerErrorException

/**
 * All possible errors that can occur during email verification
 */
export type VerifyEmailError =
  | TokenInvalidError
  | TokenExpiredError
  | UserNotFoundError
  | InternalServerErrorException

/**
 * All possible errors that can occur during password reset request
 */
export type RequestPasswordResetError =
  | InvalidEmailError
  | UserNotFoundError
  | InternalServerErrorException

/**
 * All possible errors that can occur during password reset
 */
export type ResetPasswordError =
  | TokenInvalidError
  | TokenExpiredError
  | InvalidPasswordError
  | WeakPasswordError
  | InternalServerErrorException

/**
 * All possible errors that can occur during email verification status check
 */
export type EmailVerificationStatusError =
  | InvalidEmailError
  | UserNotFoundError
  | InternalServerErrorException

// ============================================================================
// AUTH CLIENT CLASS
// ============================================================================

export class AuthClient {
  /**
   * Login user with email and password
   *
   * @returns Result with LoginResponse or enumerated LoginError
   *
   * @example
   * ```ts
   * const result = await authClient.login({ email, password })
   *
   * if (result.ok) {
   *   console.log('Logged in:', result.value.user)
   * } else {
   *   // TypeScript knows all possible error types
   *   if (result.error instanceof InvalidCredentialsError) {
   *     console.error('Wrong email or password')
   *   } else if (result.error instanceof TooManyLoginAttemptsError) {
   *     console.error('Too many attempts, try again later')
   *   }
   * }
   * ```
   */
  async login(request: LoginRequest): Promise<Result<LoginResponse, LoginError>> {
    logger.debug({ email: request.email }, 'Attempting user login')

    try {
      const response = await api.authControllerLogin(request as UserLoginDto)
      const data = response.data

      if (!data.success || !data.token || !data.user) {
        logger.error('Invalid login response from server')
        return err(new InternalServerErrorException('Invalid login response from server'))
      }

      // Type assertion for user object (generated types use generic 'object')
      const user = data.user as {
        id: number
        email: string
        firstName: string
        lastName: string
        emailVerified: boolean
      }

      const loginResponse: LoginResponse = {
        success: data.success,
        token: data.token,
        expiresAt: data.expiresAt!,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
        },
      }

      logger.info({ userId: user.id }, 'Login successful')
      return ok(loginResponse)
    } catch (error) {
      const serviceError = mapBackendErrorToServiceException(error)
      logger.error({ error: serviceError.message }, 'Login failed')

      // Map to specific login errors
      if (serviceError instanceof InvalidCredentialsError) {
        return err(serviceError)
      }
      if (serviceError instanceof InvalidEmailError) {
        return err(serviceError)
      }
      if (serviceError instanceof InvalidPasswordError) {
        return err(serviceError)
      }
      if (serviceError instanceof TooManyLoginAttemptsError) {
        return err(serviceError)
      }

      // Fallback to internal server error
      return err(new InternalServerErrorException(serviceError.message))
    }
  }

  /**
   * Register a new user account
   *
   * @returns Result with SignupResponse or enumerated SignupError
   *
   * @example
   * ```ts
   * const result = await authClient.signup({ email, password, firstName, lastName })
   *
   * if (result.ok) {
   *   console.log('Account created:', result.value.user)
   * } else {
   *   if (result.error instanceof EmailAlreadyExistsError) {
   *     console.error('Email already registered')
   *   } else if (result.error instanceof WeakPasswordError) {
   *     console.error('Password is too weak')
   *   }
   * }
   * ```
   */
  async signup(request: SignupRequest): Promise<Result<SignupResponse, SignupError>> {
    logger.debug({ email: request.email }, 'Attempting user signup')

    try {
      const response = await api.authControllerRegister(request as UserRegisterDto)
      const data = response.data

      if (!data.success || !data.user) {
        logger.error('Invalid signup response from server')
        return err(new InternalServerErrorException(data.error || 'Invalid signup response from server'))
      }

      // Type assertion for user object
      const user = data.user as {
        id: number
        email: string
        firstName: string
        lastName: string
        emailVerified: boolean
      }

      const signupResponse: SignupResponse = {
        success: data.success,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
        },
      }

      logger.info({ userId: user.id }, 'Signup successful')
      return ok(signupResponse)
    } catch (error) {
      const serviceError = mapBackendErrorToServiceException(error)
      logger.error({ error: serviceError.message }, 'Signup failed')

      // Map to specific signup errors
      if (serviceError instanceof InvalidEmailError) {
        return err(serviceError)
      }
      if (serviceError instanceof InvalidPasswordError) {
        return err(serviceError)
      }
      if (serviceError instanceof WeakPasswordError) {
        return err(serviceError)
      }
      if (serviceError instanceof EmailAlreadyExistsError) {
        return err(serviceError)
      }

      // Fallback to internal server error
      return err(new InternalServerErrorException(serviceError.message))
    }
  }

  /**
   * Verify user email address with token
   *
   * @returns Result with VerifyEmailResponse or enumerated VerifyEmailError
   */
  async verifyEmail(request: VerifyEmailRequest): Promise<Result<VerifyEmailResponse, VerifyEmailError>> {
    logger.debug('Verifying email')

    try {
      const response = await api.authControllerVerifyEmail(request as EmailVerificationDto)
      const data = response.data

      const verifyResponse: VerifyEmailResponse = {
        success: data.success,
        message: data.message,
      }

      logger.info('Email verification successful')
      return ok(verifyResponse)
    } catch (error) {
      const serviceError = mapBackendErrorToServiceException(error)
      logger.error({ error: serviceError.message }, 'Email verification failed')

      // Map to specific verification errors
      if (serviceError instanceof TokenInvalidError) {
        return err(serviceError)
      }
      if (serviceError instanceof TokenExpiredError) {
        return err(serviceError)
      }
      if (serviceError instanceof UserNotFoundError) {
        return err(serviceError)
      }

      // Fallback to internal server error
      return err(new InternalServerErrorException(serviceError.message))
    }
  }

  /**
   * Request password reset for user
   *
   * @returns Result with RequestPasswordResetResponse or enumerated RequestPasswordResetError
   */
  async requestPasswordReset(
    request: RequestPasswordResetRequest
  ): Promise<Result<RequestPasswordResetResponse, RequestPasswordResetError>> {
    logger.debug({ email: request.email }, 'Requesting password reset')

    try {
      const response = await api.authControllerRequestPasswordReset(
        request as PasswordResetRequestDto
      )
      const data = response.data

      const resetResponse: RequestPasswordResetResponse = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        token: data.token,
      }

      logger.info({ email: request.email }, 'Password reset request successful')
      return ok(resetResponse)
    } catch (error) {
      const serviceError = mapBackendErrorToServiceException(error)
      logger.error({ error: serviceError.message }, 'Password reset request failed')

      // Map to specific password reset request errors
      if (serviceError instanceof InvalidEmailError) {
        return err(serviceError)
      }
      if (serviceError instanceof UserNotFoundError) {
        return err(serviceError)
      }

      // Fallback to internal server error
      return err(new InternalServerErrorException(serviceError.message))
    }
  }

  /**
   * Reset password with token and new password
   *
   * @returns Result with ResetPasswordResponse or enumerated ResetPasswordError
   */
  async resetPassword(request: ResetPasswordRequest): Promise<Result<ResetPasswordResponse, ResetPasswordError>> {
    logger.debug('Resetting password')

    try {
      const response = await api.authControllerResetPassword(request as PasswordResetDto)
      const data = response.data

      const resetResponse: ResetPasswordResponse = {
        success: data.success,
        message: data.message,
      }

      logger.info('Password reset successful')
      return ok(resetResponse)
    } catch (error) {
      const serviceError = mapBackendErrorToServiceException(error)
      logger.error({ error: serviceError.message }, 'Password reset failed')

      // Map to specific password reset errors
      if (serviceError instanceof TokenInvalidError) {
        return err(serviceError)
      }
      if (serviceError instanceof TokenExpiredError) {
        return err(serviceError)
      }
      if (serviceError instanceof InvalidPasswordError) {
        return err(serviceError)
      }
      if (serviceError instanceof WeakPasswordError) {
        return err(serviceError)
      }

      // Fallback to internal server error
      return err(new InternalServerErrorException(serviceError.message))
    }
  }

  /**
   * Check email verification status for a user
   *
   * @returns Result with email verification status or enumerated EmailVerificationStatusError
   */
  async getEmailVerificationStatus(
    email: string
  ): Promise<Result<{ emailVerified: boolean }, EmailVerificationStatusError>> {
    logger.debug({ email }, 'Checking email verification status')

    try {
      const response = await api.authControllerGetEmailVerificationStatus({ email })
      const data = response.data

      const statusResponse = {
        emailVerified: data.emailVerified,
      }

      logger.info({ email, emailVerified: data.emailVerified }, 'Email verification status retrieved')
      return ok(statusResponse)
    } catch (error) {
      const serviceError = mapBackendErrorToServiceException(error)
      logger.error({ error: serviceError.message }, 'Failed to check verification status')

      // Map to specific verification status errors
      if (serviceError instanceof InvalidEmailError) {
        return err(serviceError)
      }
      if (serviceError instanceof UserNotFoundError) {
        return err(serviceError)
      }

      // Fallback to internal server error
      return err(new InternalServerErrorException(serviceError.message))
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const authClient = new AuthClient()
