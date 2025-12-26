/**
 * Resend Email Provider
 *
 * Sends transactional emails using Resend (https://resend.com)
 * Resend is a modern email API with excellent deliverability.
 */

import { Resend } from 'resend'
import { createLogger } from '@/lib/config/logging'
import { ok, err } from '@/lib/common/result'
import type { Result } from '@/lib/common/result'
import { config } from '@/lib/config'
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
import { generateVerificationEmailHtml, generateVerificationEmailText } from '../templates/verification-email'
import { generatePasswordResetEmailHtml, generatePasswordResetEmailText } from '../templates/password-reset-email'

const logger = createLogger('ResendEmailProvider')

export class ResendEmailProvider implements EmailProvider {
  private resend: Resend

  constructor() {
    if (!config.resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is required for Resend email provider')
    }

    this.resend = new Resend(config.resendApiKey)
    logger.info('Resend email provider initialized')
  }

  /**
   * Send a verification email via Resend
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<Result<void, VerificationEmailSendError>> {
    const html = generateVerificationEmailHtml(data)
    const text = generateVerificationEmailText(data)

    try {
      const result = await this.resend.emails.send({
        from: `${config.transactionEmailFromName} <${config.transactionAuthEmailFromAddress}>`,
        to: data.email,
        subject: 'Verify your email address',
        html,
        text,
      })

      logger.info(
        {
          emailId: result.data?.id,
          to: data.email,
          subject: 'Verify your email address',
        },
        'Verification email sent via Resend'
      )

      return ok(undefined)
    } catch (error) {
      logger.error(
        {
          error,
          to: data.email,
        },
        'Failed to send verification email via Resend'
      )

      return err(new VerificationEmailSendError(data.email, error instanceof Error ? error : undefined))
    }
  }

  /**
   * Send a password reset email via Resend
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<Result<void, PasswordResetEmailSendError>> {
    const html = generatePasswordResetEmailHtml(data)
    const text = generatePasswordResetEmailText(data)

    try {
      const result = await this.resend.emails.send({
        from: `${config.transactionEmailFromName} <${config.transactionAuthEmailFromAddress}>`,
        to: data.email,
        subject: 'Reset your password',
        html,
        text,
      })

      logger.info(
        {
          emailId: result.data?.id,
          to: data.email,
          subject: 'Reset your password',
        },
        'Password reset email sent via Resend'
      )

      return ok(undefined)
    } catch (error) {
      logger.error(
        {
          error,
          to: data.email,
        },
        'Failed to send password reset email via Resend'
      )

      return err(new PasswordResetEmailSendError(data.email, error instanceof Error ? error : undefined))
    }
  }

  /**
   * Send a welcome email via Resend
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<Result<void, WelcomeEmailSendError>> {
    // For welcome email, we'll create a simple HTML template
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to Tenant App!</h1>
        <p>Hi ${data.firstName} ${data.lastName},</p>
        <p>Thanks for joining Tenant App. We're excited to have you on board!</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br/>The Tenant App Team</p>
      </div>
    `

    const text = `Welcome to Tenant App!

Hi ${data.firstName} ${data.lastName},

Thanks for joining Tenant App. We're excited to have you on board!

If you have any questions, feel free to reach out to our support team.

Best regards,
The Tenant App Team`

    try {
      const result = await this.resend.emails.send({
        from: `${config.transactionEmailFromName} <${config.transactionAuthEmailFromAddress}>`,
        to: data.email,
        subject: 'Welcome to Tenant App!',
        html,
        text,
      })

      logger.info(
        {
          emailId: result.data?.id,
          to: data.email,
          subject: 'Welcome to Tenant App!',
        },
        'Welcome email sent via Resend'
      )

      return ok(undefined)
    } catch (error) {
      logger.error(
        {
          error,
          to: data.email,
        },
        'Failed to send welcome email via Resend'
      )

      return err(new WelcomeEmailSendError(data.email, error instanceof Error ? error : undefined))
    }
  }
}
