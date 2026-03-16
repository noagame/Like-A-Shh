import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TermsAndConditions from './pages/TermsAndConditions'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'
import AdminLayout from './components/admin/AdminLayout'
import AdminCourses from './components/admin/AdminCourses'
import AdminGallery from './components/admin/AdminGallery'
import AdminComments from './components/admin/AdminComments'
import AdminSettings from './components/admin/AdminSettings'
import ProtectedRoute from './components/ProtectedRoute'

/**
 * App — Root component with React Router.
 * Routes:
 *   /           → Public landing page
 *   /login      → Login page
 *   /registro   → Register page
 *   /terminos   → Terms & Conditions
 *   /panel      → User dashboard (protected)
 *   /admin/*    → Admin dashboard (protected, admin only)
 */
const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/terminos" element={<TermsAndConditions />} />

      {/* User panel (protected) */}
      <Route
        path="/panel"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin (protected, admin only) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="cursos" replace />} />
        <Route path="cursos" element={<AdminCourses />} />
        <Route path="galeria" element={<AdminGallery />} />
        <Route path="comentarios" element={<AdminComments />} />
        <Route path="configuracion" element={<AdminSettings />} />
      </Route>
    </Routes>
  )
}

export default App
