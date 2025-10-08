"use client"

import { motion } from "framer-motion"
import { Mail, Shield, FileText, BarChart3, Bell, Zap } from "lucide-react"

export function FeaturesHero() {
  return (
    <section className="relative py-20 md:py-28 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]"></div>
        </div>

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
              Platform Features
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 font-heading leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-300">
              Everything You Need for
            </span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-300 to-red-500">
              Modern Communication
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            From drag-and-drop email builders to advanced analytics and notification systems, discover all the features
            that make Xypher the complete communication platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {[
              { icon: Mail, label: "Email Builder", color: "text-blue-400" },
              { icon: Shield, label: "Verification", color: "text-green-400" },
              { icon: BarChart3, label: "Analytics", color: "text-purple-400" },
              { icon: FileText, label: "Blog System", color: "text-orange-400" },
              { icon: Bell, label: "Notifications", color: "text-red-400" },
              { icon: Zap, label: "Automation", color: "text-gold-400" },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-3 hover:border-gold-500/30 transition-all">
                  <feature.icon className={`h-8 w-8 mx-auto ${feature.color}`} />
                </div>
                <span className="text-sm text-neutral-400">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
