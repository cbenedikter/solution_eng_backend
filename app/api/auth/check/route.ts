import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    console.log("Auth check:", {
      hasSession: !!session,
      sessionId: session?.userId,
      timestamp: new Date().toISOString(),
    })

    return Response.json({
      authenticated: !!session,
      user: session?.userId || null,
      sessionValid: !!session,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return Response.json({
      authenticated: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
