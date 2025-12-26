/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface UserLoginDto {
  /**
   * User email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * User password (minimum 8 characters)
   * @minLength 8
   * @example "SecurePass123!"
   */
  password: string;
}

export interface UserLoginResponseDto {
  /** @example true */
  success: boolean;
  /**
   * JWT token for authenticated requests
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  token?: string;
  /**
   * Token expiration date
   * @format date-time
   * @example "2025-12-21T12:00:00Z"
   */
  expiresAt?: string;
  /**
   * User information
   * @example {"id":42,"email":"user@example.com","firstName":"John","lastName":"Doe","emailVerified":true}
   */
  user?: object;
  /**
   * Error message if login failed
   * @example "Invalid credentials"
   */
  error?: string;
}

export interface UserRegisterDto {
  /**
   * User email address
   * @example "newuser@example.com"
   */
  email: string;
  /**
   * User password (minimum 8 characters)
   * @minLength 8
   * @example "SecurePass123!"
   */
  password: string;
  /**
   * User first name
   * @minLength 1
   * @example "John"
   */
  firstName: string;
  /**
   * User last name
   * @minLength 1
   * @example "Doe"
   */
  lastName: string;
}

export interface UserRegisterResponseDto {
  /** @example true */
  success: boolean;
  /**
   * Newly created user information
   * @example {"id":42,"email":"newuser@example.com","firstName":"John","lastName":"Doe","emailVerified":false,"createdAt":"2025-12-20T12:00:00Z"}
   */
  user?: object;
  /**
   * Email verification token (for client to send verification email)
   * @example "a1b2c3d4e5f6789..."
   */
  verificationToken?: string;
  /**
   * Verification token expiration timestamp
   * @format date-time
   * @example "2025-12-25T12:00:00Z"
   */
  verificationExpiresAt?: string;
  /**
   * General error message
   * @example "Email already registered"
   */
  error?: string;
  /**
   * Field-specific validation errors
   * @example [{"field":"email","message":"Email must be valid"}]
   */
  errors?: string[];
}

export interface RequestEmailVerificationDto {
  /**
   * User ID to request verification for
   * @example 123
   */
  userId: number;
}

export interface RequestEmailVerificationResponseDto {
  /** @example true */
  success: boolean;
  /**
   * Verification token to include in email link
   * @example "a1b2c3d4e5f6..."
   */
  token?: string;
  /**
   * Token expiration timestamp
   * @format date-time
   * @example "2025-12-25T12:00:00Z"
   */
  expiresAt?: string;
  /**
   * User information for email personalization
   * @example {"id":123,"email":"user@example.com","firstName":"John","lastName":"Doe"}
   */
  user?: object;
  /**
   * Error message if token generation failed
   * @example "User not found"
   */
  error?: string;
}

export interface EmailVerificationDto {
  /**
   * Email verification token
   * @example "a1b2c3d4e5f6789..."
   */
  token: string;
}

export interface EmailVerificationResponseDto {
  /** @example true */
  success: boolean;
  /** @example "Email verified successfully" */
  message: string;
  /**
   * Error message if verification failed
   * @example "Invalid or expired token"
   */
  error?: string;
}

export interface PasswordResetRequestDto {
  /**
   * User email address
   * @example "user@example.com"
   */
  email: string;
}

export interface PasswordResetRequestResponseDto {
  /**
   * User's email address (for client to send email)
   * @example "user@example.com"
   */
  email: string;
  /**
   * User's first name (for personalized email)
   * @example "John"
   */
  firstName: string;
  /**
   * User's last name (for personalized email)
   * @example "Doe"
   */
  lastName: string;
  /**
   * Password reset token (for client to include in reset URL)
   * @example "a1b2c3d4e5f6789..."
   */
  token: string;
}

export interface PasswordResetDto {
  /**
   * Password reset token
   * @example "a1b2c3d4e5f6789..."
   */
  token: string;
  /**
   * New password (minimum 8 characters)
   * @minLength 8
   * @example "NewSecurePass123!"
   */
  newPassword: string;
}

export interface PasswordResetResponseDto {
  /** @example true */
  success: boolean;
  /** @example "Password reset successfully" */
  message: string;
  /**
   * Error message if reset failed
   * @example "Invalid or expired token"
   */
  error?: string;
}

export interface EmailVerificationStatusResponseDto {
  /** @example true */
  success: boolean;
  /** @example true */
  emailVerified: boolean;
  /**
   * Error message if status check failed
   * @example "User not found"
   */
  error?: string;
}

export interface ExchangeTokenDto {
  /**
   * API key for tenant authentication
   * @example "sk_live_abc123xyz789"
   */
  apiKey: string;
}

export interface ExchangeTokenResponseDto {
  /** @example true */
  success: boolean;
  /**
   * JWT token for API access
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  token: string;
  /**
   * Token expiration date
   * @format date-time
   * @example "2025-12-21T12:00:00Z"
   */
  expiresAt: string;
  /**
   * Tenant information
   * @example {"id":1,"name":"Acme Corp","slug":"acme-corp"}
   */
  tenant: object;
}

export interface RevokeTokenDto {
  /**
   * JWT token to revoke
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  token: string;
}

export interface RevokeTokenResponseDto {
  /** @example true */
  success: boolean;
  /** @example "Token revoked successfully" */
  message: string;
}

export interface TenantInfoResponseDto {
  /** @example true */
  success: boolean;
  /**
   * Tenant information from Bearer token
   * @example {"id":1,"name":"Acme Corporation","slug":"acme-corp","status":"active","createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-15T12:00:00Z"}
   */
  tenant?: object;
  /**
   * Error message if request failed
   * @example "Tenant context not available"
   */
  error?: string;
}

export interface AuthControllerGetEmailVerificationStatusParams {
  email: string;
}
