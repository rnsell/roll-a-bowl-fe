/**
 * Email Service Module
 *
 * Centralized email functionality with support for multiple providers.
 * Exports the configured email service and related types.
 */

export { emailService } from './email-service'
export type {
  EmailProvider,
  EmailProviderType,
  EmailMessage,
  VerificationEmailData,
  PasswordResetEmailData,
  WelcomeEmailData,
} from './types'
