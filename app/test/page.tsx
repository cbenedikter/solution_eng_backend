"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestPage() {
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [signalPostPhone, setSignalPostPhone] = useState("+11234556777")
  const [signalPostCode, setSignalPostCode] = useState("54541")

  const addResponse = (response: any) => {
    setResponses((prev) => [response, ...prev.slice(0, 9)]) // Keep last 10 responses
  }

  const testHealthCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      addResponse({
        endpoint: "/api/health",
        method: "GET",
        status: response.status,
        data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      addResponse({
        endpoint: "/api/health",
        method: "GET",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
    setLoading(false)
  }

  const testWebhook = async () => {
    setLoading(true)
    const testData = {
      event: "test_webhook",
      data: { message: "Hello from test interface", timestamp: Date.now() },
    }

    try {
      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      })
      const data = await response.json()
      addResponse({
        endpoint: "/api/webhook",
        method: "POST",
        status: response.status,
        sentData: testData,
        data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      addResponse({
        endpoint: "/api/webhook",
        method: "POST",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
    setLoading(false)
  }

  const testMobileData = async () => {
    setLoading(true)
    const testMobileData = {
      userId: "user123",
      deviceType: "Android",
      appVersion: "2.1.0",
      sessionId: "session_" + Date.now(),
      customMessage: "Hello from mobile app!",
    }

    try {
      const response = await fetch("/api/mobile/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testMobileData),
      })
      const data = await response.json()
      addResponse({
        endpoint: "/api/mobile/data",
        method: "POST",
        status: response.status,
        sentData: testMobileData,
        data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      addResponse({
        endpoint: "/api/mobile/data",
        method: "POST",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
    setLoading(false)
  }

  const testSignalPost = async () => {
    setLoading(true)
    const signalPostData = {
      demo_app_id: "Signal Post",
      phone_number: signalPostPhone,
      signalcode: signalPostCode,
      userId: "test_user_" + Date.now(),
      timestamp: new Date().toISOString(),
    }

    try {
      const response = await fetch("/api/mobile/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signalPostData),
      })
      const data = await response.json()
      addResponse({
        endpoint: "/api/mobile/data (Signal Post)",
        method: "POST",
        status: response.status,
        sentData: signalPostData,
        data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      addResponse({
        endpoint: "/api/mobile/data (Signal Post)",
        method: "POST",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Testing Interface</h1>
          <p className="text-gray-600">Test your API endpoints and view responses</p>
        </div>

        <Tabs defaultValue="test" className="space-y-6">
          <TabsList>
            <TabsTrigger value="test">Test Endpoints</TabsTrigger>
            <TabsTrigger value="signal-post">Signal Post Test</TabsTrigger>
            <TabsTrigger value="responses">Response History</TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Health Check</CardTitle>
                  <CardDescription>Test the server health endpoint</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={testHealthCheck} disabled={loading} className="w-full">
                    Test GET /api/health
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhook Test</CardTitle>
                  <CardDescription>Send test data to webhook endpoint</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={testWebhook} disabled={loading} className="w-full">
                    Test POST /api/webhook
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mobile App Data</CardTitle>
                  <CardDescription>Test mobile app data endpoint</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={testMobileData} disabled={loading} className="w-full">
                    Test POST /api/mobile/data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="signal-post" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Signal Post Test</CardTitle>
                <CardDescription>
                  Test the Signal Post payload processing that triggers OneSignal notifications using the phone number
                  from the payload
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="+11234556777"
                      value={signalPostPhone}
                      onChange={(e) => setSignalPostPhone(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be formatted to E164</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Signal Code</label>
                    <Input
                      type="text"
                      placeholder="54541"
                      value={signalPostCode}
                      onChange={(e) => setSignalPostCode(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Custom data for OneSignal</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Test Payload Preview:</h4>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(
                      {
                        demo_app_id: "Signal Post",
                        phone_number: signalPostPhone,
                        signalcode: signalPostCode,
                        userId: "test_user_" + Date.now(),
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>

                <Button onClick={testSignalPost} disabled={loading || !signalPostPhone} className="w-full">
                  {loading ? "Sending..." : "Test Signal Post → OneSignal"}
                </Button>

                <div className="text-sm text-gray-600">
                  <p>
                    <strong>What this test does:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Sends payload with demo_app_id: "Signal Post"</li>
                    <li>Formats phone number to E164 format</li>
                    <li>Uses the payload phone number in OneSignal include_phone_numbers array</li>
                    <li>Triggers OneSignal notification API call</li>
                    <li>Returns processing results in response</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses">
            <Card>
              <CardHeader>
                <CardTitle>Recent API Responses</CardTitle>
                <CardDescription>Last 10 API calls and their responses</CardDescription>
              </CardHeader>
              <CardContent>
                {responses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No API calls yet. Try testing some endpoints!</p>
                ) : (
                  <div className="space-y-4">
                    {responses.map((response, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={response.method === "GET" ? "default" : "secondary"}>{response.method}</Badge>
                          <code className="text-sm">{response.endpoint}</code>
                          {response.status && (
                            <Badge variant={response.status < 400 ? "default" : "destructive"}>{response.status}</Badge>
                          )}
                          {response.data?.processing && (
                            <Badge variant={response.data.processing.success ? "default" : "destructive"}>
                              {response.data.processing.action}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(response.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(response.data || response.error, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
