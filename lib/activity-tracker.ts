interface ApiActivity {
  id: string
  timestamp: string
  method: string
  endpoint: string
  payload?: any
  headers?: Record<string, string>
  userAgent?: string
  clientIP?: string
  responseStatus?: number
  responseTime?: number
}

class ActivityTracker {
  private activities: ApiActivity[] = []
  private maxActivities = 1000 // Keep more for better tracking
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start automatic cleanup every 6 hours
    this.startAutoCleanup()
  }

  log(activity: Omit<ApiActivity, "id" | "timestamp">): string {
    const id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newActivity: ApiActivity = {
      id,
      timestamp: new Date().toISOString(),
      ...activity,
    }

    this.activities.unshift(newActivity)

    // Keep only the most recent activities
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities)
    }

    console.log(`API Activity logged: ${activity.method} ${activity.endpoint}`)
    return id
  }

  getRecent(limit = 50): ApiActivity[] {
    return this.activities.slice(0, limit)
  }

  getById(id: string): ApiActivity | undefined {
    return this.activities.find((activity) => activity.id === id)
  }

  clear(): void {
    this.activities = []
  }

  count(): number {
    return this.activities.length
  }

  // Cleanup methods
  cleanupOldActivities(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): number {
    // Default: 7 days in milliseconds
    const cutoffTime = new Date(Date.now() - maxAgeMs)
    const originalCount = this.activities.length

    this.activities = this.activities.filter((activity) => {
      const activityTime = new Date(activity.timestamp)
      return activityTime >= cutoffTime
    })

    const deletedCount = originalCount - this.activities.length

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} old activities (older than ${cutoffTime.toISOString()})`)
    }

    return deletedCount
  }

  getOldActivitiesCount(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoffTime = new Date(Date.now() - maxAgeMs)
    return this.activities.filter((activity) => {
      const activityTime = new Date(activity.timestamp)
      return activityTime < cutoffTime
    }).length
  }

  startAutoCleanup(): void {
    // Run cleanup every 6 hours
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupOldActivities()
      },
      6 * 60 * 60 * 1000,
    ) // 6 hours

    console.log("Activity auto-cleanup started: will run every 6 hours to remove activities older than 7 days")
  }

  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
      console.log("Activity auto-cleanup stopped")
    }
  }

  getCleanupStats(): {
    totalActivities: number
    oldActivities: number
    nextCleanupIn: string
    autoCleanupEnabled: boolean
  } {
    return {
      totalActivities: this.count(),
      oldActivities: this.getOldActivitiesCount(),
      nextCleanupIn: this.cleanupInterval ? "< 6 hours" : "disabled",
      autoCleanupEnabled: this.cleanupInterval !== null,
    }
  }
}

// Singleton instance
export const activityTracker = new ActivityTracker()
