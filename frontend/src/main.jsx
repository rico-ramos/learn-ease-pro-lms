import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'
import { AuthProvider } from './components/AuthProvider.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Courses from './pages/Courses.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import Admin from './pages/Dashboard/Admin.jsx'
import Learner from './pages/Dashboard/Learner.jsx'
import Faculty from './pages/Dashboard/Faculty.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NewCourse from './pages/Dashboard/NewCourse.jsx'
import EditCourse from './pages/Dashboard/EditCourse.jsx'
import LessonsEditor from './pages/Dashboard/LessonsEditor.jsx'
import Register from './pages/Register.jsx'
import ToastProvider from './components/ToastProvider.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'courses', element: <Courses /> },
      { path: 'courses/:slug', element: <CourseDetails /> },
      { path: 'register', element: <Register /> },

      {
        path: 'me', element:
          <ProtectedRoute roles={['learner', 'faculty', 'admin']}>
            <Learner />
          </ProtectedRoute>
      },

      {
        path: 'admin', element:
          <ProtectedRoute roles={['admin']}>
            <Admin />
          </ProtectedRoute>
      },

      {
        path: 'faculty', element:
          <ProtectedRoute roles={['faculty', 'admin']}>
            <Faculty />
          </ProtectedRoute>
      },

      {
        path: 'faculty/new', element:
          <ProtectedRoute roles={['faculty', 'admin']}>
            <NewCourse />
          </ProtectedRoute>
      },

      {
        path: 'faculty/edit/:slug', element:
          <ProtectedRoute roles={['faculty', 'admin']}>
            <EditCourse />
          </ProtectedRoute>
      },

      {
        path: 'faculty/edit/:slug/lessons', element:
          <ProtectedRoute roles={['faculty', 'admin']}>
            <LessonsEditor />
          </ProtectedRoute>
      },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </AuthProvider>
)
