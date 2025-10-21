import { FeaturesHero } from "./hero";
import { EmailAnalytics } from "./email-analytics";
import { BlogSystem } from "./blog-system";
import { EmailVerification } from "./email-verification";
import { NewsletterBuilder } from "./newsletter-builder";
import { NotificationSystem } from "./notification-system";
import { OTPSystem } from "./otp-system";
import Header from "@/lib/utils/widgets/header";
import Footer from "@/lib/utils/widgets/footer/footer";


export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <FeaturesHero />
      <NewsletterBuilder />
      <OTPSystem/>
      {/* <EmailBuilder /> */}
      {/* <EmailVerification /> */}
      {/* <EmailAnalytics /> */}
      <BlogSystem />
      {/* <NotificationSystem/> */}
      <Footer />
    </div>
  )
}
