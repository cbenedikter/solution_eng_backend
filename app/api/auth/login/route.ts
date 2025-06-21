import { validatePassword, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    console.log("Login attempt:", {
      hasPassword: !!password,
      passwordLength: password?.length || 0,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
    })

    if (!password) {
      console.log("Login failed: No password provided")
      return Response.json({ success: false, error: "Password is required" }, { status: 400 })
    }

    const isValid = validatePassword(password)

    if (!isValid) {
      console.log("Login failed: Invalid password")
      return Response.json(
        {
          success: false,
          error: "Invalid password",
          debug: {
            envVarSet: !!process.env.ADMIN_PASSWORD,
            envVarLength: process.env.ADMIN_PASSWORD?.length || 0,
          },
        },
        { status: 401 },
      )
    }

    // Create session
    const sessionId = createSession("admin")

    console.log("Login successful, creating session response")

    // Return success with session cookie
    const response = Response.json({
      success: true,
      message: "Login successful",
      sessionId: sessionId, // Include for debugging
      redirect: "/",
    })

    // Set the cookie manually
    response.headers.set(
      "Set-Cookie",
      `api-server-session=${sessionId}; HttpOnly; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    )

    return response
  } catch (error) {
    console.error("Login error:", error)
    return Response.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
