export async function GET() {
  try {
    return Response.json({
      status: "Debug endpoint working",
      environment: process.env.NODE_ENV || "unknown",
      adminPasswordSet: !!process.env.ADMIN_PASSWORD,
      adminPasswordLength: process.env.ADMIN_PASSWORD?.length || 0,
      adminPasswordPreview: process.env.ADMIN_PASSWORD
        ? `${process.env.ADMIN_PASSWORD.charAt(0)}***${process.env.ADMIN_PASSWORD.charAt(process.env.ADMIN_PASSWORD.length - 1)}`
        : "NOT SET",
      timestamp: new Date().toISOString(),
      message: "Environment check successful",
    })
  } catch (error) {
    return Response.json(
      {
        error: "Debug endpoint error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
