import Navbar from "@/components/navigation/Navbar";
import Hero from "@/components/layout/Hero";
import Features from "@/components/layout/Features";
import ProcessSteps from "@/components/layout/ProcessSteps";
import Pricing from "@/components/layout/Pricing";
import FAQ from "@/components/layout/FAQ";
import Testimonials from "@/components/layout/Testimonials";
import CTA from "@/components/layout/CTA";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ProcessSteps />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>);

}