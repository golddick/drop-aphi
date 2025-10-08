
import { BlogHeader } from "./BlogHeader"
import { BlogFeatured } from "./BlogFeatured"
import { BlogList } from "./BlogList"
import { BlogSidebar } from "./BlogSidebar"
import Header from "@/lib/utils/widgets/header"
import { Footer } from "@/lib/utils/widgets/footer/footer"


export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-800">
      <Header />
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
