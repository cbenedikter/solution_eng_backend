"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout error:", error)
    }

    setLoading(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
      <LogOut className="w-4 h-4 mr-2" />
      {loading ? "Signing out..." : "Sign Out"}
    </Button>
  )
}
