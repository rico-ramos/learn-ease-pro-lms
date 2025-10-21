import User from '../models/User.js'

// GET /users?role=faculty|learner
export const list = async (req, res, next) => {
    try {
        const role = req.query.role
        const filter = role ? { role } : { role: { $in: ['faculty', 'learner', 'admin'] } }
        const users = await User.find(filter)
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(500)
        res.json(users)
    } catch (e) { next(e) }
}

// GET /users/:id
export const getOne = async (req, res, next) => {
    try {
        const u = await User.findById(req.params.id).select('name email role avatarUrl bio createdAt')
        if (!u) return res.status(404).json({ message: 'Not found' })
        res.json(u)
    } catch (e) { next(e) }
}
