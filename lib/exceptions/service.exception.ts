/**
 * Service Exception Classes
 *
 * Used for internal application logic errors and business rules
 * These don't map directly to HTTP status codes
 */

export interface ServiceExceptionOptions {
  message: string
  code?: string
  cause?: Error
  metadata?: Record<string, any>
}

/**
 * Base service exception for internal application errors
 */
export class ServiceException extends Error {
  public readonly code?: string
  public readonly cause?: Error
  public readonly metadata?: Record<string, any>
  public readonly timestamp: Date

  constructor(options: ServiceExceptionOptions) {
    super(options.message)
    this.name = this.constructor.name
    this.code = options.code
    this.cause = options.cause
    this.metadata = options.metadata
    this.timestamp = new Date()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
      ...(this.cause && { cause: this.cause.message }),
    }
  }
}

// ============================================================================
// AUTHENTICATION SERVICE EXCEPTIONS
// ============================================================================

/**
 * Invalid credentials provided during authentication
 */
export class InvalidCredentialsError extends ServiceException {
  constructor() {
    super({
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    })
  }
}

/**
 * Session-related errors
 */
export class SessionError extends ServiceException {
  constructor(message: string, code: string, metadata?: Record<string, any>) {
    super({ message, code, metadata })
  }
}

/**
 * Session not found in storage
 */
export class SessionNotFoundError extends SessionError {
  constructor(sessionId?: string) {
    super(
      'Session not found',
      'SESSION_NOT_FOUND',
      sessionId ? { sessionId } : undefined
    )
  }
}

/**
 * Session has expired
 */
export class SessionExpiredError extends SessionError {
  constructor() {
    super('Session has expired', 'SESSION_EXPIRED')
  }
}

/**
 * Session is invalid or corrupted
 */
export class SessionInvalidError extends SessionError {
  constructor() {
    super('Session is invalid', 'SESSION_INVALID')
  }
}

/**
 * Failed to create session
 */
export class SessionCreationError extends SessionError {
  constructor(cause?: Error) {
    super('Failed to create session', 'SESSION_CREATION_FAILED')
    if (cause) {
      Object.defineProperty(this, 'cause', { value: cause, writable: false })
    }
  }
}

/**
 * Token-related errors
 */
export class TokenError extends ServiceException {
  constructor(message: string, code: string, metadata?: Record<string, any>) {
    super({ message, code, metadata })
  }
}

/**
 * Token is missing
 */
export class TokenMissingError extends TokenError {
  constructor() {
    super('Authentication token is missing', 'TOKEN_MISSING')
  }
}

/**
 * Token is invalid or malformed
 */
export class TokenInvalidError extends TokenError {
  constructor() {
    super('Authentication token is invalid', 'TOKEN_INVALID')
  }
}

/**
 * Token has expired
 */
export class TokenExpiredError extends TokenError {
  constructor() {
    super('Authentication token has expired', 'TOKEN_EXPIRED')
  }
}

/**
 * Token has been revoked
 */
export class TokenRevokedError extends TokenError {
  constructor() {
    super('Authentication token has been revoked', 'TOKEN_REVOKED')
  }
}

/**
 * Failed to refresh token
 */
export class TokenRefreshError extends TokenError {
  constructor(cause?: Error) {
    super('Failed to refresh authentication token', 'TOKEN_REFRESH_FAILED')
    if (cause) {
      Object.defineProperty(this, 'cause', { value: cause, writable: false })
    }
  }
}

/**
 * User account errors
 */
export class UserAccountError extends ServiceException {
  constructor(message: string, code: string, metadata?: Record<string, any>) {
    super({ message, code, metadata })
  }
}

/**
 * User account not found
 */
export class UserNotFoundError extends UserAccountError {
  constructor(identifier?: string) {
    super(
      'User account not found',
      'USER_NOT_FOUND',
      identifier ? { identifier } : undefined
    )
  }
}

/**
 * Email is not verified
 */
export class EmailNotVerifiedError extends UserAccountError {
  constructor() {
    super('Email address is not verified', 'EMAIL_NOT_VERIFIED')
  }
}

/**
 * Account is locked
 */
export class AccountLockedError extends UserAccountError {
  constructor(reason?: string) {
    super(
      reason || 'Account has been locked',
      'ACCOUNT_LOCKED',
      reason ? { reason } : undefined
    )
  }
}

/**
 * Account is suspended
 */
export class AccountSuspendedError extends UserAccountError {
  constructor() {
    super('Account has been suspended', 'ACCOUNT_SUSPENDED')
  }
}

/**
 * Account is deactivated
 */
export class AccountDeactivatedError extends UserAccountError {
  constructor() {
    super('Account has been deactivated', 'ACCOUNT_DEACTIVATED')
  }
}

/**
 * Email already exists
 */
export class EmailAlreadyExistsError extends UserAccountError {
  constructor(email: string) {
    super('Email already exists', 'EMAIL_ALREADY_EXISTS', { email })
  }
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

/**
 * Validation error
 */
export class ValidationError extends ServiceException {
  constructor(message: string, metadata?: Record<string, any>) {
    super({ message, code: 'VALIDATION_ERROR', metadata })
  }
}

/**
 * Invalid email format
 */
export class InvalidEmailError extends ValidationError {
  constructor() {
    super('Invalid email address format')
  }
}

/**
 * Invalid password
 */
export class InvalidPasswordError extends ValidationError {
  constructor(message = 'Password does not meet requirements') {
    super(message)
  }
}

/**
 * Weak password
 */
export class WeakPasswordError extends ValidationError {
  constructor() {
    super('Password is too weak')
  }
}

/**
 * Missing required field
 */
export class MissingFieldError extends ValidationError {
  constructor(field: string) {
    super(`Missing required field: ${field}`, { field })
  }
}

// ============================================================================
// AUTHORIZATION ERRORS
// ============================================================================

/**
 * Authorization error
 */
export class AuthorizationError extends ServiceException {
  constructor(message: string, code: string, metadata?: Record<string, any>) {
    super({ message, code, metadata })
  }
}

/**
 * Insufficient permissions
 */
export class InsufficientPermissionsError extends AuthorizationError {
  constructor(resource?: string) {
    super(
      resource
        ? `Insufficient permissions to access ${resource}`
        : 'Insufficient permissions',
      'INSUFFICIENT_PERMISSIONS',
      resource ? { resource } : undefined
    )
  }
}

/**
 * Insufficient role
 */
export class InsufficientRoleError extends AuthorizationError {
  constructor(requiredRole: string) {
    super(
      `Insufficient role: ${requiredRole} required`,
      'INSUFFICIENT_ROLE',
      { requiredRole }
    )
  }
}

/**
 * Tenant access denied
 */
export class TenantAccessDeniedError extends AuthorizationError {
  constructor(tenantId?: string) {
    super(
      'Access denied to tenant',
      'TENANT_ACCESS_DENIED',
      tenantId ? { tenantId } : undefined
    )
  }
}

/**
 * Resource access denied
 */
export class ResourceAccessDeniedError extends AuthorizationError {
  constructor(resourceType: string, resourceId?: string) {
    super(
      `Access denied to ${resourceType}`,
      'RESOURCE_ACCESS_DENIED',
      { resourceType, ...(resourceId && { resourceId }) }
    )
  }
}

// ============================================================================
// RATE LIMITING ERRORS
// ============================================================================

/**
 * Rate limit error
 */
export class RateLimitError extends ServiceException {
  constructor(message: string, retryAfter?: number) {
    super({
      message,
      code: 'RATE_LIMIT_EXCEEDED',
      metadata: retryAfter ? { retryAfter } : undefined,
    })
  }
}

/**
 * Too many login attempts
 */
export class TooManyLoginAttemptsError extends RateLimitError {
  constructor(retryAfter?: number) {
    super(
      retryAfter
        ? `Too many login attempts. Try again in ${retryAfter} seconds`
        : 'Too many login attempts',
      retryAfter
    )
  }
}

/**
 * Too many password reset attempts
 */
export class TooManyPasswordResetAttemptsError extends RateLimitError {
  constructor() {
    super('Too many password reset attempts')
  }
}

/**
 * Too many verification attempts
 */
export class TooManyVerificationAttemptsError extends RateLimitError {
  constructor() {
    super('Too many verification attempts')
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if error is a service exception
 */
export function isServiceException(error: any): error is ServiceException {
  return error instanceof ServiceException
}

/**
 * Check if error is an auth-related service exception
 */
export function isAuthServiceError(error: any): boolean {
  return (
    error instanceof InvalidCredentialsError ||
    error instanceof SessionError ||
    error instanceof TokenError ||
    error instanceof UserAccountError ||
    error instanceof AuthorizationError
  )
}
