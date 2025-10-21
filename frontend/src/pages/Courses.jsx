import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Courses } from '../api'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true); setError('')
      try {
        const list = await Courses.list()
        if (!ignore) setCourses(list)
      } catch (e) {
        if (!ignore) setError('Failed to load courses')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const filtered = q
    ? courses.filter(c => c.title.toLowerCase().includes(q.toLowerCase()))
    : courses

  if (loading) return <div className="p-6">Loading courses…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <section className="py-6">
      <div className="mb-4">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search courses"
          className="w-full md:w-80 border px-3 py-2 rounded"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-gray-600">No courses found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Link key={c.slug} to={`/courses/${c.slug}`} className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold">{c.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{c.description}</p>
            <div className="text-xs mt-2">{c.category} · {c.level}</div>
            {typeof c.ratingAvg === 'number' && (
              <div className="text-xs mt-1">Rating: {c.ratingAvg} ({c.ratingCount || 0})</div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
