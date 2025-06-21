import { otpManager } from "@/lib/otp-manager"
import { activityTracker } from "@/lib/activity-tracker"
import { formatToE164, validateE164 } from "@/lib/phone-utils"

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const { phoneNumber, signalCode } = await request.json()

    // Log the API activity
    const activityId = activityTracker.log({
      method: "POST",
      endpoint: "/api/verify-otp",
      payload: { phoneNumber: phoneNumber?.substring(0, 8) + "***", signalCode: "***" }, // Redacted for security
      headers: Object.fromEntries(request.headers.entries()),
      userAgent: request.headers.get("user-agent") || undefined,
      clientIP: request.headers.get("x-forwarded-for") || undefined,
    })

    // Validate required fields
    if (!phoneNumber || !signalCode) {
      const responseTime = Date.now() - startTime
      const activity = activityTracker.getById(activityId)
      if (activity) {
        activity.responseStatus = 400
        activity.responseTime = responseTime
      }

      return Response.json(
        {
          status: "Invalid",
          message: "Missing required fields: phoneNumber and signalCode",
        },
        { status: 400 },
      )
    }

    // Format phone number to E164
    const e164Phone = formatToE164(phoneNumber)
    if (!e164Phone || !validateE164(e164Phone)) {
      const responseTime = Date.now() - startTime
      const activity = activityTracker.getById(activityId)
      if (activity) {
        activity.responseStatus = 400
        activity.responseTime = responseTime
      }

      return Response.json(
        {
          status: "Invalid",
          message: "Invalid phone number format",
        },
        { status: 400 },
      )
    }

    // Verify the OTP
    const verificationResult = otpManager.verifyOTP(e164Phone, signalCode)

    const responseTime = Date.now() - startTime
    const activity = activityTracker.getById(activityId)
    if (activity) {
      activity.responseStatus = verificationResult.success ? 200 : 401
      activity.responseTime = responseTime
    }

    console.log(`OTP verification attempt for ${e164Phone}: ${verificationResult.success ? "SUCCESS" : "FAILED"}`)

    if (verificationResult.success) {
      // ✅ SUCCESS - Return your exact format
      return Response.json({
        status: "Valid",
        message: "OTP verification successful",
      })
    } else {
      // ❌ FAILURE - Return error with details
      return Response.json(
        {
          status: "Invalid",
          message: verificationResult.message,
          remainingAttempts: verificationResult.remainingAttempts,
          timeRemaining: verificationResult.timeRemaining,
        },
        { status: 401 },
      )
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("OTP verification error:", error)

    return Response.json(
      {
        status: "Error",
        message: "Failed to verify OTP",
      },
      { status: 500 },
    )
  }
}

// GET endpoint to check OTP status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const phoneNumber = searchParams.get("phoneNumber")

  if (!phoneNumber) {
    return Response.json(
      {
        status: "Invalid",
        message: "Missing phoneNumber parameter",
      },
      { status: 400 },
    )
  }

  const e164Phone = formatToE164(phoneNumber)
  if (!e164Phone || !validateE164(e164Phone)) {
    return Response.json(
      {
        status: "Invalid",
        message: "Invalid phone number format",
      },
      { status: 400 },
    )
  }

  const status = otpManager.getOTPStatus(e164Phone)

  return Response.json({
    status: "Success",
    phoneNumber: e164Phone,
    otpStatus: status,
    timestamp: new Date().toISOString(),
  })
}
