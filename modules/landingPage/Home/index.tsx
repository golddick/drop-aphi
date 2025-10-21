
// import { Footer } from "@/lib/utils/widgets/footer/footer";
// import Header from "@/lib/utils/widgets/header";
// import { Banner } from "./component/banner";
// import { About } from "./component/about";
// import { FeatureHighlight } from "./component/featureHighlight";
// import { FAQ } from "./component/faq";



// const LandingPage = () => {
//   return (
//     <div>
//       <Header />
//       <Banner />
//       <About/>
//       {/* <Branding /> */}
//       {/* <Benefits /> */}
//       <FeatureHighlight />
//       <FAQ/>
//       {/* <Pricing /> */}
//       <Footer />
//     </div>
//   );
// };

// export default LandingPage;




"use client"

import { useState } from "react"
import APIShowcase from "./component/api-showcase"
import Header from "./component/header"
import Hero from "./component/hero"
import Features from "./component/featureHighlight"
import Footer from "@/lib/utils/widgets/footer/footer"
import BlogPreview from "./component/blog-preview"
import FAQ from "./component/faq"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Hero />
      <Features />
      <APIShowcase />
      <FAQ />
      <BlogPreview />
      <Footer />
    </main>
  )
}
