import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Courses } from '../../api'

export default function Faculty() {
    const [mine, setMine] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false
        async function load() {
            setLoading(true); setError('')
            try {
                const items = await Courses.listMine()
                if (!ignore) setMine(items)
            } catch (e) {
                if (!ignore) setError('Failed to load your courses')
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        load()
        return () => { ignore = true }
    }, [])

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Course Management</h2>
                <Link
                    to="/faculty/new"
                    className="px-3 py-2 rounded bg-blue-600 text-white"
                >
                    + New Course
                </Link>
            </div>

            {loading && <div>Loading your courses…</div>}
            {error && <div className="text-red-600">{error}</div>}

            {!loading && !error && (
                <>
                    {mine.length === 0 ? (
                        <div className="text-gray-600">You haven’t created any courses yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mine.map(c => (
                                <div key={c.slug} className="p-4 bg-white rounded shadow">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold">{c.title}</h3>
                                            <div className="text-xs text-gray-600">
                                                {c.category} · {c.level} {c.isPublished ? '· Published' : '· Draft'}
                                            </div>
                                        </div>
                                        <Link
                                            to={`/faculty/edit/${c.slug}`}
                                            className="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-2 line-clamp-3">{c.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
