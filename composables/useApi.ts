// Wrapper único sobre $fetch — todo o app chama isso, nunca $fetch direto.
// Injeta baseURL + token, e trata 401 redirecionando pro login.
// (ver arquitetura-tecnica.md, seção 4.3)
export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  async function request<T>(path: string, options: any = {}): Promise<T> {
    try {
      return await $fetch<T>(path, {
        baseURL: config.public.apiBase,
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {})
        }
      })
    } catch (error: any) {
      if (error?.response?.status === 401) {
        authStore.logout()
        await navigateTo('/login')
      }
      throw error
    }
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
    put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' })
  }
}
