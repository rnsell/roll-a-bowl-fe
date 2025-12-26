/**
 * Email Verification Template
 *
 * HTML and plain text templates for email verification messages
 */

import type { VerificationEmailData } from '../types'

/**
 * Generate HTML email for email verification
 */
export function generateVerificationEmailHtml(data: VerificationEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to Tenant App!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600;">Hi ${data.firstName}! 👋</h2>

              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                Thanks for signing up! We're excited to have you on board. To complete your registration and access all features, please verify your email address.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 32px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${data.verificationUrl}"
                       style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                ${data.verificationUrl}
              </p>

              <!-- Expiry Notice -->
              <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                  ⏰ This verification link will expire in <strong>${data.expiresInHours} hours</strong>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; line-height: 20px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 16px;">
                © ${new Date().getFullYear()} Tenant App. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text email for email verification
 */
export function generateVerificationEmailText(data: VerificationEmailData): string {
  return `
Hi ${data.firstName}!

Welcome to Tenant App! Thanks for signing up.

To complete your registration and access all features, please verify your email address by clicking the link below:

${data.verificationUrl}

This verification link will expire in ${data.expiresInHours} hours.

If you didn't create an account, you can safely ignore this email.

---
© ${new Date().getFullYear()} Tenant App. All rights reserved.
  `.trim()
}
