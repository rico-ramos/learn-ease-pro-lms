import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '../api'
import useAuth from '../components/useAuth.js'

export default function Register() {
    const nav = useNavigate()
    const { login } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('learner') // allow instructor sign-up too
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    async function submit(e) {
        e.preventDefault()
        setError(''); setSaving(true)
        try {
            await Auth.register({ name, email, password, role })
            // auto-login after register
            const { accessToken, user } = await Auth.login(email, password)
            login(user, accessToken)
            if (user.role === 'faculty') nav('/faculty')
            else if (user.role === 'admin') nav('/admin')
            else nav('/me')
        } catch (err) {
            setError(err?.response?.data?.message || 'Registration failed')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-md mx-auto py-10">
            <h2 className="text-2xl font-semibold mb-4">Create Account</h2>
            <form onSubmit={submit} className="space-y-3">
                <input className="w-full border px-3 py-2 rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
                <input className="w-full border px-3 py-2 rounded" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                <input className="w-full border px-3 py-2 rounded" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                <select className="w-full border px-3 py-2 rounded" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="learner">Learner</option>
                    <option value="faculty">Instructor</option>
                </select>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <button disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60">
                    {saving ? 'Creating…' : 'Create Account'}
                </button>
            </form>
        </div>
    )
}
