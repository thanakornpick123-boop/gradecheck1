import React, { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './store/AppStore'
import Landing from './pages/Landing'
import StudentLogin from './pages/StudentLogin'
import StudentDashboard from './pages/StudentDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminLayout from './pages/AdminLayout'
import Scores from './pages/admin/Scores'
import Publish from './pages/admin/Publish'
import AuditLog from './pages/admin/AuditLog'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function RequireStudent({ children }) {
  const { session, student } = useApp()
  if (session?.role === 'student' && student) return children
  return <Navigate to="/student/login" replace />
}

function RequireAdmin({ children }) {
  const { session } = useApp()
  if (session?.role === 'admin') return children
  return <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route
          path="/student"
          element={
            <RequireStudent>
              <StudentDashboard />
            </RequireStudent>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="scores" replace />} />
          <Route path="scores" element={<Scores />} />
          <Route path="publish" element={<Publish />} />
          <Route path="audit" element={<AuditLog />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
