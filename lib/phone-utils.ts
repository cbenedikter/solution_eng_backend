// Simple E164 phone number formatter
export function formatToE164(phoneNumber: string): string | null {
  if (!phoneNumber) return null

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "")

  // If it starts with 1 and has 11 digits, it's already in good format
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`
  }

  // If it has 10 digits, assume US number and add country code
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }

  // If it already starts with country code but no +
  if (cleaned.length > 10) {
    return `+${cleaned}`
  }

  // If it already has +, just clean it up
  if (phoneNumber.includes("+")) {
    const withPlus = phoneNumber.replace(/[^\d+]/g, "")
    if (withPlus.startsWith("+") && withPlus.length > 10) {
      return withPlus
    }
  }

  return null // Invalid format
}

export function validateE164(phoneNumber: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/
  return e164Regex.test(phoneNumber)
}
