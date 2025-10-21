"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import Toolbar from "@/lib/utils/widgets/header/toolbar"
import Logo from "@/lib/utils/widgets/header/logo"

interface HeaderProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export default function Header({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Function to check if a link is active
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  // Nav link component with active state
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = isActiveLink(href)
    
    return (
      <Link
        href={href}
        className={`relative pb-1 transition-colors ${
          isActive 
            ? "text-yellow-600 font-semibold" 
            : "text-black hover:text-yellow-600"
        }`}
      >
        {children}
        {isActive && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-600 rounded-full animate-fade-in" />
        )}
      </Link>
    )
  }

  // Mobile nav link component with active state
  const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = isActiveLink(href)
    
    return (
      <Link
        href={href}
        className={`block py-2 px-3 rounded-lg transition-colors ${
          isActive 
            ? "text-yellow-600 font-semibold bg-yellow-50 border-l-4 border-yellow-600" 
            : "text-black hover:text-yellow-600 hover:bg-gray-50"
        }`}
      >
        {children}
      </Link>
    )
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 animate-fade-in">
           <Logo />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/#features">Features</NavLink>
          <NavLink href="/#api">APIs</NavLink>
          <NavLink href="/about-us">About Us</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/pricing">Price</NavLink>
          <NavLink href="/docs">Doc</NavLink>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Toolbar />
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-slide-in-down">
          <div className="px-4 py-4 space-y-2">
            <MobileNavLink href="/#features">Features</MobileNavLink>
            <MobileNavLink href="/#api">APIs</MobileNavLink>
            <MobileNavLink href="/about-us">About Us</MobileNavLink>
            <MobileNavLink href="/blog">Blog</MobileNavLink>
            <MobileNavLink href="/pricing">Price</MobileNavLink>
            <MobileNavLink href="/docs">Doc</MobileNavLink>
            <div className="pt-4 space-y-2 border-t border-gray-200">
              <Toolbar />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}