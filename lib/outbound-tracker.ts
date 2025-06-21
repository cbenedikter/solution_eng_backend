interface OutboundActivity {
  id: string
  timestamp: string
  method: string
  targetUrl: string
  payload?: any
  headers?: Record<string, string>
  responseStatus?: number
  responseTime?: number
  responseData?: any
  success: boolean
  error?: string
  trigger?: string // What triggered this outbound call
  triggerPayload?: any // Original payload that triggered this
}

class OutboundTracker {
  private activities: OutboundActivity[] = []
  private maxActivities = 1000
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startAutoCleanup()
  }

  log(activity: Omit<OutboundActivity, "id" | "timestamp">): string {
    const id = `outbound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newActivity: OutboundActivity = {
      id,
      timestamp: new Date().toISOString(),
      ...activity,
    }

    this.activities.unshift(newActivity)

    // Keep only the most recent activities
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities)
    }

    console.log(
      `Outbound API logged: ${activity.method} ${activity.targetUrl} - ${activity.success ? "SUCCESS" : "FAILED"}`,
    )
    return id
  }

  getRecent(limit = 50): OutboundActivity[] {
    return this.activities.slice(0, limit)
  }

  getById(id: string): OutboundActivity | undefined {
    return this.activities.find((activity) => activity.id === id)
  }

  clear(): void {
    this.activities = []
  }

  count(): number {
    return this.activities.length
  }

  getSuccessCount(): number {
    return this.activities.filter((a) => a.success).length
  }

  getFailureCount(): number {
    return this.activities.filter((a) => !a.success).length
  }

  getRecentCount(minutes = 5): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.activities.filter((a) => new Date(a.timestamp) > cutoff).length
  }

  // Cleanup methods
  cleanupOldActivities(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoffTime = new Date(Date.now() - maxAgeMs)
    const originalCount = this.activities.length

    this.activities = this.activities.filter((activity) => {
      const activityTime = new Date(activity.timestamp)
      return activityTime >= cutoffTime
    })

    const deletedCount = originalCount - this.activities.length

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} old outbound activities (older than ${cutoffTime.toISOString()})`)
    }

    return deletedCount
  }

  startAutoCleanup(): void {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupOldActivities()
      },
      6 * 60 * 60 * 1000,
    ) // 6 hours

    console.log("Outbound activity auto-cleanup started: will run every 6 hours to remove activities older than 7 days")
  }

  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Singleton instance
export const outboundTracker = new OutboundTracker()
