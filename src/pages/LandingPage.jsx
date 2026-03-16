import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AboutUs from '../components/AboutUs'
import Instructor from '../components/Instructor'
import CourseDetails from '../components/CourseDetails'
import Gallery from '../components/Gallery'
import Footer from '../components/Footer'

/**
 * LandingPage — Public-facing page assembling all sections.
 * Order: Hero → About Us → Instructor → Courses → Gallery → Footer
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-brand-black text-white font-body">
      <Navbar />
      <main>
        <Hero />
        <AboutUs />
        <Instructor />
        <CourseDetails />
        <Gallery />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
