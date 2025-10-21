"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Moon, Sun } from "lucide-react"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const navSections = [
    {
      title: "Getting Started",
      items: [
        { label: "Introduction", href: "/docs" },
        { label: "Quick Start", href: "/docs/quick-start" },
        { label: "Authentication", href: "/docs/authentication" },
      ],
    },
    {
      title: "API Reference",
      items: [
        { label: "Newsletter API", href: "/docs/api/newsletter" },
        { label: "OTP API", href: "/docs/api/otp" },
        { label: "Blog API", href: "/docs/api/blog" },
        { label: "Webhooks", href: "/docs/webhooks" },
      ],
    },
    {
      title: "SDKs & Tools",
      items: [
        { label: "JavaScript SDK", href: "/docs/sdk/javascript" },
        { label: "Python SDK", href: "/docs/sdk/python" },
        { label: "Code Playground", href: "/docs/playground" },
        { label: "Postman Collection", href: "/docs/postman" },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "API Status", href: "/docs/status" },
        { label: "Rate Limits", href: "/docs/rate-limits" },
        { label: "Error Codes", href: "/docs/errors" },
        { label: "Changelog", href: "/docs/changelog" },
      ],
    },
  ]

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-gold to-red rounded-lg" />
                DropAphi Docs
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search docs..."
                className="hidden md:block px-4 py-2 rounded-lg bg-secondary border border-border text-sm"
              />
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-secondary rounded-lg transition">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "w-40" : "w-0"
            } border-r border-border bg-sidebar transition-all duration-300 overflow-hidden lg:w-64`}
          >
            <nav className="p-6 space-y-8">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="text-sm hover:text-accent transition">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto p-6 lg:p-12">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
