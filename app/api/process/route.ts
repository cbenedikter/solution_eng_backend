export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Example data processing operations
    const processedData = {
      original: body,
      processed: {
        timestamp: new Date().toISOString(),
        dataType: Array.isArray(body) ? "array" : typeof body,
        itemCount: Array.isArray(body) ? body.length : Object.keys(body || {}).length,
        // Add your custom processing logic here
        transformed: transformData(body),
      },
    }

    return Response.json({
      success: true,
      message: "Data processed successfully",
      result: processedData,
    })
  } catch (error) {
    console.error("Data processing error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to process data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    )
  }
}

// Helper function for data transformation
function transformData(data: any) {
  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      index,
      value: item,
      processed: true,
    }))
  }

  if (typeof data === "object" && data !== null) {
    const transformed: any = {}
    for (const [key, value] of Object.entries(data)) {
      transformed[`processed_${key}`] = {
        originalValue: value,
        type: typeof value,
        processed: true,
      }
    }
    return transformed
  }

  return {
    originalValue: data,
    type: typeof data,
    processed: true,
  }
}
