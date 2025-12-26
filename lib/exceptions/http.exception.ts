/**
 * HTTP Exception Classes
 *
 * Used for API responses and Express route handlers
 * These map directly to HTTP status codes
 */

// ============================================================================
// HTTP STATUS CODE ENUMS
// ============================================================================

/**
 * Standard HTTP status codes
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export enum HttpStatusCode {
  // 2xx Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // 3xx Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,

  // 4xx Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  IM_A_TEAPOT = 418,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  FAILED_DEPENDENCY = 424,
  TOO_EARLY = 425,
  UPGRADE_REQUIRED = 426,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
  UNAVAILABLE_FOR_LEGAL_REASONS = 451,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
  VARIANT_ALSO_NEGOTIATES = 506,
  INSUFFICIENT_STORAGE = 507,
  LOOP_DETECTED = 508,
  NOT_EXTENDED = 510,
  NETWORK_AUTHENTICATION_REQUIRED = 511,
}

/**
 * Common HTTP error status codes for quick reference
 */
export const HTTP_ERROR_CODES = {
  BAD_REQUEST: HttpStatusCode.BAD_REQUEST,
  UNAUTHORIZED: HttpStatusCode.UNAUTHORIZED,
  FORBIDDEN: HttpStatusCode.FORBIDDEN,
  NOT_FOUND: HttpStatusCode.NOT_FOUND,
  CONFLICT: HttpStatusCode.CONFLICT,
  UNPROCESSABLE_ENTITY: HttpStatusCode.UNPROCESSABLE_ENTITY,
  TOO_MANY_REQUESTS: HttpStatusCode.TOO_MANY_REQUESTS,
  INTERNAL_SERVER_ERROR: HttpStatusCode.INTERNAL_SERVER_ERROR,
  BAD_GATEWAY: HttpStatusCode.BAD_GATEWAY,
  SERVICE_UNAVAILABLE: HttpStatusCode.SERVICE_UNAVAILABLE,
  GATEWAY_TIMEOUT: HttpStatusCode.GATEWAY_TIMEOUT,
} as const

export interface HttpExceptionOptions {
  message: string
  statusCode: number
  cause?: Error
  metadata?: Record<string, any>
}

/**
 * Base HTTP exception for API responses
 */
export class HttpException extends Error {
  public readonly statusCode: number
  public readonly cause?: Error
  public readonly metadata?: Record<string, any>
  public readonly timestamp: Date

  constructor(options: HttpExceptionOptions) {
    super(options.message)
    this.name = this.constructor.name
    this.statusCode = options.statusCode
    this.cause = options.cause
    this.metadata = options.metadata
    this.timestamp = new Date()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Format for Express error response
   */
  toErrorResponse() {
    return {
      success: false,
      error: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      ...(this.metadata && { metadata: this.metadata }),
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
      ...(this.cause && { cause: this.cause.message }),
    }
  }
}

/**
 * HTTP 400 - Bad Request
 */
export class BadRequestException extends HttpException {
  constructor(message: string, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.BAD_REQUEST, metadata })
  }
}

/**
 * HTTP 401 - Unauthorized
 */
export class UnauthorizedException extends HttpException {
  constructor(message: string, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.UNAUTHORIZED, metadata })
  }
}

/**
 * HTTP 403 - Forbidden
 */
export class ForbiddenException extends HttpException {
  constructor(message: string, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.FORBIDDEN, metadata })
  }
}

/**
 * HTTP 404 - Not Found
 */
export class NotFoundException extends HttpException {
  constructor(message: string, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.NOT_FOUND, metadata })
  }
}

/**
 * HTTP 409 - Conflict
 */
export class ConflictException extends HttpException {
  constructor(message: string, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.CONFLICT, metadata })
  }
}

/**
 * HTTP 422 - Unprocessable Entity
 */
export class UnprocessableEntityException extends HttpException {
  constructor(message: string, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.UNPROCESSABLE_ENTITY, metadata })
  }
}

/**
 * HTTP 429 - Too Many Requests
 */
export class TooManyRequestsException extends HttpException {
  constructor(message: string, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.TOO_MANY_REQUESTS, metadata })
  }
}

/**
 * HTTP 500 - Internal Server Error
 */
export class InternalServerErrorException extends HttpException {
  constructor(message: string, cause?: Error, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR, cause, metadata })
  }
}

/**
 * HTTP 502 - Bad Gateway
 */
export class BadGatewayException extends HttpException {
  constructor(message: string, cause?: Error, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.BAD_GATEWAY, cause, metadata })
  }
}

/**
 * HTTP 503 - Service Unavailable
 */
export class ServiceUnavailableException extends HttpException {
  constructor(message: string, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.SERVICE_UNAVAILABLE, metadata })
  }
}

/**
 * HTTP 504 - Gateway Timeout
 */
export class GatewayTimeoutException extends HttpException {
  constructor(message: string, metadata?: Record<string, any>) {
    super({ message, statusCode: HttpStatusCode.GATEWAY_TIMEOUT, metadata })
  }
}

/**
 * Type guard to check if error is an HTTP exception
 */
export function isHttpException(error: any): error is HttpException {
  return error instanceof HttpException
}
