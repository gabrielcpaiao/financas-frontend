<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <aside class="w-56 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-1">
      <div class="flex items-center gap-2 px-2 mb-4">
        <div class="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
          <UIcon name="i-heroicons-wallet" class="text-white w-4 h-4" />
        </div>
        <span class="font-medium">Finanças</span>
      </div>

      <UButton to="/" variant="ghost" color="neutral" block class="justify-start" icon="i-heroicons-home">
        Geral
      </UButton>
      <UButton to="/accounts" variant="ghost" color="neutral" block class="justify-start" icon="i-heroicons-building-library">
        Contas
      </UButton>
      <UButton to="/categories" variant="ghost" color="neutral" block class="justify-start" icon="i-heroicons-tag">
        Categorias
      </UButton>
      <UButton to="/transactions" variant="ghost" color="neutral" block class="justify-start" icon="i-heroicons-banknotes">
        Lançamentos
      </UButton>
      <UButton to="/credit-cards" variant="ghost" color="neutral" block class="justify-start" icon="i-heroicons-credit-card">
        Cartão de crédito
      </UButton>
      <UButton to="/budget" variant="ghost" color="neutral" block class="justify-start" icon="i-heroicons-calculator">
        Orçamento
      </UButton>
      <UButton to="/investments" variant="ghost" color="neutral" block class="justify-start" icon="i-heroicons-chart-bar">
        Investimentos
      </UButton>

      <div class="flex-1" />

      <UButton variant="ghost" color="neutral" block class="justify-start" icon="i-heroicons-arrow-right-on-rectangle" @click="handleLogout">
        Sair
      </UButton>
    </aside>

    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  navigateTo('/login')
}
</script>