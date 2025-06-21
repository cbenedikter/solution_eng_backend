import { dataStore } from "@/lib/data-store"
import { outboundTracker } from "@/lib/outbound-tracker"

export async function POST(request: Request) {
  try {
    const { payloadId, targetUrl, method = "POST", headers = {} } = await request.json()

    if (!payloadId || !targetUrl) {
      return Response.json(
        { success: false, error: "Missing required fields: payloadId and targetUrl" },
        { status: 400 },
      )
    }

    // Get the stored payload
    const storedPayload = dataStore.get(payloadId)
    if (!storedPayload) {
      return Response.json({ success: false, error: "Payload not found" }, { status: 404 })
    }

    // Validate target URL
    try {
      new URL(targetUrl)
    } catch {
      return Response.json({ success: false, error: "Invalid target URL" }, { status: 400 })
    }

    const startTime = Date.now()

    try {
      // Make the request to the external service
      const forwardResponse = await fetch(targetUrl, {
        method: method.toUpperCase(),
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "API-Server-Forward/1.0",
          ...headers,
        },
        body: JSON.stringify(storedPayload.data),
      })

      const responseTime = Date.now() - startTime
      const responseData = await forwardResponse.text()
      let parsedResponse
      try {
        parsedResponse = JSON.parse(responseData)
      } catch {
        parsedResponse = responseData
      }

      // Log the outbound activity
      outboundTracker.log({
        method: method.toUpperCase(),
        targetUrl: targetUrl,
        payload: storedPayload.data,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "API-Server-Forward/1.0",
          ...headers,
        },
        responseStatus: forwardResponse.status,
        responseTime: responseTime,
        responseData: parsedResponse,
        success: forwardResponse.ok,
        error: forwardResponse.ok ? undefined : `HTTP ${forwardResponse.status}: ${forwardResponse.statusText}`,
        trigger: "Manual Forward",
        triggerPayload: { payloadId, originalPayload: storedPayload },
      })

      // Mark payload as processed
      dataStore.markAsProcessed(payloadId)

      return Response.json({
        success: true,
        message: "Payload forwarded successfully",
        payloadId,
        targetUrl,
        forwardedAt: new Date().toISOString(),
        targetResponse: {
          status: forwardResponse.status,
          statusText: forwardResponse.statusText,
          data: parsedResponse,
        },
        originalPayload: storedPayload.data,
      })
    } catch (error) {
      const responseTime = Date.now() - startTime

      // Log the failed outbound activity
      outboundTracker.log({
        method: method.toUpperCase(),
        targetUrl: targetUrl,
        payload: storedPayload.data,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "API-Server-Forward/1.0",
          ...headers,
        },
        responseTime: responseTime,
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        trigger: "Manual Forward",
        triggerPayload: { payloadId, originalPayload: storedPayload },
      })

      throw error
    }
  } catch (error) {
    console.error("Forward request error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to forward payload",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
