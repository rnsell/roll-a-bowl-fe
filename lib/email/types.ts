/**
 * Email Service Types
 *
 * Type definitions for email functionality including messages,
 * templates, and provider interfaces.
 */

import type { Result } from '@/lib/common/result'
import type {
  VerificationEmailSendError,
  PasswordResetEmailSendError,
  WelcomeEmailSendError,
} from './email-errors'

// ============================================================================
// EMAIL MESSAGE TYPES
// ============================================================================

/**
 * Base email message structure
 */
export interface EmailMessage {
  to: string
  from: string
  subject: string
  html: string
  text?: string
}

/**
 * Email template types supported by the system
 */
export type EmailTemplateType = 'verification' | 'password-reset' | 'welcome'

// ============================================================================
// VERIFICATION EMAIL DATA
// ============================================================================

/**
 * Data required to send an email verification message
 */
export interface VerificationEmailData {
  email: string
  firstName: string
  lastName: string
  verificationUrl: string
  expiresInHours: number
}

// ============================================================================
// PASSWORD RESET EMAIL DATA
// ============================================================================

/**
 * Data required to send a password reset message
 */
export interface PasswordResetEmailData {
  email: string
  firstName: string
  lastName: string
  resetUrl: string
  expiresInHours: number
}

// ============================================================================
// WELCOME EMAIL DATA
// ============================================================================

/**
 * Data required to send a welcome message
 */
export interface WelcomeEmailData {
  email: string
  firstName: string
  lastName: string
}

// ============================================================================
// EMAIL PROVIDER INTERFACE
// ============================================================================

/**
 * Interface that all email providers must implement
 * This allows easy swapping between mock, SendGrid, AWS SES, etc.
 *
 * All methods return Result types for explicit error handling
 */
export interface EmailProvider {
  /**
   * Send an email verification message
   * Returns Result with void on success, or VerificationEmailSendError on failure
   */
  sendVerificationEmail(data: VerificationEmailData): Promise<Result<void, VerificationEmailSendError>>

  /**
   * Send a password reset message
   * Returns Result with void on success, or PasswordResetEmailSendError on failure
   */
  sendPasswordResetEmail(data: PasswordResetEmailData): Promise<Result<void, PasswordResetEmailSendError>>

  /**
   * Send a welcome message
   * Returns Result with void on success, or WelcomeEmailSendError on failure
   */
  sendWelcomeEmail(data: WelcomeEmailData): Promise<Result<void, WelcomeEmailSendError>>
}

// ============================================================================
// EMAIL PROVIDER TYPE
// ============================================================================

/**
 * Available email provider implementations
 */
export type EmailProviderType = 'mock' | 'resend'
