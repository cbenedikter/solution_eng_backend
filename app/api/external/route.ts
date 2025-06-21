export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const apiUrl = searchParams.get("url")

  if (!apiUrl) {
    return Response.json({ error: "Missing required parameter: url" }, { status: 400 })
  }

  try {
    // Validate URL to prevent SSRF attacks
    const url = new URL(apiUrl)
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid protocol")
    }

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "API-Server/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return Response.json({
      success: true,
      source: apiUrl,
      fetchedAt: new Date().toISOString(),
      data: data,
    })
  } catch (error) {
    console.error("External API fetch error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch external API",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
