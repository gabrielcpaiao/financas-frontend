<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <UIcon name="i-heroicons-wallet" class="text-white w-4 h-4" />
          </div>
          <span class="font-medium text-lg">Entrar</span>
        </div>
      </template>

      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <UFormField label="Email">
          <UInput v-model="email" type="email" placeholder="voce@email.com" required class="w-full" />
        </UFormField>

        <UFormField label="Senha">
          <UInput v-model="password" type="password" required class="w-full" />
        </UFormField>

        <p v-if="errorMessage" class="text-sm text-error-600">{{ errorMessage }}</p>

        <UButton type="submit" color="primary" block :loading="loading">
          Entrar
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const api = useApi()
const authStore = useAuthStore()

async function handleSubmit() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.post<{ token: string; name: string; email: string }>('/auth/login', {
      email: email.value,
      password: password.value
    })
    authStore.setSession(response.token, { name: response.name, email: response.email })
    await navigateTo('/')
  } catch (e) {
    errorMessage.value = 'Email ou senha inválidos'
  } finally {
    loading.value = false
  }
}
</script>
