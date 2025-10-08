
"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ChevronDown, Mail, Code, Shield } from "lucide-react"
import { useRef } from "react"

export function Banner() {
  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      ref={targetRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 2 }}
        >
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]"></div>
        </motion.div>

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-gradient-to-r from-gold-500/20 to-red-500/20 blur-3xl"
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
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-gradient-to-l from-red-500/10 to-gold-500/10 blur-3xl"
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

      <div className="container mx-auto px-4 relative z-10 py-16 md:py-0">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 md:mb-6"
          >
            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-red-500/10 to-red-500/20 border border-yellow-700 rounded-full text-sm font-medium text-gold-400">
              The Complete Developer Email Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 font-heading leading-tight max-w-5xl"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-300">
              Build, Send & Verify
            </span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500/20 via-red-500 to-red-500 ">
              Email Solutions
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base md:text-xl text-neutral-300 mb-8 md:mb-10 max-w-3xl leading-relaxed"
          >
            Powerful APIs for newsletters, OTP verification, and blog content delivery. No SMTP setup required - we
            handle everything so you can focus on building amazing experiences.
          </motion.p>

          {/* Core Features highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mb-8 md:mb-10"
          >
            <div className="flex items-center gap-2 text-neutral-300 bg-neutral-900/50 px-4 py-2 rounded-full border border-neutral-800">
              <Mail className="h-5 w-5 text-gold-400" />
              <span className="text-sm">Newsletter API</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300 bg-neutral-900/50 px-4 py-2 rounded-full border border-neutral-800">
              <Shield className="h-5 w-5 text-red-400" />
              <span className="text-sm">OTP Verification</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300 bg-neutral-900/50 px-4 py-2 rounded-full border border-neutral-800">
              <Code className="h-5 w-5 text-gold-400" />
              <span className="text-sm">Blog Content API</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-6 md:mb-8 w-full max-w-md"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="border-neutral-700 bg-neutral-900/60 focus:border-gold-400 h-12 text-base text-white placeholder:text-neutral-500"
            />
            <Button className="bg-gradient-to-r from-red-500/10 to-red-500 text-black hover:from-gold-400 hover:to-red-400 w-full sm:w-auto h-12 text-base font-medium px-6">
              Start Building <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-neutral-400 text-sm"
          >
            Free tier available • No credit card required • 10,000 emails/month
          </motion.p>
        </div>

        {/* API Code Preview */}
        <motion.div style={{ y, opacity }} className="relative mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gold-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-neutral-400 text-sm ml-2">Xypher API</span>
            </div>
            <div className="text-left">
              <div className="text-neutral-500 text-sm mb-2">// Send newsletter with OTP verification</div>
              <div className="text-gold-400">const</div>
              <div className="text-white inline"> response = </div>
              <div className="text-blue-400 inline">await</div>
              <div className="text-white"> fetch(</div>
              <div className="text-green-400">'https://api.xypher.com/v1/send'</div>
              <div className="text-white">, {`{`}</div>
              <div className="ml-4 text-neutral-300">
                method: <span className="text-green-400">'POST'</span>,
              </div>
              <div className="ml-4 text-neutral-300">
                headers: {`{`} <span className="text-green-400">'Authorization'</span>:{" "}
                <span className="text-green-400">'Bearer YOUR_API_KEY'</span> {`}`},
              </div>
              <div className="ml-4 text-neutral-300">body: JSON.stringify({`{`}</div>
              <div className="ml-8 text-neutral-300">
                email: <span className="text-green-400">'user@example.com'</span>,
              </div>
              <div className="ml-8 text-neutral-300">
                template: <span className="text-green-400">'newsletter'</span>,
              </div>
              <div className="ml-8 text-neutral-300">
                sendOTP: <span className="text-blue-400">true</span>
              </div>
              <div className="ml-4 text-neutral-300">{`})`}</div>
              <div className="text-white">{`});`}</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
          <span className="text-neutral-400 text-sm mb-2">Explore APIs</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
            <ChevronDown className="h-6 w-6 text-neutral-400" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
