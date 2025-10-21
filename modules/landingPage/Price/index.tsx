"use client"

import { useState } from "react"
import { Check, ArrowRight } from "lucide-react"
import Header from "../Home/component/header"
import Footer from "@/lib/utils/widgets/footer/footer"


interface Plan {
  id: string
  name: string
  price: { monthly: number; yearly: number }
  features: string[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    features: [
      "Up to 500 subscribers",
      "Send up to 20 mails",
      "Post up to 10 Blog content",
      "Use AI to generate content",
      "Dev key free for first time user for 1 month",
      "Custom subscription page",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "LAUNCH",
    name: "LAUNCH",
    price: { monthly: 4999, yearly: 49990 },
    features: [
      "Everything in FREE plus:",
      "Up to 5,000 subscribers",
      "Send up to 50 emails",
      "50 blog posts",
      "AI-powered content generation",
      "Custom subscription page",
      "Dev API access",
      "Priority email support",
    ],
    popular: true,
  },
  {
    id: "SCALE",
    name: "SCALE",
    price: { monthly: 9999, yearly: 99990 },
    features: [
      "Everything in LAUNCH plus:",
      "Up to 10,000 subscribers",
      "Send unlimited emails",
      "200 blog posts",
      "AI-powered content generation",
      "Custom subscription page",
      "Advanced analytics",
      "Priority support",
      "Extended Dev API access",
    ],
  },
]

export default function PricingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  return (
    <main className="min-h-screen bg-white">
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-6">
            Simple, Transparent <span className="text-yellow-600">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your communication needs. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === "monthly" ? "bg-black text-white" : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === "yearly" ? "bg-black text-white" : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded">Save 17%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl transition-all duration-300 hover:shadow-2xl ${
                  plan.popular
                    ? "md:scale-105 bg-gradient-to-br from-black to-gray-900 text-white border-2 border-yellow-600 shadow-xl"
                    : "bg-white border-2 border-gray-200 text-black"
                } animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-600 text-black px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">₦{(plan.price[billingPeriod] / 100).toLocaleString()}</span>
                    <span className={`ml-2 ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>
                      /{billingPeriod === "monthly" ? "month" : "year"}
                    </span>
                  </div>

                  <button
                    className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${
                      plan.popular
                        ? "bg-yellow-600 text-black hover:bg-yellow-500"
                        : "bg-black text-white hover:bg-gray-900"
                    }`}
                  >
                    Get Started
                    <ArrowRight className="inline ml-2" size={18} />
                  </button>

                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check
                          size={20}
                          className={`flex-shrink-0 mt-1 ${plan.popular ? "text-yellow-400" : "text-yellow-600"}`}
                        />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change my plan anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major payment methods including credit cards, debit cards, and bank transfers via Paystack.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! The Free plan includes a 1-month free developer API key for first-time users to test our APIs.",
              },
              {
                q: "What happens when I exceed my limits?",
                a: "We'll notify you when you're approaching your limits. You can upgrade your plan or contact support for custom limits.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-bold text-black mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
