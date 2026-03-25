import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    timeout: 15000,
})

// Attach JWT token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fb_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Auto-handle 401 (expired token)
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('fb_token')
            window.location.href = '/auth/login'
        }
        return Promise.reject(err)
    }
)

export default api
