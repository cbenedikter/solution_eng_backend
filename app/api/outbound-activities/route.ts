import { outboundTracker } from "@/lib/outbound-tracker"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "50")

  try {
    const activities = outboundTracker.getRecent(limit)

    return Response.json({
      success: true,
      activities,
      total: outboundTracker.count(),
      showing: activities.length,
      stats: {
        successCount: outboundTracker.getSuccessCount(),
        failureCount: outboundTracker.getFailureCount(),
        recentCount: outboundTracker.getRecentCount(5), // Last 5 minutes
      },
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to retrieve outbound activities",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
