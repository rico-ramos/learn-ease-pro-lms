import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Enrollments, Progress } from '../../api'
import ProgressBar from '../../components/ProgressBar.jsx'

export default function Learner() {
    const [items, setItems] = useState([]) // enrollments
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [percents, setPercents] = useState({}) // slug -> percent

    useEffect(() => {
        let ignore = false
        async function load() {
            setLoading(true); setError('')
            try {
                const enrolls = await Enrollments.mine()
                if (ignore) return
                setItems(enrolls || [])

                // load progress per course (approved or requested)
                const approved = (enrolls || []).filter(e => e.status === 'approved' && e.course?.slug)
                const results = {}
                await Promise.all(approved.map(async e => {
                    try {
                        const p = await Progress.getByCourseSlug(e.course.slug)
                        results[e.course.slug] = p?.percent || 0
                    } catch { /* ignore */ }
                }))
                if (!ignore) setPercents(results)
            } catch (e) {
                if (!ignore) setError('Failed to load your enrollments')
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        load()
        return () => { ignore = true }
    }, [])

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Learner Dashboard</h2>

            {loading && <div>Loading your courses…</div>}
            {error && <div className="text-red-600">{error}</div>}

            {!loading && !error && (
                <>
                    {items.length === 0 ? (
                        <div className="text-gray-600">You aren’t enrolled in any courses yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {items.map(e => {
                                const slug = e.course?.slug
                                const pct = percents[slug] ?? (e.status === 'approved' ? 0 : null)
                                return (
                                    <div key={e._id} className="p-4 bg-white rounded-2xl shadow">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="font-semibold">{e.course?.title || 'Course'}</div>
                                                <div className="text-xs text-gray-600">Status: {e.status}</div>
                                            </div>
                                            {slug && (
                                                <Link to={`/courses/${slug}`} className="px-3 py-2 rounded-2xl bg-blue-600 text-white">
                                                    Open
                                                </Link>
                                            )}
                                        </div>

                                        {pct !== null && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                    <span>Progress</span>
                                                    <span>{pct}%</span>
                                                </div>
                                                <ProgressBar value={pct} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
