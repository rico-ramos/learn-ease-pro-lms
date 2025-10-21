import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Courses } from '../../api'
import { useToast } from '../../components/ToastProvider.jsx'

export default function EditCourse() {
    const { slug } = useParams()
    const nav = useNavigate()

    const [course, setCourse] = useState(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('General')
    const [level, setLevel] = useState('beginner')
    const [isPublished, setIsPublished] = useState(false)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [msg, setMsg] = useState('')
    const { push } = useToast()

    useEffect(() => {
        let ignore = false
        async function load() {
            setLoading(true); setError(''); setMsg('')
            try {
                const data = await Courses.get(slug)
                if (ignore) return
                setCourse(data)
                setTitle(data.title || '')
                setDescription(data.description || '')
                setCategory(data.category || 'General')
                setLevel(data.level || 'beginner')
                setIsPublished(!!data.isPublished)
            } catch (e) {
                if (!ignore) setError('Failed to load course')
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        load()
        return () => { ignore = true }
    }, [slug])

    async function save(e) {
        e.preventDefault()
        setError(''); setMsg('')
        if (!title.trim()) { setError('Title is required'); return }
        setSaving(true)
        try {
            const updated = await Courses.update(slug, { title, description, category, level, isPublished })
            setMsg('Saved!')
            push('Saved', 'success')
            // If the title changed, slug may have changed on backend — navigate
            if (updated?.slug && updated.slug !== slug) {
                nav(`/faculty/edit/${updated.slug}`, { replace: true })
            } else {
                // update local state
                setCourse(updated)
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-6">Loading…</div>
    if (error && !course) return <div className="p-6 text-red-600">{error}</div>
    if (!course) return null

    return (
        <div className="max-w-3xl p-6 bg-white rounded shadow">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Edit Course</h2>
                <div className="flex gap-2">
                    <button onClick={() => nav(`/faculty/edit/${slug}/lessons`)}
                        className="px-3 py-2 rounded-2xl bg-blue-500 text-white hover:brightness-95 transition">Manage Lessons</button>
                    <button onClick={() => nav('/faculty')}
                        className="px-3 py-2 rounded-2xl bg-gray-200">Back</button>
                </div>
            </div>


            <form onSubmit={save} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        className="w-full border px-3 py-2 rounded"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Course title"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        className="w-full border px-3 py-2 rounded"
                        rows={5}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe the course content and outcomes"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <input
                            className="w-full border px-3 py-2 rounded"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            placeholder="e.g. Web"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Level</label>
                        <select
                            className="w-full border px-3 py-2 rounded"
                            value={level}
                            onChange={e => setLevel(e.target.value)}
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <label className="inline-flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={e => setIsPublished(e.target.checked)}
                            />
                            <span>Published</span>
                        </label>
                    </div>
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}
                {msg && <div className="text-green-700 text-sm">{msg}</div>}

                <div className="flex gap-2">
                    <button
                        disabled={saving}
                        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => nav('/faculty')}
                        className="px-4 py-2 rounded bg-gray-200"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
