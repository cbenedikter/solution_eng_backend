interface UsageStats {
  totalRequests: number
  requestsToday: number
  requestsThisMonth: number
  averageResponseTime: number
  errorRate: number
  topEndpoints: { endpoint: string; count: number }[]
  dailyBreakdown: { date: string; requests: number }[]
}

class UsageTracker {
  private requests: Map<string, { timestamp: string; endpoint: string; responseTime?: number; success: boolean }> =
    new Map()

  logRequest(endpoint: string, responseTime?: number, success = true): void {
    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.requests.set(id, {
      timestamp: new Date().toISOString(),
      endpoint,
      responseTime,
      success,
    })

    // Keep only last 10,000 requests to prevent memory issues
    if (this.requests.size > 10000) {
      const oldestKey = this.requests.keys().next().value
      this.requests.delete(oldestKey)
    }
  }

  getUsageStats(): UsageStats {
    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const thisMonth = now.toISOString().substring(0, 7) // YYYY-MM

    const allRequests = Array.from(this.requests.values())

    // Filter requests
    const todayRequests = allRequests.filter((req) => req.timestamp.startsWith(today))
    const monthRequests = allRequests.filter((req) => req.timestamp.startsWith(thisMonth))

    // Calculate averages
    const requestsWithTime = allRequests.filter((req) => req.responseTime)
    const averageResponseTime =
      requestsWithTime.length > 0
        ? requestsWithTime.reduce((sum, req) => sum + (req.responseTime || 0), 0) / requestsWithTime.length
        : 0

    // Error rate
    const errorCount = allRequests.filter((req) => !req.success).length
    const errorRate = allRequests.length > 0 ? (errorCount / allRequests.length) * 100 : 0

    // Top endpoints
    const endpointCounts = new Map<string, number>()
    allRequests.forEach((req) => {
      endpointCounts.set(req.endpoint, (endpointCounts.get(req.endpoint) || 0) + 1)
    })
    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Daily breakdown (last 7 days)
    const dailyBreakdown: { date: string; requests: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayRequests = allRequests.filter((req) => req.timestamp.startsWith(dateStr))
      dailyBreakdown.push({ date: dateStr, requests: dayRequests.length })
    }

    return {
      totalRequests: allRequests.length,
      requestsToday: todayRequests.length,
      requestsThisMonth: monthRequests.length,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      topEndpoints,
      dailyBreakdown,
    }
  }

  // Vercel-specific usage estimation
  getVercelUsageEstimate(): {
    functionExecutions: number
    estimatedCost: number
    percentOfFreeLimit: number
    daysUntilReset: number
  } {
    const stats = this.getUsageStats()
    const freeLimit = 100000 // Vercel Hobby plan limit

    // Estimate days until monthly reset
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      functionExecutions: stats.requestsThisMonth,
      estimatedCost: 0, // Free tier
      percentOfFreeLimit: (stats.requestsThisMonth / freeLimit) * 100,
      daysUntilReset,
    }
  }
}

export const usageTracker = new UsageTracker()
