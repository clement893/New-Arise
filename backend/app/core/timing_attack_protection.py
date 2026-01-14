"""
Timing Attack Protection Utilities
Provides constant-time comparison functions to prevent timing attacks
"""

import hmac
from typing import Any


def constant_time_compare(a: str, b: str) -> bool:
    """
    Constant-time string comparison to prevent timing attacks.
    
    SECURITY: Uses hmac.compare_digest which is designed to prevent
    timing attacks by comparing all bytes regardless of early differences.
    
    Args:
        a: First string to compare
        b: Second string to compare
        
    Returns:
        True if strings are equal, False otherwise
        
    Example:
        >>> constant_time_compare("secret", "secret")
        True
        >>> constant_time_compare("secret", "wrong")
        False
    """
    return hmac.compare_digest(a.encode() if isinstance(a, str) else a,
                               b.encode() if isinstance(b, str) else b)


def constant_time_bytes_compare(a: bytes, b: bytes) -> bool:
    """
    Constant-time bytes comparison to prevent timing attacks.
    
    SECURITY: Uses hmac.compare_digest for constant-time comparison.
    
    Args:
        a: First bytes to compare
        b: Second bytes to compare
        
    Returns:
        True if bytes are equal, False otherwise
    """
    return hmac.compare_digest(a, b)
