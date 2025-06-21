import { activityTracker } from "@/lib/activity-tracker"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "50")

  try {
    const activities = activityTracker.getRecent(limit)

    return Response.json({
      success: true,
      activities,
      total: activityTracker.count(),
      showing: activities.length,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to retrieve activities",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
