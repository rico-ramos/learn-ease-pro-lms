import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { requireAuth, requireRole } from '../middleware/auth.js'

const uploadDir = path.resolve('uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname || '')
        cb(null, unique + ext)
    }
})
const upload = multer({ storage })

const r = Router()

// POST /uploads  (faculty/admin) — single file
r.post('/', requireAuth, requireRole('faculty', 'admin'), upload.single('file'), (req, res) => {
    // serve files under /uploads/<filename>
    const url = `/uploads/${req.file.filename}`
    res.status(201).json({ filename: req.file.filename, url })
})

export default r
