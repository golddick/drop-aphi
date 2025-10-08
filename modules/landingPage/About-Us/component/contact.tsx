"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AboutContact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch with our team",
      value: "hello@xypher.com",
      action: "mailto:hello@xypher.com",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      value: "Available 24/7",
      action: "#",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our sales team",
      value: "+1 (555) 123-4567",
      action: "tel:+15551234567",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Our headquarters",
      value: "San Francisco, CA",
      action: "#",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gold-50 to-red-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-gold-100 text-gold-700 rounded-full text-sm font-medium mb-4">
            Get in Touch
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 font-heading">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Whether you have questions about our APIs, need technical support, or want to discuss enterprise solutions,
            we're here to help.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((contact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 text-center hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-r from-gold-500 to-red-500 p-3 rounded-full inline-flex mb-4">
                <contact.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">{contact.title}</h3>
              <p className="text-sm text-neutral-600 mb-3">{contact.description}</p>
              <a href={contact.action} className="text-gold-600 font-semibold hover:text-gold-700 transition-colors">
                {contact.value}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-white p-8 rounded-xl shadow-lg border border-neutral-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Start Building Today</h3>
            <p className="text-neutral-600 mb-6">
              Join thousands of developers who trust Xypher for their communication needs. Get started with our free
              tier and scale as you grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-gold-500 to-red-500 text-white hover:from-gold-600 hover:to-red-600">
                Get Started Free
              </Button>
              <Button variant="outline" className="border-gold-300 text-gold-600 hover:bg-gold-50 bg-transparent">
                View Documentation
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
