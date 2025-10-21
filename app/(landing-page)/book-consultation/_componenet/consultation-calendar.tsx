"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConsultationCalendarProps {
  onDateTimeSelect: (date: Date, time: string) => void
}

export default function ConsultationCalendar({ onDateTimeSelect }: ConsultationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Unavailable dates (admin configured)
  const unavailableDates = [
    new Date(2025, 9, 25), // Example: Oct 25, 2025
    new Date(2025, 9, 26),
  ]

  // Time slots
  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const isUnavailable = (date: Date) => {
    return unavailableDates.some(
      (d) =>
        d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(),
    )
  }

  const isDateDisabled = (date: Date) => {
    return isWeekend(date) || isUnavailable(date) || date < new Date()
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    if (!isDateDisabled(date)) {
      setSelectedDate(date)
      setSelectedTime(null)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (selectedDate) {
      onDateTimeSelect(selectedDate, time)
    }
  }

  const days = []
  const firstDay = getFirstDayOfMonth(currentDate)
  const daysInMonth = getDaysInMonth(currentDate)

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">{monthName}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth} className="p-2 h-auto bg-transparent">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth} className="p-2 h-auto bg-transparent">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const disabled = isDateDisabled(date)
            const isSelected =
              selectedDate?.getDate() === day &&
              selectedDate?.getMonth() === currentDate.getMonth() &&
              selectedDate?.getFullYear() === currentDate.getFullYear()

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={disabled}
                className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                  disabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isSelected
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-gray-50 text-black hover:bg-yellow-100 border border-gray-200"
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="space-y-3 pt-4 border-t border-gray-200 animate-slide-in-up">
          <h3 className="text-lg font-semibold text-black">Select Time</h3>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                  selectedTime === time
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-gray-50 text-black border border-gray-200 hover:border-red-600 hover:bg-red-50"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300" />
          <span className="text-gray-600">Weekends & Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded border border-yellow-300" />
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded" />
          <span className="text-gray-600">Selected</span>
        </div>
      </div>
    </div>
  )
}
