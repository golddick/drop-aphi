
'use client'

import { BlogHeader } from "./BlogHeader"
import { BlogFeatured } from "./BlogFeatured"
import { BlogList } from "./BlogList"
import { BlogSidebar } from "./BlogSidebar"
import Footer from "@/lib/utils/widgets/footer/footer"
import Header from "@/modules/landingPage/Home/component/header"
import { useState } from "react"


export default function BlogPage() {

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)


  return (
    <div className="min-h-screen bg-white text-neutral-800">
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <BlogHeader />
      <BlogFeatured /> 
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <BlogList />
          </div>
          <div className="w-full lg:w-1/3">
            <BlogSidebar />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
