import { defineStore } from 'pinia'

interface AuthUser {
  name: string
  email: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as AuthUser | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    setSession(token: string, user: AuthUser) {
      this.token = token
      this.user = user
      if (import.meta.client) {
        localStorage.setItem('financas_token', token)
        localStorage.setItem('financas_user', JSON.stringify(user))
      }
    },

    restoreSession() {
      if (import.meta.client) {
        const token = localStorage.getItem('financas_token')
        const user = localStorage.getItem('financas_user')
        if (token) this.token = token
        if (user) this.user = JSON.parse(user)
      }
    },

    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('financas_token')
      }
    }
  }
})
