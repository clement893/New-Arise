"""
Email Templates

Professional email templates for SaaS application using SendGrid.

This module provides a collection of pre-designed email templates for common
transactional emails including welcome, password reset, invoices, subscriptions, etc.

All templates use a responsive design with both HTML and plain text versions.

Usage:
    from app.services.email_templates import EmailTemplates
    
    template = EmailTemplates.welcome("John Doe", "https://app.com/login")
    email_service.send_email(
        to_email="user@example.com",
        subject=template["subject"],
        html_content=template["html"],
        text_content=template["text"]
    )

Available Templates:
    - welcome: Welcome email for new users
    - password_reset: Password reset email with token
    - email_verification: Email verification link
    - invoice: Invoice email with details and items
    - subscription_created: Subscription confirmation email
    - subscription_cancelled: Subscription cancellation confirmation
    - trial_ending: Trial period ending reminder
"""

from typing import Optional, Dict, Any
import os


class EmailTemplates:
    """Collection of email templates"""

    @staticmethod
    def get_base_template(html_content: str, footer_text: Optional[str] = None, locale: str = "fr") -> str:
        """Get base email template with header and footer"""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        app_name = os.getenv("SENDGRID_FROM_NAME", "MODELE")
        footer = footer_text or (f"© {app_name}. All rights reserved." if locale == "en" else f"© {app_name}. Tous droits réservés.")
        visit_text = "Visit our website" if locale == "en" else "Visitez notre site"
        
        return f"""
        <!DOCTYPE html>
        <html lang="{locale}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 30px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                        {app_name}
                                    </h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    {html_content}
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                                    <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center; line-height: 1.6;">
                                        {footer}
                                    </p>
                                    <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                        <a href="{frontend_url}" style="color: #667eea; text-decoration: none;">{visit_text}</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

    @staticmethod
    def welcome(name: str, login_url: Optional[str] = None, locale: str = "fr") -> Dict[str, str]:
        """Welcome email template"""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        login_url = login_url or f"{frontend_url}/auth/login"
        app_name = os.getenv("SENDGRID_FROM_NAME", "MODELE")
        
        if locale == "en":
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Welcome {name}! 🎉
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for signing up for {app_name}! We're thrilled to have you with us.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Your account is now active and ready to use. Start exploring all the available features right away.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{login_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Access my account
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                If you have any questions, please don't hesitate to contact us. Our team is here to help!
            </p>
        """
            text_content = f"""
Welcome {name}!

Thank you for signing up for {app_name}! We're thrilled to have you with us.

Your account is now active and ready to use.

Access your account: {login_url}

If you have any questions, please don't hesitate to contact us.

Best regards,
The {app_name} team
        """
            subject = f"Welcome to {app_name}!"
        else:
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Bienvenue {name} ! 🎉
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Merci de vous être inscrit sur {app_name} ! Nous sommes ravis de vous avoir parmi nous.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Votre compte est maintenant actif et prêt à être utilisé. Commencez dès maintenant à explorer toutes les fonctionnalités disponibles.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{login_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Accéder à mon compte
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Si vous avez des questions, n'hésitez pas à nous contacter. Notre équipe est là pour vous aider !
            </p>
        """
            text_content = f"""
Bienvenue {name} !

Merci de vous être inscrit sur {app_name} ! Nous sommes ravis de vous avoir parmi nous.

Votre compte est maintenant actif et prêt à être utilisé.

Accédez à votre compte : {login_url}

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
L'équipe {app_name}
        """
            subject = f"Bienvenue sur {app_name} !"
        
        return {
            "subject": subject,
            "html": EmailTemplates.get_base_template(html_content, locale=locale),
            "text": text_content.strip(),
        }

    @staticmethod
    def password_reset(name: str, reset_token: str, reset_url: Optional[str] = None, locale: str = "fr") -> Dict[str, str]:
        """Password reset email template"""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_url = reset_url or f"{frontend_url}/auth/reset-password?token={reset_token}"
        app_name = os.getenv("SENDGRID_FROM_NAME", "MODELE")
        
        if locale == "en":
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Password Reset
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello {name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your password for your {app_name} account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Reset my password
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Or copy this link into your browser:
            </p>
            <p style="color: #667eea; font-size: 14px; word-break: break-all; margin: 10px 0 20px 0;">
                {reset_url}
            </p>
            <p style="color: #ef4444; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                ⚠️ This link expires in 1 hour. If you didn't request this reset, please ignore this email.
            </p>
        """
            text_content = f"""
Password Reset

Hello {name},

We received a request to reset your password for your {app_name} account.

Click on this link to reset your password:
{reset_url}

This link expires in 1 hour.

If you didn't request this reset, please ignore this email.

Best regards,
The {app_name} team
        """
            subject = f"Password Reset - {app_name}"
        else:
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Réinitialisation de mot de passe
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour {name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte {app_name}.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Réinitialiser mon mot de passe
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Ou copiez ce lien dans votre navigateur :
            </p>
            <p style="color: #667eea; font-size: 14px; word-break: break-all; margin: 10px 0 20px 0;">
                {reset_url}
            </p>
            <p style="color: #ef4444; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                ⚠️ Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
        """
            text_content = f"""
Réinitialisation de mot de passe

Bonjour {name},

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte {app_name}.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
{reset_url}

Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe {app_name}
        """
            subject = f"Réinitialisation de mot de passe - {app_name}"
        
        return {
            "subject": subject,
            "html": EmailTemplates.get_base_template(html_content, locale=locale),
            "text": text_content.strip(),
        }

    @staticmethod
    def email_verification(name: str, verification_token: str, verification_url: Optional[str] = None, locale: str = "fr") -> Dict[str, str]:
        """Email verification template"""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        verification_url = verification_url or f"{frontend_url}/auth/verify-email?token={verification_token}"
        app_name = os.getenv("SENDGRID_FROM_NAME", "MODELE")
        
        if locale == "en":
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Verify your email address
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello {name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for signing up for {app_name}! Please verify your email address by clicking the button below.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Verify my email
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Or copy this link into your browser:
            </p>
            <p style="color: #667eea; font-size: 14px; word-break: break-all; margin: 10px 0 20px 0;">
                {verification_url}
            </p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                This link expires in 24 hours.
            </p>
        """
            text_content = f"""
Verify your email address

Hello {name},

Thank you for signing up for {app_name}! Please verify your email address by clicking the link below.

{verification_url}

This link expires in 24 hours.

Best regards,
The {app_name} team
        """
            subject = f"Verify your email - {app_name}"
        else:
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Vérifiez votre adresse email
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour {name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Merci de vous être inscrit sur {app_name} ! Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Vérifier mon email
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Ou copiez ce lien dans votre navigateur :
            </p>
            <p style="color: #667eea; font-size: 14px; word-break: break-all; margin: 10px 0 20px 0;">
                {verification_url}
            </p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Ce lien expire dans 24 heures.
            </p>
        """
            text_content = f"""
Vérifiez votre adresse email

Bonjour {name},

Merci de vous être inscrit sur {app_name} ! Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous.

{verification_url}

Ce lien expire dans 24 heures.

Cordialement,
L'équipe {app_name}
        """
            subject = f"Vérifiez votre email - {app_name}"
        
        return {
            "subject": subject,
            "html": EmailTemplates.get_base_template(html_content, locale=locale),
            "text": text_content.strip(),
        }

    @staticmethod
    def invoice(
        name: str,
        invoice_number: str,
        invoice_date: str,
        amount: float,
        currency: str = "CAD",
        invoice_url: Optional[str] = None,
        items: Optional[list] = None,
        locale: str = "fr",
    ) -> Dict[str, str]:
        """Invoice email template"""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        invoice_url = invoice_url or f"{frontend_url}/invoices/{invoice_number}"
        app_name = os.getenv("SENDGRID_FROM_NAME", "MODELE")
        
        if locale == "en":
            desc_label = "Description"
            amount_label = "Amount"
            invoice_label = "Invoice"
            invoice_num_label = "Invoice number:"
            date_label = "Date:"
            total_label = "Total amount:"
            ready_text = "Your invoice is ready. You'll find the details below."
            view_invoice = "View invoice"
            thanks_text = "Thank you for your trust!"
            hello_text = f"Hello {name},"
        else:
            desc_label = "Description"
            amount_label = "Montant"
            invoice_label = "Facture"
            invoice_num_label = "Numéro de facture :"
            date_label = "Date :"
            total_label = "Montant total :"
            ready_text = "Votre facture est prête. Vous trouverez les détails ci-dessous."
            view_invoice = "Voir la facture"
            thanks_text = "Merci pour votre confiance !"
            hello_text = f"Bonjour {name},"
        
        items_html = ""
        if items:
            items_html = f"""
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background-color: #f9fafb;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151; font-weight: 600;">{desc_label}</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151; font-weight: 600;">{amount_label}</th>
                    </tr>
                </thead>
                <tbody>
            """
            for item in items:
                items_html += f"""
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">{item.get('description', '')}</td>
                        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #6b7280;">{item.get('amount', 0)} {currency}</td>
                    </tr>
                """
            items_html += """
                </tbody>
            </table>
            """
        
        html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                {invoice_label} #{invoice_number}
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                {hello_text}
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                {ready_text}
            </p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <table style="width: 100%;">
                    <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 5px 0;">{invoice_num_label}</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600; padding: 5px 0; text-align: right;">#{invoice_number}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 5px 0;">{date_label}</td>
                        <td style="color: #111827; font-size: 14px; padding: 5px 0; text-align: right;">{invoice_date}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 5px 0;">{total_label}</td>
                        <td style="color: #111827; font-size: 18px; font-weight: 700; padding: 5px 0; text-align: right;">{amount} {currency}</td>
                    </tr>
                </table>
            </div>
            
            {items_html}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{invoice_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    {view_invoice}
                </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                {thanks_text}
            </p>
        """
        
        if locale == "en":
            text_content = f"""
Invoice #{invoice_number}

Hello {name},

Your invoice is ready. You'll find the details below.

Invoice number: #{invoice_number}
Date: {invoice_date}
Total amount: {amount} {currency}

View invoice: {invoice_url}

Thank you for your trust!

Best regards,
The {app_name} team
        """
            subject = f"Invoice #{invoice_number} - {app_name}"
        else:
            text_content = f"""
Facture #{invoice_number}

Bonjour {name},

Votre facture est prête. Vous trouverez les détails ci-dessous.

Numéro de facture : #{invoice_number}
Date : {invoice_date}
Montant total : {amount} {currency}

Voir la facture : {invoice_url}

Merci pour votre confiance !

Cordialement,
L'équipe {app_name}
        """
            subject = f"Facture #{invoice_number} - {app_name}"
        
        return {
            "subject": subject,
            "html": EmailTemplates.get_base_template(html_content, locale=locale),
            "text": text_content.strip(),
        }

    @staticmethod
    def subscription_created(name: str, plan_name: str, amount: float, currency: str = "CAD", locale: str = "fr") -> Dict[str, str]:
        """Subscription created email template"""
        app_name = os.getenv("SENDGRID_FROM_NAME", "MODELE")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        if locale == "en":
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Subscription activated! 🎉
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello {name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your <strong>{plan_name}</strong> subscription has been successfully activated!
            </p>
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">
                    ✅ Active subscription
                </p>
                <p style="margin: 5px 0 0 0; color: #047857; font-size: 14px;">
                    Plan: {plan_name} - {amount} {currency}/month
                </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{frontend_url}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Access dashboard
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                You can now enjoy all the features of your plan.
            </p>
        """
            text_content = f"""
Subscription activated!

Hello {name},

Your {plan_name} subscription has been successfully activated!

Plan: {plan_name} - {amount} {currency}/month

Access your dashboard: {frontend_url}/dashboard

You can now enjoy all the features of your plan.

Best regards,
The {app_name} team
        """
            subject = f"Your {plan_name} subscription is active - {app_name}"
        else:
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Abonnement activé ! 🎉
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour {name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Votre abonnement <strong>{plan_name}</strong> a été activé avec succès !
            </p>
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">
                    ✅ Abonnement actif
                </p>
                <p style="margin: 5px 0 0 0; color: #047857; font-size: 14px;">
                    Plan : {plan_name} - {amount} {currency}/mois
                </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{frontend_url}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Accéder au dashboard
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.
            </p>
        """
            text_content = f"""
Abonnement activé !

Bonjour {name},

Votre abonnement {plan_name} a été activé avec succès !

Plan : {plan_name} - {amount} {currency}/mois

Accédez à votre dashboard : {frontend_url}/dashboard

Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.

Cordialement,
L'équipe {app_name}
        """
            subject = f"Votre abonnement {plan_name} est actif - {app_name}"
        
        return {
            "subject": subject,
            "html": EmailTemplates.get_base_template(html_content, locale=locale),
            "text": text_content.strip(),
        }

    @staticmethod
    def subscription_cancelled(name: str, plan_name: str, end_date: str, locale: str = "fr") -> Dict[str, str]:
        """Subscription cancelled email template"""
        app_name = os.getenv("SENDGRID_FROM_NAME", "MODELE")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        if locale == "en":
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Subscription cancelled
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello {name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your <strong>{plan_name}</strong> subscription has been cancelled. It will remain active until <strong>{end_date}</strong>.
            </p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                    ⚠️ Subscription cancelled
                </p>
                <p style="margin: 5px 0 0 0; color: #b91c1c; font-size: 14px;">
                    Active until: {end_date}
                </p>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                You can reactivate your subscription at any time from your account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{frontend_url}/dashboard/billing" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Manage my subscription
                </a>
            </div>
        """
            text_content = f"""
Subscription cancelled

Hello {name},

Your {plan_name} subscription has been cancelled. It will remain active until {end_date}.

You can reactivate your subscription at any time from your account.

Manage my subscription: {frontend_url}/dashboard/billing

Best regards,
The {app_name} team
        """
            subject = f"Subscription cancelled - {app_name}"
        else:
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Abonnement annulé
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour {name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Votre abonnement <strong>{plan_name}</strong> a été annulé. Il restera actif jusqu'au <strong>{end_date}</strong>.
            </p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                    ⚠️ Abonnement annulé
                </p>
                <p style="margin: 5px 0 0 0; color: #b91c1c; font-size: 14px;">
                    Actif jusqu'au : {end_date}
                </p>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                Vous pouvez réactiver votre abonnement à tout moment depuis votre compte.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{frontend_url}/dashboard/billing" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Gérer mon abonnement
                </a>
            </div>
        """
            text_content = f"""
Abonnement annulé

Bonjour {name},

Votre abonnement {plan_name} a été annulé. Il restera actif jusqu'au {end_date}.

Vous pouvez réactiver votre abonnement à tout moment depuis votre compte.

Gérer mon abonnement : {frontend_url}/dashboard/billing

Cordialement,
L'équipe {app_name}
        """
            subject = f"Abonnement annulé - {app_name}"
        
        return {
            "subject": subject,
            "html": EmailTemplates.get_base_template(html_content, locale=locale),
            "text": text_content.strip(),
        }

    @staticmethod
    def evaluator_360_invitation(
        evaluator_name: str,
        sender_name: str,
        evaluation_url: str,
        role: Optional[str] = None,
        locale: str = "fr"
    ) -> Dict[str, str]:
        """360 Feedback evaluator invitation email template"""
        app_name = os.getenv("SENDGRID_FROM_NAME", "MODELE")
        
        if locale == "en":
            role_text = f" as {role}" if role else ""
            html_content = f"""
            <div style="line-height: 1.6; color: #374151;">
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                    Hello {evaluator_name},
                </p>
                
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                    {sender_name} has invited you{role_text} to participate in their 360° Feedback evaluation.
                </p>
                
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                    Your feedback is important to help {sender_name} better understand their strengths and areas for improvement.
                </p>
                
                <div style="margin: 30px 0; text-align: center;">
                    <a href="{evaluation_url}" 
                       style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                        Complete the evaluation
                    </a>
                </div>
                
                <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                    This link is unique and personal. Please do not share it.
                </p>
                
                <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                    If you have any questions, please don't hesitate to contact {sender_name} directly.
                </p>
            </div>
        """
            text_content = f"""
Hello {evaluator_name},

{sender_name} has invited you{role_text} to participate in their 360° Feedback evaluation.

Your feedback is important to help {sender_name} better understand their strengths and areas for improvement.

Complete the evaluation by clicking on this link:
{evaluation_url}

This link is unique and personal. Please do not share it.

If you have any questions, please don't hesitate to contact {sender_name} directly.

Best regards,
The {app_name} team
        """
            subject = f"Invitation to a 360° Feedback evaluation - {sender_name}"
        else:
            role_text = f" en tant que {role}" if role else ""
            html_content = f"""
            <div style="line-height: 1.6; color: #374151;">
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                    Bonjour {evaluator_name},
                </p>
                
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                    {sender_name} vous a invité{role_text} à participer à son évaluation 360° Feedback.
                </p>
                
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                    Votre feedback est important pour aider {sender_name} à mieux comprendre ses forces et ses axes d'amélioration.
                </p>
                
                <div style="margin: 30px 0; text-align: center;">
                    <a href="{evaluation_url}" 
                       style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                        Compléter l'évaluation
                    </a>
                </div>
                
                <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                    Ce lien est unique et personnel. Veuillez ne pas le partager.
                </p>
                
                <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                    Si vous avez des questions, n'hésitez pas à contacter {sender_name} directement.
                </p>
            </div>
        """
            text_content = f"""
Bonjour {evaluator_name},

{sender_name} vous a invité{role_text} à participer à son évaluation 360° Feedback.

Votre feedback est important pour aider {sender_name} à mieux comprendre ses forces et ses axes d'amélioration.

Complétez l'évaluation en cliquant sur ce lien :
{evaluation_url}

Ce lien est unique et personnel. Veuillez ne pas le partager.

Si vous avez des questions, n'hésitez pas à contacter {sender_name} directement.

Cordialement,
L'équipe {app_name}
        """
            subject = f"Invitation à une évaluation 360° Feedback - {sender_name}"
        
        return {
            "subject": subject,
            "html": EmailTemplates.get_base_template(html_content, locale=locale),
            "text": text_content.strip(),
        }

    @staticmethod
    def trial_ending(name: str, days_remaining: int, upgrade_url: Optional[str] = None, locale: str = "fr") -> Dict[str, str]:
        """Trial ending soon email template"""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        upgrade_url = upgrade_url or f"{frontend_url}/pricing"
        app_name = os.getenv("SENDGRID_FROM_NAME", "MODELE")
        
        if locale == "en":
            day_word = "day" if days_remaining == 1 else "days"
            remaining_word = "remaining" if days_remaining > 1 else "remaining"
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Your trial period is ending soon
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello {name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your trial period ends in <strong>{days_remaining} {day_word}</strong>.
            </p>
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                    ⏰ {days_remaining} {day_word} {remaining_word}
                </p>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                Don't lose access to all features! Subscribe now to continue enjoying {app_name}.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{upgrade_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Choose a plan
                </a>
            </div>
        """
            text_content = f"""
Your trial period is ending soon

Hello {name},

Your trial period ends in {days_remaining} {day_word}.

Don't lose access to all features! Subscribe now.

Choose a plan: {upgrade_url}

Best regards,
The {app_name} team
        """
            subject = f"Your trial ends in {days_remaining} {day_word} - {app_name}"
        else:
            day_word = "jour" if days_remaining == 1 else "jours"
            remaining_word = "restant" if days_remaining == 1 else "restants"
            html_content = f"""
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
                Votre période d'essai se termine bientôt
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour {name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Votre période d'essai se termine dans <strong>{days_remaining} {day_word}</strong>.
            </p>
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                    ⏰ {days_remaining} {day_word} {remaining_word}
                </p>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                Ne perdez pas l'accès à toutes les fonctionnalités ! Abonnez-vous maintenant pour continuer à profiter de {app_name}.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{upgrade_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Choisir un plan
                </a>
            </div>
        """
            text_content = f"""
Votre période d'essai se termine bientôt

Bonjour {name},

Votre période d'essai se termine dans {days_remaining} {day_word}.

Ne perdez pas l'accès à toutes les fonctionnalités ! Abonnez-vous maintenant.

Choisir un plan : {upgrade_url}

Cordialement,
L'équipe {app_name}
        """
            subject = f"Votre essai se termine dans {days_remaining} {day_word} - {app_name}"
        
        return {
            "subject": subject,
            "html": EmailTemplates.get_base_template(html_content, locale=locale),
            "text": text_content.strip(),
        }

