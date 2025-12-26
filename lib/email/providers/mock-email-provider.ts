/**
 * Mock Email Provider
 *
 * Logs email content to console instead of sending actual emails.
 * Useful for development and testing.
 */

import { createLogger } from '@/lib/config/logging'
import { ok } from '@/lib/common/result'
import type { Result } from '@/lib/common/result'
import type {
  EmailProvider,
  VerificationEmailData,
  PasswordResetEmailData,
  WelcomeEmailData,
} from '../types'
import {
  VerificationEmailSendError,
  PasswordResetEmailSendError,
  WelcomeEmailSendError,
} from '../email-errors'
import { generateVerificationEmailText } from '../templates/verification-email'
import { generatePasswordResetEmailText } from '../templates/password-reset-email'
import { config } from '@/lib/config'

const logger = createLogger('MockEmailProvider')

export class MockEmailProvider implements EmailProvider {
  /**
   * Send a verification email (mock - logs to console)
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<Result<void, VerificationEmailSendError>> {
    const text = generateVerificationEmailText(data)
    // HTML version is available via generateVerificationEmailHtml(data) if needed

    // Log structured data for debugging
    logger.info(
      {
        to: data.email,
        from: config.transactionAuthEmailFromAddress,
        subject: 'Verify your email address',
        verificationUrl: data.verificationUrl,
        expiresInHours: data.expiresInHours,
      },
      'Mock Email: Verification Email'
    )

    // Pretty console output for easy copy-paste of verification URL
    console.log('\n')
    console.log('━'.repeat(80))
    console.log('📧  VERIFICATION EMAIL (Mock)')
    console.log('━'.repeat(80))
    console.log(`To:        ${data.email}`)
    console.log(`From:      ${config.transactionEmailFromName} <${config.transactionAuthEmailFromAddress}>`)
    console.log(`Subject:   Verify your email address`)
    console.log('━'.repeat(80))
    console.log(`\n🔗 VERIFICATION URL (Click to verify):`)
    console.log(`   ${data.verificationUrl}`)
    console.log(`\n⏰ Expires in: ${data.expiresInHours} hours`)
    console.log('━'.repeat(80))
    console.log('\n📄 Plain Text Preview:')
    console.log('─'.repeat(80))
    console.log(text)
    console.log('─'.repeat(80))
    console.log('\n')

    return ok(undefined)
  }

  /**
   * Send a password reset email (mock - logs to console)
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<Result<void, PasswordResetEmailSendError>> {
    const text = generatePasswordResetEmailText(data)
    // HTML version is available via generatePasswordResetEmailHtml(data) if needed

    // Log structured data for debugging
    logger.info(
      {
        to: data.email,
        from: config.transactionAuthEmailFromAddress,
        subject: 'Reset your password',
        resetUrl: data.resetUrl,
        expiresInHours: data.expiresInHours,
      },
      'Mock Email: Password Reset Email'
    )

    // Pretty console output for easy copy-paste of reset URL
    console.log('\n')
    console.log('━'.repeat(80))
    console.log('📧  PASSWORD RESET EMAIL (Mock)')
    console.log('━'.repeat(80))
    console.log(`To:        ${data.email}`)
    console.log(`From:      ${config.transactionEmailFromName} <${config.transactionAuthEmailFromAddress}>`)
    console.log(`Subject:   Reset your password`)
    console.log('━'.repeat(80))
    console.log(`\n🔗 RESET URL (Click to reset password):`)
    console.log(`   ${data.resetUrl}`)
    console.log(`\n⏰ Expires in: ${data.expiresInHours} hours`)
    console.log('━'.repeat(80))
    console.log('\n📄 Plain Text Preview:')
    console.log('─'.repeat(80))
    console.log(text)
    console.log('─'.repeat(80))
    console.log('\n')

    return ok(undefined)
  }

  /**
   * Send a welcome email (mock - logs to console)
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<Result<void, WelcomeEmailSendError>> {
    // Log structured data for debugging
    logger.info(
      {
        to: data.email,
        from: config.transactionAuthEmailFromAddress,
        subject: 'Welcome to Tenant App!',
      },
      'Mock Email: Welcome Email'
    )

    // Pretty console output
    console.log('\n')
    console.log('━'.repeat(80))
    console.log('📧  WELCOME EMAIL (Mock)')
    console.log('━'.repeat(80))
    console.log(`To:        ${data.email}`)
    console.log(`From:      ${config.transactionEmailFromName} <${config.transactionAuthEmailFromAddress}>`)
    console.log(`Subject:   Welcome to Tenant App!`)
    console.log('━'.repeat(80))
    console.log(`\n👋 Welcome ${data.firstName} ${data.lastName}!`)
    console.log('\n   Thanks for joining Tenant App. We\'re excited to have you on board!')
    console.log('━'.repeat(80))
    console.log('\n')

    return ok(undefined)
  }
}
