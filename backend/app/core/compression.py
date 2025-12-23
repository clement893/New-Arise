"""
HTTP Compression Middleware
GZip compression for API responses with streaming support for large responses
"""

from fastapi import Request
from fastapi.responses import Response, StreamingResponse
from starlette.middleware.base import BaseHTTPMiddleware
import gzip
from typing import Callable, AsyncGenerator


class CompressionMiddleware(BaseHTTPMiddleware):
    """Middleware for GZip compression of responses with streaming for large responses"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Check if client accepts gzip encoding
        accept_encoding = request.headers.get("Accept-Encoding", "")
        supports_gzip = "gzip" in accept_encoding.lower()
        
        # Call the next middleware/endpoint
        response = await call_next(request)
        
        # Only compress if client accepts gzip and response is JSON/text
        # Skip compression for streaming responses or responses without body attribute
        if supports_gzip and response.status_code < 400 and hasattr(response, 'body'):
            content_type = response.headers.get("Content-Type", "")
            
            # Compress JSON and text responses (skip binary, images, etc.)
            if "application/json" in content_type or "text/" in content_type or "application/javascript" in content_type:
                # Get response body (only if it exists)
                try:
                    body = response.body
                except AttributeError:
                    # Response doesn't have body attribute (e.g., StreamingResponse)
                    return response
                
                # Skip if already compressed or too small (compression overhead not worth it)
                if len(body) > 1024:  # Only compress if > 1KB
                    # For large responses (>100KB), use streaming compression
                    if len(body) > 100 * 1024:
                        # Streaming compression for large responses
                        async def compress_stream() -> AsyncGenerator[bytes, None]:
                            compressor = gzip.GzipFile(mode='wb', compresslevel=6)
                            # Compress in chunks
                            chunk_size = 8192
                            for i in range(0, len(body), chunk_size):
                                chunk = body[i:i + chunk_size]
                                compressed_chunk = compressor.compress(chunk)
                                if compressed_chunk:
                                    yield compressed_chunk
                            # Flush remaining data
                            final = compressor.flush()
                            if final:
                                yield final
                        
                        return StreamingResponse(
                            compress_stream(),
                            status_code=response.status_code,
                            headers={
                                **response.headers,
                                "Content-Encoding": "gzip",
                                "Vary": "Accept-Encoding",
                            },
                            media_type=content_type
                        )
                    else:
                        # In-memory compression for smaller responses
                        compressed_body = gzip.compress(body, compresslevel=6)
                        
                        # Only use compressed version if it's actually smaller
                        if len(compressed_body) < len(body):
                            # Update response
                            response.body = compressed_body
                            response.headers["Content-Encoding"] = "gzip"
                            response.headers["Content-Length"] = str(len(compressed_body))
                            
                            # Update Vary header if it exists
                            vary = response.headers.get("Vary", "")
                            if "Accept-Encoding" not in vary:
                                response.headers["Vary"] = f"{vary}, Accept-Encoding".strip(", ")
        
        return response
