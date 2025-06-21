import { outboundTracker } from "./outbound-tracker"

interface OneSignalPayload {
  app_id: string
  template_id: string
  include_phone_numbers: string[]
  custom_data: {
    signalcode: string
  }
}

interface OneSignalResponse {
  id?: string
  recipients?: number
  errors?: any
}

export class OneSignalService {
  private readonly apiUrl = "https://app.onesignal.com/api/v1/notifications"
  private readonly authHeader = "Basic YTE4YmE0MWUtYWQyMi00YTYzLWJiZWQtMTg1YmY1ZGYyYTIw"
  private readonly appId = "cf532c5e-5be2-4b00-ab6d-3d3d72ca9124"
  private readonly templateId = "a6f35326-6b86-4076-952c-1b3bbee7d391"

  async sendNotification(
    phoneNumber: string,
    signalCode: string,
    triggerPayload?: any,
  ): Promise<{
    success: boolean
    data?: OneSignalResponse
    error?: string
  }> {
    const startTime = Date.now()

    try {
      const payload: OneSignalPayload = {
        app_id: this.appId,
        template_id: this.templateId,
        include_phone_numbers: [phoneNumber],
        custom_data: {
          signalcode: signalCode,
        },
      }

      console.log("Sending OneSignal notification:", {
        phoneNumber,
        signalCode,
        timestamp: new Date().toISOString(),
        payloadPreview: payload,
      })

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authHeader,
          Cookie:
            "__cf_bm=kMnH5ka7.lSxRUwKimV8TpLfH4rG2VDAtYFl5zMOUTY-1750361291-1.0.1.1-SvnXe0z6rfSy5h6l16qum8bbev2ouHMzbQyibA8WRqFl_PEF6ys0NfD5hMhBSoCju8D6amQblZ2JilFUV9fKsv1xMMoRuwLzdhxubDnrO6Q",
        },
        body: JSON.stringify(payload),
      })

      const responseTime = Date.now() - startTime
      const responseData = await response.json()

      // Log the outbound activity
      outboundTracker.log({
        method: "POST",
        targetUrl: this.apiUrl,
        payload: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic [REDACTED]", // Don't log full auth header
        },
        responseStatus: response.status,
        responseTime: responseTime,
        responseData: responseData,
        success: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
        trigger: "Signal Post",
        triggerPayload: triggerPayload,
      })

      if (!response.ok) {
        throw new Error(`OneSignal API error: ${response.status} - ${JSON.stringify(responseData)}`)
      }

      console.log("OneSignal notification sent successfully:", responseData)

      return {
        success: true,
        data: responseData,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      // Log the failed outbound activity
      outboundTracker.log({
        method: "POST",
        targetUrl: this.apiUrl,
        payload: {
          app_id: this.appId,
          template_id: this.templateId,
          include_phone_numbers: [phoneNumber],
          custom_data: { signalcode: signalCode },
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic [REDACTED]",
        },
        responseTime: responseTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        trigger: "Signal Post",
        triggerPayload: triggerPayload,
      })

      console.error("OneSignal notification failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const oneSignalService = new OneSignalService()
