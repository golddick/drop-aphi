"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitted(true)
    setFormData({ name: "", email: "", subject: "", message: "" })
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <main className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-black mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600">We'd love to hear from you. Send us a message!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          <div className="p-8 bg-gray-50 rounded-xl border-2 border-gray-200">
            <Mail className="w-8 h-8 text-yellow-600 mb-4" />
            <h3 className="text-lg font-bold text-black mb-2">Email</h3>
            <p className="text-gray-600">support@dropaphi.com</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-xl border-2 border-gray-200">
            <Phone className="w-8 h-8 text-yellow-600 mb-4" />
            <h3 className="text-lg font-bold text-black mb-2">Phone</h3>
            <p className="text-gray-600">+1 (555) 123-4567</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-xl border-2 border-gray-200">
            <MapPin className="w-8 h-8 text-yellow-600 mb-4" />
            <h3 className="text-lg font-bold text-black mb-2">Address</h3>
            <p className="text-gray-600">San Francisco, CA 94105</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-600"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-600"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-600"
                placeholder="How can we help?"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-600 resize-none"
                placeholder="Your message..."
              />
            </div>
            {isSubmitted && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-700">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-600 to-red-600 text-white hover:from-yellow-700 hover:to-red-700 flex items-center justify-center gap-2 py-3"
            >
              Send Message
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
