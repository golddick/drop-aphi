"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

interface FAQItemProps {
  question: string
  answer: string
  delay: number
}

function FAQItem({ question, answer, delay }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`border-2 border-gray-200 rounded-lg overflow-hidden transition-all duration-300 ${
        isOpen ? "border-yellow-600 bg-yellow-50" : "bg-white"
      } ${isVisible ? "animate-slide-in-up" : "opacity-0"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-black text-left">{question}</h3>
        <ChevronDown
          className={`w-5 h-5 text-yellow-600 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t-2 border-gray-200">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const faqs = [
    {
      question: "What is DropAphi?",
      answer:
        "DropAphi is a unified communication platform designed for both developers and content creators. It provides powerful APIs for newsletters, OTP authentication, and blog content management, along with an intuitive UI for non-technical users.",
    },
    {
      question: "How do I get started with the APIs?",
      answer:
        "Getting started is simple! Sign up for a free account, generate your API keys from the dashboard, and refer to our comprehensive documentation. We provide SDKs for popular languages and code examples for quick integration.",
    },
    {
      question: "What are the pricing plans?",
      answer:
        "We offer flexible pricing based on your usage. Start with our free tier for up to 1,000 emails per month, then upgrade to Pro or Enterprise plans as you scale. All plans include access to our full API suite.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, security is our top priority. We're SOC 2 compliant, use end-to-end encryption, and follow GDPR regulations. All data is encrypted in transit and at rest, with regular security audits.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "We provide 24/7 email support for all users, with priority support for Pro and Enterprise customers. We also have an active community forum and comprehensive documentation.",
    },
    {
      question: "Can I integrate DropAphi with my existing tools?",
      answer:
        "Yes! DropAphi integrates with popular platforms like Zapier, Make, and many others. We also provide webhooks and REST APIs for custom integrations with any system.",
    },
  ]

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Find answers to common questions about DropAphi</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} delay={idx * 50} />
          ))}
        </div>
      </div>
    </section>
  )
}
