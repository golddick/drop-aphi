"use client"

import type React from "react"
import { motion, Variants } from "framer-motion"
import Link from "next/link"
import {  Instagram, Mail } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"


export function Footer() {

  const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
}


  return (
    <footer className="bg-black text-white  border-none pt-16 pb-8">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-4 gap-10"
        >
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold">
                <span className="text-gold-700 font-heading">The</span>
                <span className="text-white font-heading">News</span>
              </span>
            </Link>
            <p className="text-neutral-300 mb-6 max-w-md leading-relaxed">
              DROPAPHI helps you create, send, and analyze beautiful newsletters that engage your audience and grow your
              business.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://wa.me/+2347050998742" icon={<FaWhatsapp size={18} />} />
              <SocialLink href="https://www.instagram.com/thenews.africa/" icon={<Instagram size={18} />} />
              <SocialLink href="mailto:info@thenews.africa" icon={<Mail size={18} />} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-5 text-white">Company</h4>
            <ul className="space-y-3">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/coming-soon">Blog</FooterLink>
              <FooterLink href="#pricing">Pricing</FooterLink>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-5 text-white">Subscribe</h4>
            <p className="text-neutral-300 mb-4">Get the latest news and updates from TheNews.</p>
           {/* <FooterNewsLetter/> */}
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="border-t border-dark-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} TheNews. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/legal" className="text-neutral-400 text-sm hover:text-gold-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal" className="text-neutral-400 text-sm hover:text-gold-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-dark-700 text-neutral-300 hover:bg-gold-500/20 hover:text-gold-300 transition-colors"
    >
      {icon}
    </Link>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-neutral-300 hover:text-gold-300 transition-colors">
        {children}
      </Link>
    </li>
  )
}
