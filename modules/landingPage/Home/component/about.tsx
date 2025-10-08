
"use client"

import { motion } from "framer-motion"
import { Code, Shield, Mail, Users, Globe, Zap } from "lucide-react"

export function About() {
  return (
    <section id="about" className="py-20 bg-neutral-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Powering the Future of</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-red-400">
              Email Infrastructure
            </span>
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Xypher provides enterprise-grade email APIs that eliminate the complexity of email infrastructure. Focus on
            building great products while we handle deliverability, security, and scale.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Built for Developers, Trusted by Enterprises
            </h3>
            <p className="text-neutral-300 mb-6 leading-relaxed">
              From startups to Fortune 500 companies, developers choose Xypher for its reliability, simplicity, and
              powerful features. Our APIs are designed with developer experience in mind, offering comprehensive
              documentation, SDKs, and 24/7 support.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-black/50 rounded-lg border border-neutral-800">
                <div className="text-2xl font-bold text-gold-400">99.9%</div>
                <div className="text-sm text-neutral-400">Uptime SLA</div>
              </div>
              <div className="text-center p-4 bg-black/50 rounded-lg border border-neutral-800">
                <div className="text-2xl font-bold text-gold-400">10B+</div>
                <div className="text-sm text-neutral-400">Emails Delivered</div>
              </div>
              <div className="text-center p-4 bg-black/50 rounded-lg border border-neutral-800">
                <div className="text-2xl font-bold text-gold-400">150+</div>
                <div className="text-sm text-neutral-400">Countries</div>
              </div>
              <div className="text-center p-4 bg-black/50 rounded-lg border border-neutral-800">
                <div className="text-2xl font-bold text-gold-400">24/7</div>
                <div className="text-sm text-neutral-400">Support</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-gold-500/10 to-red-500/10 border border-gold-500/20 rounded-xl">
                <Mail className="h-8 w-8 text-gold-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Newsletter API</h4>
                <p className="text-sm text-neutral-300">Beautiful email templates with drag-and-drop builder</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-red-500/10 to-gold-500/10 border border-red-500/20 rounded-xl">
                <Shield className="h-8 w-8 text-red-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">OTP Verification</h4>
                <p className="text-sm text-neutral-300">Secure authentication with instant delivery</p>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="p-6 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-xl">
                <Code className="h-8 w-8 text-gold-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Blog Content API</h4>
                <p className="text-sm text-neutral-300">Headless CMS with customizable templates</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-xl">
                <Zap className="h-8 w-8 text-gold-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Lightning Fast</h4>
                <p className="text-sm text-neutral-300">Global CDN with sub-second response times</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">Why Developers Choose Xypher</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-black/50 border border-neutral-800 rounded-xl">
              <Users className="h-12 w-12 text-gold-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">No Infrastructure Hassle</h4>
              <p className="text-neutral-300">
                Skip the complexity of setting up SMTP servers, managing IP reputation, and handling bounce management.
                We've got it all covered.
              </p>
            </div>
            <div className="p-6 bg-black/50 border border-neutral-800 rounded-xl">
              <Globe className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">Global Reach</h4>
              <p className="text-neutral-300">
                Deliver emails worldwide with our global infrastructure. Optimized routing ensures the fastest delivery
                times everywhere.
              </p>
            </div>
            <div className="p-6 bg-black/50 border border-neutral-800 rounded-xl">
              <Shield className="h-12 w-12 text-gold-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">Enterprise Security</h4>
              <p className="text-neutral-300">
                SOC 2 compliant with end-to-end encryption. Your data and your users' data are always protected.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
