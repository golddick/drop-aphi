"use client"

import { motion, useInView , Variants} from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Palette, Layout, Type, ImageIcon, Smartphone, Code, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function NewsletterBuilder() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const containerVariants = {
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

  const builderFeatures = [
    {
      icon: Layout,
      title: "Drag & Drop Interface",
      description: "Intuitive visual editor with pre-built components and layouts",
    },
    {
      icon: Palette,
      title: "Custom Branding",
      description: "Full brand customization with colors, fonts, and logos",
    },
    {
      icon: Type,
      title: "Rich Text Editor",
      description: "Advanced text formatting with HTML and markdown support",
    },
    {
      icon: ImageIcon,
      title: "Media Management",
      description: "Built-in image hosting and optimization for fast loading",
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Automatically optimized for all devices and email clients",
    },
    {
      icon: Code,
      title: "Custom HTML/CSS",
      description: "Advanced users can add custom code for unique designs",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-blue-50 to-transparent opacity-50"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">Newsletter Builder</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 font-heading">Drag & Drop Email Builder</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Create stunning newsletters without any coding knowledge. Our visual editor makes it easy to design
              professional emails that engage your audience.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=500&width=600&text=Email+Builder+Interface"
                  width={600}
                  height={500}
                  alt="Drag and Drop Email Builder Interface"
                  className="rounded-xl shadow-2xl w-full h-auto border border-neutral-200"
                />
                <div className="absolute -top-4 -right-4 bg-blue-500 text-white p-3 rounded-full">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4">Build Beautiful Emails in Minutes</h3>
                <p className="text-neutral-600 mb-6">
                  Our drag-and-drop builder comes with everything you need to create professional newsletters. Choose
                  from dozens of pre-built templates or start from scratch.
                </p>
              </div>

              <div className="grid gap-4">
                {builderFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="bg-blue-500 p-2 rounded-lg shrink-0">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-neutral-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="bg-blue-500 hover:bg-blue-600 text-white">Try Email Builder</Button>
            </motion.div>
          </div>

          {/* Template Gallery Preview */}
          <motion.div variants={itemVariants} className="text-center">
            <h3 className="text-2xl font-bold mb-8">Choose from 50+ Professional Templates</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Newsletter",
                  category: "Weekly Updates",
                  image: "/placeholder.svg?height=300&width=250&text=Newsletter+Template",
                },
                {
                  name: "Product Launch",
                  category: "Announcements",
                  image: "/placeholder.svg?height=300&width=250&text=Product+Launch+Template",
                },
                {
                  name: "Event Invitation",
                  category: "Events",
                  image: "/placeholder.svg?height=300&width=250&text=Event+Template",
                },
              ].map((template, index) => (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-lg transition-all"
                >
                  <Image
                    src={template.image || "/placeholder.svg"}
                    width={250}
                    height={300}
                    alt={template.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h4 className="font-semibold text-neutral-900">{template.name}</h4>
                  <p className="text-sm text-neutral-600">{template.category}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
