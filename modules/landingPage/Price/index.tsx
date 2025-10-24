"use client"

import { useState } from "react"
import { Check, ArrowRight, Loader2Icon } from "lucide-react"
import Header from "../Home/component/header"
import Footer from "@/lib/utils/widgets/footer/footer"
import { availablePlans } from "@/lib/planLimit"
import { paystackSubscribe } from "@/actions/paystack/paystack.subscribe"
import { useAuthUser } from "@/lib/auth/getClientAuth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Loader from "@/components/_component/Loader"

export default function PricingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { user } = useAuthUser()
  const router = useRouter()

  // Calculate savings for yearly plans
  const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12
    const savings = monthlyTotal - yearlyPrice
    const percentage = ((savings / monthlyTotal) * 100).toFixed(0)
    return { savings, percentage }
  }

  const handlePlanSelection = async (planId: string, planName: string) => {
    if (!user) {
      toast.error("Please sign in to select a plan")
      router.push("/auth/signin")
      return
    }

    // Handle FREE plan selection
    if (planId === "FREE") {
      // You might want to implement a function to set user to free plan
      toast.success("You're now on the Free plan!")
      return
    }

    setIsLoading(planId)

    try {
      const result = await paystackSubscribe({
        planName: planName as "LAUNCH" | "SCALE",
        userId: user.userId,
        billingCycle: billingPeriod,
        redirectPath: "/dashboard/settings?tab=subscription"
      })

      // Handle KYC required case
      if (result.kycRequired) {
        toast.error("KYC verification is required before upgrading.")
        router.push("/dashboard/settings?tab=KYC")
        return
      }

      // Handle payment initiation
      if (result.success && result.url) {
        toast.success("Redirecting to payment...")
        window.location.href = result.url
      } else {
        toast.error(result.error || "Failed to initiate payment")
      }

    } catch (error: any) {
      console.error("Payment error:", error)
      toast.error(error.message || "Payment failed. Please try again.")
    } finally {
      setIsLoading(null)
    }
  }

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
              <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                Save up to 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {availablePlans.map((plan, index) => {
              const currentPrice = plan.price[billingPeriod]
              const monthlyEquivalent = billingPeriod === "yearly" ? Math.round(currentPrice / 12) : currentPrice
              const yearlySavings = billingPeriod === "yearly" && plan.id !== "FREE" 
                ? calculateSavings(plan.price.monthly, plan.price.yearly) 
                : null

              return (
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
                    
                    {/* Pricing Display */}
                    <div className="mb-4">
                      <span className="text-4xl font-bold">₦{currentPrice.toLocaleString()}</span>
                      <span className={`ml-2 ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>
                        /{billingPeriod === "monthly" ? "month" : "year"}
                      </span>
                    </div>

                    {/* Equivalent Monthly Price for Yearly */}
                    {billingPeriod === "yearly" && plan.id !== "FREE" && (
                      <div className="mb-4">
                        <p className="text-sm text-green-500">
                          Equivalent to ₦{monthlyEquivalent.toLocaleString()}/month
                        </p>
                        {yearlySavings && yearlySavings.percentage !== "0" && (
                          <p className="text-sm text-yellow-500 font-semibold">
                            Save ₦{yearlySavings.savings.toLocaleString()} ({yearlySavings.percentage}%)
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handlePlanSelection(plan.id, plan.name)}
                      disabled={isLoading === plan.id}
                      className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all flex items-center justify-center ${
                        plan.popular
                          ? "bg-yellow-600 text-black hover:bg-yellow-500 disabled:bg-yellow-400"
                          : plan.id === "FREE"
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-300"
                          : "bg-black text-white hover:bg-gray-900 disabled:bg-gray-600"
                      }`}
                    >
                      {isLoading === plan.id ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.id === "FREE" ? "Get Started Free" : "Get Started"}
                          <ArrowRight className="inline ml-2" size={18} />
                        </>
                      )}
                    </button>

                    <div className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check
                            size={20}
                            className={`flex-shrink-0 mt-1 ${
                              plan.popular ? "text-yellow-400" : "text-yellow-600"
                            }`}
                          />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Secure Payment Processing</h3>
          <p className="text-gray-300 mb-6">
            All payments are securely processed through Paystack. We accept:
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
            <span>💳 Credit Cards</span>
            <span>💳 Debit Cards</span>
            <span>🏦 Bank Transfers</span>
            <span>📱 USSD</span>
            <span>📊 Bank Account</span>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Plan Comparison</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-6 font-semibold text-gray-900">Features</th>
                  {availablePlans.map((plan) => (
                    <th key={plan.id} className="p-6 text-center font-semibold text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-6 font-medium">Subscribers</td>
                  <td className="p-6 text-center">500</td>
                  <td className="p-6 text-center">5,000</td>
                  <td className="p-6 text-center">50,000</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-6 font-medium">Emails/Month</td>
                  <td className="p-6 text-center">20</td>
                  <td className="p-6 text-center">100</td>
                  <td className="p-6 text-center">1,000</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-6 font-medium">Blog Posts</td>
                  <td className="p-6 text-center">10</td>
                  <td className="p-6 text-center">50</td>
                  <td className="p-6 text-center">500</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-6 font-medium">AI Generations</td>
                  <td className="p-6 text-center">5</td>
                  <td className="p-6 text-center">100</td>
                  <td className="p-6 text-center">1,000</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-6 font-medium">API Access</td>
                  <td className="p-6 text-center">1 month trial</td>
                  <td className="p-6 text-center">
                    <Check className="inline h-5 w-5 text-green-500" />
                  </td>
                  <td className="p-6 text-center">
                    <Check className="inline h-5 w-5 text-green-500" />
                  </td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Support</td>
                  <td className="p-6 text-center">Email</td>
                  <td className="p-6 text-center">Priority Email</td>
                  <td className="p-6 text-center">Priority + Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
                a: "We accept all major payment methods including credit cards, debit cards, bank transfers, USSD, and more via Paystack.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! The Free plan includes a 1-month free developer API key for first-time users to test our APIs.",
              },
              {
                q: "What happens when I exceed my limits?",
                a: "We'll notify you when you're approaching your limits. You can upgrade your plan or contact support for custom limits.",
              },
              {
                q: "Do you offer discounts for yearly plans?",
                a: "Yes! Our yearly plans offer significant savings compared to monthly billing. Save up to 17% with annual commitment.",
              },
              {
                q: "Is my payment information secure?",
                a: "Yes! All payments are processed securely through Paystack, a PCI DSS compliant payment processor. We never store your payment details.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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


// "use client"

// import { useState } from "react"
// import { Check, ArrowRight } from "lucide-react"
// import Header from "../Home/component/header"
// import Footer from "@/lib/utils/widgets/footer/footer"
// import { availablePlans } from "@/lib/planLimit"


// export default function PricingPage() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//   const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

//   // Calculate savings for yearly plans
//   const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
//     const monthlyTotal = monthlyPrice * 12
//     const savings = monthlyTotal - yearlyPrice
//     const percentage = ((savings / monthlyTotal) * 100).toFixed(0)
//     return { savings, percentage }
//   }

//   return (
//     <main className="min-h-screen bg-white">
//       <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

//       {/* Hero Section */}
//       <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-4xl mx-auto text-center animate-fade-in">
//           <h1 className="text-4xl sm:text-5xl font-bold text-black mb-6">
//             Simple, Transparent <span className="text-yellow-600">Pricing</span>
//           </h1>
//           <p className="text-xl text-gray-600 mb-8">
//             Choose the perfect plan for your communication needs. Scale as you grow.
//           </p>

//           {/* Billing Toggle */}
//           <div className="flex items-center justify-center gap-4 mb-12">
//             <button
//               onClick={() => setBillingPeriod("monthly")}
//               className={`px-6 py-2 rounded-lg font-semibold transition-all ${
//                 billingPeriod === "monthly" ? "bg-black text-white" : "bg-gray-100 text-black hover:bg-gray-200"
//               }`}
//             >
//               Monthly
//             </button>
//             <button
//               onClick={() => setBillingPeriod("yearly")}
//               className={`px-6 py-2 rounded-lg font-semibold transition-all ${
//                 billingPeriod === "yearly" ? "bg-black text-white" : "bg-gray-100 text-black hover:bg-gray-200"
//               }`}
//             >
//               Yearly
//               <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded">
//                 Save up to 17%
//               </span>
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Pricing Cards */}
//       <section className="pb-20 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-3 gap-8">
//             {availablePlans.map((plan, index) => {
//               const currentPrice = plan.price[billingPeriod]
//               const monthlyEquivalent = billingPeriod === "yearly" ? Math.round(currentPrice / 12) : currentPrice
//               const yearlySavings = billingPeriod === "yearly" ? calculateSavings(plan.price.monthly, plan.price.yearly) : null

//               return (
//                 <div
//                   key={plan.id}
//                   className={`relative rounded-2xl transition-all duration-300 hover:shadow-2xl ${
//                     plan.popular
//                       ? "md:scale-105 bg-gradient-to-br from-black to-gray-900 text-white border-2 border-yellow-600 shadow-xl"
//                       : "bg-white border-2 border-gray-200 text-black"
//                   } animate-fade-in`}
//                   style={{ animationDelay: `${index * 100}ms` }}
//                 >
//                   {plan.popular && (
//                     <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                       <span className="bg-yellow-600 text-black px-4 py-1 rounded-full text-sm font-bold">
//                         Most Popular
//                       </span>
//                     </div>
//                   )}

//                   <div className="p-8">
//                     <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    
//                     {/* Pricing Display */}
//                     <div className="mb-4">
//                       <span className="text-4xl font-bold">₦{currentPrice.toLocaleString()}</span>
//                       <span className={`ml-2 ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>
//                         /{billingPeriod === "monthly" ? "month" : "year"}
//                       </span>
//                     </div>

//                     {/* Equivalent Monthly Price for Yearly */}
//                     {billingPeriod === "yearly" && plan.id !== "FREE" && (
//                       <div className="mb-4">
//                         <p className="text-sm text-green-500">
//                           Equivalent to ₦{monthlyEquivalent.toLocaleString()}/month
//                         </p>
//                         {yearlySavings && yearlySavings.percentage !== "0" && (
//                           <p className="text-sm text-yellow-500 font-semibold">
//                             Save ₦{yearlySavings.savings.toLocaleString()} ({yearlySavings.percentage}%)
//                           </p>
//                         )}
//                       </div>
//                     )}

//                     <button
//                       className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${
//                         plan.popular
//                           ? "bg-yellow-600 text-black hover:bg-yellow-500"
//                           : plan.id === "FREE"
//                           ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
//                           : "bg-black text-white hover:bg-gray-900"
//                       }`}
//                     >
//                       {plan.id === "FREE" ? "Get Started Free" : "Get Started"}
//                       <ArrowRight className="inline ml-2" size={18} />
//                     </button>

//                     <div className="space-y-4">
//                       {plan.features.map((feature, idx) => (
//                         <div key={idx} className="flex items-start gap-3">
//                           <Check
//                             size={20}
//                             className={`flex-shrink-0 mt-1 ${
//                               plan.popular ? "text-yellow-400" : "text-yellow-600"
//                             }`}
//                           />
//                           <span className="text-sm">{feature}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Comparison Table */}
//       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-3xl font-bold text-center mb-12 text-black">Plan Comparison</h2>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="text-left p-6 font-semibold text-gray-900">Features</th>
//                   {availablePlans.map((plan) => (
//                     <th key={plan.id} className="p-6 text-center font-semibold text-gray-900">
//                       {plan.name}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr className="border-b border-gray-100">
//                   <td className="p-6 font-medium">Subscribers</td>
//                   <td className="p-6 text-center">500</td>
//                   <td className="p-6 text-center">5,000</td>
//                   <td className="p-6 text-center">50,000</td>
//                 </tr>
//                 <tr className="border-b border-gray-100">
//                   <td className="p-6 font-medium">Emails/Month</td>
//                   <td className="p-6 text-center">20</td>
//                   <td className="p-6 text-center">100</td>
//                   <td className="p-6 text-center">1,000</td>
//                 </tr>
//                 <tr className="border-b border-gray-100">
//                   <td className="p-6 font-medium">Blog Posts</td>
//                   <td className="p-6 text-center">10</td>
//                   <td className="p-6 text-center">50</td>
//                   <td className="p-6 text-center">500</td>
//                 </tr>
//                 <tr className="border-b border-gray-100">
//                   <td className="p-6 font-medium">AI Generations</td>
//                   <td className="p-6 text-center">5</td>
//                   <td className="p-6 text-center">100</td>
//                   <td className="p-6 text-center">1,000</td>
//                 </tr>
//                 <tr className="border-b border-gray-100">
//                   <td className="p-6 font-medium">API Access</td>
//                   <td className="p-6 text-center">1 month trial</td>
//                   <td className="p-6 text-center">
//                     <Check className="inline h-5 w-5 text-green-500" />
//                   </td>
//                   <td className="p-6 text-center">
//                     <Check className="inline h-5 w-5 text-green-500" />
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="p-6 font-medium">Support</td>
//                   <td className="p-6 text-center">Email</td>
//                   <td className="p-6 text-center">Priority Email</td>
//                   <td className="p-6 text-center">Priority + Dedicated</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </section>

//       {/* FAQ Section */}
//       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
//         <div className="max-w-3xl mx-auto">
//           <h2 className="text-3xl font-bold text-center mb-12 text-black">Frequently Asked Questions</h2>
//           <div className="space-y-6">
//             {[
//               {
//                 q: "Can I change my plan anytime?",
//                 a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
//               },
//               {
//                 q: "What payment methods do you accept?",
//                 a: "We accept all major payment methods including credit cards, debit cards, and bank transfers via Paystack.",
//               },
//               {
//                 q: "Is there a free trial?",
//                 a: "Yes! The Free plan includes a 1-month free developer API key for first-time users to test our APIs.",
//               },
//               {
//                 q: "What happens when I exceed my limits?",
//                 a: "We'll notify you when you're approaching your limits. You can upgrade your plan or contact support for custom limits.",
//               },
//               {
//                 q: "Do you offer discounts for yearly plans?",
//                 a: "Yes! Our yearly plans offer significant savings compared to monthly billing. Save up to 17% with annual commitment.",
//               },
//             ].map((item, idx) => (
//               <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
//                 <h3 className="font-bold text-black mb-2">{item.q}</h3>
//                 <p className="text-gray-600">{item.a}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </main>
//   )
// }