import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import useAuth from './components/useAuth.js'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1 rounded-2xl hover:bg-gray-100 transition ${isActive ? 'bg-gray-200 font-medium' : ''
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function App() {
  const { user, logout } = useAuth()
  const role = user?.role

  return (
    <div className="max-w-6xl mx-auto px-4">
      <header className="flex items-center justify-between py-5">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">LEARN EASE PRO</Link>
        <nav className="flex items-center gap-2">
          <NavItem to="/courses">Courses</NavItem>

          {(role === 'faculty' || role === 'admin') && <NavItem to="/faculty">Manage Courses</NavItem>}
          {role === 'admin' && <NavItem to="/admin">Admin</NavItem>}
          {role && <NavItem to="/me">Dashboard</NavItem>}

          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-2">
                <span className="text-sm text-gray-600">Signed in as</span>
                <span className="px-2 py-1 rounded-2xl bg-gray-100 text-sm font-medium">
                  {user.name} · {role}
                </span>
              </div>
              <button onClick={logout} className="ml-2 px-3 py-1 rounded-2xl bg-gray-200 hover:bg-gray-300 transition">Logout</button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1 rounded-2xl bg-blue-600 text-white hover:brightness-95 transition">Login</Link>
          )}

          {!user && (
            <Link to="/register" className="px-3 py-1 rounded-2xl hover:bg-gray-100 transition">
              Register
            </Link>
          )}

        </nav>
      </header>

      <main className="pb-12">
        <Outlet />
      </main>
    </div>
  )
}
