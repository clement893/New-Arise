"""Email endpoints using SendGrid."""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.dependencies import get_current_user
from app.models import User
from app.services.email_service import EmailService

router = APIRouter(prefix="/api/email", tags=["email"])


class SendEmailRequest(BaseModel):
    """Schema for sending a custom email."""
    to_email: EmailStr = Field(..., description="Recipient email address")
    subject: str = Field(..., description="Email subject")
    html_content: str = Field(..., description="HTML content of the email")
    text_content: Optional[str] = Field(None, description="Plain text content (optional)")
    from_email: Optional[str] = Field(None, description="Sender email (optional)")
    from_name: Optional[str] = Field(None, description="Sender name (optional)")
    reply_to: Optional[str] = Field(None, description="Reply-to email (optional)")
    cc: Optional[List[str]] = Field(None, description="CC email addresses (optional)")
    bcc: Optional[List[str]] = Field(None, description="BCC email addresses (optional)")


class EmailResponse(BaseModel):
    """Schema for email response."""
    status: str = Field(..., description="Status of the email")
    status_code: Optional[int] = Field(None, description="HTTP status code from SendGrid")
    message_id: Optional[str] = Field(None, description="Message ID from SendGrid")
    to: str = Field(..., description="Recipient email address")


class TestEmailRequest(BaseModel):
    """Schema for test email request."""
    to_email: EmailStr = Field(..., description="Recipient email address for test")


@router.get("/health")
async def email_health_check(
    current_user: User = Depends(get_current_user),
):
    """Health check for SendGrid service."""
    email_service = EmailService()
    
    if not email_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SendGrid is not configured. Please set SENDGRID_API_KEY environment variable.",
        )
    
    return {
        "configured": True,
        "from_email": email_service.from_email,
        "from_name": email_service.from_name,
        "status": "ready",
    }


@router.post("/send", response_model=EmailResponse)
async def send_email_endpoint(
    request_data: SendEmailRequest,
    current_user: User = Depends(get_current_user),
):
    """Send a custom email via SendGrid."""
    email_service = EmailService()
    
    try:
        result = email_service.send_email(
            to_email=request_data.to_email,
            subject=request_data.subject,
            html_content=request_data.html_content,
            text_content=request_data.text_content,
            from_email=request_data.from_email,
            from_name=request_data.from_name,
            reply_to=request_data.reply_to,
            cc=request_data.cc,
            bcc=request_data.bcc,
        )
        return EmailResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))


@router.post("/test", response_model=EmailResponse)
async def send_test_email(
    request_data: TestEmailRequest,
    current_user: User = Depends(get_current_user),
):
    """Send a test email to verify SendGrid configuration."""
    email_service = EmailService()
    
    subject = "Test Email from NukleoHUB"
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Test Email</h1>
            <p>This is a test email from NukleoHUB.</p>
            <p>If you received this email, SendGrid is configured correctly!</p>
            <p>Sent by: {current_user.name} ({current_user.email})</p>
            <p>Best regards,<br>The NukleoHUB Team</p>
        </div>
    </body>
    </html>
    """
    text_content = """
    Test Email
    
    This is a test email from NukleoHUB.
    
    If you received this email, SendGrid is configured correctly!
    
    Best regards,
    The NukleoHUB Team
    """
    
    try:
        result = email_service.send_email(
            to_email=request_data.to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
        )
        return EmailResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))


@router.post("/welcome")
async def send_welcome_email_endpoint(
    request_data: TestEmailRequest,
    current_user: User = Depends(get_current_user),
):
    """Send a welcome email (example)."""
    email_service = EmailService()
    
    # Extract name from email or use a default
    name = request_data.to_email.split("@")[0].replace(".", " ").title()
    
    try:
        result = email_service.send_welcome_email(request_data.to_email, name)
        return EmailResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))

