import { formatToE164, validateE164 } from "./phone-utils"
import { oneSignalService } from "./onesignal-service"
import { activityTracker } from "./activity-tracker"
import { otpManager } from "./otp-manager"

interface ProcessingResult {
  processed: boolean
  action?: string
  success?: boolean
  details?: any
  error?: string
}

export class PayloadProcessor {
  // Generate a random 5-digit signal code
  private generateSignalCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString()
  }

  async processPayload(payload: any, source = "unknown"): Promise<ProcessingResult> {
    try {
      // Check if this is a Signal Post payload
      if (payload.demo_app_id === "Signal Post") {
        console.log("Signal Post payload detected, processing...", payload)

        // Extract phone number
        const rawPhoneNumber = payload.phone_number
        if (!rawPhoneNumber) {
          return {
            processed: true,
            action: "signal_post",
            success: false,
            error: "Missing phone_number in payload",
          }
        }

        // Format to E164
        const e164Phone = formatToE164(rawPhoneNumber)
        if (!e164Phone || !validateE164(e164Phone)) {
          return {
            processed: true,
            action: "signal_post",
            success: false,
            error: `Invalid phone number format: ${rawPhoneNumber}`,
          }
        }

        // Generate a random 5-digit signal code
        const signalCode = this.generateSignalCode()

        // 🔐 STORE THE OTP FOR 5 MINUTES
        otpManager.storeOTP(e164Phone, signalCode)

        console.log(`Generated and stored OTP: ${signalCode} for phone: ${e164Phone}`)

        // Log the processing attempt
        activityTracker.log({
          method: "PROCESS",
          endpoint: "/internal/signal-post-processor",
          payload: {
            originalPhone: rawPhoneNumber,
            e164Phone: e164Phone,
            generatedSignalCode: signalCode,
            otpStored: true,
            originalPayloadSignalCode: payload.signalcode || payload.signal_code || "none",
            source: source,
          },
        })

        // Send OneSignal notification with generated signal code
        const result = await oneSignalService.sendNotification(e164Phone, signalCode, payload)

        return {
          processed: true,
          action: "signal_post",
          success: result.success,
          details: {
            originalPhone: rawPhoneNumber,
            e164Phone: e164Phone,
            generatedSignalCode: signalCode,
            otpStored: true,
            otpExpiresIn: "5 minutes",
            originalPayloadSignalCode: payload.signalcode || payload.signal_code || "none",
            oneSignalResponse: result.data,
            oneSignalError: result.error,
          },
          error: result.error,
        }
      }

      // Not a Signal Post payload, no processing needed
      return {
        processed: false,
      }
    } catch (error) {
      console.error("Payload processing error:", error)
      return {
        processed: true,
        success: false,
        error: error instanceof Error ? error.message : "Unknown processing error",
      }
    }
  }
}

export const payloadProcessor = new PayloadProcessor()
