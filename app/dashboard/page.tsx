"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Send, Database, Trash2, Clock, AlertTriangle } from "lucide-react"

interface StoredPayload {
  id: string
  data: Record<string, any>
  receivedAt: string
  processed: boolean
  source: string
}

interface CleanupStats {
  payloads: {
    totalPayloads: number
    oldPayloads: number
    nextCleanupIn: string
    autoCleanupEnabled: boolean
  }
  activities: {
    totalActivities: number
    oldActivities: number
    nextCleanupIn: string
    autoCleanupEnabled: boolean
  }
  totalOldItems: number
}

export default function DashboardPage() {
  const [payloads, setPayloads] = useState<StoredPayload[]>([])
  const [loading, setLoading] = useState(false)
  const [targetUrl, setTargetUrl] = useState("")
  const [forwardResults, setForwardResults] = useState<any[]>([])
  const [cleanupStats, setCleanupStats] = useState<CleanupStats | null>(null)
  const [cleanupLoading, setCleanupLoading] = useState(false)

  const fetchPayloads = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payloads")
      const data = await response.json()
      if (data.success) {
        setPayloads(data.payloads)
      }
    } catch (error) {
      console.error("Failed to fetch payloads:", error)
    }
    setLoading(false)
  }

  const fetchCleanupStats = async () => {
    try {
      const response = await fetch("/api/cleanup")
      const data = await response.json()
      if (data.success) {
        setCleanupStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch cleanup stats:", error)
    }
  }

  const performCleanup = async (maxAgeDays = 7, type = "both") => {
    setCleanupLoading(true)
    try {
      const response = await fetch("/api/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxAgeDays, type }),
      })

      const result = await response.json()

      if (result.success) {
        alert(
          `Cleanup completed! Deleted ${result.results.totalDeleted} items (${result.results.payloadsDeleted} payloads, ${result.results.activitiesDeleted} activities)`,
        )
        fetchPayloads()
        fetchCleanupStats()
      } else {
        alert(`Cleanup failed: ${result.error}`)
      }
    } catch (error) {
      console.error("Failed to perform cleanup:", error)
      alert("Cleanup failed due to network error")
    }
    setCleanupLoading(false)
  }

  const forwardPayload = async (payloadId: string) => {
    if (!targetUrl) {
      alert("Please enter a target URL")
      return
    }

    try {
      const response = await fetch("/api/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payloadId,
          targetUrl,
          method: "POST",
        }),
      })

      const result = await response.json()
      setForwardResults((prev) => [result, ...prev.slice(0, 9)])

      if (result.success) {
        fetchPayloads() // Refresh to show updated processed status
      }
    } catch (error) {
      console.error("Failed to forward payload:", error)
    }
  }

  const autoForwardAll = async () => {
    if (!targetUrl) {
      alert("Please enter a target URL")
      return
    }

    try {
      const response = await fetch("/api/auto-forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl,
          method: "POST",
          maxPayloads: 20,
        }),
      })

      const result = await response.json()
      setForwardResults((prev) => [result, ...prev.slice(0, 9)])

      if (result.success) {
        fetchPayloads() // Refresh to show updated processed status
      }
    } catch (error) {
      console.error("Failed to auto-forward payloads:", error)
    }
  }

  useEffect(() => {
    fetchPayloads()
    fetchCleanupStats()
  }, [])

  const unprocessedCount = payloads.filter((p) => !p.processed).length

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payload Dashboard</h1>
            <p className="text-gray-600">Manage stored payloads and forward them to external services</p>
          </div>
          <Button onClick={fetchPayloads} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <CardTitle>{payloads.length}</CardTitle>
              <CardDescription>Total Payloads</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Send className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <CardTitle>{unprocessedCount}</CardTitle>
              <CardDescription>Unprocessed</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <CardTitle>{payloads.length - unprocessedCount}</CardTitle>
              <CardDescription>Processed</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <CardTitle>{cleanupStats?.totalOldItems || 0}</CardTitle>
              <CardDescription>Old Items (7+ days)</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="payloads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payloads">Stored Payloads</TabsTrigger>
            <TabsTrigger value="forward">Forward Payloads</TabsTrigger>
            <TabsTrigger value="cleanup">Data Cleanup</TabsTrigger>
          </TabsList>

          <TabsContent value="payloads">
            <Card>
              <CardHeader>
                <CardTitle>Stored Payloads</CardTitle>
                <CardDescription>All payloads received from mobile apps and other sources</CardDescription>
              </CardHeader>
              <CardContent>
                {payloads.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No payloads stored yet</p>
                ) : (
                  <div className="space-y-4">
                    {payloads.map((payload) => (
                      <div key={payload.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={payload.processed ? "default" : "secondary"}>
                              {payload.processed ? "Processed" : "Unprocessed"}
                            </Badge>
                            <Badge variant="outline">{payload.source}</Badge>
                            <code className="text-xs text-gray-500">{payload.id}</code>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(payload.receivedAt).toLocaleString()}</span>
                        </div>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(payload.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forward">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Forward Payloads</CardTitle>
                  <CardDescription>Send stored payloads to external services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target URL</label>
                    <Input
                      type="url"
                      placeholder="https://api.example.com/webhook"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={autoForwardAll} disabled={!targetUrl || unprocessedCount === 0}>
                      Forward All Unprocessed ({unprocessedCount})
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {forwardResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Forward Results</CardTitle>
                    <CardDescription>Recent forwarding operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {forwardResults.map((result, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={result.success ? "default" : "destructive"}>
                              {result.success ? "Success" : "Failed"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {result.forwardedAt && new Date(result.forwardedAt).toLocaleString()}
                            </span>
                          </div>
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cleanup">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automatic Data Cleanup</CardTitle>
                  <CardDescription>Automatically delete data older than 7 days to save storage space</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cleanupStats && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-5 h-5 text-blue-600" />
                          <h3 className="font-medium">Payload Storage</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>Total: {cleanupStats.payloads.totalPayloads}</div>
                          <div>Old (7+ days): {cleanupStats.payloads.oldPayloads}</div>
                          <div>Next cleanup: {cleanupStats.payloads.nextCleanupIn}</div>
                          <Badge variant={cleanupStats.payloads.autoCleanupEnabled ? "default" : "destructive"}>
                            {cleanupStats.payloads.autoCleanupEnabled ? "Auto-cleanup ON" : "Auto-cleanup OFF"}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          <h3 className="font-medium">Activity Logs</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>Total: {cleanupStats.activities.totalActivities}</div>
                          <div>Old (7+ days): {cleanupStats.activities.oldActivities}</div>
                          <div>Next cleanup: {cleanupStats.activities.nextCleanupIn}</div>
                          <Badge variant={cleanupStats.activities.autoCleanupEnabled ? "default" : "destructive"}>
                            {cleanupStats.activities.autoCleanupEnabled ? "Auto-cleanup ON" : "Auto-cleanup OFF"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {cleanupStats && cleanupStats.totalOldItems > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-medium text-yellow-800">Old Data Detected</h3>
                      </div>
                      <p className="text-sm text-yellow-700 mb-3">
                        You have {cleanupStats.totalOldItems} items older than 7 days that can be cleaned up.
                      </p>
                      <Button
                        onClick={() => performCleanup(7, "both")}
                        disabled={cleanupLoading}
                        variant="outline"
                        className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {cleanupLoading ? "Cleaning..." : "Clean Up Old Data"}
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button onClick={() => performCleanup(1, "both")} disabled={cleanupLoading} variant="outline">
                      Clean 1+ day old
                    </Button>
                    <Button onClick={() => performCleanup(7, "both")} disabled={cleanupLoading} variant="outline">
                      Clean 7+ days old
                    </Button>
                    <Button onClick={() => performCleanup(30, "both")} disabled={cleanupLoading} variant="outline">
                      Clean 30+ days old
                    </Button>
                    <Button onClick={fetchCleanupStats} variant="ghost">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Stats
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
