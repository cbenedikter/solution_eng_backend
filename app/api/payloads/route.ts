import { dataStore } from "@/lib/data-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const unprocessedOnly = searchParams.get("unprocessed") === "true"
  const limit = Number.parseInt(searchParams.get("limit") || "50")

  try {
    const payloads = unprocessedOnly ? dataStore.getUnprocessed() : dataStore.getAll()
    const limitedPayloads = payloads.slice(0, limit)

    return Response.json({
      success: true,
      payloads: limitedPayloads,
      total: payloads.length,
      showing: limitedPayloads.length,
      unprocessedCount: dataStore.getUnprocessed().length,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to retrieve payloads",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
