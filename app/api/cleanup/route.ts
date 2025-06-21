import { dataStore } from "@/lib/data-store"
import { activityTracker } from "@/lib/activity-tracker"

// ─────────────────────────────────────────────────────────────
// POST  /api/cleanup
// Body: { maxAgeDays?: number; type?: "payloads" | "activities" | "both" }
// Runs an on-demand cleanup.
// ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { maxAgeDays = 7, type = "both" } = await request.json()

    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000
    let payloadsDeleted = 0
    let activitiesDeleted = 0

    if (type === "payloads" || type === "both") {
      payloadsDeleted = dataStore.cleanupOldData(maxAgeMs)
    }
    if (type === "activities" || type === "both") {
      activitiesDeleted = activityTracker.cleanupOldActivities(maxAgeMs)
    }

    return Response.json({
      success: true,
      message: "Cleanup completed",
      results: {
        payloadsDeleted,
        activitiesDeleted,
        totalDeleted: payloadsDeleted + activitiesDeleted,
      },
      cleanedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cleanup POST error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to perform cleanup",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// ─────────────────────────────────────────────────────────────
// GET  /api/cleanup
// Returns cleanup statistics and schedule information.
// ─────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const payloadStats = dataStore.getCleanupStats()
    const activityStats = activityTracker.getCleanupStats()

    return Response.json({
      success: true,
      stats: {
        payloads: payloadStats,
        activities: activityStats,
        totalOldItems: payloadStats.oldPayloads + activityStats.oldActivities,
      },
      autoCleanupStatus: {
        enabled: payloadStats.autoCleanupEnabled && activityStats.autoCleanupEnabled,
        payloadCleanup: payloadStats.autoCleanupEnabled ? "every hour" : "disabled",
        activityCleanup: activityStats.autoCleanupEnabled ? "every 6 hours" : "disabled",
      },
    })
  } catch (error) {
    console.error("Cleanup GET error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to retrieve cleanup stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
