import Course from '../models/Course.js'
import Lesson from '../models/Lesson.js'

// GET /lessons/by-course/:slug  (auth)
export const listByCourseSlug = async (req, res, next) => {
    try {
        const { slug } = req.params
        const course = await Course.findOne({ slug }).select('_id')
        if (!course) return res.status(404).json({ message: 'Course not found' })

        const lessons = await Lesson.find({ course: course._id })
            .select('_id title contentType durationSec order')
            .sort({ order: 1, createdAt: 1 })

        res.json({ courseId: course._id, lessons })
    } catch (e) { next(e) }
}

// POST /lessons/:slug  (faculty/admin) create lesson for course slug
export const createForCourse = async (req, res, next) => {
    try {
        const { slug } = req.params
        const { title, contentType = 'text', contentUrl, text, durationSec = 0, order = 0 } = req.body
        if (!title) return res.status(400).json({ message: 'Title is required' })

        const course = await Course.findOne({ slug }).select('_id createdBy')
        if (!course) return res.status(404).json({ message: 'Course not found' })

        const isOwner = course.createdBy.toString() === req.user.id
        const isAdmin = req.user.role === 'admin'
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' })

        const lesson = await Lesson.create({
            course: course._id, title, contentType, contentUrl, text, durationSec, order
        })
        res.status(201).json(lesson)
    } catch (e) { next(e) }
}

// PATCH /lessons/:id  (faculty/admin) update single lesson
export const updateOne = async (req, res, next) => {
    try {
        const { id } = req.params
        const lesson = await Lesson.findById(id).select('_id course')
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' })

        const course = await Course.findById(lesson.course).select('_id createdBy')
        const isOwner = course.createdBy.toString() === req.user.id
        const isAdmin = req.user.role === 'admin'
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' })

        const fields = ['title', 'contentType', 'contentUrl', 'text', 'durationSec', 'order']
        fields.forEach(f => {
            if (req.body[f] !== undefined) lesson[f] = req.body[f]
        })
        await lesson.save()
        res.json(lesson)
    } catch (e) { next(e) }
}

// DELETE /lessons/:id  (faculty/admin)
export const removeOne = async (req, res, next) => {
    try {
        const { id } = req.params
        const lesson = await Lesson.findById(id).select('_id course')
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' })

        const course = await Course.findById(lesson.course).select('_id createdBy')
        const isOwner = course.createdBy.toString() === req.user.id
        const isAdmin = req.user.role === 'admin'
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' })

        await lesson.deleteOne()
        res.json({ ok: true })
    } catch (e) { next(e) }
}
