import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import express from 'express'
import jwt from 'jsonwebtoken'

const originalCwd = process.cwd()
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-uploads-test-'))
let server
let baseUrl
const secret = 'test-only-upload-secret'

before(async () => {
    process.chdir(scratch)
    process.env.JWT_SECRET = secret
    const { default: routes } = await import('../src/routes/uploads.routes.js')
    const app = express()
    app.use('/api/v1/uploads', routes)
    app.use((err, _req, res, _next) => res.status(err.status || 500).json({ message: err.message }))
    server = app.listen(0)
    await new Promise(resolve => server.once('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}/api/v1/uploads`
})

after(async () => {
    if (server) await new Promise(resolve => server.close(resolve))
    process.chdir(originalCwd)
    fs.rmSync(scratch, { recursive: true, force: true })
})

const token = role => jwt.sign({ sub: 'faculty-1', role }, secret)
function form(name = 'lesson.pdf', type = 'application/pdf', bytes = new Uint8Array([37, 80, 68, 70])) {
    const data = new FormData()
    data.append('file', new Blob([bytes], { type }), name)
    return data
}
async function post(body, role = 'faculty') {
    return fetch(baseUrl, {
        method: 'POST',
        headers: role ? { Authorization: `Bearer ${token(role)}` } : {},
        body
    })
}
function uploadedNames() {
    return fs.readdirSync(path.join(scratch, 'uploads'))
}

test('faculty can upload a PDF and receives a file URL', async () => {
    const response = await post(form())
    assert.equal(response.status, 201)
    const result = await response.json()
    assert.match(result.url, /^\/uploads\/\d+-\d+\.pdf$/)
    assert.ok(uploadedNames().includes(result.filename))
})

test('administrator can upload MP4 and WebM files', async () => {
    for (const [filename, mime] of [['movie.mp4', 'video/mp4'], ['movie.webm', 'video/webm']]) {
        const response = await post(form(filename, mime), 'admin')
        assert.equal(response.status, 201)
    }
})

test('unsupported extension is rejected and not written', async () => {
    const beforeCount = uploadedNames().length
    const response = await post(form('script.js', 'text/javascript'))
    assert.equal(response.status, 400)
    assert.equal(uploadedNames().length, beforeCount)
})

test('mismatched extension and MIME is rejected', async () => {
    const response = await post(form('fake.pdf', 'video/mp4'))
    assert.equal(response.status, 400)
})

test('missing file returns a clear 400 response', async () => {
    const response = await post(new FormData())
    assert.equal(response.status, 400)
    assert.match((await response.json()).message, /File is required/)
})

test('file over 25 MB is rejected without leaving a file', async () => {
    const beforeCount = uploadedNames().length
    const response = await post(form('huge.pdf', 'application/pdf', new Uint8Array(25 * 1024 * 1024 + 1)))
    assert.equal(response.status, 413)
    assert.equal(uploadedNames().length, beforeCount)
})

test('unauthenticated requests are rejected', async () => {
    const response = await post(form(), null)
    assert.equal(response.status, 401)
})

test('learners cannot upload files', async () => {
    const response = await post(form(), 'learner')
    assert.equal(response.status, 403)
})
