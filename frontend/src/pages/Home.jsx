import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold mb-4">Welcome to the LEARN EASE PRO</h1>
      <p className="mb-6">Browse courses, request access, and learn at your pace.</p>
      <Link className="px-4 py-2 rounded bg-blue-600 text-white" to="/courses">
        Browse Courses
      </Link>
    </section>
  )
}
