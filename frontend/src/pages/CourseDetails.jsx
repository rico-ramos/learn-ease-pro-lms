import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Courses, Feedback, Lessons, Progress } from '../api'
import StarRating from '../components/StarRating.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import useAuth from '../components/useAuth.js'

export default function CourseDetails() {
  const { slug } = useParams()
  const { user } = useAuth()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // enrollment UX
  const [enrollMsg, setEnrollMsg] = useState('')

  // feedback
  const [feedback, setFeedback] = useState([])
  const [fbLoading, setFbLoading] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  // lessons & progress
  const [lessons, setLessons] = useState([]) // from Lessons API
  const [progress, setProgress] = useState({ percent: 0, lessons: [] }) // from Progress API
  const [progLoading, setProgLoading] = useState(false)
  const [marking, setMarking] = useState(null) // lessonId being marked

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true); setError('')
      try {
        const data = await Courses.get(slug)
        if (!ignore) setCourse(data)
      } catch (e) {
        if (!ignore) setError('Failed to load course')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [slug])

  // feedback list
  useEffect(() => {
    if (!course?._id) return
    let ignore = false
    async function loadFb() {
      setFbLoading(true)
      try {
        const items = await Feedback.listForCourse(course._id)
        if (!ignore) setFeedback(items)
      } finally {
        if (!ignore) setFbLoading(false)
      }
    }
    loadFb()
    return () => { ignore = true }
  }, [course?._id])

  // lessons + progress (auth required)
  useEffect(() => {
    if (!user || !course?.slug) return
    let ignore = false
    async function loadLessonsAndProgress() {
      setProgLoading(true)
      try {
        const [{ lessons: les }, prog] = await Promise.all([
          Lessons.listByCourseSlug(course.slug),
          Progress.getByCourseSlug(course.slug),
        ])
        if (ignore) return
        // les: { courseId, lessons: [...] }
        setLessons(les || [])
        setProgress({ percent: prog?.percent || 0, lessons: prog?.lessons || [] })
      } catch {
        // ignore auth failures silently
      } finally {
        if (!ignore) setProgLoading(false)
      }
    }
    loadLessonsAndProgress()
    return () => { ignore = true }
  }, [user, course?.slug])

  // avg rating
  const avg = useMemo(() => {
    if (!feedback.length) return 0
    const sum = feedback.reduce((a, b) => a + (b.rating || 0), 0)
    return Math.round((sum / feedback.length) * 10) / 10
  }, [feedback])

  async function requestAccess() {
    try {
      const data = await Courses.requestEnroll(course._id)
      setEnrollMsg(data.status || 'requested')
    } catch (e) {
      setEnrollMsg(e?.response?.data?.message || 'Request failed')
    }
  }

  async function submitFeedback(e) {
    e.preventDefault()
    setSubmitMsg('')
    if (!myRating) { setSubmitMsg('Please select a rating'); return }
    setSubmitting(true)
    try {
      await Feedback.post(course._id, { rating: myRating, comment: myComment })
      setSubmitMsg('Thanks for your feedback!')
      const items = await Feedback.listForCourse(course._id)
      setFeedback(items)
      setMyComment('')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not submit feedback'
      setSubmitMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  function progressFor(lessonId) {
    return progress.lessons.find(p => p._id === lessonId)?.progress || { completed: false, secondsWatched: 0 }
  }

  async function toggleComplete(lessonId) {
    setMarking(lessonId)
    const current = progressFor(lessonId)
    try {
      await Progress.mark({ lessonId, completed: !current.completed })
      // reload progress quickly (lightweight)
      const prog = await Progress.getByCourseSlug(slug)
      setProgress({ percent: prog?.percent || 0, lessons: prog?.lessons || [] })
    } catch (e) {
      // best-effort; you could show toast
    } finally {
      setMarking(null)
    }
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!course) return null

  return (
    <section className="grid gap-6 md:grid-cols-3">
      {/* Left: details + ratings + lessons */}
      <div className="md:col-span-2 space-y-4">
        <div className="p-4 bg-white rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            <span>{course.category}</span>
            <span>•</span>
            <span className="capitalize">{course.level}</span>
            <span>•</span>
            <span>{course.isPublished ? 'Published' : 'Draft'}</span>
          </div>
          <p className="mb-4 text-gray-800">{course.description}</p>

          <div className="flex items-center gap-3">
            <StarRating readOnly value={avg || 0} />
            <div className="text-sm text-gray-700">
              {avg ? `${avg} / 5` : 'No ratings yet'}
              {feedback.length > 0 && <span className="text-gray-500"> ({feedback.length})</span>}
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={requestAccess}
              className="px-4 py-2 rounded-2xl bg-green-600 text-white hover:brightness-95 transition"
            >
              Request Access
            </button>
            {enrollMsg && <div className="mt-2 text-sm text-gray-700">{enrollMsg}</div>}
          </div>
        </div>

        {/* Lessons list (auth only) */}
        <div className="p-4 bg-white rounded-2xl shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Lessons</h3>
            {progLoading ? (
              <span className="text-sm text-gray-500">Syncing…</span>
            ) : (
              <span className="text-sm text-gray-600">{progress.percent}% complete</span>
            )}
          </div>
          <ProgressBar value={progress.percent} />
          {!user ? (
            <div className="mt-4 text-gray-600 text-sm">
              Sign in to view and track your lessons.
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {(lessons || []).length === 0 ? (
                <div className="text-gray-600">No lessons yet.</div>
              ) : (
                lessons.map(l => {
                  const p = progressFor(l._id)
                  return (
                    <div key={l._id} className="flex items-center justify-between p-3 border rounded-xl">
                      <div>
                        <div className="font-medium">{l.title}</div>
                        <div className="text-xs text-gray-500">
                          {l.durationSec ? `${Math.round(l.durationSec / 60)} min` : '—'}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleComplete(l._id)}
                        disabled={marking === l._id}
                        className={`px-3 py-1 rounded-2xl text-sm transition ${p.completed ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                          } disabled:opacity-60`}
                        title={p.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {marking === l._id ? 'Saving…' : (p.completed ? 'Completed' : 'Mark complete')}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Feedback list */}
        <div className="p-4 bg-white rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-3">Learner Feedback</h3>
          {fbLoading ? (
            <div>Loading feedback…</div>
          ) : feedback.length === 0 ? (
            <div className="text-gray-600">No feedback yet.</div>
          ) : (
            <div className="space-y-3">
              {feedback.map(item => (
                <div key={item._id} className="border rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{item.learner?.name || 'Learner'}</div>
                    <StarRating readOnly value={item.rating} size="sm" />
                  </div>
                  {item.comment && <p className="text-gray-700 text-sm mt-2">{item.comment}</p>}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: rate course */}
      <aside className="space-y-4">
        <div className="p-4 bg-white rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-2">Rate this course</h3>
          {user?.role === 'learner' ? (
            <form onSubmit={submitFeedback} className="space-y-3">
              <div>
                <StarRating value={myRating} onChange={setMyRating} size="lg" />
              </div>
              <textarea
                className="w-full border px-3 py-2 rounded-xl"
                rows={4}
                value={myComment}
                onChange={e => setMyComment(e.target.value)}
                placeholder="Share your thoughts (optional)…"
              />
              {submitMsg && <div className="text-sm text-gray-700">{submitMsg}</div>}
              <button
                disabled={submitting}
                className="w-full px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-60 hover:brightness-95 transition"
              >
                {submitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
              <div className="text-xs text-gray-500">
                You can submit once per course.
              </div>
            </form>
          ) : (
            <div className="text-gray-600 text-sm">
              Sign in as a learner to leave a rating.
            </div>
          )}
        </div>
      </aside>
    </section>
  )
}
