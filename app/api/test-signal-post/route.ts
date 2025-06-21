import { payloadProcessor } from "@/lib/payload-processor"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Test the Signal Post processing
    const result = await payloadProcessor.processPayload(body, "test")

    return Response.json({
      success: true,
      message: "Signal Post test completed",
      testPayload: body,
      processingResult: result,
      testedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Signal Post test error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to test Signal Post processing",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return Response.json({
    endpoint: "/api/test-signal-post",
    method: "POST",
    description: "Test Signal Post payload processing",
    testPayload: {
      demo_app_id: "Signal Post",
      phone_number: "+11234556777",
      signalcode: "54541",
      userId: "test123",
    },
    instructions: "Send a POST request with the test payload to see Signal Post processing in action",
  })
}
