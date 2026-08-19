<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-medium">Geral</h1>
      <div class="flex items-center gap-2 text-sm">
        <UButton icon="i-heroicons-chevron-left" variant="ghost" color="neutral" size="xs" @click="previousMonth" />
        <span class="font-medium">{{ monthLabel }}</span>
        <UButton icon="i-heroicons-chevron-right" variant="ghost" color="neutral" size="xs" @click="nextMonth" />
      </div>
    </div>

    <div v-if="pending" class="text-sm text-gray-500">Carregando...</div>

    <template v-else-if="summary">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <UCard>
          <p class="text-xs text-gray-500 mb-1">Renda</p>
          <p class="text-xl font-medium">{{ formatCurrency(summary.income) }}</p>
        </UCard>
        <UCard>
          <p class="text-xs text-gray-500 mb-1">Despesas fixas</p>
          <p class="text-xl font-medium">{{ formatCurrency(summary.fixedExpenses) }}</p>
        </UCard>
        <UCard>
          <p class="text-xs text-gray-500 mb-1">Cartão de crédito</p>
          <p class="text-xl font-medium" :class="summary.creditCard > 0 ? 'text-error-600' : ''">
            {{ formatCurrency(summary.creditCard) }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs text-gray-500 mb-1">Gastos variáveis</p>
          <p class="text-xl font-medium">{{ formatCurrency(summary.variableExpenses) }}</p>
        </UCard>
        <UCard>
          <p class="text-xs text-gray-500 mb-1">Investimentos</p>
          <p class="text-xl font-medium">{{ formatCurrency(summary.investments) }}</p>
        </UCard>
        <UCard :class="summary.result >= 0 ? 'bg-success-50 dark:bg-success-950' : 'bg-error-50 dark:bg-error-950'">
          <p class="text-xs mb-1" :class="summary.result >= 0 ? 'text-success-700' : 'text-error-700'">Resultado</p>
          <p class="text-xl font-medium" :class="summary.result >= 0 ? 'text-success-800' : 'text-error-800'">
            {{ formatCurrency(summary.result) }}
          </p>
        </UCard>
      </div>
    </template>

    <p v-else class="text-sm text-gray-500">Não foi possível carregar o resumo do mês.</p>
  </div>
</template>

<script setup lang="ts">
interface DashboardSummary {
  referenceMonth: string
  income: number
  fixedExpenses: number
  creditCard: number
  variableExpenses: number
  investments: number
  result: number
}

const api = useApi()
const currentMonth = ref(new Date())

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
)

const { data: summary, pending, refresh } = await useAsyncData<DashboardSummary>(
  'dashboard-summary',
  () => api.get(`/dashboard/summary?month=${monthParam()}`),
  { watch: [currentMonth] }
)

function monthParam() {
  const y = currentMonth.value.getFullYear()
  const m = String(currentMonth.value.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function previousMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d
}

function nextMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d
}

function formatCurrency(value: number) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>
