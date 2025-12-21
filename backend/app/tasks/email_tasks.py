"""Email tasks."""

import asyncio
from app.celery_app import celery_app
from app.services.email_service import EmailService


@celery_app.task(bind=True, max_retries=3)
def send_email_task(self, to_email: str, subject: str, html_content: str, text_content: str = None):
    """Send email task using SendGrid."""
    try:
        email_service = EmailService()
        if not email_service.is_configured():
            print(f"SendGrid not configured. Would send email to {to_email}")
            print(f"Subject: {subject}")
            return {"status": "skipped", "to": to_email, "reason": "SendGrid not configured"}
        
        # SendGrid is synchronous, so we can call it directly
        result = email_service.send_email(to_email, subject, html_content, text_content)
        return result
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60)


@celery_app.task
def send_welcome_email(email: str, name: str):
    """Send welcome email."""
    email_service = EmailService()
    if not email_service.is_configured():
        return send_email_task.delay(
            email,
            f"Welcome {name}!",
            f"<html><body><h1>Welcome {name}!</h1><p>Hello {name}, welcome to NukleoHUB!</p></body></html>",
            f"Welcome {name}!\n\nHello {name}, welcome to NukleoHUB!"
        )
    
    result = email_service.send_welcome_email(email, name)
    return result


@celery_app.task
def send_password_reset_email(email: str, reset_token: str, name: str = "User"):
    """Send password reset email."""
    email_service = EmailService()
    if not email_service.is_configured():
        reset_url = f"http://localhost:3000/auth/reset-password?token={reset_token}"
        return send_email_task.delay(
            email,
            "Password Reset Request",
            f"<html><body><h1>Password Reset</h1><p>Click <a href='{reset_url}'>here</a> to reset your password.</p></body></html>",
            f"Password Reset\n\nClick here to reset your password: {reset_url}"
        )
    
    result = email_service.send_password_reset_email(email, name, reset_token)
    return result
