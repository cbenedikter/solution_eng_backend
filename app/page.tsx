import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server, Send, ReceiptIcon as Receive, Globe, Shield } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { AuthCheck } from "@/components/auth-check"

export default function HomePage() {
  const apiEndpoints = [
    { method: "GET", path: "/api/health", description: "Server health check", public: true },
    { method: "POST", path: "/api/webhook", description: "Receive webhook data", public: true },
    { method: "POST", path: "/api/mobile/data", description: "Receive mobile app data", public: true },
    { method: "GET", path: "/api/external", description: "Fetch external API data", public: true },
    { method: "POST", path: "/api/process", description: "Process and transform data", public: true },
    { method: "GET", path: "/api/usage", description: "View usage statistics", public: false },
    { method: "GET", path: "/api/payloads", description: "View stored payloads", public: false },
  ]

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Server className="w-12 h-12 text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-900">API Server</h1>
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-xl text-gray-600">Your secure online server for receiving and sending APIs</p>
              <div className="mt-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  🔐 Authenticated & Secure
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Logged in as</div>
                <div className="font-medium">Admin</div>
                <div className="text-xs text-gray-500">Session active</div>
              </div>
              <LogoutButton />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Link href="/monitor" className="block">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-green-50">
                <CardHeader className="text-center">
                  <Receive className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <CardTitle>Receive APIs</CardTitle>
                  <CardDescription>Accept incoming HTTP requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Handle webhooks, form submissions, and data from external services
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-2">Click to monitor in real-time →</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/outbound" className="block">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-blue-50">
                <CardHeader className="text-center">
                  <Send className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle>Send APIs</CardTitle>
                  <CardDescription>Make outbound HTTP requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Fetch data from external APIs and integrate with third-party services
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-2">Click to monitor outbound calls →</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard" className="block">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-purple-50">
                <CardHeader className="text-center">
                  <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <CardTitle>Web Interface</CardTitle>
                  <CardDescription>Monitor and manage your APIs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    View logs, test endpoints, and manage your server through this interface
                  </p>
                  <p className="text-xs text-purple-600 font-medium mt-2">Click to manage payloads →</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/usage" className="block">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-orange-50">
                <CardHeader className="text-center">
                  <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <CardTitle>Usage & Limits</CardTitle>
                  <CardDescription>Monitor your API usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Track Vercel limits, response times, and usage statistics</p>
                  <p className="text-xs text-orange-600 font-medium mt-2">Click to view usage →</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Available API Endpoints
                <Shield className="w-5 h-5 text-green-600" />
              </CardTitle>
              <CardDescription>Your server exposes these endpoints for external use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>{endpoint.method}</Badge>
                      <code className="text-sm font-mono bg-white px-2 py-1 rounded">{endpoint.path}</code>
                      <Badge variant={endpoint.public ? "default" : "destructive"}>
                        {endpoint.public ? "Public" : "Protected"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthCheck>
  )
}
