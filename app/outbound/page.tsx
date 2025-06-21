"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Send, Clock, CheckCircle, XCircle } from "lucide-react"

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
  trigger?: string
  triggerPayload?: any
}

export default function OutboundPage() {
  const [activities, setActivities] = useState<OutboundActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(3000) // 3 seconds
  const [stats, setStats] = useState({
    successCount: 0,
    failureCount: 0,
    recentCount: 0,
  })

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/outbound-activities?limit=50")
      const data = await response.json()
      if (data.success) {
        setActivities(data.activities)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch outbound activities:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchActivities, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "default"
      case "POST":
        return "secondary"
      case "PUT":
        return "outline"
      case "DELETE":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status?: number) => {
    if (!status) return "outline"
    if (status >= 200 && status < 300) return "default"
    if (status >= 400 && status < 500) return "destructive"
    if (status >= 500) return "destructive"
    return "outline"
  }

  const getTriggerIcon = (trigger?: string) => {
    if (trigger === "Signal Post") return "📱"
    if (trigger === "Manual Forward") return "🔄"
    return "🔗"
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)

    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Outbound API Monitor</h1>
            <p className="text-gray-600">Live view of API requests sent from your server</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh" />
              <label htmlFor="auto-refresh" className="text-sm font-medium">
                Auto-refresh
              </label>
            </div>
            <Button onClick={fetchActivities} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center pb-2">
              <Send className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <CardTitle className="text-lg">{activities.length}</CardTitle>
              <CardDescription className="text-xs">Total Sent</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <CardTitle className="text-lg">{stats.successCount}</CardTitle>
              <CardDescription className="text-xs">Successful</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <CardTitle className="text-lg">{stats.failureCount}</CardTitle>
              <CardDescription className="text-xs">Failed</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <Clock className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <CardTitle className="text-lg">{stats.recentCount}</CardTitle>
              <CardDescription className="text-xs">Last 5 Minutes</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Outbound Activity</CardTitle>
            <CardDescription>
              Real-time stream of API requests sent from your server
              {autoRefresh && <span className="text-blue-600 ml-2">● Live</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No outbound API activity yet</p>
                <p className="text-gray-400 text-sm">
                  Trigger a Signal Post or forward a payload to see outbound requests appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getTriggerIcon(activity.trigger)}</span>
                        <Badge variant={getMethodColor(activity.method)}>{activity.method}</Badge>
                        <div className="flex flex-col">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {getDomainFromUrl(activity.targetUrl)}
                          </code>
                          <span className="text-xs text-gray-500 mt-1">{activity.trigger || "Unknown trigger"}</span>
                        </div>
                        {activity.responseStatus && (
                          <Badge variant={getStatusColor(activity.responseStatus)}>{activity.responseStatus}</Badge>
                        )}
                        {activity.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatTime(activity.timestamp)}</div>
                        <div className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</div>
                      </div>
                    </div>

                    {activity.error && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-red-700 mb-1">Error:</div>
                        <div className="text-xs bg-red-50 text-red-800 p-2 rounded border">{activity.error}</div>
                      </div>
                    )}

                    {activity.payload && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Sent Payload:</div>
                        <pre className="text-xs bg-blue-50 p-3 rounded border overflow-auto max-h-32">
                          {JSON.stringify(activity.payload, null, 2)}
                        </pre>
                      </div>
                    )}

                    {activity.responseData && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Response:</div>
                        <pre className="text-xs bg-green-50 p-3 rounded border overflow-auto max-h-32">
                          {JSON.stringify(activity.responseData, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>Target: {getDomainFromUrl(activity.targetUrl)}</span>
                        {activity.responseTime && <span>Response: {activity.responseTime}ms</span>}
                      </div>
                      {activity.triggerPayload && <span className="text-blue-600">Triggered by payload data</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
