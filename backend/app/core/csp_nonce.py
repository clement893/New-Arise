"""
CSP Nonce Generation and Management
Generates secure nonces for Content Security Policy (CSP)

SECURITY: Nonces are used to allow inline scripts/styles while maintaining
strict CSP. Each request gets a unique nonce that must match between the
CSP header and the inline script/style tag.
"""

import secrets
from typing import Optional


def generate_nonce(length: int = 16) -> str:
    """
    Generate a secure random nonce for CSP.
    
    Args:
        length: Length of the nonce in bytes (default: 16)
        
    Returns:
        Base64-encoded nonce string safe for use in CSP headers and HTML attributes
        
    Example:
        >>> nonce = generate_nonce()
        >>> # Use in CSP: script-src 'self' 'nonce-{nonce}'
        >>> # Use in HTML: <script nonce="{nonce}">...</script>
    """
    # Generate random bytes and encode as base64url (URL-safe)
    # This ensures the nonce is safe to use in HTML attributes and CSP headers
    return secrets.token_urlsafe(length)


def get_csp_nonce_header(nonce: str) -> str:
    """
    Format nonce for use in CSP header.
    
    Args:
        nonce: The nonce value
        
    Returns:
        CSP nonce directive string (e.g., "'nonce-abc123xyz'")
        
    Example:
        >>> nonce = generate_nonce()
        >>> csp_directive = get_csp_nonce_header(nonce)
        >>> # Returns: "'nonce-abc123xyz'"
    """
    return f"'nonce-{nonce}'"


def build_csp_with_nonce(
    nonce: Optional[str] = None,
    base_policy: Optional[str] = None
) -> str:
    """
    Build CSP policy string with nonce support.
    
    Args:
        nonce: Optional nonce value. If provided, adds nonce to script-src and style-src
        base_policy: Optional base CSP policy. If not provided, uses default strict policy
        
    Returns:
        Complete CSP policy string with nonce directives
        
    Example:
        >>> nonce = generate_nonce()
        >>> csp = build_csp_with_nonce(nonce)
        >>> # Returns: "default-src 'self'; script-src 'self' 'nonce-{nonce}'; ..."
    """
    if base_policy:
        policy = base_policy
    else:
        # Default strict policy
        policy = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "object-src 'none'; "
            "upgrade-insecure-requests"
        )
    
    if nonce:
        nonce_directive = get_csp_nonce_header(nonce)
        # Add nonce to script-src and style-src
        policy = policy.replace(
            "script-src 'self';",
            f"script-src 'self' {nonce_directive};"
        )
        policy = policy.replace(
            "style-src 'self';",
            f"style-src 'self' {nonce_directive};"
        )
    
    return policy
