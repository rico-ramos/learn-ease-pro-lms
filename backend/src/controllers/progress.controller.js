import Course from '../models/Course.js'
import Lesson from '../models/Lesson.js'
import Progress from '../models/Progress.js'

// GET /progress/by-course/:slug  (auth)
export const getByCourseSlug = async (req, res, next) => {
    try {
        const { slug } = req.params
        const course = await Course.findOne({ slug }).select('_id')
        if (!course) return res.status(404).json({ message: 'Course not found' })

        // all lessons for denominator
        const lessons = await Lesson.find({ course: course._id })
            .select('_id title order durationSec')
            .sort({ order: 1, createdAt: 1 })

        // learner's progress for those lessons
        const progList = await Progress.find({
            learner: req.user.id,
            course: course._id,
            lesson: { $in: lessons.map(l => l._id) }
        }).select('lesson completed secondsWatched')

        const progressMap = {}
        progList.forEach(p => {
            progressMap[p.lesson.toString()] = {
                completed: p.completed,
                secondsWatched: p.secondsWatched || 0,
            }
        })

        const completedCount = lessons.reduce((acc, l) => {
            const p = progressMap[l._id.toString()]
            return acc + (p && p.completed ? 1 : 0)
        }, 0)
        const percent = lessons.length
            ? Math.round((completedCount / lessons.length) * 100)
            : 0

        res.json({
            courseId: course._id,
            percent,
            lessons: lessons.map(l => ({
                _id: l._id,
                title: l.title,
                order: l.order,
                durationSec: l.durationSec || 0,
                progress: progressMap[l._id.toString()] || { completed: false, secondsWatched: 0 }
            }))
        })
    } catch (e) { next(e) }
}

// POST /progress/mark  (auth, learner)
// body: { lessonId, completed?, secondsWatched? }
export const mark = async (req, res, next) => {
    try {
        const { lessonId, completed, secondsWatched } = req.body
        if (!lessonId) return res.status(400).json({ message: 'lessonId is required' })

        const lesson = await Lesson.findById(lessonId).select('_id course')
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' })

        const update = {}
        if (typeof completed === 'boolean') update.completed = completed
        if (typeof secondsWatched === 'number' && secondsWatched >= 0) {
            update.secondsWatched = secondsWatched
        }

        const doc = await Progress.findOneAndUpdate(
            {
                learner: req.user.id,
                course: lesson.course,
                lesson: lesson._id
            },
            { $set: { ...update } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).select('lesson completed secondsWatched')

        res.json(doc)
    } catch (e) { next(e) }
}
