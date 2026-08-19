<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-medium">Lançamentos</h1>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-sm">
          <UButton icon="i-heroicons-chevron-left" variant="ghost" color="neutral" size="xs" @click="previousMonth" />
          <span class="font-medium">{{ monthLabel }}</span>
          <UButton icon="i-heroicons-chevron-right" variant="ghost" color="neutral" size="xs" @click="nextMonth" />
        </div>
        <UButton icon="i-heroicons-plus" @click="openCreate">Novo lançamento</UButton>
      </div>
    </div>

    <UTable :rows="transactions ?? []" :columns="columns" :loading="pending">
      <template #type-data="{ row }">
        <UBadge :color="typeColor(row.type)" variant="subtle">{{ TYPE_LABELS[row.type] }}</UBadge>
      </template>
      <template #categoryId-data="{ row }">
        {{ categoryName(row.categoryId) }}
      </template>
      <template #amount-data="{ row }">
        <span :class="row.type === 'EXPENSE' ? 'text-error-600' : row.type === 'INCOME' ? 'text-success-600' : ''">
          {{ formatCurrency(row.amount) }}
        </span>
      </template>
      <template #actions-data="{ row }">
        <div class="flex gap-2 justify-end">
          <UButton icon="i-heroicons-pencil" size="xs" variant="ghost" color="neutral" @click="openEdit(row)" />
          <UButton icon="i-heroicons-trash" size="xs" variant="ghost" color="error" @click="confirmDelete(row)" />
        </div>
      </template>
    </UTable>

    <UModal v-model="modalOpen">
      <UCard>
        <template #header>
          <span class="font-medium">{{ editingId ? 'Editar lançamento' : 'Novo lançamento' }}</span>
        </template>

        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <UFormField label="Tipo">
            <USelect v-model="form.type" :options="typeOptions" class="w-full" />
          </UFormField>

          <UFormField label="Data">
            <UInput v-model="form.transactionDate" type="date" required class="w-full" />
          </UFormField>

          <UFormField label="Descrição">
            <UInput v-model="form.description" required class="w-full" />
          </UFormField>

          <UFormField label="Valor">
            <UInput v-model.number="form.amount" type="number" step="0.01" min="0.01" required class="w-full" />
          </UFormField>

          <UFormField v-if="form.type === 'INCOME' || form.type === 'EXPENSE'" label="Categoria">
            <USelect v-model="form.categoryId" :options="categoryOptions" class="w-full" />
          </UFormField>

          <UFormField v-if="form.type === 'EXPENSE'" label="Tipo de despesa">
            <USelect v-model="form.expenseType" :options="expenseTypeOptions" class="w-full" />
          </UFormField>

          <UFormField v-if="form.type === 'INCOME' || form.type === 'EXPENSE'" label="Forma de pagamento">
            <USelect v-model="form.paymentMethod" :options="paymentMethodOptions" class="w-full" />
          </UFormField>

          <UFormField v-if="showSourceAccount" label="Conta de origem">
            <USelect v-model="form.sourceAccountId" :options="accountOptions" class="w-full" />
          </UFormField>

          <UFormField v-if="form.type === 'INCOME' || form.type === 'TRANSFER'" label="Conta de destino">
            <USelect v-model="form.destinationAccountId" :options="accountOptions" class="w-full" />
          </UFormField>

          <UFormField label="Observações">
            <UTextarea v-model="form.notes" class="w-full" />
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
import type { Transaction, TransactionInput } from '~/composables/useTransactions'

const currentMonth = ref(new Date())

const from = computed(() => {
  const d = currentMonth.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
})
const to = computed(() => {
  const d = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 0)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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

const { transactions, pending, create, update, remove } = useTransactions(from, to)
const { accounts } = useAccounts()
const { categories } = useCategories()
const toast = useToast()

const columns = [
  { key: 'transactionDate', label: 'Data' },
  { key: 'description', label: 'Descrição' },
  { key: 'type', label: 'Tipo' },
  { key: 'categoryId', label: 'Categoria' },
  { key: 'amount', label: 'Valor' },
  { key: 'actions', label: '', class: 'text-right' }
]

const TYPE_LABELS: Record<string, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferência',
  CARD_PAYMENT: 'Pagamento de fatura',
  INVESTMENT: 'Investimento'
}

function typeColor(type: string) {
  if (type === 'INCOME') return 'success'
  if (type === 'EXPENSE') return 'error'
  return 'neutral'
}

// Só INCOME/EXPENSE/TRANSFER são criáveis por aqui — CARD_PAYMENT e
// INVESTMENT dependem dos módulos de Cartão (Fase 4) e Investimentos
// (Fase 5); o backend rejeita esses dois tipos neste endpoint.
const typeOptions = [
  { label: 'Receita', value: 'INCOME' },
  { label: 'Despesa', value: 'EXPENSE' },
  { label: 'Transferência', value: 'TRANSFER' }
]

const expenseTypeOptions = [
  { label: 'Fixa', value: 'FIXED' },
  { label: 'Variável', value: 'VARIABLE' }
]

const paymentMethodOptions = [
  { label: 'Dinheiro', value: 'CASH' },
  { label: 'Débito', value: 'DEBIT_CARD' },
  { label: 'Pix', value: 'PIX' },
  { label: 'Cartão de crédito', value: 'CREDIT_CARD' }
]

const accountOptions = computed(() => (accounts.value ?? []).map(a => ({ label: a.name, value: a.id })))

const categoryOptions = computed(() =>
  (categories.value ?? []).filter(c => c.context === form.type).map(c => ({ label: c.name, value: c.id }))
)

// EXPENSE no cartão não usa conta de origem — só é debitado quando a
// fatura é paga (Fase 4). Mesma regra do validateBusinessRules do backend.
const showSourceAccount = computed(() =>
  form.type === 'TRANSFER' || (form.type === 'EXPENSE' && form.paymentMethod !== 'CREDIT_CARD')
)

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const errorMessage = ref('')

const form = reactive<TransactionInput>({
  type: 'EXPENSE',
  transactionDate: new Date().toISOString().slice(0, 10),
  description: '',
  amount: 0,
  sourceAccountId: null,
  destinationAccountId: null,
  categoryId: null,
  expenseType: 'VARIABLE',
  paymentMethod: 'PIX',
  notes: null
})

// Limpa campos que deixam de fazer sentido quando o tipo muda — evita
// mandar pro backend um sourceAccountId de um EXPENSE no cartão, por
// exemplo, e cair na validação 400.
watch(() => form.type, () => {
  form.categoryId = null
  form.sourceAccountId = null
  form.destinationAccountId = null
  form.expenseType = form.type === 'EXPENSE' ? 'VARIABLE' : null
  form.paymentMethod = form.type === 'TRANSFER' ? null : 'PIX'
})

watch(() => form.paymentMethod, () => {
  if (form.type === 'EXPENSE' && form.paymentMethod === 'CREDIT_CARD') {
    form.sourceAccountId = null
  }
})

function resetForm() {
  form.type = 'EXPENSE'
  form.transactionDate = new Date().toISOString().slice(0, 10)
  form.description = ''
  form.amount = 0
  form.sourceAccountId = null
  form.destinationAccountId = null
  form.categoryId = null
  form.expenseType = 'VARIABLE'
  form.paymentMethod = 'PIX'
  form.notes = null
  errorMessage.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  modalOpen.value = true
}

function openEdit(row: Transaction) {
  editingId.value = row.id
  form.type = row.type as TransactionInput['type']
  form.transactionDate = row.transactionDate
  form.description = row.description
  form.amount = row.amount
  form.sourceAccountId = row.sourceAccountId
  form.destinationAccountId = row.destinationAccountId
  form.categoryId = row.categoryId
  form.expenseType = row.expenseType
  form.paymentMethod = row.paymentMethod
  form.notes = row.notes
  errorMessage.value = ''
  modalOpen.value = true
}

function categoryName(categoryId: number | null) {
  if (!categoryId) return '—'
  return categories.value?.find(c => c.id === categoryId)?.name ?? '—'
}

function formatCurrency(value: number) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function handleSubmit() {
  saving.value = true
  errorMessage.value = ''
  try {
    if (editingId.value) {
      await update(editingId.value, { ...form })
      toast.add({ title: 'Lançamento atualizado', color: 'success' })
    } else {
      await create({ ...form })
      toast.add({ title: 'Lançamento criado', color: 'success' })
    }
    modalOpen.value = false
  } catch (e: any) {
    errorMessage.value = e?.data?.message ?? 'Não foi possível salvar o lançamento'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(row: Transaction) {
  if (!confirm(`Excluir o lançamento "${row.description}"?`)) return
  try {
    await remove(row.id)
    toast.add({ title: 'Lançamento excluído', color: 'success' })
  } catch {
    toast.add({ title: 'Erro ao excluir lançamento', color: 'error' })
  }
}
</script>