export async function POST() {
  try {
    console.log("Logout request received")

    const response = Response.json({
      success: true,
      message: "Logout successful",
    })

    // Clear the cookie
    response.headers.set("Set-Cookie", "api-server-session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax")

    console.log("Logout successful, cookie cleared")
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
