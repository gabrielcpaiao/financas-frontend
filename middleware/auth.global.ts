export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.restoreSession()

  if (to.path !== '/login' && !authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
