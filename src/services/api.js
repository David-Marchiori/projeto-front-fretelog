import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authService = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
}

// Remetentes
export const remetenteService = {
  list: () => api.get('/senders'),
  create: (data) => api.post('/senders', data),
  update: (id, data) => api.put(`/senders/${id}`, data),
  delete: (id) => api.delete(`/senders/${id}`),
}

// Destinatários
export const destinatarioService = {
  list: () => api.get('/recipients'),
  create: (data) => api.post('/recipients', data),
  update: (id, data) => api.put(`/recipients/${id}`, data),
  delete: (id) => api.delete(`/recipients/${id}`),
}

// Cotações
export const cotacaoService = {
  calcular: (data) => api.post('/quotes', data),
  saveQuote: (data) => api.post('/quotes', data),
  list: () => api.get('/shipments'),
}
