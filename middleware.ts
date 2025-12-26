/**
 * Next.js Middleware
 * 
 * Handles:
 * - Session cookie validation
 * - Protected route checking
 * - Redirects to login for unauthenticated users
 * - Note: Bearer token (API JWT) refresh is handled by ApiTokenManager
 */

import { NextRequest, NextResponse } from 'next/server'
import { parseSessionIdFromCookie } from '@/lib/session'

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/',
]

/**
 * API routes that don't require authentication
 */
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/verify-email',
  '/api/auth/request-password-reset',
  '/api/auth/reset-password',
]

/**
 * API routes that require authentication
 */
const PROTECTED_API_ROUTES = ['/api/auth/logout', '/api/auth/me', '/api/graphql']

// ============================================================================
// ROUTE CHECKERS
// ============================================================================

/**
 * Check if route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })
}

/**
 * Check if route is public API route
 */
function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.includes(pathname)
}

/**
 * Check if route is protected API route
 */
function isProtectedApiRoute(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * Check if route is API route
 */
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const method = request.method

  // Allow all GET requests to public routes
  if (method === 'GET' && isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Allow all requests to public API routes
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next()
  }

  // Get session ID from cookies
  const cookieHeader = request.headers.get('cookie') || ''
  const sessionId = parseSessionIdFromCookie(cookieHeader)


  // Check protected routes
  if (!isApiRoute(pathname)) {
    // Protected page route
    // Note: We don't validate the session here because Express manages sessions
    // in its own memory. Instead, we just check if a session cookie exists.
    // The actual session validation happens in Express middleware and API routes.
    // Page components can check auth state client-side using useAuth hook.
    
    if (!sessionId) {
      console.log('No session cookie found, redirecting to login:', pathname)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Session cookie exists, allow request
    // Actual session validation will happen when the page makes API calls
    return NextResponse.next()
  }

  // Protected API route
  // Note: API routes are handled by Express, which validates sessions in its own middleware
  // We just pass them through - Express will handle authentication
  if (isProtectedApiRoute(pathname)) {
    // Let Express handle session validation
    return NextResponse.next()
  }

  // Allow other requests
  return NextResponse.next()
}

// ============================================================================
// MIDDLEWARE CONFIG
// ============================================================================

export const config = {
  matcher: [
    // Match all routes except static files and _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
