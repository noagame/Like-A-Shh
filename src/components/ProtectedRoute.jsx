import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

/**
 * ProtectedRoute — Wrapper that checks for valid JWT token.
 * Redirects to /login if not authenticated.
 * Optionally checks for admin role.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [status, setStatus] = useState('loading') // loading | authenticated | unauthorized
  const [user, setUser] = useState(null)

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setStatus('unauthorized')
        return
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (data.success) {
          if (requireAdmin && data.data.user.role !== 'admin') {
            setStatus('unauthorized')
          } else {
            setUser(data.data.user)
            setStatus('authenticated')
          }
        } else {
          localStorage.removeItem('token')
          setStatus('unauthorized')
        }
      } catch {
        setStatus('unauthorized')
      }
    }
    verifyAuth()
  }, [requireAdmin])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'unauthorized') {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
