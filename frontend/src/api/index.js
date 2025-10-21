import api from './client.js'

export const Auth = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },
  async register({ name, email, password, role }) {
    const { data } = await api.post('/auth/register', { name, email, password, role })
    return data
  }
}

export const Courses = {
  async list() {
    const { data } = await api.get('/courses');
    return data
  },
  async get(slug) {
    const { data } = await api.get(`/courses/${slug}`);
    return data
  },
  async requestEnroll(courseId) {
    const { data } = await api.post('/enrollments/request', { courseId });
    return data
  },

  // ==== Faculty/Admin ====
  async listMine() {
    const { data } = await api.get('/courses/mine')
    return data
  },
  async create({ title, description, category, level }) {
    const { data } = await api.post('/courses', { title, description, category, level })
    return data
  },
  async update(slug, { title, description, category, level, isPublished }) {
    const { data } = await api.patch(`/courses/${slug}`, { title, description, category, level, isPublished })
    return data
  },
}

export const Enrollments = {
  async listPending() {
    const { data } = await api.get('/enrollments/pending')
    return data
  },
  async approve(id) {
    const { data } = await api.patch(`/enrollments/${id}/approve`)
    return data
  },
  async mine() {
    const { data } = await api.get('/enrollments/mine')
    return data // [{ _id, course: { title, slug }, status, ... }]
  }
}

// ==== Ratings / Feedback ====
export const Feedback = {
  async listForCourse(courseId) {
    const { data } = await api.get(`/feedback/course/${courseId}`)
    return data
  },
  async post(courseId, { rating, comment }) {
    const { data } = await api.post(`/feedback/course/${courseId}`, { rating, comment })
    return data
  }
}

// ==== Lessons (auth required) ====
export const Lessons = {
  // slug = course slug
  async listByCourseSlug(slug) {
    const { data } = await api.get(`/lessons/by-course/${slug}`)
    return data  // { courseId, lessons: [...] }
  }
}

// ==== Progress (auth required) ====
export const Progress = {
  // slug = course slug
  async getByCourseSlug(slug) {
    const { data } = await api.get(`/progress/by-course/${slug}`)
    return data  // { courseId, percent, lessons: [{ _id, title, order, durationSec, progress:{ completed, secondsWatched } }] }
  },
  // lessonId: string, completed?: boolean, secondsWatched?: number
  async mark({ lessonId, completed, secondsWatched }) {
    const { data } = await api.post('/progress/mark', { lessonId, completed, secondsWatched })
    return data
  }
}

// ==== Faculty/Admin Lesson Management ====
export const LessonManage = {
  async create(slug, { title, contentType, contentUrl, text, durationSec, order }) {
    const { data } = await api.post(`/lessons/${slug}`, {
      title, contentType, contentUrl, text, durationSec, order
    })
    return data
  },
  async update(id, fields) {
    const { data } = await api.patch(`/lessons/${id}`, fields)
    return data
  },
  async remove(id) {
    const { data } = await api.delete(`/lessons/${id}`)
    return data
  }
}

// ==== Admin User Management ====
export const Users = {
  async list(role) {
    const { data } = await api.get('/users', { params: role ? { role } : {} })
    return data
  },
  async get(id) { const { data } = await api.get(`/users/${id}`); return data }
}

// ==== File Uploads ====
export const Uploads = {
  async send(file) {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post('/uploads', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data   // { filename, url }
  }
}
