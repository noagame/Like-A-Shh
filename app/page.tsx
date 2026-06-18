import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import CoursesSection from "./components/CoursesSection";
import GallerySection from "./components/GallerySection";
import TestimonialsSection from "./components/TestimonialsSection";
import EventsSection from "./components/EventsSection";
import FAQSection from "./components/FAQSection";
import ContactSection from "./components/ContactSection";
import WhatsAppButton from "./components/WhatsAppButton";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <GallerySection />
      <TestimonialsSection />
      <EventsSection />
      <FAQSection />
      <ContactSection />
      <WhatsAppButton />
      <Footer />
    </main>
  );
}
