/**
 * Token Cookie Management API Route
 * 
 * This route handles setting and clearing authentication tokens
 * as httpOnly cookies for enhanced security.
 * 
 * Note: This is a server-side API route that can set httpOnly cookies
 * which are not accessible to JavaScript, preventing XSS attacks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const TOKEN_COOKIE_NAME = 'auth-token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Set authentication tokens as httpOnly cookies
 * POST /api/auth/token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, refreshToken } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    
    // Set access token cookie
    cookieStore.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    // Set refresh token cookie if provided
    if (refreshToken) {
      cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: REFRESH_COOKIE_MAX_AGE,
        path: '/',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to set token' },
      { status: 500 }
    );
  }
}

/**
 * Clear authentication tokens
 * DELETE /api/auth/token
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    
    cookieStore.delete(TOKEN_COOKIE_NAME);
    cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear tokens' },
      { status: 500 }
    );
  }
}

/**
 * Get token status (without exposing the actual token)
 * GET /api/auth/token
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME);
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME);

    return NextResponse.json({
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get token status' },
      { status: 500 }
    );
  }
}


