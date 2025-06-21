import { dataStore } from "@/lib/data-store"

export async function POST(request: Request) {
  try {
    const { targetUrl, method = "POST", headers = {}, maxPayloads = 10 } = await request.json()

    if (!targetUrl) {
      return Response.json({ success: false, error: "Missing required field: targetUrl" }, { status: 400 })
    }

    // Get unprocessed payloads
    const unprocessedPayloads = dataStore.getUnprocessed().slice(0, maxPayloads)

    if (unprocessedPayloads.length === 0) {
      return Response.json({
        success: true,
        message: "No unprocessed payloads to forward",
        forwardedCount: 0,
      })
    }

    const results = []

    // Forward each payload
    for (const payload of unprocessedPayloads) {
      try {
        const forwardResponse = await fetch(targetUrl, {
          method: method.toUpperCase(),
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "API-Server-Auto-Forward/1.0",
            ...headers,
          },
          body: JSON.stringify(payload.data),
        })

        const responseData = await forwardResponse.text()
        let parsedResponse
        try {
          parsedResponse = JSON.parse(responseData)
        } catch {
          parsedResponse = responseData
        }

        // Mark as processed
        dataStore.markAsProcessed(payload.id)

        results.push({
          payloadId: payload.id,
          success: true,
          status: forwardResponse.status,
          response: parsedResponse,
        })
      } catch (error) {
        results.push({
          payloadId: payload.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    return Response.json({
      success: true,
      message: `Forwarded ${successCount} of ${unprocessedPayloads.length} payloads`,
      forwardedCount: successCount,
      totalProcessed: unprocessedPayloads.length,
      results,
      forwardedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Auto-forward error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to auto-forward payloads",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
