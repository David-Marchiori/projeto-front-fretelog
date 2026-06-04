import { defineStore } from 'pinia'
import { authService } from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const { data } = await authService.login({ email, password })
        this.token = data.token || data.access_token
        this.user = data.user
        localStorage.setItem('token', this.token)
        return true
      } catch (e) {
        this.error = e.response?.data?.message || 'Credenciais inválidas'
        return false
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try { await authService.logout() } catch {}
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },
    async fetchUser() {
      if (!this.token) return
      try {
        const { data } = await authService.me()
        this.user = data
      } catch {}
    }
  }
})
