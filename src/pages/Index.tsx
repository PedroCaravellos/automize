import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DemoSection from "@/components/DemoSection";
import AboutSection from "@/components/AboutSection";
import BenefitsSection from "@/components/BenefitsSection";
import TemplatesSection from "@/components/TemplatesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ROICalculator from "@/components/ROICalculator";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <DemoSection />
      <AboutSection />
      <BenefitsSection />
      <TemplatesSection />
      <HowItWorksSection />
      <ROICalculator />
      <TestimonialsSection />
      <div id="planos">
        <PricingSection />
      </div>
      <Footer />
    </main>
  );
};

export default Index;
