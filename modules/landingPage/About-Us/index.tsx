// import Header from "@/lib/utils/widgets/header";
// import { AboutHero } from "./component/hero";
// import { AboutMission } from "./component/mission";
// import { AboutTimeline } from "./component/timeline";
// import { Footer } from "@/lib/utils/widgets/footer/footer";
// import { AboutContact } from "./component/contact";
// import { AboutTeam } from "./component/team";


// export default function AboutPage() {
//   return (
//     <div className="min-h-screen bg-white text-neutral-800">
//       <Header />
//       <AboutHero />
//       <AboutMission />
//       {/* <AboutParent /> */}
//       <AboutTimeline />
//       <AboutTeam />
//       <AboutContact />
//       <Footer />
//     </div>
//   )
// }



"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, Zap, Globe, Heart } from "lucide-react"
import Header from "../Home/component/header"
import Footer from "@/lib/utils/widgets/footer/footer"

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const values = [
    {
      icon: Zap,
      title: "Developer First",
      description:
        "We build powerful APIs that eliminate SMTP setup complexity. Simple integration, comprehensive documentation, and SDKs for every language.",
    },
    {
      icon: Users,
      title: "Creator Empowered",
      description:
        "Content creators deserve integrated tools. Send newsletters, manage blogs, and engage audiences—all through one unified platform.",
    },
    {
      icon: Globe,
      title: "API-First Architecture",
      description:
        "Everything is an API. Integrate DropAphi into your website, app, or platform. No vendor lock-in, full control.",
    },
    {
      icon: Heart,
      title: "Community Driven",
      description:
        "We listen to developers and creators. Your feedback shapes our roadmap. Your success is our success.",
    },
  ]

  const team = [
    {
      name: "Founder & CEO",
      role: "Vision & Strategy",
      description: "Leading DropAphi's mission to unify communication for developers and creators.",
    },
    {
      name: "CTO",
      role: "Technology & Architecture",
      description: "Building scalable, reliable infrastructure that powers millions of communications.",
    },
    {
      name: "Head of Product",
      role: "Product & Design",
      description: "Crafting intuitive experiences that developers and creators love to use.",
    },
    {
      name: "Head of Developer Relations",
      role: "Community & Support",
      description: "Ensuring developers have everything they need to succeed with our APIs.",
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-bold text-black mb-6">
            About <span className="text-yellow-600">DropAphi</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The API-first communication platform that eliminates SMTP complexity for developers and empowers creators.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-black mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                DropAphi exists to eliminate the complexity of email communication infrastructure. We handle all the
                SMTP setup, security, and delivery so developers can focus on building amazing products.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We provide unified APIs for OTP delivery, newsletters, blog management, and notifications—all without
                requiring developers to configure SMTP for each platform. Content creators get intuitive tools to reach
                their audience, while developers get powerful APIs to integrate into their applications.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our vision: a world where sending emails, OTPs, and managing content is as simple as making an API call.
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-600 to-red-600 rounded-2xl h-96 animate-fade-in" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon
              return (
                <div
                  key={idx}
                  className="p-8 border-2 border-gray-200 rounded-xl hover:border-yellow-600 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <Icon className="w-12 h-12 text-yellow-600 mb-4" />
                  <h3 className="text-xl font-bold text-black mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Our Story</h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              DropAphi was born from a frustration we experienced firsthand: every time developers needed to send
              emails—whether for OTP verification, newsletters, or notifications—they had to set up SMTP configuration
              for each platform. It was repetitive, error-prone, and took away from building core features.
            </p>
            <p>
              We realized that developers shouldn't have to become email infrastructure experts. So we decided to build
              DropAphi: an API-first platform that handles all the complexity. We manage SMTP setup, deliverability,
              security, and scaling. Developers just make API calls.
            </p>
            <p>
              Today, DropAphi provides three core services: OTP delivery via email (SMS and WhatsApp coming soon), a
              newsletter platform with APIs for 3rd party integration, and a blog platform that creators can embed on
              their own websites. Everything is API-first, so whether you're a developer integrating into your app or a
              creator managing your audience, you have full control.
            </p>
            <p>
              We're a startup on a mission to simplify communication infrastructure. Our roadmap includes push
              notifications, SMS, WhatsApp, and more communication channels—all with the same philosophy: powerful APIs,
              zero complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black mb-12">Our Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="p-8 bg-gray-50 rounded-xl border border-gray-200 hover:border-yellow-600 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-red-600 rounded-full mb-4" />
                <h3 className="text-xl font-bold text-black mb-1">{member.name}</h3>
                <p className="text-yellow-600 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-black mb-6">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of developers and creators using DropAphi to power their communication without SMTP
            complexity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              View Pricing
            </Link>
            <Link
              href="/docs"
              className="px-8 py-3 border-2 border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition-colors"
            >
              Read Docs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
