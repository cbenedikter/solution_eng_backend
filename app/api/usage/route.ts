import { usageTracker } from "@/lib/usage-tracker"
import { activityTracker } from "@/lib/activity-tracker"
import { outboundTracker } from "@/lib/outbound-tracker"
import { dataStore } from "@/lib/data-store"

export async function GET() {
  try {
    const usageStats = usageTracker.getUsageStats()
    const vercelEstimate = usageTracker.getVercelUsageEstimate()

    return Response.json({
      success: true,
      usage: usageStats,
      vercelEstimate,
      storage: {
        storedPayloads: dataStore.count(),
        inboundActivities: activityTracker.count(),
        outboundActivities: outboundTracker.count(),
      },
      limits: {
        vercel: {
          functionExecutions: { current: vercelEstimate.functionExecutions, limit: 100000 },
          functionDuration: { limit: "10 seconds" },
          bandwidth: { limit: "100GB/month" },
          buildMinutes: { limit: "6000 minutes/month" },
        },
        recommendations: [
          vercelEstimate.percentOfFreeLimit > 80 ? "Consider upgrading to Vercel Pro plan" : null,
          usageStats.errorRate > 5 ? "High error rate detected - check your API endpoints" : null,
          usageStats.averageResponseTime > 2000 ? "Slow response times - consider optimization" : null,
        ].filter(Boolean),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to retrieve usage stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
