<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-medium">Orçamento mensal</h1>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-sm">
          <UButton icon="i-heroicons-chevron-left" variant="ghost" color="neutral" size="xs" @click="previousMonth" />
          <span class="font-medium">{{ monthLabel }}</span>
          <UButton icon="i-heroicons-chevron-right" variant="ghost" color="neutral" size="xs" @click="nextMonth" />
        </div>
        <UButton icon="i-heroicons-plus" @click="openCreateBudget">Definir meta</UButton>
      </div>
    </div>

    <div v-if="pending" class="text-sm text-neutral-500">Carregando...</div>

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="text-left text-neutral-500 border-b">
          <th class="font-normal py-2">Categoria</th>
          <th class="font-normal py-2 text-right">Planejado</th>
          <th class="font-normal py-2 text-right">Realizado</th>
          <th class="font-normal py-2 text-right">Diferença</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="budget in budgets ?? []" :key="budget.id" class="border-b">
          <td class="py-2">{{ budget.categoryName ?? '—' }}</td>
          <td class="py-2 text-right">{{ formatCurrency(budget.plannedAmount) }}</td>
          <td class="py-2 text-right">{{ formatCurrency(budget.realizedAmount) }}</td>
          <td class="py-2 text-right" :class="differenceClass(budget)">
            {{ formatCurrency(budget.difference) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!pending && (budgets ?? []).length === 0" class="text-sm text-neutral-500 mt-4">
      Nenhuma meta definida para {{ monthLabel }}. Clique em "Definir meta" para começar
      (ex: Renda extra R$ 800, Gastos variáveis R$ 350).
    </div>

    <!-- Modal: definir meta -->
    <UModal v-model="modalOpen">
      <UCard>
        <template #header><span class="font-medium">Definir meta do mês</span></template>
        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <UFormField label="Categoria">
            <USelect v-model="form.categoryId" :options="categoryOptions" class="w-full" />
          </UFormField>
          <UFormField label="Valor planejado">
            <UInput v-model.number="form.plannedAmount" type="number" step="0.01" min="0" required class="w-full" />
          </UFormField>
          <p v-if="errorMessage" class="text-sm text-error-600">{{ errorMessage }}</p>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="modalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="saving">Salvar</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { MonthlyBudget, MonthlyBudgetInput } from '~/composables/useMonthlyBudget'

const currentMonth = ref(new Date())

const referenceMonth = computed(() => {
  const d = currentMonth.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
})

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
)

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

const { budgets, pending, upsert } = useMonthlyBudget(referenceMonth)
const { categories } = useCategories()
const toast = useToast()

// Todas as categorias (INCOME e EXPENSE) podem ter meta — Renda extra é
// uma categoria INCOME, gastos variáveis/cartão são categorias EXPENSE.
const categoryOptions = computed(() =>
  (categories.value ?? []).map((c: any) => ({ label: `${c.name} (${c.context === 'INCOME' ? 'Receita' : 'Despesa'})`, value: c.id }))
)

function formatCurrency(value: number) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function differenceClass(budget: MonthlyBudget) {
  // Para categorias de receita (ex: Renda extra), diferença negativa é ruim
  // (ficou abaixo da meta); para despesas, diferença positiva é ruim
  // (passou do planejado) — mas sem o contexto aqui, mantemos neutro e
  // deixamos o valor falar por si (igual ao Excel, que só destaca visualmente).
  return budget.difference > 0 ? 'text-error-600' : 'text-success-600'
}

const modalOpen = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const form = reactive<MonthlyBudgetInput>({ categoryId: 0, referenceMonth: referenceMonth.value, plannedAmount: 0 })

function openCreateBudget() {
  form.categoryId = categoryOptions.value[0]?.value ?? 0
  form.referenceMonth = referenceMonth.value
  form.plannedAmount = 0
  errorMessage.value = ''
  modalOpen.value = true
}

async function handleSubmit() {
  saving.value = true
  errorMessage.value = ''
  try {
    await upsert({ ...form, referenceMonth: referenceMonth.value })
    toast.add({ title: 'Meta salva', color: 'success' })
    modalOpen.value = false
  } catch (e: any) {
    errorMessage.value = e?.data?.message ?? 'Não foi possível salvar a meta'
  } finally {
    saving.value = false
  }
}
</script>
