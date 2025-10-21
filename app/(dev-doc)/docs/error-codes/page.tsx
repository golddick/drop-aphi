"use client"

import { AlertTriangle, Info } from "lucide-react"

export default function ErrorCodesPage() {
  const errorCodes = [
    {
      code: "400",
      name: "Bad Request",
      description: "The request was malformed or missing required parameters.",
      example: "Missing required field: email",
      icon: AlertTriangle,
    },
    {
      code: "401",
      name: "Unauthorized",
      description: "Authentication failed or API key is invalid.",
      example: "Invalid API key provided",
      icon: AlertTriangle,
    },
    {
      code: "403",
      name: "Forbidden",
      description: "You don't have permission to access this resource.",
      example: "Trial keys cannot access this endpoint",
      icon: AlertTriangle,
    },
    {
      code: "404",
      name: "Not Found",
      description: "The requested resource does not exist.",
      example: "Newsletter with ID 123 not found",
      icon: Info,
    },
    {
      code: "429",
      name: "Too Many Requests",
      description: "You've exceeded the rate limit for your plan.",
      example: "Rate limit exceeded. Reset at 2025-10-17T15:00:00Z",
      icon: AlertTriangle,
    },
    {
      code: "500",
      name: "Internal Server Error",
      description: "An unexpected error occurred on our servers.",
      example: "Please try again later or contact support",
      icon: AlertTriangle,
    },
    {
      code: "503",
      name: "Service Unavailable",
      description: "The API is temporarily unavailable for maintenance.",
      example: "Service will be back online in 30 minutes",
      icon: Info,
    },
  ]

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-balance">Error Codes</h1>
        <p className="text-lg text-muted-foreground">
          Reference guide for all error codes returned by the DropAphi API.
        </p>
      </div>

      {/* Error Codes Table */}
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 px-4 font-bold">Code</th>
                <th className="text-left py-3 px-4 font-bold">Name</th>
                <th className="text-left py-3 px-4 font-bold">Description</th>
                <th className="text-left py-3 px-4 font-bold">Example</th>
              </tr>
            </thead>
            <tbody>
              {errorCodes.map((error) => {
                const Icon = error.icon
                return (
                  <tr key={error.code} className="border-b border-border hover:bg-secondary transition">
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-accent">{error.code}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{error.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{error.description}</td>
                    <td className="py-4 px-4 text-sm font-mono text-muted-foreground">{error.example}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Response Format */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Error Response Format</h2>
        <p className="text-muted-foreground">All error responses follow this standard format:</p>
        <div className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
          <pre>{`{
  "error": {
    "code": "400",
    "message": "Bad Request",
    "details": "Missing required field: email",
    "timestamp": "2025-10-17T14:30:00Z",
    "request_id": "req_abc123xyz"
  }
}`}</pre>
        </div>
      </div>

      {/* Handling Errors */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Handling Errors</h2>
        <div className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
          <pre>{`try {
  const response = await dropaphi.newsletter.send({
    subject: 'Hello',
    content: 'World'
  })
} catch (error) {
  if (error.code === 429) {
    // Implement exponential backoff
    console.log('Rate limited, retry after:', error.retryAfter)
  } else if (error.code === 401) {
    // Re-authenticate
    console.log('Invalid API key')
  } else {
    // Handle other errors
    console.error('API Error:', error.message)
  }
}`}</pre>
        </div>
      </div>
    </div>
  )
}
