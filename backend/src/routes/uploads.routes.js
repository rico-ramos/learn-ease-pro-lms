import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { requireAuth, requireRole } from '../middleware/auth.js'

const uploadDir = path.resolve('uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const MAX_FILE_BYTES = 25 * 1024 * 1024
const ALLOWED_TYPES = new Map([
    ['.pdf', 'application/pdf'],
    ['.mp4', 'video/mp4'],
    ['.webm', 'video/webm']
])

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname || '').toLowerCase()
        cb(null, unique + ext)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_BYTES },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase()
        if (ALLOWED_TYPES.get(ext) !== file.mimetype) {
            const error = new Error('Only PDF, MP4, and WebM files are allowed')
            error.status = 400
            return cb(error)
        }
        cb(null, true)
    }
}).single('file')

const r = Router()

// Files are public when served by /uploads. Do not upload private information.
r.post('/', requireAuth, requireRole('faculty', 'admin'), (req, res, next) => {
    upload(req, res, err => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({ message: 'File exceeds the 25 MB upload limit' })
                }
                return res.status(400).json({ message: 'Invalid file upload' })
            }
            return next(err)
        }
        if (!req.file) return res.status(400).json({ message: 'File is required' })
        const url = `/uploads/${req.file.filename}`
        return res.status(201).json({ filename: req.file.filename, url })
    })
})

export default r
