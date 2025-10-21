"use client"

import { useState } from "react"
import Header from "@/modules/landingPage/Home/component/header"
import Footer from "@/lib/utils/widgets/footer/footer"
import ConsultationCalendar from "./consultation-calendar"
import BookingForm from "./booking-form"

export default function BookConsultationPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleDateSelect = (date: Date, time: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setShowForm(true)
  }

  const handleBookingSubmit = (data: any) => {
    console.log("Booking submitted:", { date: selectedDate, time: selectedTime, ...data })
    setShowForm(false)
    setSelectedDate(null)
    setSelectedTime(null)
  }

  return (
    <main className="min-h-screen bg-white">
      <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} />

      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Book a <span className="text-red-600">Consultation</span>
            </h1>
            <p className="text-lg text-gray-600">
              Schedule a session with our team to discuss your needs and explore how DropAphi can help
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Calendar Section */}
            <div className="animate-slide-in-left">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-black mb-6">Select Date & Time</h2>
                <ConsultationCalendar onDateTimeSelect={handleDateSelect} />
              </div>
            </div>

            {/* Form Section */}
            <div className="animate-slide-in-right">
              {showForm && selectedDate && selectedTime ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-black mb-6">Your Information</h2>
                  <BookingForm selectedDate={selectedDate} selectedTime={selectedTime} onSubmit={handleBookingSubmit} />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center min-h-96">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-2">Select a Date & Time</h3>
                    <p className="text-gray-600">Choose your preferred consultation slot from the calendar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
