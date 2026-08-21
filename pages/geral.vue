<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-medium">Geral</h1>
      <div class="flex items-center gap-2 text-sm">
        <UButton icon="i-heroicons-chevron-left" variant="ghost" color="neutral" size="xs" @click="year--" />
        <span class="font-medium">{{ year }}</span>
        <UButton icon="i-heroicons-chevron-right" variant="ghost" color="neutral" size="xs" @click="year++" />
      </div>
    </div>

    <div v-if="pending" class="text-sm text-neutral-500">Carregando...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm whitespace-nowrap">
        <thead>
          <tr class="text-left text-neutral-500 border-b">
            <th class="font-normal py-2 pr-4">Mês</th>
            <th class="font-normal py-2 pr-4 text-right">Salário</th>
            <th class="font-normal py-2 pr-4 text-right">Despesas fixas</th>
            <th class="font-normal py-2 pr-4 text-right">Cartão crédito</th>
            <th class="font-normal py-2 pr-4 text-right">Gastos variáveis</th>
            <th class="font-normal py-2 pr-4 text-right">Investimentos</th>
            <th class="font-normal py-2 pr-4 text-right">Renda extra</th>
            <th class="font-normal py-2 text-right">Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in months ?? []" :key="row.referenceMonth" class="border-b">
            <td class="py-2 pr-4">{{ monthName(row.referenceMonth) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(row.salary) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(row.fixedExpenses) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(row.creditCardExpenses) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(row.variableExpenses) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(row.investments) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(row.extraIncome) }}</td>
            <td class="py-2 text-right font-medium" :class="row.result < 0 ? 'text-error-600' : 'text-success-600'">
              {{ formatCurrency(row.result) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t font-medium">
            <td class="py-2 pr-4">Total</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(totals.salary) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(totals.fixedExpenses) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(totals.creditCardExpenses) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(totals.variableExpenses) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(totals.investments) }}</td>
            <td class="py-2 pr-4 text-right">{{ formatCurrency(totals.extraIncome) }}</td>
            <td class="py-2 text-right" :class="totals.result < 0 ? 'text-error-600' : 'text-success-600'">
              {{ formatCurrency(totals.result) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const year = ref(new Date().getFullYear())
const yearRef = computed({ get: () => year.value, set: (v) => (year.value = v) })

const { months, pending } = useMonthlySummary(yearRef)

function monthName(referenceMonth: string) {
  const d = new Date(referenceMonth + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { month: 'long' })
}

function formatCurrency(value: number) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const totals = computed(() => {
  const rows = months.value ?? []
  return rows.reduce((acc, row) => ({
    salary: acc.salary + row.salary,
    fixedExpenses: acc.fixedExpenses + row.fixedExpenses,
    creditCardExpenses: acc.creditCardExpenses + row.creditCardExpenses,
    variableExpenses: acc.variableExpenses + row.variableExpenses,
    investments: acc.investments + row.investments,
    extraIncome: acc.extraIncome + row.extraIncome,
    result: acc.result + row.result
  }), { salary: 0, fixedExpenses: 0, creditCardExpenses: 0, variableExpenses: 0, investments: 0, extraIncome: 0, result: 0 })
})
</script>
