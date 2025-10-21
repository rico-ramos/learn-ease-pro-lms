import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Lessons, LessonManage, Uploads } from '../../api'
import ProgressBar from '../../components/ProgressBar.jsx'
import { useToast } from '../../components/ToastProvider.jsx'

function LessonRow({ item, onEdit, onDelete }) {
    return (
        <div className="flex items-center justify-between p-3 border rounded-xl bg-white">
            <div className="min-w-0">
                <div className="font-medium truncate">{item.title}</div>
                <div className="text-xs text-gray-500">
                    {item.contentType} · {item.durationSec ? `${Math.round(item.durationSec / 60)} min` : '—'} · order {item.order ?? 0}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="px-3 py-1 rounded-2xl bg-gray-200 hover:bg-gray-300 text-sm"
                    onClick={() => onEdit(item)}
                >
                    Edit
                </button>
                <button
                    className="px-3 py-1 rounded-2xl bg-red-600 text-white text-sm"
                    onClick={() => onDelete(item)}
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default function LessonsEditor() {
    const { slug } = useParams()
    const nav = useNavigate()

    const [courseId, setCourseId] = useState(null)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const { push } = useToast()

    // form state (create/edit)
    const emptyForm = { id: null, title: '', contentType: 'text', contentUrl: '', text: '', durationSec: 0, order: 0 }
    const [form, setForm] = useState(emptyForm)
    const [isEditing, setIsEditing] = useState(false)
    const [msg, setMsg] = useState('')

    async function load() {
        setLoading(true); setError('')
        try {
            const data = await Lessons.listByCourseSlug(slug)
            setCourseId(data.courseId || null)
            setItems((data.lessons || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
        } catch (e) {
            setError('Failed to load lessons')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [slug])

    const resetForm = () => { setForm(emptyForm); setIsEditing(false); setMsg('') }

    async function handleSubmit(e) {
        e.preventDefault()
        setMsg('')
        if (!form.title.trim()) { setMsg('Title is required'); return }
        setSaving(true)
        try {
            if (isEditing && form.id) {
                await LessonManage.update(form.id, {
                    title: form.title,
                    contentType: form.contentType,
                    contentUrl: form.contentUrl || undefined,
                    text: form.text || undefined,
                    durationSec: Number(form.durationSec) || 0,
                    order: Number(form.order) || 0
                })
                push('Saved', 'success')
            } else {
                await LessonManage.create(slug, {
                    title: form.title,
                    contentType: form.contentType,
                    contentUrl: form.contentUrl || undefined,
                    text: form.text || undefined,
                    durationSec: Number(form.durationSec) || 0,
                    order: Number(form.order) || 0
                })
            }
            await load()
            resetForm()
            setMsg('Saved!')
            push('Lesson added', 'success')
        } catch (e) {
            setMsg(e?.response?.data?.message || 'Save failed')
            push('Add lesson failed', 'error')
        } finally {
            setSaving(false)
        }
    }

    function startEdit(item) {
        setIsEditing(true)
        setForm({
            id: item._id,
            title: item.title || '',
            contentType: item.contentType || 'text',
            contentUrl: item.contentUrl || '',
            text: item.text || '',
            durationSec: item.durationSec || 0,
            order: item.order || 0
        })
        setMsg('')
    }

    async function handleDelete(item) {
        if (!confirm(`Delete lesson "${item.title}"?`)) return
        setSaving(true)
        try {
            await LessonManage.remove(item._id)
            await load()
        } catch (e) {
            alert(e?.response?.data?.message || 'Delete failed')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Lessons — {slug}</h2>
                <div className="flex gap-2">
                    <button onClick={() => nav(`/faculty/edit/${slug}`)} className="px-3 py-2 rounded-2xl bg-gray-200">
                        Back to Course
                    </button>
                    <button onClick={() => nav('/faculty')} className="px-3 py-2 rounded-2xl bg-gray-200">
                        My Courses
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* List */}
                <div className="space-y-3">
                    <div className="p-4 bg-white rounded-2xl shadow">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Existing Lessons</h3>
                            {loading ? <span className="text-sm text-gray-500">Loading…</span> : null}
                        </div>
                        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
                        {items.length === 0 ? (
                            <div className="text-gray-600">No lessons yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {items.map(item => (
                                    <LessonRow
                                        key={item._id}
                                        item={item}
                                        onEdit={startEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order hint */}
                    <div className="p-4 bg-white rounded-2xl shadow">
                        <div className="text-sm text-gray-700">
                            <div className="font-medium mb-1">Ordering tips</div>
                            Use the <span className="font-mono">order</span> field to control display order (lower first).
                            Keep lessons short and focused. You can mix <b>video</b>, <b>pdf</b>, <b>link</b>, and <b>text</b>.
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="p-4 bg-white rounded-2xl shadow">
                    <h3 className="font-semibold mb-3">{isEditing ? 'Edit Lesson' : 'Add Lesson'}</h3>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-sm mb-1">Title</label>
                            <input
                                className="w-full border px-3 py-2 rounded-xl"
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="e.g. JSX & Components"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm mb-1">Content Type</label>
                                <select
                                    className="w-full border px-3 py-2 rounded-xl"
                                    value={form.contentType}
                                    onChange={e => setForm(f => ({ ...f, contentType: e.target.value }))}
                                >
                                    <option value="text">Text</option>
                                    <option value="video">Video</option>
                                    <option value="pdf">PDF</option>
                                    <option value="link">Link</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Duration (seconds)</label>
                                <input
                                    className="w-full border px-3 py-2 rounded-xl"
                                    type="number"
                                    min="0"
                                    value={form.durationSec}
                                    onChange={e => setForm(f => ({ ...f, durationSec: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Optional fields */}
                        <div>
                            <label className="block text-sm mb-1">Content URL</label>
                            <div className="flex gap-2">
                                <input
                                    className="w-full border px-3 py-2 rounded-xl"
                                    value={form.contentUrl}
                                    onChange={e => setForm(f => ({ ...f, contentUrl: e.target.value }))}
                                    placeholder="https://… or upload a file"
                                />
                                <label className="px-3 py-2 rounded-2xl bg-gray-200 cursor-pointer">
                                    Upload
                                    <input type="file" className="hidden" onChange={async e => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        setMsg('Uploading…')
                                        try {
                                            const { url } = await Uploads.send(file)
                                            setForm(f => ({ ...f, contentUrl: url }))
                                            setMsg('Uploaded ✓')
                                        } catch {
                                            setMsg('Upload failed')
                                        }
                                    }} />
                                </label>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Supports any file; served from the backend /uploads folder.</div>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Text (optional)</label>
                            <textarea
                                className="w-full border px-3 py-2 rounded-xl"
                                rows={4}
                                value={form.text}
                                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                                placeholder="Lesson notes or transcript…"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Order</label>
                            <input
                                className="w-full border px-3 py-2 rounded-xl"
                                type="number"
                                value={form.order}
                                onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                            />
                        </div>

                        {msg && <div className={`text-sm ${msg.includes('fail') ? 'text-red-600' : 'text-green-700'}`}>{msg}</div>}

                        <div className="flex items-center gap-2">
                            <button
                                disabled={saving}
                                className="px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-60"
                            >
                                {saving ? 'Saving…' : (isEditing ? 'Save Changes' : 'Add Lesson')}
                            </button>
                            {isEditing && (
                                <button type="button" className="px-4 py-2 rounded-2xl bg-gray-200" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Subtle footer note */}
            <div className="text-xs text-gray-500">
                Tip: After adding lessons, open the course page as a learner to test progress tracking.
            </div>
        </div>
    )
}
