"use client"

import { useState } from "react"
import { Copy, Check, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function OTPAPIPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("curl")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const endpoints = [
    {
      method: "POST",
      path: "/send",
      description: "Send OTP via email",
      params: ["email", "purpose", "expiryMinutes", "length", "template"],
    },
    {
      method: "POST",
      path: "/verify",
      description: "Verify OTP code",
      params: ["email", "code"],
    },
    {
      method: "POST",
      path: "/resend",
      description: "Resend OTP to email",
      params: ["email"],
    },
  ]

  const codeExamples = {
    curl: `curl -X POST https://api.dropaphi.com/v1/otp/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "purpose": "account_verification",
    "expiryMinutes": 10,
    "length": 6,
    "template": "Your verification code is {otp}"
  }'`,
    javascript: `const response = await fetch('https://api.dropaphi.com/v1/otp/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    purpose: 'account_verification',
    expiryMinutes: 10,
    length: 6,
    template: 'Your verification code is {otp}'
  })
})`,
    python: `import requests

response = requests.post(
    'https://api.dropaphi.com/v1/otp/send',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'email': 'user@example.com',
        'purpose': 'account_verification',
        'expiryMinutes': 10,
        'length': 6,
        'template': 'Your verification code is {otp}'
    }
)`,
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">OTP API</h1>
        <p className="text-lg text-muted-foreground">
          Send and verify one-time passwords via email for secure authentication.
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Currently, OTP is sent via email only. SMS and WhatsApp delivery channels are coming soon.
        </AlertDescription>
      </Alert>

      {/* Base URL */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h3 className="font-semibold mb-2">Base URL</h3>
        <code className="text-sm bg-secondary p-2 rounded">https://api.dropaphi.com/v1/otp</code>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Request Parameters</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-sm mb-3">Required Parameters</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-mono bg-secondary px-2 py-1 rounded">email</span>
                <p className="text-muted-foreground mt-1">The recipient's email address</p>
              </div>
              <div>
                <span className="font-mono bg-secondary px-2 py-1 rounded">purpose</span>
                <p className="text-muted-foreground mt-1">
                  Purpose of OTP (e.g., account_verification, password_reset, login)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-sm mb-3">Optional Parameters</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-mono bg-secondary px-2 py-1 rounded">expiryMinutes</span>
                <p className="text-muted-foreground mt-1">OTP expiration time in minutes (default: 10)</p>
              </div>
              <div>
                <span className="font-mono bg-secondary px-2 py-1 rounded">length</span>
                <p className="text-muted-foreground mt-1">Length of OTP code (default: 6, range: 4-8)</p>
              </div>
              <div>
                <span className="font-mono bg-secondary px-2 py-1 rounded">template</span>
                <p className="text-muted-foreground mt-1">Custom email template with {"{otp}"} placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Endpoints</h2>
        <div className="space-y-3">
          {endpoints.map((endpoint, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-4 mb-3">
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold text-white ${
                    endpoint.method === "POST" ? "bg-blue-600" : "bg-green-600"
                  }`}
                >
                  {endpoint.method}
                </span>
                <div className="flex-1">
                  <code className="font-mono text-sm">{endpoint.path}</code>
                  <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                </div>
              </div>
              <div className="text-sm">
                <span className="font-semibold">Parameters:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {endpoint.params.map((param) => (
                    <span key={param} className="px-2 py-1 rounded bg-secondary text-xs">
                      {param}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Send OTP Example</h2>
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-border">
            {Object.keys(codeExamples).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                  activeTab === tab ? "border-accent text-accent" : "border-transparent text-muted-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <pre className="flex-1 p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
              {codeExamples[activeTab as keyof typeof codeExamples]}
            </pre>
            <Button
              onClick={() => copyToClipboard(codeExamples[activeTab as keyof typeof codeExamples])}
              variant="outline"
              size="sm"
              className="self-start"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </div>
      </div>

      {/* OTP Flow Simulator */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">OTP Flow</h2>
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 p-4 rounded-lg bg-secondary text-center font-semibold">1. Send OTP</div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1 p-4 rounded-lg bg-secondary text-center font-semibold">2. Email Sent</div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1 p-4 rounded-lg bg-accent text-accent-foreground text-center font-semibold">
              3. Verify OTP
            </div>
          </div>
        </div>
      </div>

      {/* Response Schema */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Response Schema</h2>
        <div className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
          <pre>{`{
  "success": true,
  "data": {
    "requestId": "otp_req_123456",
    "email": "user@example.com",
    "expiresIn": 600,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}`}</pre>
        </div>
      </div>

      {/* Template Customization */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <div className="space-y-3">
          {[
            { name: "Default", template: "Your verification code is {otp}" },
            { name: "With Expiry", template: "Your code is {otp}. Valid for 10 minutes." },
            { name: "Custom", template: "Welcome! Your verification code is {otp}. Do not share." },
          ].map((template, i) => (
            <div key={i} className="p-4 rounded-lg bg-secondary">
              <h4 className="font-semibold text-sm mb-2">{template.name}</h4>
              <code className="text-xs text-muted-foreground">{template.template}</code>
            </div>
          ))}
        </div>
      </div>

      <Alert className="bg-purple-50 border-purple-200">
        <Clock className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>Coming Soon:</strong> SMS and WhatsApp delivery channels will be available soon. Stay tuned for
          updates!
        </AlertDescription>
      </Alert>
    </div>
  )
}
