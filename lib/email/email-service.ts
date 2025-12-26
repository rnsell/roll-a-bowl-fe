/**
 * Email Service Factory
 *
 * Creates and exports the appropriate email provider based on configuration.
 * Uses ts-pattern for type-safe provider selection.
 */

import { match } from 'ts-pattern'
import { config } from '@/lib/config'
import { createLogger } from '@/lib/config/logging'
import type { EmailProvider, EmailProviderType } from './types'
import { MockEmailProvider } from './providers/mock-email-provider'
import { ResendEmailProvider } from './providers/resend-email-provider'

const logger = createLogger('EmailService')

/**
 * Create email provider based on configuration
 * Uses ts-pattern for exhaustive type-safe matching
 */
function createEmailProvider(): EmailProvider {
  const provider = match<EmailProviderType, EmailProvider>(config.transactionEmailProvider)
    .with('mock', () => {
      logger.info('Using Mock Email Provider (emails will be logged to console)')
      return new MockEmailProvider()
    })
    .with('resend', () => {
      logger.info('Using Resend Email Provider')
      return new ResendEmailProvider()
    })
    .exhaustive()

  return provider
}

/**
 * Singleton email service instance
 * Use this throughout the application for sending emails
 */
export const emailService = createEmailProvider()

/**
 * Export types for convenience
 */
export type { EmailProvider, VerificationEmailData, PasswordResetEmailData, WelcomeEmailData } from './types'
