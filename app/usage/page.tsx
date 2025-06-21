"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Clock, Database } from "lucide-react"

interface UsageData {
  usage: {
    totalRequests: number
    requestsToday: number
    requestsThisMonth: number
    averageResponseTime: number
    errorRate: number
    topEndpoints: { endpoint: string; count: number }[]
    dailyBreakdown: { date: string; requests: number }[]
  }
  vercelEstimate: {
    functionExecutions: number
    estimatedCost: number
    percentOfFreeLimit: number
    daysUntilReset: number
  }
  storage: {
    storedPayloads: number
    inboundActivities: number
    outboundActivities: number
  }
  limits: {
    vercel: {
      functionExecutions: { current: number; limit: number }
      functionDuration: { limit: string }
      bandwidth: { limit: string }
      buildMinutes: { limit: string }
    }
    recommendations: string[]
  }
}

export default function UsagePage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchUsage = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/usage")
      const data = await response.json()
      if (data.success) {
        setUsageData(data)
      }
    } catch (error) {
      console.error("Failed to fetch usage data:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsage()
  }, [])

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return "text-green-600"
    if (percentage < 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getUsageBadgeVariant = (percentage: number) => {
    if (percentage < 50) return "default"
    if (percentage < 80) return "secondary"
    return "destructive"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Usage Dashboard</h1>
            <p className="text-gray-600">Monitor your API usage and Vercel limits</p>
          </div>
          <Button onClick={fetchUsage} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {!usageData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading usage data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Vercel Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Vercel Usage (Free Tier)
                </CardTitle>
                <CardDescription>Your current usage against Vercel's free tier limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Function Executions</span>
                      <Badge variant={getUsageBadgeVariant(usageData.vercelEstimate.percentOfFreeLimit)}>
                        {usageData.vercelEstimate.percentOfFreeLimit.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={usageData.vercelEstimate.percentOfFreeLimit} className="mb-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{usageData.vercelEstimate.functionExecutions.toLocaleString()} used</span>
                      <span>100,000 limit</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Days until reset:</span>
                      <span className="font-medium">{usageData.vercelEstimate.daysUntilReset} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Function Duration Limit:</span>
                      <span className="font-medium">10 seconds</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bandwidth Limit:</span>
                      <span className="font-medium">100GB/month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Usage Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="text-center pb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <CardTitle className="text-lg">{usageData.usage.totalRequests.toLocaleString()}</CardTitle>
                  <CardDescription className="text-xs">Total Requests</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="text-center pb-2">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <CardTitle className="text-lg">{usageData.usage.requestsToday.toLocaleString()}</CardTitle>
                  <CardDescription className="text-xs">Today</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="text-center pb-2">
                  <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <CardTitle className="text-lg">{usageData.usage.averageResponseTime}ms</CardTitle>
                  <CardDescription className="text-xs">Avg Response Time</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="text-center pb-2">
                  <AlertTriangle
                    className={`w-6 h-6 mx-auto mb-1 ${usageData.usage.errorRate > 5 ? "text-red-600" : "text-gray-400"}`}
                  />
                  <CardTitle className="text-lg">{usageData.usage.errorRate}%</CardTitle>
                  <CardDescription className="text-xs">Error Rate</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Storage Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Storage Usage
                </CardTitle>
                <CardDescription>Data stored in memory (resets on server restart)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{usageData.storage.storedPayloads}</div>
                    <div className="text-sm text-gray-500">Stored Payloads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{usageData.storage.inboundActivities}</div>
                    <div className="text-sm text-gray-500">Inbound Activities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{usageData.storage.outboundActivities}</div>
                    <div className="text-sm text-gray-500">Outbound Activities</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {usageData.limits.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {usageData.limits.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>Top API Endpoints</CardTitle>
                <CardDescription>Most frequently used endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usageData.usage.topEndpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <code className="text-sm font-mono">{endpoint.endpoint}</code>
                      <Badge variant="outline">{endpoint.count.toLocaleString()} requests</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
