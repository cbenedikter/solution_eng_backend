import { getSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

export default async function TestAuthPage() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Authentication Test
              {session ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </CardTitle>
            <CardDescription>Testing if authentication is working properly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Authentication Status:</span>
              <Badge variant={session ? "default" : "destructive"}>
                {session ? "✅ Authenticated" : "❌ Not Authenticated"}
              </Badge>
            </div>

            {session && (
              <>
                <div className="flex items-center justify-between">
                  <span>User ID:</span>
                  <Badge variant="outline">{session.userId}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Created:</span>
                  <Badge variant="outline">{new Date(session.createdAt).toLocaleString()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Expires:</span>
                  <Badge variant="outline">{new Date(session.expiresAt).toLocaleString()}</Badge>
                </div>
              </>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              {session ? (
                <p className="text-sm text-blue-800">
                  ✅ Authentication is working! You can now access all protected pages.
                </p>
              ) : (
                <p className="text-sm text-blue-800">❌ You need to log in to access protected pages.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
