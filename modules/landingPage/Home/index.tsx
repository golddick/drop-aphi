
import { Footer } from "@/lib/utils/widgets/footer/footer";
import Header from "@/lib/utils/widgets/header";
import { Banner } from "./component/banner";
import { About } from "./component/about";
import { FeatureHighlight } from "./component/featureHighlight";
import { FAQ } from "./component/faq";



const LandingPage = () => {
  return (
    <div>
      <Header />
      <Banner />
      <About/>
      {/* <Branding /> */}
      {/* <Benefits /> */}
      <FeatureHighlight />
      <FAQ/>
      {/* <Pricing /> */}
      <Footer />
    </div>
  );
};

export default LandingPage;
