interface OTPEntry {
  signalCode: string
  phoneNumber: string
  createdAt: number
  expiresAt: number
  verified: boolean
  attempts: number
}

class OTPManager {
  private otpStore: Map<string, OTPEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  private readonly OTP_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
  private readonly MAX_ATTEMPTS = 3 // Maximum verification attempts

  constructor() {
    this.startAutoCleanup()
  }

  // 🔐 Store a new OTP for a phone number
  storeOTP(phoneNumber: string, signalCode: string): void {
    const now = Date.now()
    const key = this.getKey(phoneNumber)

    const otpEntry: OTPEntry = {
      signalCode, // ← THE GENERATED CODE IS STORED HERE
      phoneNumber,
      createdAt: now,
      expiresAt: now + this.OTP_DURATION,
      verified: false,
      attempts: 0,
    }

    this.otpStore.set(key, otpEntry)

    console.log(`OTP stored for ${phoneNumber}: ${signalCode} (expires in 5 minutes)`)
  }

  // ✅ Verify an OTP for a phone number
  verifyOTP(
    phoneNumber: string,
    providedCode: string,
  ): {
    success: boolean
    message: string
    remainingAttempts?: number
    timeRemaining?: number
  } {
    const key = this.getKey(phoneNumber)
    const otpEntry = this.otpStore.get(key) // ← GET THE STORED OTP

    if (!otpEntry) {
      return {
        success: false,
        message: "No OTP found for this phone number. Please request a new code.",
      }
    }

    const now = Date.now()

    // Check if OTP has expired
    if (now > otpEntry.expiresAt) {
      this.otpStore.delete(key)
      return {
        success: false,
        message: "OTP has expired. Please request a new code.",
      }
    }

    // Check if already verified
    if (otpEntry.verified) {
      return {
        success: false,
        message: "This OTP has already been used. Please request a new code.",
      }
    }

    // Check if max attempts reached
    if (otpEntry.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(key)
      return {
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new code.",
      }
    }

    // Increment attempt counter
    otpEntry.attempts++

    // 🎯 THE ACTUAL VERIFICATION HAPPENS HERE:
    if (otpEntry.signalCode === providedCode.trim()) {
      otpEntry.verified = true
      console.log(`OTP verified successfully for ${phoneNumber}`)

      // Keep the entry for a short time to prevent reuse, then delete
      setTimeout(() => {
        this.otpStore.delete(key)
      }, 30000) // Delete after 30 seconds

      return {
        success: true,
        message: "OTP verified successfully!",
      }
    } else {
      const remainingAttempts = this.MAX_ATTEMPTS - otpEntry.attempts
      console.log(`OTP verification failed for ${phoneNumber}. Attempts: ${otpEntry.attempts}/${this.MAX_ATTEMPTS}`)

      return {
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        remainingAttempts,
        timeRemaining: Math.ceil((otpEntry.expiresAt - now) / 1000), // seconds
      }
    }
  }

  // Generate a normalized key for phone numbers
  private getKey(phoneNumber: string): string {
    // Remove any non-digit characters and ensure it starts with +
    const cleaned = phoneNumber.replace(/\D/g, "")
    return cleaned.startsWith("1") ? `+${cleaned}` : `+1${cleaned}`
  }

  // Clean up expired OTPs
  private cleanupExpiredOTPs(): number {
    const now = Date.now()
    let deletedCount = 0

    for (const [key, entry] of this.otpStore.entries()) {
      if (now > entry.expiresAt) {
        this.otpStore.delete(key)
        deletedCount++
      }
    }

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired OTPs`)
    }

    return deletedCount
  }

  // Start automatic cleanup every minute
  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredOTPs()
    }, 60 * 1000) // Run every minute

    console.log("OTP auto-cleanup started: will run every minute to remove expired codes")
  }

  // Stop automatic cleanup
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  // Get statistics
  getStats(): {
    totalOTPs: number
    activeOTPs: number
    expiredOTPs: number
    verifiedOTPs: number
  } {
    const now = Date.now()
    let active = 0
    let expired = 0
    let verified = 0

    for (const entry of this.otpStore.values()) {
      if (entry.verified) {
        verified++
      } else if (now > entry.expiresAt) {
        expired++
      } else {
        active++
      }
    }

    return {
      totalOTPs: this.otpStore.size,
      activeOTPs: active,
      expiredOTPs: expired,
      verifiedOTPs: verified,
    }
  }
}

// Singleton instance
export const otpManager = new OTPManager()
