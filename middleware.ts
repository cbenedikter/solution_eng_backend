import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes
const protectedRoutes = ["/dashboard", "/monitor", "/outbound", "/usage", "/test"]

// Define API routes that need protection
const protectedApiRoutes = [
  "/api/payloads",
  "/api/activities",
  "/api/outbound-activities",
  "/api/usage",
  "/api/cleanup",
  "/api/forward",
  "/api/auto-forward",
]

// Public API routes (for external integrations)
const publicApiRoutes = [
  "/api/health",
  "/api/webhook",
  "/api/mobile/data",
  "/api/external",
  "/api/process",
  "/api/test-signal-post",
  "/api/auth",
  "/api/debug",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware processing:", pathname)

  // Allow auth routes and login page
  if (pathname.startsWith("/api/auth") || pathname === "/login" || pathname.startsWith("/api/debug")) {
    return NextResponse.next()
  }

  // Check if it's a public API route
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // For the home page, let it load and handle auth there
  if (pathname === "/") {
    return NextResponse.next()
  }

  // Check if route needs protection
  const needsAuth =
    protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/")) ||
    protectedApiRoutes.some((route) => pathname.startsWith(route))

  if (needsAuth) {
    const sessionCookie = request.cookies.get("api-server-session")

    console.log("Protected route check:", {
      pathname,
      hasSessionCookie: !!sessionCookie,
      sessionValue: sessionCookie?.value?.substring(0, 20) + "...",
    })

    if (!sessionCookie) {
      if (pathname.startsWith("/api/")) {
        return Response.json({ success: false, error: "Authentication required" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
