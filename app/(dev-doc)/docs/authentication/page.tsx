"use client"

import { useState } from "react"
import { Copy, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button" 
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthenticationPage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const codeExamples = {
    curl: `curl -X GET https://api.dropaphi.com/v1/subscribers \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    javascript: `const response = await fetch('https://api.dropaphi.com/v1/subscribers', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})`,
    python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.dropaphi.com/v1/subscribers',
    headers=headers
)`,
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">Authentication</h1>
        <p className="text-lg text-muted-foreground">
          Secure your API requests using Bearer token authentication with JWT tokens.
        </p>
      </div>

      {/* API Key Types section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">API Key Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded text-sm font-semibold bg-yellow-100 text-yellow-800">TRIAL</span>
              <h3 className="font-semibold">Trial Key</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Valid for 14 days</li>
              <li>✓ Full API access</li>
              <li>✓ Rate limited to 1,000 requests/day</li>
              <li>✗ Cannot be regenerated after expiry</li>
              <li>✗ Not for production use</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">Format: drop-aphi-key-trial-xxxxx</p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-800">LIVE</span>
              <h3 className="font-semibold">Live Key</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ No expiration</li>
              <li>✓ Full API access</li>
              <li>✓ Higher rate limits</li>
              <li>✓ Production ready</li>
              <li>✓ Requires active subscription</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">Format: drop-aphi-key-live-xxxxx</p>
          </div>
        </div>
      </div>

      {/* Trial Key Management section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Trial Key Management</h2>
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            New accounts automatically receive a trial API key valid for 14 days. After expiration, you can regenerate a
            new trial key or upgrade to a paid plan for live keys.
          </AlertDescription>
        </Alert>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-secondary">
            <h4 className="font-semibold text-sm mb-2">Getting Your Trial Key</h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Sign up for a DropAphi account</li>
              <li>Navigate to Dashboard → API Keys</li>
              <li>Your trial key will be displayed automatically</li>
              <li>Copy and use it in your applications</li>
            </ol>
          </div>
          <div className="p-4 rounded-lg bg-secondary">
            <h4 className="font-semibold text-sm mb-2">Regenerating Trial Key</h4>
            <p className="text-sm text-muted-foreground">
              Once your trial key expires, you can regenerate a new one from the API Keys dashboard. Each regeneration
              gives you another 14 days of access.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary">
            <h4 className="font-semibold text-sm mb-2">Upgrading to Live Keys</h4>
            <p className="text-sm text-muted-foreground">
              To get live keys that don't expire, upgrade to a paid subscription plan. Live keys are only available for
              active subscribers.
            </p>
          </div>
        </div>
      </div>

      {/* JWT Flow Diagram */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">JWT Authentication Flow</h2>
        <div className="p-8 rounded-lg border border-border bg-card space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 p-4 rounded-lg bg-secondary text-center font-semibold">1. Request Token</div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1 p-4 rounded-lg bg-secondary text-center font-semibold">2. Receive JWT</div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1 p-4 rounded-lg bg-accent text-accent-foreground text-center font-semibold">
              3. Use Token
            </div>
          </div>
        </div>
      </div>

      {/* API Key Generator */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Generate API Key</h2>
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <div className="flex gap-2">
              <input
                type="text"
                value=" Drop-aphi-live-xxxxxxxxxxxxxxxxxxxxxxxx"
                readOnly
                className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border font-mono text-sm"
              />
              <Button
                onClick={() => copyToClipboard(" Drop-aphi-live-xxxxxxxxxxxxxxxxxxxxxxxx")}
                variant="outline"
                size="sm"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Keep your API key secret. Never share it publicly or commit it to version control.
          </p>
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Code Examples</h2>
        <div className="space-y-4">
          {Object.entries(codeExamples).map(([lang, code]) => (
            <div key={lang} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold capitalize">{lang}</h3>
                <Button onClick={() => copyToClipboard(code)} variant="ghost" size="sm">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
                {code}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Security Best Practices</h2>
        <div className="space-y-3">
          {[
            "Always use HTTPS for API requests",
            "Rotate API keys regularly",
            "Use environment variables to store API keys",
            "Never commit API keys to version control",
            "Implement rate limiting on your client",
            "Monitor API usage for suspicious activity",
          ].map((practice, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-lg bg-secondary">
              <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                {i + 1}
              </div>
              <p className="text-sm">{practice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
