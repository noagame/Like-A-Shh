import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logoSrc from '../assets/Logo.jpg'

/**
 * Navbar — Sticky glassmorphism navigation bar.
 * Contains brand logo, anchor links, auth buttons (Login/Register), and CTA button.
 */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth scroll to anchor and close mobile menu
  const scrollTo = (id) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const navLinks = [
    { label: 'Inicio', id: 'hero' },
    { label: 'Instructor', id: 'instructor' },
    { label: 'Cursos', id: 'course-details' },
    { label: 'Galería', id: 'gallery' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-lg shadow-black/30' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* ── Logo ── */}
        <button
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-3 group"
          aria-label="Ir al inicio"
        >
          <img
            src={logoSrc}
            alt="LIKE A SHH Logo"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-gold/40 group-hover:ring-brand-gold transition-all duration-300"
          />
          <span className="hidden sm:inline text-lg font-heading font-bold tracking-wider text-gradient-gold">
            LIKE A SHH
          </span>
        </button>

        {/* ── Desktop links ── */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="relative text-sm font-medium text-brand-muted hover:text-white transition-colors duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-brand-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </button>
          ))}

          {/* Separator */}
          <div className="w-px h-5 bg-brand-gray/30" />

          {/* Auth buttons */}
          <Link
            to="/login"
            className="text-sm font-medium text-brand-muted hover:text-white transition-colors duration-300"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/registro"
            className="px-4 py-2 rounded-full border border-brand-gold/40 text-brand-gold text-sm font-heading font-semibold hover:bg-brand-gold/10 hover:border-brand-gold transition-all duration-300"
          >
            Registrarse
          </Link>

          {/* CTA — Comprar Curso */}
          <a
            href="https://hotmart.com/es/marketplace"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer px-5 py-2 rounded-full text-sm font-heading font-bold text-brand-black animate-shimmer hover:scale-105 transition-transform duration-300"
          >
            Comprar Curso
          </a>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Abrir menú"
        >
          <span
            className={`block h-0.5 w-6 bg-brand-gold transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-brand-gold transition-all duration-300 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-brand-gold transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="glass px-6 pb-6 pt-2 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-left text-brand-muted hover:text-white transition-colors text-sm font-medium"
            >
              {link.label}
            </button>
          ))}

          {/* Separator */}
          <div className="h-px bg-brand-gray/20" />

          {/* Auth links (mobile) */}
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="text-left text-brand-muted hover:text-white transition-colors text-sm font-medium"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/registro"
            onClick={() => setMenuOpen(false)}
            className="text-left text-brand-gold hover:text-white transition-colors text-sm font-semibold"
          >
            Crear Cuenta
          </Link>

          <a
            href="https://hotmart.com/es/marketplace"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer text-center px-5 py-2.5 rounded-full text-sm font-heading font-bold text-brand-black"
          >
            Comprar Curso
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
