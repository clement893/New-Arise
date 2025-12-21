"""Email service using SendGrid."""

import os
from typing import List, Optional, Dict, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from sendgrid.helpers.mail.exceptions import SendGridException


class EmailService:
    """Service for sending emails via SendGrid."""

    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", os.getenv("FROM_EMAIL", "hello@nukleo.digital"))
        self.from_name = os.getenv("SENDGRID_FROM_NAME", os.getenv("FROM_NAME", "NukleoHUB"))

        if not self.api_key:
            self.client = None
            print("Warning: SENDGRID_API_KEY is not configured. Email sending will be disabled.")
        else:
            self.client = SendGridAPIClient(api_key=self.api_key)

    def is_configured(self) -> bool:
        """Check if SendGrid is configured."""
        return self.client is not None

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
        reply_to: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Send an email via SendGrid.

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content (optional, auto-generated from HTML if not provided)
            from_email: Sender email (defaults to SENDGRID_FROM_EMAIL)
            from_name: Sender name (defaults to SENDGRID_FROM_NAME)
            reply_to: Reply-to email address
            cc: List of CC email addresses
            bcc: List of BCC email addresses

        Returns:
            Dict with status and message_id

        Raises:
            ValueError: If SendGrid is not configured
            RuntimeError: If email sending fails
        """
        if not self.is_configured():
            raise ValueError("SendGrid service is not configured. Please set SENDGRID_API_KEY.")

        from_email = from_email or self.from_email
        from_name = from_name or self.from_name

        # Create email message
        message = Mail(
            from_email=Email(from_email, from_name),
            to_emails=To(to_email),
            subject=subject,
            html_content=Content("text/html", html_content),
        )

        # Add text content if provided
        if text_content:
            message.plain_text_content = Content("text/plain", text_content)

        # Add reply-to if provided
        if reply_to:
            message.reply_to = Email(reply_to)

        # Add CC if provided
        if cc:
            message.cc = [To(email) for email in cc]

        # Add BCC if provided
        if bcc:
            message.bcc = [To(email) for email in bcc]

        try:
            response = self.client.send(message)
            return {
                "status": "sent",
                "status_code": response.status_code,
                "message_id": response.headers.get("X-Message-Id"),
                "to": to_email,
            }
        except SendGridException as e:
            raise RuntimeError(f"Failed to send email via SendGrid: {e}")

    def send_welcome_email(self, to_email: str, name: str) -> Dict[str, Any]:
        """Send a welcome email to a new user."""
        subject = f"Welcome to {self.from_name}!"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4F46E5;">Welcome to {self.from_name}!</h1>
                <p>Hi {name},</p>
                <p>Thank you for joining {self.from_name}! We're excited to have you on board.</p>
                <p>If you have any questions, feel free to reach out to us.</p>
                <p>Best regards,<br>The {self.from_name} Team</p>
            </div>
        </body>
        </html>
        """
        text_content = f"""
        Welcome to {self.from_name}!

        Hi {name},

        Thank you for joining {self.from_name}! We're excited to have you on board.

        If you have any questions, feel free to reach out to us.

        Best regards,
        The {self.from_name} Team
        """
        return await self.send_email(to_email, subject, html_content, text_content)

    def send_password_reset_email(
        self, to_email: str, name: str, reset_token: str, reset_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send a password reset email."""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        if not reset_url:
            reset_url = f"{frontend_url}/auth/reset-password?token={reset_token}"

        subject = f"Password Reset Request - {self.from_name}"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4F46E5;">Password Reset Request</h1>
                <p>Hi {name},</p>
                <p>We received a request to reset your password. Click the button below to reset it:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">{reset_url}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>The {self.from_name} Team</p>
            </div>
        </body>
        </html>
        """
        text_content = f"""
        Password Reset Request

        Hi {name},

        We received a request to reset your password. Use the link below to reset it:

        {reset_url}

        This link will expire in 1 hour.

        If you didn't request this, please ignore this email.

        Best regards,
        The {self.from_name} Team
        """
        return await self.send_email(to_email, subject, html_content, text_content)

    def send_verification_email(
        self, to_email: str, name: str, verification_token: str, verification_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send an email verification email."""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        if not verification_url:
            verification_url = f"{frontend_url}/auth/verify-email?token={verification_token}"

        subject = f"Verify Your Email - {self.from_name}"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4F46E5;">Verify Your Email</h1>
                <p>Hi {name},</p>
                <p>Please verify your email address by clicking the button below:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email
                    </a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">{verification_url}</p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>The {self.from_name} Team</p>
            </div>
        </body>
        </html>
        """
        text_content = f"""
        Verify Your Email

        Hi {name},

        Please verify your email address by clicking the link below:

        {verification_url}

        This link will expire in 24 hours.

        Best regards,
        The {self.from_name} Team
        """
        return await self.send_email(to_email, subject, html_content, text_content)

