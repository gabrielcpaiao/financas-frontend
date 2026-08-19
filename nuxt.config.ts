export default defineNuxtConfig({
  compatibilityDate: '2024-08-01',

  // SPA, sem SSR — sistema pessoal autenticado, sem necessidade de SEO
  // (ver arquitetura-tecnica.md, seção 1)
  ssr: false,

  modules: ['@nuxt/ui', '@pinia/nuxt'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080/api/v1'
    }
  },

  app: {
    head: {
      title: 'Finanças'
    }
  }
})
