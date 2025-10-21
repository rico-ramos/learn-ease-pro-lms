import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Courses } from '../../api'
import { useToast } from '../../components/ToastProvider.jsx'


export default function NewCourse() {
    const nav = useNavigate()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('General')
    const [level, setLevel] = useState('beginner')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const { push } = useToast()


    async function submit(e) {
        e.preventDefault()
        setError('')
        if (!title.trim()) { setError('Title is required'); return }
        setSaving(true)
        try {
            const created = await Courses.create({ title, description, category, level })
            push('Course created', 'success')
            // send them to edit page for further work
            nav(`/faculty/edit/${created.slug}`)

        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to create course')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-2xl p-6 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Create New Course</h2>

            <form onSubmit={submit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        className="w-full border px-3 py-2 rounded"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Intro to React"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        className="w-full border px-3 py-2 rounded"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        placeholder="What will learners get from this course?"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <div className="flex gap-2">
                    <button
                        disabled={saving}
                        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
                    >
                        {saving ? 'Creating…' : 'Create'}
                    </button>
                    <button type="button" onClick={() => nav('/faculty')} className="px-4 py-2 rounded bg-gray-200">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
