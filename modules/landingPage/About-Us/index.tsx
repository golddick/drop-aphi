import Header from "@/lib/utils/widgets/header";
import { AboutHero } from "./component/hero";
import { AboutMission } from "./component/mission";
import { AboutTimeline } from "./component/timeline";
import { Footer } from "@/lib/utils/widgets/footer/footer";
import { AboutContact } from "./component/contact";
import { AboutTeam } from "./component/team";


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-800">
      <Header />
      <AboutHero />
      <AboutMission />
      {/* <AboutParent /> */}
      <AboutTimeline />
      <AboutTeam />
      <AboutContact />
      <Footer />
    </div>
  )
}
