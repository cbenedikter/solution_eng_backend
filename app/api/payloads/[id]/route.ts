import { dataStore } from "@/lib/data-store"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = dataStore.get(params.id)

    if (!payload) {
      return Response.json({ success: false, error: "Payload not found" }, { status: 404 })
    }

    return Response.json({
      success: true,
      payload,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to retrieve payload",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
