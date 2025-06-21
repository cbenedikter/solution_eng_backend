import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const cookies = request.headers.get("cookie") || ""

    return Response.json({
      hasSession: !!session,
      sessionData: session
        ? {
            userId: session.userId,
            createdAt: new Date(session.createdAt).toISOString(),
            expiresAt: new Date(session.expiresAt).toISOString(),
            isExpired: Date.now() > session.expiresAt,
          }
        : null,
      cookiesReceived: cookies.includes("api-server-session"),
      cookiePreview: cookies.substring(0, 100) + (cookies.length > 100 ? "..." : ""),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json(
      {
        error: "Session debug error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
