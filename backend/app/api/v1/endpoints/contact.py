"""
Contact Form API Endpoint
Public endpoint for contact form submissions
"""

import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from app.services.email_service import EmailService
from app.core.logging import logger

router = APIRouter()


class ContactFormRequest(BaseModel):
    """Contact form submission request"""
    name: str = Field(..., min_length=1, max_length=200, description="Contact name")
    email: EmailStr = Field(..., description="Contact email address")
    subject: str = Field(..., min_length=1, max_length=200, description="Message subject")
    message: str = Field(..., min_length=1, max_length=5000, description="Message content")


class ContactFormResponse(BaseModel):
    """Contact form submission response"""
    success: bool
    message: str


@router.post("/contact", response_model=ContactFormResponse, status_code=status.HTTP_200_OK, tags=["contact"])
async def submit_contact_form(
    contact_data: ContactFormRequest,
):
    """
    Submit a contact form.
    Public endpoint - no authentication required.
    Sends a confirmation email to the user.
    """
    try:
        email_service = EmailService()
        
        if not email_service.is_configured():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email service is not configured. Please contact the administrator.",
            )
        
        # Escape HTML in user input for security
        import html
        escaped_name = html.escape(contact_data.name)
        escaped_subject = html.escape(contact_data.subject)
        escaped_message = html.escape(contact_data.message).replace('\n', '<br>')
        
        # Send confirmation email to the user
        confirmation_subject = f"Confirmation de réception - {escaped_subject}"
        confirmation_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0d9488;">Merci pour votre message</h2>
                <p>Bonjour {escaped_name},</p>
                <p>Nous avons bien reçu votre demande de contact et nous vous répondrons dans les plus brefs délais.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Sujet :</strong> {escaped_subject}</p>
                </div>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Votre message :</strong></p>
                    <p style="margin: 10px 0 0 0;">{escaped_message}</p>
                </div>
                <p>Notre équipe de support vous répondra généralement dans les 24 heures ouvrables.</p>
                <p>Si vous avez des questions urgentes, n'hésitez pas à nous contacter directement.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 12px;">Cet email est un accusé de réception automatique. Merci de ne pas y répondre directement.</p>
                <p style="color: #6b7280; font-size: 12px;">Cordialement,<br>L'équipe ARISE</p>
            </div>
        </body>
        </html>
        """
        
        confirmation_text = f"""
        Merci pour votre message
        
        Bonjour {contact_data.name},
        
        Nous avons bien reçu votre demande de contact et nous vous répondrons dans les plus brefs délais.
        
        Sujet : {contact_data.subject}
        
        Votre message :
        {contact_data.message}
        
        Notre équipe de support vous répondra généralement dans les 24 heures ouvrables.
        
        Si vous avez des questions urgentes, n'hésitez pas à nous contacter directement.
        
        Cet email est un accusé de réception automatique. Merci de ne pas y répondre directement.
        
        Cordialement,
        L'équipe ARISE
        """
        
        # Send confirmation email
        email_service.send_email(
            to_email=contact_data.email,
            subject=confirmation_subject,
            html_content=confirmation_html,
            text_content=confirmation_text,
        )
        
        # Also send notification to support team (optional - you can configure a support email)
        support_email = os.getenv("SUPPORT_EMAIL", os.getenv("SENDGRID_FROM_EMAIL"))
        if support_email and support_email != contact_data.email:
            notification_subject = f"Nouvelle demande de contact - {escaped_subject}"
            notification_html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0d9488;">Nouvelle demande de contact</h2>
                    <p><strong>Nom :</strong> {escaped_name}</p>
                    <p><strong>Email :</strong> {contact_data.email}</p>
                    <p><strong>Sujet :</strong> {escaped_subject}</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Message :</strong></p>
                        <p style="margin: 10px 0 0 0;">{escaped_message}</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            notification_text = f"""
            Nouvelle demande de contact
            
            Nom : {contact_data.name}
            Email : {contact_data.email}
            Sujet : {contact_data.subject}
            
            Message :
            {contact_data.message}
            """
            
            try:
                email_service.send_email(
                    to_email=support_email,
                    subject=notification_subject,
                    html_content=notification_html,
                    text_content=notification_text,
                    reply_to=contact_data.email,
                )
            except Exception as e:
                # Log but don't fail if notification email fails
                logger.warning(f"Failed to send notification email to support: {e}")
        
        logger.info(f"Contact form submitted by {contact_data.email}")
        
        return ContactFormResponse(
            success=True,
            message="Votre message a été envoyé avec succès. Vous recevrez un email de confirmation sous peu."
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Contact form submission error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur s'est produite lors de l'envoi de votre message. Veuillez réessayer plus tard.",
        )
