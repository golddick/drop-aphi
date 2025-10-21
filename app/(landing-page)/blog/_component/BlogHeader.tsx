"use client"

import { motion } from "framer-motion"

export function BlogHeader() {
  return (
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-bold text-black mb-6">
            Blog <span className="text-yellow-600">DropAphi</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Insights, tutorials, and updates from the DropAphi team.
          </p>
        </div>
      </section>
  )
}
