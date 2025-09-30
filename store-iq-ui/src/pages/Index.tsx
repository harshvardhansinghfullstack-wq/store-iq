import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StepsSection from "@/components/StepsSection";
import PricingSection from "@/components/PricingSection";
import TestimonialSection from "@/components/TestimonialSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-storiq-dark">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <PricingSection />
      <TestimonialSection />
    </div>
  );
};

export default Index;
