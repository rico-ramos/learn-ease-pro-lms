import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from './useAuth.js'

export default function ProtectedRoute({ roles = [], children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-6">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}
