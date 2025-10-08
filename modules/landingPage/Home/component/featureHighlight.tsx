
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mail, Shield, Code, Zap, BarChart3, Globe, Lock, CheckCircle } from "lucide-react"

export function FeatureHighlight() {
  return (
    <section id="features" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Three Powerful APIs,</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-red-400">
              Endless Possibilities
            </span>
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Everything you need to build, send, and manage email communications at scale
          </p>
        </motion.div>

        {/* Newsletter API */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-gold-500 to-red-500 rounded-lg">
                  <Mail className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">Newsletter & Email Builder API</h3>
              </div>
              <p className="text-neutral-300 mb-6 text-lg leading-relaxed">
                Create stunning newsletters with our drag-and-drop builder or use our REST API to send programmatic
                emails. Complete subscriber management, analytics, and templates included.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gold-400" />
                  <span className="text-neutral-300">Drag & Drop Builder</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gold-400" />
                  <span className="text-neutral-300">Custom Templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gold-400" />
                  <span className="text-neutral-300">Subscriber Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gold-400" />
                  <span className="text-neutral-300">Analytics & Tracking</span>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-gold-500 to-red-500 text-black hover:from-gold-400 hover:to-red-400">
                Explore Newsletter API
              </Button>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <div className="text-sm text-neutral-400 mb-2">POST /api/v1/newsletters/send</div>
              <pre className="text-sm text-neutral-300 overflow-x-auto">
                {`{
  "to": ["user@example.com"],
  "template": "welcome-series",
  "data": {
    "name": "John Doe",
    "company": "Acme Corp"
  },
  "tracking": true,
  "schedule": "2024-01-15T10:00:00Z"
}`}
              </pre>
            </div>
          </div>
        </motion.div>

        {/* OTP API */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <div className="text-sm text-neutral-400 mb-2">POST /api/v1/otp/send</div>
              <pre className="text-sm text-neutral-300 overflow-x-auto mb-4">
                {`{
  "email": "user@example.com",
  "type": "login",
  "length": 6,
  "expiry": 300,
  "template": "custom-otp"
}`}
              </pre>
              <div className="text-sm text-neutral-400 mb-2">POST /api/v1/otp/verify</div>
              <pre className="text-sm text-neutral-300 overflow-x-auto">
                {`{
  "email": "user@example.com",
  "code": "123456"
}`}
              </pre>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-red-500 to-gold-500 rounded-lg">
                  <Shield className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">OTP Verification API</h3>
              </div>
              <p className="text-neutral-300 mb-6 text-lg leading-relaxed">
                Secure user authentication with one-time passwords. No SMTP configuration needed - we handle delivery,
                rate limiting, and security automatically.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-red-400" />
                  <span className="text-neutral-300">Instant Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-red-400" />
                  <span className="text-neutral-300">Rate Limiting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-red-400" />
                  <span className="text-neutral-300">Custom Templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-red-400" />
                  <span className="text-neutral-300">Security Built-in</span>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-red-500 to-gold-500 text-black hover:from-red-400 hover:to-gold-400">
                Explore OTP API
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Blog Content API */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-gold-500 to-red-500 rounded-lg">
                  <Code className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">Blog Content API</h3>
              </div>
              <p className="text-neutral-300 mb-6 text-lg leading-relaxed">
                Headless CMS for blog content with customizable templates. Fetch and display blog posts on any website
                with our flexible API and template system.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gold-400" />
                  <span className="text-neutral-300">Headless CMS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gold-400" />
                  <span className="text-neutral-300">Custom Templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gold-400" />
                  <span className="text-neutral-300">SEO Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gold-400" />
                  <span className="text-neutral-300">Cross-Platform</span>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-gold-500 to-red-500 text-black hover:from-gold-400 hover:to-red-400">
                Explore Blog API
              </Button>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <div className="text-sm text-neutral-400 mb-2">GET /api/v1/blog/posts</div>
              <pre className="text-sm text-neutral-300 overflow-x-auto mb-4">
                {`{
  "posts": [
    {
      "id": "post-123",
      "title": "Getting Started with APIs",
      "content": "...",
      "template": "modern",
      "author": "Jane Doe",
      "published": "2024-01-15"
    }
  ]
}`}
              </pre>
              <div className="text-sm text-neutral-400 mb-2">GET /api/v1/templates/modern</div>
              <pre className="text-sm text-neutral-300 overflow-x-auto">
                {`{
  "template": "modern",
  "config": {
    "primaryColor": "#f59e0b",
    "layout": "single-column"
  }
}`}
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">Built for Scale & Performance</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
              <Zap className="h-8 w-8 text-gold-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Lightning Fast</h4>
              <p className="text-sm text-neutral-300">Sub-second API response times globally</p>
            </div>
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
              <BarChart3 className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Real-time Analytics</h4>
              <p className="text-sm text-neutral-300">Track opens, clicks, and conversions</p>
            </div>
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
              <Globe className="h-8 w-8 text-gold-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Global CDN</h4>
              <p className="text-sm text-neutral-300">150+ edge locations worldwide</p>
            </div>
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
              <Lock className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Enterprise Security</h4>
              <p className="text-sm text-neutral-300">SOC 2 compliant with encryption</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}




