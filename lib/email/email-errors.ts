/**
 * Email Service Error Types
 *
 * Specific error types for email sending operations
 */

import { ServiceException, type ServiceExceptionOptions } from '@/lib/exceptions/service.exception'

// ============================================================================
// EMAIL SERVICE EXCEPTIONS
// ============================================================================

/**
 * Base email service exception
 */
export class EmailServiceError extends ServiceException {
  constructor(options: ServiceExceptionOptions) {
    super(options)
  }
}

/**
 * Email provider configuration error
 */
export class EmailProviderConfigError extends EmailServiceError {
  constructor(message: string, metadata?: Record<string, any>) {
    super({
      message,
      code: 'EMAIL_PROVIDER_CONFIG_ERROR',
      metadata,
    })
  }
}

/**
 * Email send failure - generic failure
 */
export class EmailSendError extends EmailServiceError {
  constructor(message: string, cause?: Error, metadata?: Record<string, any>) {
    super({
      message,
      code: 'EMAIL_SEND_ERROR',
      cause,
      metadata,
    })
  }
}

/**
 * Verification email send failure
 */
export class VerificationEmailSendError extends EmailSendError {
  constructor(email: string, cause?: Error) {
    super(`Failed to send verification email to ${email}`, cause, { email, emailType: 'verification' })
  }
}

/**
 * Password reset email send failure
 */
export class PasswordResetEmailSendError extends EmailSendError {
  constructor(email: string, cause?: Error) {
    super(`Failed to send password reset email to ${email}`, cause, { email, emailType: 'password-reset' })
  }
}

/**
 * Welcome email send failure
 */
export class WelcomeEmailSendError extends EmailSendError {
  constructor(email: string, cause?: Error) {
    super(`Failed to send welcome email to ${email}`, cause, { email, emailType: 'welcome' })
  }
}

/**
 * Invalid email address
 */
export class InvalidEmailAddressError extends EmailServiceError {
  constructor(email: string) {
    super({
      message: `Invalid email address: ${email}`,
      code: 'INVALID_EMAIL_ADDRESS',
      metadata: { email },
    })
  }
}

/**
 * Email provider not available or down
 */
export class EmailProviderUnavailableError extends EmailServiceError {
  constructor(provider: string, cause?: Error) {
    super({
      message: `Email provider "${provider}" is unavailable`,
      code: 'EMAIL_PROVIDER_UNAVAILABLE',
      cause,
      metadata: { provider },
    })
  }
}

/**
 * Email rate limit exceeded
 */
export class EmailRateLimitError extends EmailServiceError {
  constructor(retryAfter?: number) {
    super({
      message: retryAfter
        ? `Email rate limit exceeded. Retry after ${retryAfter} seconds`
        : 'Email rate limit exceeded',
      code: 'EMAIL_RATE_LIMIT',
      metadata: retryAfter ? { retryAfter } : undefined,
    })
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if error is an email service error
 */
export function isEmailServiceError(error: any): error is EmailServiceError {
  return error instanceof EmailServiceError
}
