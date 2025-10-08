"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Github, Linkedin, Twitter } from "lucide-react"

export function AboutTeam() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "CEO & Co-Founder",
      bio: "Former engineering lead at major tech companies. Passionate about developer tools and API design.",
      image: "/placeholder.svg?height=300&width=300&text=Alex+Johnson",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Sarah Chen",
      role: "CTO & Co-Founder",
      bio: "Full-stack engineer with 10+ years experience building scalable communication platforms.",
      image: "/placeholder.svg?height=300&width=300&text=Sarah+Chen",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Engineering",
      bio: "Infrastructure expert focused on building reliable, high-performance API systems.",
      image: "/placeholder.svg?height=300&width=300&text=Marcus+Rodriguez",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Emily Watson",
      role: "Head of Product",
      bio: "Product strategist with deep understanding of developer needs and user experience.",
      image: "/placeholder.svg?height=300&width=300&text=Emily+Watson",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
            Our Team
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 font-heading">
            Meet the People Behind Xypher
          </h2>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            We're a diverse team of engineers, designers, and product experts united by our passion for building
            exceptional developer tools.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="relative mb-6">
                <Image
                  src={member.image || "/placeholder.svg"}
                  width={300}
                  height={300}
                  alt={member.name}
                  className="w-full h-64 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-shadow"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <h3 className="text-xl font-bold text-neutral-900 mb-1">{member.name}</h3>
              <p className="text-gold-600 font-semibold mb-3">{member.role}</p>
              <p className="text-neutral-600 text-sm mb-4">{member.bio}</p>

              <div className="flex justify-center gap-3">
                <a
                  href={member.social.twitter}
                  className="p-2 bg-neutral-100 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <Twitter className="h-4 w-4 text-neutral-600 hover:text-blue-600" />
                </a>
                <a
                  href={member.social.linkedin}
                  className="p-2 bg-neutral-100 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <Linkedin className="h-4 w-4 text-neutral-600 hover:text-blue-600" />
                </a>
                <a
                  href={member.social.github}
                  className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
                >
                  <Github className="h-4 w-4 text-neutral-600" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
