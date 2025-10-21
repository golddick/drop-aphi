"use client"

import { useEffect, useState } from "react"
import { Code2, Mail, BookOpen } from "lucide-react"

export default function Hero() {
  const [displayText, setDisplayText] = useState("")
  const fullText = "Build, Write, and Connect with Code"

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
            {displayText}
            <span className="text-yellow-600">.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The unified communication platform that serves developers and content creators. APIs for developers,
            intuitive tools for creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all hover:shadow-lg">
              Start Building
            </button>
            <button className="px-8 py-3 border-2 border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition-all">
              View Docs
            </button>
          </div>
        </div>

        {/* Floating Icons */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20">
          <div className="flex flex-col items-center gap-4 animate-float" style={{ animationDelay: "0s" }}>
            <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center animate-float">
              <Mail className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm font-semibold text-black">Newsletter</p>
          </div>
          <div className="flex flex-col items-center gap-4 animate-float" style={{ animationDelay: "0.2s" }}>
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center animate-float">
              <Code2 className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm font-semibold text-black">APIs</p>
          </div>
          <div className="flex flex-col items-center gap-4 animate-float" style={{ animationDelay: "0.4s" }}>
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center animate-float">
              <BookOpen className="w-8 h-8 text-black" />
            </div>
            <p className="text-sm font-semibold text-black">Blog</p>
          </div>
        </div>
      </div>
    </section>
  )
}
