import axios from 'axios'
import type { ApiError } from '../types'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send httpOnly cookie
  timeout: 15_000,
})

// Request interceptor — attach JWT from localStorage for admin calls
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — normalize errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      if (window.location.pathname.startsWith('/admin/dashboard')) {
        window.location.href = '/admin'
      }
    }
    return Promise.reject(error)
  }
)

export default api
