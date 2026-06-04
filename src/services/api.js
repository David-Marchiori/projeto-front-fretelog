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
  list: () => api.get('/remetentes'),
  create: (data) => api.post('/remetentes', data),
  update: (id, data) => api.put(`/remetentes/${id}`, data),
  delete: (id) => api.delete(`/remetentes/${id}`),
}

// Destinatários
export const destinatarioService = {
  list: () => api.get('/destinatarios'),
  create: (data) => api.post('/destinatarios', data),
  update: (id, data) => api.put(`/destinatarios/${id}`, data),
  delete: (id) => api.delete(`/destinatarios/${id}`),
}

// Cotações
export const cotacaoService = {
  calcular: (data) => api.post('/cotacoes/calcular', data),
  list: () => api.get('/shipments'),
}
