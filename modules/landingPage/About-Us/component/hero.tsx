"use client"

import { motion } from "framer-motion"

export function AboutHero() {
  return (
    <section className="relative py-20 md:py-28 bg-black text-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]"></div>
        </div>

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        ></motion.div>

        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-red-500/5 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        ></motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-gold-500/20 to-red-500/20 border border-gold-500/30 rounded-full text-sm font-medium text-gold-400">
              About Xypher
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 font-heading leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-300">
              Powering Modern Communication
            </span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-300 to-red-500">
              Through APIs
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed"
          >
            We're building the future of digital communication with three powerful APIs: Newsletter management, OTP
            verification, and Blog content systems. Trusted by over 50,000 developers worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-12 text-sm"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-400">10M+</div>
              <div className="text-neutral-400">Emails Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">50K+</div>
              <div className="text-neutral-400">Developers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-400">99.9%</div>
              <div className="text-neutral-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">150+</div>
              <div className="text-neutral-400">Countries</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
