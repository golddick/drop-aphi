

"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "Do I need to set up SMTP servers?",
      answer:
        "No! That's the beauty of Xypher. We handle all the email infrastructure, SMTP configuration, IP reputation management, and deliverability optimization. You just make API calls and we handle the rest.",
    },
    {
      question: "How reliable is the email delivery?",
      answer:
        "We guarantee 99.9% uptime with our global infrastructure. Our emails are delivered through multiple redundant pathways with real-time monitoring and automatic failover to ensure maximum deliverability.",
    },
    {
      question: "Can I customize the email templates?",
      answer:
        "You can use our drag-and-drop builder, create custom HTML templates, or use our template API to dynamically generate emails. All templates are mobile-responsive and tested across major email clients.",
    },
    {
      question: "How secure is the OTP verification?",
      answer:
        "Our OTP system uses industry-standard security practices including rate limiting, encryption in transit and at rest, and configurable expiry times. We're SOC 2 compliant and follow GDPR guidelines.",
    },
    {
      question: "What's included in the free tier?",
      answer:
        "The free tier includes 10,000 emails per month, 1,000 OTP verifications, basic blog templates, email support, and access to all core APIs. Perfect for getting started and small projects.",
    },
    {
      question: "How does the Blog Content API work?",
      answer:
        "Our Blog API acts as a headless CMS. You create content through our dashboard, choose from our templates, and fetch the content via API to display on any website or application with your preferred styling.",
    },
    {
      question: "Can I track email analytics?",
      answer:
        "Yes! We provide comprehensive analytics including open rates, click-through rates, bounce rates, and delivery statistics. All data is available in real-time through our dashboard and analytics API.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We offer email support for all plans, priority support for Professional plans, and 24/7 phone support for Enterprise customers. We also have comprehensive documentation and code examples.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply sign up for a free account, get your API key, and start making API calls. We have SDKs for popular programming languages and comprehensive documentation to get you up and running in minutes.",
    },
    {
      question: "Can I use Xypher for transactional emails?",
      answer:
        "Yes! Xypher is perfect for transactional emails like welcome messages, password resets, order confirmations, and notifications. Our high deliverability rates ensure your important emails reach users' inboxes.",
    },
  ]

  return (
    <section className="py-20 bg-neutral-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Frequently Asked</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-red-400">Questions</span>
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Everything you need to know about Xypher's email infrastructure
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-black border border-neutral-800 rounded-lg px-6 hover:border-gold-500/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-white hover:text-gold-400 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-300 leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-neutral-400 mb-4">Still have questions? We're here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@xypher.com" className="text-gold-400 hover:text-gold-300 transition-colors">
              support@xypher.com
            </a>
            <span className="hidden sm:block text-neutral-600">|</span>
            <a href="/docs" className="text-gold-400 hover:text-gold-300 transition-colors">
              View Documentation
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
