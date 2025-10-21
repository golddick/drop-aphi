"use client"

import Link from "next/link"
import { Mail, Github, Twitter, Linkedin } from "lucide-react"
import NewsletterSignup from "./newsletter-signup"
import Logo from "../header/logo"

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <NewsletterSignup />
        </div>
      </div>

      {/* Main Footer */}
      <div className="px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                   <Logo />
              </div>
              <p className="text-gray-400 text-sm">
                Unified communication platform for developers and content creators.
              </p>
            </div>

          <div className=" grid grid-cols-3 md:grid-cols-3 gap-4" >
              <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>
                  <Link href="#features" className="hover:text-yellow-600 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-yellow-600 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-yellow-600 transition-colors">
                    Documentation
                  </Link>
                </li>
                {/* <li>
                  <Link href="/api-reference" className="hover:text-yellow-600 transition-colors">
                    API Reference
                  </Link>
                </li> */}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>
                  <Link href="/about-us" className="hover:text-yellow-600 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-yellow-600 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-yellow-600 transition-colors">
                    Careers
                  </Link>
                </li>
                {/* <li>
                  <Link href="/contact" className="hover:text-yellow-600 transition-colors">
                    Contact
                  </Link>
                </li> */}
              </ul>
            </div>

            {/* <div>
              <h4 className="font-bold mb-4 text-white">Resources</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>
                  <Link href="/guides" className="hover:text-yellow-600 transition-colors">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-yellow-600 transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-yellow-600 transition-colors">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-yellow-600 transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div> */}

            <div >
              <h4 className="font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-yellow-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-yellow-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                {/* <li>
                  <Link href="/security" className="hover:text-yellow-600 transition-colors">
                    Security
                  </Link>
                </li> */}
                <li>
                  <Link href="/cookies" className="hover:text-yellow-600 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>

          </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">© 2025 DropAphi. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="#" className="text-gray-400 hover:text-yellow-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-yellow-600 transition-colors">
                  <Github className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-yellow-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-yellow-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
