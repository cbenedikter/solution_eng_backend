export async function GET() {
  return Response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: "API server is running successfully",
  })
}
