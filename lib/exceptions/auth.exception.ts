/**
 * Authentication Exception Utilities
 *
 * Helpers for mapping between service exceptions and HTTP exceptions
 * Used in API routes to convert internal errors to HTTP responses
 */

import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  TooManyRequestsException,
} from './http.exception'

import {
  InvalidCredentialsError,
  SessionNotFoundError,
  SessionExpiredError,
  SessionInvalidError,
  TokenMissingError,
  TokenInvalidError,
  TokenExpiredError,
  TokenRevokedError,
  UserNotFoundError,
  EmailNotVerifiedError,
  AccountLockedError,
  AccountSuspendedError,
  AccountDeactivatedError,
  EmailAlreadyExistsError,
  InsufficientPermissionsError,
  InsufficientRoleError,
  TenantAccessDeniedError,
  ResourceAccessDeniedError,
  InvalidEmailError,
  InvalidPasswordError,
  WeakPasswordError,
  MissingFieldError,
  TooManyLoginAttemptsError,
  TooManyPasswordResetAttemptsError,
  TooManyVerificationAttemptsError,
  isServiceException,
} from './service.exception'

/**
 * Maps service exceptions to HTTP exceptions for API responses
 */
export function mapServiceToHttpException(error: Error): Error {
  // Invalid credentials -> 401
  if (error instanceof InvalidCredentialsError) {
    return new UnauthorizedException(error.message)
  }

  // Session errors -> 401
  if (
    error instanceof SessionNotFoundError ||
    error instanceof SessionExpiredError ||
    error instanceof SessionInvalidError
  ) {
    return new UnauthorizedException(error.message)
  }

  // Token errors -> 401
  if (
    error instanceof TokenMissingError ||
    error instanceof TokenInvalidError ||
    error instanceof TokenExpiredError ||
    error instanceof TokenRevokedError
  ) {
    return new UnauthorizedException(error.message)
  }

  // User account status errors -> 401
  if (
    error instanceof EmailNotVerifiedError ||
    error instanceof AccountLockedError ||
    error instanceof AccountSuspendedError ||
    error instanceof AccountDeactivatedError
  ) {
    return new UnauthorizedException(error.message)
  }

  // Authorization errors -> 403
  if (
    error instanceof InsufficientPermissionsError ||
    error instanceof InsufficientRoleError ||
    error instanceof TenantAccessDeniedError ||
    error instanceof ResourceAccessDeniedError
  ) {
    return new ForbiddenException(error.message)
  }

  // Not found errors -> 404
  if (error instanceof UserNotFoundError) {
    return new NotFoundException(error.message)
  }

  // Conflict errors -> 409
  if (error instanceof EmailAlreadyExistsError) {
    return new ConflictException(error.message)
  }

  // Validation errors -> 400
  if (
    error instanceof InvalidEmailError ||
    error instanceof InvalidPasswordError ||
    error instanceof WeakPasswordError ||
    error instanceof MissingFieldError
  ) {
    return new BadRequestException(error.message)
  }

  // Rate limit errors -> 429
  if (
    error instanceof TooManyLoginAttemptsError ||
    error instanceof TooManyPasswordResetAttemptsError ||
    error instanceof TooManyVerificationAttemptsError
  ) {
    return new TooManyRequestsException(error.message)
  }

  // Return original error if no mapping found
  return error
}

/**
 * Maps backend API error status codes to service exceptions
 */
export function mapBackendErrorToServiceException(error: any): Error {
  const statusCode = error?.statusCode || error?.status
  const message = error?.message || 'Authentication failed'

  switch (statusCode) {
    case 400:
      if (message.toLowerCase().includes('email')) {
        return new InvalidEmailError()
      }
      if (message.toLowerCase().includes('password')) {
        return new InvalidPasswordError()
      }
      return new InvalidCredentialsError()

    case 401:
      if (message.toLowerCase().includes('token')) {
        return new TokenInvalidError()
      }
      if (message.toLowerCase().includes('session')) {
        return new SessionInvalidError()
      }
      if (message.toLowerCase().includes('expired')) {
        return new TokenExpiredError()
      }
      return new InvalidCredentialsError()

    case 403:
      if (message.toLowerCase().includes('tenant')) {
        return new TenantAccessDeniedError()
      }
      return new InsufficientPermissionsError()

    case 404:
      return new UserNotFoundError()

    case 409:
      if (message.toLowerCase().includes('email')) {
        return new EmailAlreadyExistsError(error?.email || '')
      }
      return error instanceof Error ? error : new Error(message)

    case 429:
      return new TooManyLoginAttemptsError()

    default:
      return error instanceof Error ? error : new Error(message)
  }
}

/**
 * Converts any error to an HTTP exception for API responses
 */
export function toHttpException(error: Error): Error {
  // If it's already an HTTP exception, return as-is
  if (error.constructor.name.includes('Exception')) {
    return error
  }

  // If it's a service exception, map it
  if (isServiceException(error)) {
    return mapServiceToHttpException(error)
  }

  // Generic error mapping
  return error
}
