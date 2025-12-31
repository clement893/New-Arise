import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { BuildingLeadersSection } from '@/components/landing/BuildingLeadersSection';
import { FourDimensionsSection } from '@/components/landing/FourDimensionsSection';
import { ChooseYourPathSection } from '@/components/landing/ChooseYourPathSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

export default function LandingPage() {
  return (
    <main className="bg-white">
      <Header />
      <HeroSection />
      <BuildingLeadersSection />
      <FourDimensionsSection />
      <ChooseYourPathSection />
      <TestimonialsSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
