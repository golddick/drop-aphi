"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface BookingFormProps {
  selectedDate: Date
  selectedTime: string
  onSubmit: (data: any) => void
}

export default function BookingForm({ selectedDate, selectedTime, onSubmit }: BookingFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSubmit(formData)
    setFormData({ fullName: "", email: "", company: "", message: "" })
    setIsSubmitting(false)
  }

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selected Date & Time Display */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600 mb-1">Scheduled Consultation</p>
        <p className="text-lg font-semibold text-black">
          {formattedDate} at {selectedTime}
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">Full Name *</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
          placeholder="John Doe"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
          placeholder="john@example.com"
        />
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">Company</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
          placeholder="Your Company"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 resize-none"
          placeholder="Tell us about your needs..."
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-red-600 text-white hover:bg-black py-2 rounded-lg font-semibold transition-all"
      >
        {isSubmitting ? "Booking..." : "Confirm Booking"}
      </Button>

      <p className="text-xs text-gray-500 text-center">We'll send a confirmation email to your provided address</p>
    </form>
  )
}
