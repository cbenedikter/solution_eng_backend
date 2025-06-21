"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loginSuccess, setLoginSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setDebugInfo(null)

    try {
      console.log("Attempting login...")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      })

      const data = await response.json()
      console.log("Login response:", data)

      if (data.success) {
        setLoginSuccess(true)
        console.log("Login successful! Redirecting in 2 seconds...")

        // Simple redirect after delay
        setTimeout(() => {
          window.location.replace("/") // Use replace to avoid back button issues
        }, 2000)
      } else {
        console.log("Login failed:", data.error)
        setError(data.error || "Login failed")
        if (data.debug) {
          setDebugInfo(data.debug)
        }
      }
    } catch (error) {
      console.error("Login network error:", error)
      setError("Network error. Please try again.")
    }

    setLoading(false)
  }

  const checkDebugInfo = async () => {
    setDebugInfo(null)
    try {
      const response = await fetch("/api/debug/env")
      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
      } else {
        setDebugInfo({
          error: `Debug endpoint returned ${response.status}`,
          message: "Debug info not available",
        })
      }
    } catch (error) {
      setDebugInfo({
        error: "Network error",
        message: "Could not fetch debug info",
      })
    }
  }

  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <CheckCircle className="text-green-600 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Successful! 🎉</h2>
            <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Button onClick={() => window.location.replace("/")} variant="outline" size="sm">
              Go to Dashboard Now
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
            <CardTitle className="text-2xl">API Server Login</CardTitle>
          </div>
          <CardDescription>Enter your password to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  required
                  className="pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {debugInfo && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-xs space-y-1">
                    {debugInfo.error ? (
                      <div className="text-red-600">Error: {debugInfo.error}</div>
                    ) : (
                      <>
                        <div>Environment: {debugInfo.environment || "unknown"}</div>
                        <div>Admin Password Set: {debugInfo.adminPasswordSet ? "✅ Yes" : "❌ No"}</div>
                        <div>Password Length: {debugInfo.adminPasswordLength || 0}</div>
                        {debugInfo.adminPasswordPreview && <div>Preview: {debugInfo.adminPasswordPreview}</div>}
                      </>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={checkDebugInfo} className="w-full" disabled={loading}>
              Check Environment Setup
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Security Notice:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Password is set via ADMIN_PASSWORD environment variable</li>
              <li>• Sessions expire after 24 hours</li>
              <li>• All admin pages are protected</li>
              <li>• If you forgot the password, check your deployment settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
