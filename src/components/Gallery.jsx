import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Gallery Section — Dynamic carousel from API + testimonials.
 * Fetches galleries from GET /api/galleries
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const StarRating = ({ rating }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-brand-gold' : 'text-brand-gray'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
)

// ─── Carousel Component ──────────────────────────────────────────
const ImageCarousel = ({ images }) => {
  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const intervalRef = useRef(null)

  const total = images.length

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total)
  }, [total])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total)
  }, [total])

  // Auto-play
  useEffect(() => {
    if (total <= 1) return
    intervalRef.current = setInterval(nextSlide, 4000)
    return () => clearInterval(intervalRef.current)
  }, [nextSlide, total])

  // Reset autoplay on manual interaction
  const handleManual = (fn) => {
    clearInterval(intervalRef.current)
    fn()
    intervalRef.current = setInterval(nextSlide, 4000)
  }

  // Touch events for mobile swipe
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      handleManual(diff > 0 ? nextSlide : prevSlide)
    }
    setTouchStart(null)
  }

  if (total === 0) return null

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-brand-dark border border-brand-gray/20"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={i} className="w-full flex-shrink-0 aspect-[4/3] relative">
            <img
              src={`${API_URL}${img.url}`}
              alt={img.label || `Foto ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {img.label && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <span className="text-white text-sm font-medium">{img.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={() => handleManual(prevSlide)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all"
            aria-label="Anterior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => handleManual(nextSlide)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all"
            aria-label="Siguiente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => handleManual(() => setCurrent(i))}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-brand-gold w-5' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Gallery Section ─────────────────────────────────────────────
const Gallery = () => {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef(null)

  // Fetch galleries
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const res = await fetch(`${API_URL}/api/galleries`)
        const data = await res.json()
        if (data.success) setGalleries(data.data)
      } catch (error) {
        console.error('Error fetching galleries:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGalleries()
  }, [])

  // Reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    const elements = sectionRef.current?.querySelectorAll('.reveal')
    elements?.forEach((el) => observer.observe(el))
    return () => elements?.forEach((el) => observer.unobserve(el))
  }, [loading])

  // Collect all images across galleries for the main carousel
  const allImages = galleries.flatMap((g) => g.images || [])

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative py-24 sm:py-32 bg-brand-carbon overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section heading */}
        <div className="reveal text-center mb-16">
          <span className="text-brand-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase">
            Comunidad
          </span>
          <h2 className="mt-3 font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white">
            Galería <span className="text-gradient-gold">Like A Shh</span>
          </h2>
        </div>

        {/* Main carousel */}
        {loading ? (
          <div className="reveal w-full aspect-[4/3] max-w-3xl mx-auto rounded-2xl bg-brand-dark/50 animate-pulse mb-12" />
        ) : allImages.length > 0 ? (
          <div className="reveal max-w-3xl mx-auto mb-12">
            <ImageCarousel images={allImages} />
          </div>
        ) : null}

        {/* Gallery grid (individual galleries) */}
        {!loading && galleries.length > 1 && (
          <div className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {galleries.map((gallery) => (
              <div
                key={gallery._id}
                className="rounded-2xl bg-brand-dark/60 border border-brand-gray/20 overflow-hidden hover:border-brand-gold/30 transition-all duration-300"
              >
                {gallery.images?.[0] && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={`${API_URL}${gallery.images[0].url}`}
                      alt={gallery.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-white text-sm">{gallery.name}</h3>
                  <p className="text-brand-muted text-xs mt-1">{gallery.images?.length || 0} fotos</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && allImages.length === 0 && (
          <div className="reveal text-center text-brand-muted py-12">
            Pronto tendremos fotos increíbles para mostrar.
          </div>
        )}
      </div>
    </section>
  )
}

export default Gallery
