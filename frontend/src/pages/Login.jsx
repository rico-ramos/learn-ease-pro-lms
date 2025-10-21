import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '../api'
import useAuth from '../components/useAuth.js'

export default function Login() {
  const [email, setEmail] = useState('learner@example.com')
  const [password, setPassword] = useState('Secret123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { login } = useAuth()



  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { accessToken, user } = await Auth.login(email, password)
      login(user, accessToken)
      // send to role-specific home
      if (user.role === 'faculty') nav('/faculty')
      else if (user.role === 'admin') nav('/admin')
      else nav('/me')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h2 className="text-2xl font-semibold mb-4">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border px-3 py-2 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="w-full border px-3 py-2 rounded"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? 'Signing In…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
