import { dataStore } from "@/lib/data-store"
import { activityTracker } from "@/lib/activity-tracker"
import { payloadProcessor } from "@/lib/payload-processor"
import { usageTracker } from "@/lib/usage-tracker"
import { formatToE164, validateE164 } from "@/lib/phone-utils"
import { otpManager } from "@/lib/otp-manager"

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.json()

    // Log the API activity
    const activityId = activityTracker.log({
      method: "POST",
      endpoint: "/api/mobile/data",
      payload: body,
      headers: Object.fromEntries(request.headers.entries()),
      userAgent: request.headers.get("user-agent") || undefined,
      clientIP: request.headers.get("x-forwarded-for") || undefined,
    })

    // Validate that we received key:value pairs
    if (!body || typeof body !== "object") {
      const responseTime = Date.now() - startTime
      const activity = activityTracker.getById(activityId)
      if (activity) {
        activity.responseStatus = 400
        activity.responseTime = responseTime
      }

      usageTracker.logRequest("/api/mobile/data", responseTime, false)

      return Response.json(
        {
          success: false,
          error: "Invalid data format. Expected JSON object with key:value pairs.",
        },
        { status: 400 },
      )
    }

    // Check if this is an OTP verification request
    if (body.verification === "yes") {
      console.log("OTP verification request detected")

      // Validate required fields for verification
      if (!body.phone_number || !body.signalCode) {
        const responseTime = Date.now() - startTime
        const activity = activityTracker.getById(activityId)
        if (activity) {
          activity.responseStatus = 400
          activity.responseTime = responseTime
        }

        usageTracker.logRequest("/api/mobile/data", responseTime, false)

        return Response.json(
          {
            status: "Invalid",
            message: "Missing required fields for verification: phone_number and signalCode",
          },
          { status: 400 },
        )
      }

      // Format phone number to E164
      const e164Phone = formatToE164(body.phone_number)
      if (!e164Phone || !validateE164(e164Phone)) {
        const responseTime = Date.now() - startTime
        const activity = activityTracker.getById(activityId)
        if (activity) {
          activity.responseStatus = 400
          activity.responseTime = responseTime
        }

        usageTracker.logRequest("/api/mobile/data", responseTime, false)

        return Response.json(
          {
            status: "Invalid",
            message: "Invalid phone number format",
          },
          { status: 400 },
        )
      }

      // Verify the OTP using the OTP manager
      const verificationResult = otpManager.verifyOTP(e164Phone, body.signalCode)

      const responseTime = Date.now() - startTime
      const activity = activityTracker.getById(activityId)
      if (activity) {
        activity.responseStatus = verificationResult.success ? 200 : 401
        activity.responseTime = responseTime
      }

      usageTracker.logRequest("/api/mobile/data", responseTime, verificationResult.success)

      console.log(
        `OTP verification via mobile/data for ${e164Phone}: ${verificationResult.success ? "SUCCESS" : "FAILED"}`,
      )

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
    }

    // Store the payload
    const payloadId = dataStore.store(body, "mobile-app")

    // Process the payload (check for Signal Post and trigger OneSignal if needed)
    const processingResult = await payloadProcessor.processPayload(body, "mobile-app")

    const responseTime = Date.now() - startTime
    const activity = activityTracker.getById(activityId)
    if (activity) {
      activity.responseStatus = 200
      activity.responseTime = responseTime
    }

    usageTracker.logRequest("/api/mobile/data", responseTime, true)

    // Build response with processing results
    const response: any = {
      success: true,
      message: "Data received and stored successfully",
      payloadId: payloadId,
      receivedKeys: Object.keys(body),
      storedAt: new Date().toISOString(),
      dataCount: Object.keys(body).length,
    }

    // Add processing results if payload was processed
    if (processingResult.processed) {
      response.processing = {
        action: processingResult.action,
        success: processingResult.success,
        details: processingResult.details,
        error: processingResult.error,
      }

      // Special message for Signal Post
      if (processingResult.action === "signal_post" && processingResult.success) {
        response.message = "OTP generated and sent via OneSignal notification"
        response.nextStep = "User will receive notification with OTP code. Use /api/verify-otp to verify the code."
      }
    }

    return Response.json(response)
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("Mobile data processing error:", error)

    usageTracker.logRequest("/api/mobile/data", responseTime, false)

    return Response.json(
      {
        success: false,
        error: "Failed to process mobile app data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Handle GET requests to return API info
export async function GET(request: Request) {
  const startTime = Date.now()

  activityTracker.log({
    method: "GET",
    endpoint: "/api/mobile/data",
    headers: Object.fromEntries(request.headers.entries()),
    userAgent: request.headers.get("user-agent") || undefined,
    clientIP: request.headers.get("x-forwarded-for") || undefined,
    responseStatus: 200,
  })

  const responseTime = Date.now() - startTime
  usageTracker.logRequest("/api/mobile/data", responseTime, true)

  return Response.json({
    endpoint: "/api/mobile/data",
    method: "POST",
    description: "Receive key:value string data from mobile apps",
    storedPayloads: dataStore.count(),
    unprocessedPayloads: dataStore.getUnprocessed().length,
    otpFlow: {
      step1: {
        description: "Send Signal Post payload to generate OTP",
        endpoint: "POST /api/mobile/data",
        payload: {
          demo_app_id: "Signal Post",
          phone_number: "+1234567890",
        },
        note: "Do NOT include signalCode - server generates it automatically",
      },
      step2: {
        description: "Verify the OTP code received via OneSignal",
        endpoint: "POST /api/verify-otp",
        payload: {
          phoneNumber: "+1234567890",
          signalCode: "12345",
        },
      },
    },
    specialProcessing: {
      signalPost: {
        trigger: 'demo_app_id: "Signal Post"',
        requiredFields: ["phone_number"],
        action: "Generate random 5-digit OTP and send OneSignal notification",
        otpExpiry: "5 minutes",
        maxAttempts: 3,
      },
    },
    expectedFormat: {
      key1: "value1",
      key2: "value2",
    },
  })
}
