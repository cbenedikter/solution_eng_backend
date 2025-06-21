import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Get admin password from environment with fallback and validation
function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    console.error("ADMIN_PASSWORD environment variable is not set!")
    throw new Error("Admin password not configured")
  }

  return password.trim() // Remove any whitespace
}

const SESSION_COOKIE_NAME = "api-server-session"
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface Session {
  userId: string
  createdAt: number
  expiresAt: number
}

// In production, use a proper session store (Redis, database, etc.)
const activeSessions = new Map<string, Session>()

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
}

export function createSession(userId = "admin"): string {
  const sessionId = generateSessionId()
  const now = Date.now()

  const session: Session = {
    userId,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  }

  activeSessions.set(sessionId, session)
  console.log(`Session created for ${userId}:`, sessionId)
  return sessionId
}

export function validateSession(sessionId: string): Session | null {
  const session = activeSessions.get(sessionId)

  if (!session) {
    console.log("Session not found:", sessionId)
    return null
  }

  if (Date.now() > session.expiresAt) {
    console.log("Session expired:", sessionId)
    activeSessions.delete(sessionId)
    return null
  }

  console.log("Session valid:", sessionId)
  return session
}

export function deleteSession(sessionId: string): void {
  activeSessions.delete(sessionId)
  console.log("Session deleted:", sessionId)
}

export function validatePassword(inputPassword: string): boolean {
  try {
    const adminPassword = getAdminPassword()
    const trimmedInput = inputPassword.trim()

    console.log("Password validation:", {
      inputLength: trimmedInput.length,
      adminLength: adminPassword.length,
      match: trimmedInput === adminPassword,
    })

    return trimmedInput === adminPassword
  } catch (error) {
    console.error("Password validation error:", error)
    return false
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionId) {
      console.log("No session cookie found")
      return null
    }

    console.log("Found session cookie:", sessionId)
    return validateSession(sessionId)
  } catch (error) {
    console.error("Get session error:", error)
    return null
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()

  if (!session) {
    console.log("Auth required but no valid session, redirecting to login")
    redirect("/login")
  }

  return session
}

// Simplified cookie setting using Response headers
export function createSessionResponse(sessionId: string, redirectTo = "/"): Response {
  const response = Response.redirect(new URL(redirectTo, process.env.VERCEL_URL || "http://localhost:3000"))

  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${sessionId}; HttpOnly; Path=/; Max-Age=${SESSION_DURATION / 1000}; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  )

  console.log("Session cookie set in response:", sessionId)
  return response
}

export function createLogoutResponse(redirectTo = "/login"): Response {
  const response = Response.redirect(new URL(redirectTo, process.env.VERCEL_URL || "http://localhost:3000"))

  response.headers.set("Set-Cookie", `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`)

  console.log("Session cookie cleared in response")
  return response
}
