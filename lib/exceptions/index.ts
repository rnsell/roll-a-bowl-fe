/**
 * Exception Classes Export
 *
 * Central export point for all application exceptions
 */

// ============================================================================
// HTTP EXCEPTIONS (for API responses)
// ============================================================================

export {
  // Enums and Constants
  HttpStatusCode,
  HTTP_ERROR_CODES,

  // Exception Classes
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  TooManyRequestsException,
  InternalServerErrorException,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,

  // Type Guards
  isHttpException,

  // Types
  type HttpExceptionOptions,
} from './http.exception'

// ============================================================================
// SERVICE EXCEPTIONS (for internal application logic)
// ============================================================================

export {
  ServiceException,
  type ServiceExceptionOptions,

  // Authentication
  InvalidCredentialsError,
  SessionError,
  SessionNotFoundError,
  SessionExpiredError,
  SessionInvalidError,
  SessionCreationError,
  TokenError,
  TokenMissingError,
  TokenInvalidError,
  TokenExpiredError,
  TokenRevokedError,
  TokenRefreshError,

  // User Account
  UserAccountError,
  UserNotFoundError,
  EmailNotVerifiedError,
  AccountLockedError,
  AccountSuspendedError,
  AccountDeactivatedError,
  EmailAlreadyExistsError,

  // Validation
  ValidationError,
  InvalidEmailError,
  InvalidPasswordError,
  WeakPasswordError,
  MissingFieldError,

  // Authorization
  AuthorizationError,
  InsufficientPermissionsError,
  InsufficientRoleError,
  TenantAccessDeniedError,
  ResourceAccessDeniedError,

  // Rate Limiting
  RateLimitError,
  TooManyLoginAttemptsError,
  TooManyPasswordResetAttemptsError,
  TooManyVerificationAttemptsError,

  // Type Guards
  isServiceException,
  isAuthServiceError,
} from './service.exception'

// ============================================================================
// EXCEPTION MAPPING UTILITIES
// ============================================================================

export {
  mapServiceToHttpException,
  mapBackendErrorToServiceException,
  toHttpException,
} from './auth.exception'
