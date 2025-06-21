import { activityTracker } from "@/lib/activity-tracker"
import { payloadProcessor } from "@/lib/payload-processor"

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.json()

    // Log the API activity
    const activityId = activityTracker.log({
      method: "POST",
      endpoint: "/api/webhook",
      payload: body,
      headers: Object.fromEntries(request.headers.entries()),
      userAgent: request.headers.get("user-agent") || undefined,
      clientIP: request.headers.get("x-forwarded-for") || undefined,
    })

    // Process the payload (check for Signal Post and trigger OneSignal if needed)
    const processingResult = await payloadProcessor.processPayload(body, "webhook")

    // Log the received data
    console.log("Webhook received:", {
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      processed: processingResult.processed,
    })

    const responseTime = Date.now() - startTime
    const activity = activityTracker.getById(activityId)
    if (activity) {
      activity.responseStatus = 200
      activity.responseTime = responseTime
    }

    // Build response
    const response: any = {
      success: true,
      message: "Webhook received successfully",
      receivedAt: new Date().toISOString(),
      dataReceived: typeof body === "object" ? Object.keys(body) : "raw data",
    }

    // Add processing results if payload was processed
    if (processingResult.processed) {
      response.processing = {
        action: processingResult.action,
        success: processingResult.success,
        details: processingResult.details,
        error: processingResult.error,
      }
    }

    return Response.json(response)
  } catch (error) {
    console.error("Webhook processing error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to process webhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    )
  }
}
