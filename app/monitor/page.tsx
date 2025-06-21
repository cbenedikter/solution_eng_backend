"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Activity, Clock, Globe, Smartphone } from "lucide-react"

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

export default function MonitorPage() {
  const [activities, setActivities] = useState<ApiActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(2000) // 2 seconds

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/activities?limit=50")
      const data = await response.json()
      if (data.success) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
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

  const getEndpointIcon = (endpoint: string) => {
    if (endpoint.includes("mobile")) return <Smartphone className="w-4 h-4" />
    if (endpoint.includes("webhook")) return <Globe className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-Time API Monitor</h1>
            <p className="text-gray-600">Live view of incoming API requests and payloads</p>
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
              <Activity className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <CardTitle className="text-lg">{activities.length}</CardTitle>
              <CardDescription className="text-xs">Total Requests</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <Smartphone className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <CardTitle className="text-lg">
                {activities.filter((a) => a.endpoint.includes("mobile")).length}
              </CardTitle>
              <CardDescription className="text-xs">Mobile App</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <Globe className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <CardTitle className="text-lg">
                {activities.filter((a) => a.endpoint.includes("webhook")).length}
              </CardTitle>
              <CardDescription className="text-xs">Webhooks</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <Clock className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <CardTitle className="text-lg">
                {
                  activities.filter((a) => {
                    const time = new Date(a.timestamp)
                    const now = new Date()
                    return now.getTime() - time.getTime() < 60000 // Last minute
                  }).length
                }
              </CardTitle>
              <CardDescription className="text-xs">Last Minute</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live API Activity</CardTitle>
            <CardDescription>
              Real-time stream of incoming API requests
              {autoRefresh && <span className="text-green-600 ml-2">● Live</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No API activity yet</p>
                <p className="text-gray-400 text-sm">
                  Send a request to your API endpoints to see them appear here in real-time
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getEndpointIcon(activity.endpoint)}
                        <Badge variant={getMethodColor(activity.method)}>{activity.method}</Badge>
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{activity.endpoint}</code>
                        {activity.responseStatus && (
                          <Badge variant={getStatusColor(activity.responseStatus)}>{activity.responseStatus}</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatTime(activity.timestamp)}</div>
                        <div className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</div>
                      </div>
                    </div>

                    {activity.payload && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Payload:</div>
                        <pre className="text-xs bg-blue-50 p-3 rounded border overflow-auto max-h-32">
                          {JSON.stringify(activity.payload, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        {activity.clientIP && <span>IP: {activity.clientIP}</span>}
                        {activity.responseTime && <span>Response: {activity.responseTime}ms</span>}
                      </div>
                      {activity.userAgent && (
                        <span className="truncate max-w-xs">{activity.userAgent.split(" ")[0]}</span>
                      )}
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
