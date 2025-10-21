import React, { useEffect, useState } from 'react'
import { Enrollments, Users } from '../../api'

export default function Admin() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [approvingId, setApprovingId] = useState(null)
    const [refresh, setRefresh] = useState(0)
    // Users state
    const [role, setRole] = useState('')
    const [users, setUsers] = useState([])
    const [uloading, setULoading] = useState(false)

    useEffect(() => {
        let ignore = false
        async function load() {
            setLoading(true); setError('')
            try {
                const list = await Enrollments.listPending()
                if (!ignore) setItems(list)
            } catch (e) {
                if (!ignore) setError('Failed to load pending enrollments')
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        load()
        return () => { ignore = true }
    }, [refresh])


    async function approve(id) {
        setApprovingId(id)
        try {
            await Enrollments.approve(id)
            // remove approved one locally
            setItems(prev => prev.filter(x => x._id !== id))
        } catch (e) {
            alert(e?.response?.data?.message || 'Approval failed')
        } finally {
            setApprovingId(null)
        }
    }

    useEffect(() => {
        let ignore = false
        async function loadUsers() {
            setULoading(true)
            try {
                const data = await Users.list(role)
                if (!ignore) setUsers(data)
            } finally {
                if (!ignore) setULoading(false)
            }
        }
        loadUsers()
        return () => { ignore = true }
    }, [role])

    return (
        <div className="p-6 space-y-6">
            {/* Enrollment Requests */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Admin Dashboard</h2>
                <button onClick={() => setRefresh(x => x + 1)} className="px-3 py-2 rounded bg-gray-200">Refresh</button>
            </div>

            {loading && <div>Loading pending requests…</div>}
            {error && <div className="text-red-600">{error}</div>}

            {!loading && !error && (
                <>
                    {items.length === 0 ? (
                        <div className="text-gray-600">No pending enrollment requests.</div>
                    ) : (
                        <div className="space-y-3">
                            {items.map(req => (
                                <div key={req._id} className="p-4 bg-white rounded shadow flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{req.learner?.name || 'Learner'}</div>
                                        <div className="text-sm text-gray-600">{req.learner?.email}</div>
                                        <div className="text-sm mt-1">Course: <span className="font-medium">{req.course?.title}</span></div>
                                        <div className="text-xs text-gray-500 mt-1">Requested at: {new Date(req.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => approve(req._id)}
                                            disabled={approvingId === req._id}
                                            className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-60">
                                            {approvingId === req._id ? 'Approving…' : 'Approve'}
                                        </button>
                                        {/* A reject flow could be added later */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Users */}
            <div className="p-4 bg-white rounded-2xl shadow">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Users</h3>
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        className="border px-3 py-1 rounded-2xl">
                        <option value="faculty">Faculty</option>
                        <option value="learner">Learner</option>
                        <option value="">All</option>
                    </select>
                </div>
                {uloading ? (
                    <div>Loading users…</div>
                ) : users.length === 0 ? (
                    <div className="text-gray-600">No users found.</div>
                ) : (
                    <div className="space-y-2">
                        {users.map(u => (
                            <div key={u._id} className="p-3 border rounded-xl flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{u.name}</div>
                                    <div className="text-xs text-gray-600">{u.email}</div>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-2xl bg-gray-100">{u.role}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
