// Simple in-memory storage (replace with database in production)
interface StoredPayload {
  id: string
  data: Record<string, any>
  receivedAt: string
  processed: boolean
  source: string
}

class DataStore {
  private payloads: Map<string, StoredPayload> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start automatic cleanup every hour
    this.startAutoCleanup()
  }

  store(data: Record<string, any>, source = "mobile"): string {
    const id = `payload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const payload: StoredPayload = {
      id,
      data,
      receivedAt: new Date().toISOString(),
      processed: false,
      source,
    }

    this.payloads.set(id, payload)
    console.log(`Stored payload ${id}:`, payload)
    return id
  }

  get(id: string): StoredPayload | undefined {
    return this.payloads.get(id)
  }

  getAll(): StoredPayload[] {
    return Array.from(this.payloads.values()).sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    )
  }

  getUnprocessed(): StoredPayload[] {
    return this.getAll().filter((payload) => !payload.processed)
  }

  markAsProcessed(id: string): boolean {
    const payload = this.payloads.get(id)
    if (payload) {
      payload.processed = true
      this.payloads.set(id, payload)
      return true
    }
    return false
  }

  delete(id: string): boolean {
    return this.payloads.delete(id)
  }

  clear(): void {
    this.payloads.clear()
  }

  count(): number {
    return this.payloads.size
  }

  // Cleanup methods
  cleanupOldData(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): number {
    // Default: 7 days in milliseconds
    const cutoffTime = new Date(Date.now() - maxAgeMs)
    let deletedCount = 0

    for (const [id, payload] of this.payloads.entries()) {
      const payloadTime = new Date(payload.receivedAt)
      if (payloadTime < cutoffTime) {
        this.payloads.delete(id)
        deletedCount++
      }
    }

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} old payloads (older than ${cutoffTime.toISOString()})`)
    }

    return deletedCount
  }

  getOldDataCount(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoffTime = new Date(Date.now() - maxAgeMs)
    let oldCount = 0

    for (const payload of this.payloads.values()) {
      const payloadTime = new Date(payload.receivedAt)
      if (payloadTime < cutoffTime) {
        oldCount++
      }
    }

    return oldCount
  }

  startAutoCleanup(): void {
    // Run cleanup every hour
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupOldData()
      },
      60 * 60 * 1000,
    ) // 1 hour

    console.log("Auto-cleanup started: will run every hour to remove data older than 7 days")
  }

  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
      console.log("Auto-cleanup stopped")
    }
  }

  getCleanupStats(): {
    totalPayloads: number
    oldPayloads: number
    nextCleanupIn: string
    autoCleanupEnabled: boolean
  } {
    return {
      totalPayloads: this.count(),
      oldPayloads: this.getOldDataCount(),
      nextCleanupIn: this.cleanupInterval ? "< 1 hour" : "disabled",
      autoCleanupEnabled: this.cleanupInterval !== null,
    }
  }
}

// Singleton instance
export const dataStore = new DataStore()
