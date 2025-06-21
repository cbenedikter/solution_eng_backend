import { otpManager } from "@/lib/otp-manager"

export async function GET() {
  try {
    const stats = otpManager.getStats()

    return Response.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to retrieve OTP statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
