<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-medium">Cartões de crédito</h1>
      <UButton icon="i-heroicons-plus" @click="openCreateCard">Novo cartão</UButton>
    </div>

    <!-- Seletor de cartão -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <UButton
        v-for="card in creditCards ?? []"
        :key="card.id"
        :variant="selectedCardId === card.id ? 'solid' : 'outline'"
        color="neutral"
        @click="selectedCardId = card.id"
      >
        {{ card.name }}
      </UButton>
    </div>

    <div v-if="!selectedCardId" class="text-sm text-neutral-500">
      Selecione ou crie um cartão para ver as faturas.
    </div>

    <template v-else>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-medium">Faturas</h2>
        <UButton icon="i-heroicons-plus" variant="outline" @click="openCreatePurchase">Nova compra</UButton>
      </div>

      <div v-if="invoicesPending" class="text-sm text-neutral-500">Carregando faturas...</div>

      <div v-for="invoice in invoices ?? []" :key="invoice.id" class="mb-6 border rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="font-medium">{{ formatMonth(invoice.referenceMonth) }}</span>
            <UBadge class="ml-2" :color="statusColor(invoice.status)" variant="subtle">
              {{ STATUS_LABELS[invoice.status] }}
            </UBadge>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-medium">{{ formatCurrency(invoice.totalAmount) }}</span>
            <UButton
              v-if="invoice.status !== 'PAID'"
              size="xs"
              @click="openPayInvoice(invoice)"
            >
              Pagar fatura
            </UButton>
          </div>
        </div>

        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-neutral-500">
              <th class="font-normal pb-1">Compra</th>
              <th class="font-normal pb-1">Parcela</th>
              <th class="font-normal pb-1 text-right">Valor</th>
              <th class="font-normal pb-1 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in invoice.installments" :key="item.id" class="border-t">
              <td class="py-1">{{ item.description }} <span v-if="item.store" class="text-neutral-400">· {{ item.store }}</span></td>
              <td class="py-1">{{ item.installmentNumber }}/{{ item.installmentCount }}</td>
              <td class="py-1 text-right">{{ formatCurrency(item.amount) }}</td>
              <td class="py-1 text-right">{{ INSTALLMENT_STATUS_LABELS[item.status] }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!invoicesPending && (invoices ?? []).length === 0" class="text-sm text-neutral-500">
        Nenhuma fatura ainda. Lance uma compra para começar.
      </div>
    </template>

    <!-- Modal: novo cartão -->
    <UModal v-model="cardModalOpen">
      <UCard>
        <template #header>
          <span class="font-medium">Novo cartão</span>
        </template>
        <form class="flex flex-col gap-4" @submit.prevent="handleCardSubmit">
          <UFormField label="Nome"><UInput v-model="cardForm.name" required class="w-full" /></UFormField>
          <UFormField label="Bandeira"><UInput v-model="cardForm.brand" class="w-full" /></UFormField>
          <UFormField label="Limite">
            <UInput v-model.number="cardForm.creditLimit" type="number" step="0.01" min="0" required class="w-full" />
          </UFormField>
          <UFormField label="Dia de fechamento">
            <UInput v-model.number="cardForm.closingDay" type="number" min="1" max="31" required class="w-full" />
          </UFormField>
          <UFormField label="Dia de vencimento">
            <UInput v-model.number="cardForm.dueDay" type="number" min="1" max="31" required class="w-full" />
          </UFormField>
          <p v-if="cardError" class="text-sm text-error-600">{{ cardError }}</p>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="cardModalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="cardSaving">Salvar</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal: nova compra -->
    <UModal v-model="purchaseModalOpen">
      <UCard>
        <template #header>
          <span class="font-medium">Nova compra no cartão</span>
        </template>
        <form class="flex flex-col gap-4" @submit.prevent="handlePurchaseSubmit">
          <UFormField label="Descrição"><UInput v-model="purchaseForm.description" required class="w-full" /></UFormField>
          <UFormField label="Loja"><UInput v-model="purchaseForm.store" class="w-full" /></UFormField>
          <UFormField label="Categoria">
            <USelect v-model="purchaseForm.categoryId" :options="expenseCategoryOptions" class="w-full" />
          </UFormField>
          <UFormField label="Tipo de despesa">
            <USelect v-model="purchaseForm.expenseType" :options="expenseTypeOptions" class="w-full" />
          </UFormField>
          <UFormField label="Valor total">
            <UInput v-model.number="purchaseForm.totalAmount" type="number" step="0.01" min="0.01" required class="w-full" />
          </UFormField>
          <UFormField label="Número de parcelas">
            <UInput v-model.number="purchaseForm.installmentCount" type="number" min="1" max="48" required class="w-full" />
          </UFormField>
          <UFormField label="Data da compra">
            <UInput v-model="purchaseForm.purchaseDate" type="date" required class="w-full" />
          </UFormField>
          <UFormField label="Observações"><UTextarea v-model="purchaseForm.notes" class="w-full" /></UFormField>
          <p v-if="purchaseError" class="text-sm text-error-600">{{ purchaseError }}</p>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="purchaseModalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="purchaseSaving">Salvar</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal: pagar fatura -->
    <UModal v-model="payModalOpen">
      <UCard>
        <template #header>
          <span class="font-medium">Pagar fatura</span>
        </template>
        <form class="flex flex-col gap-4" @submit.prevent="handlePaySubmit">
          <UFormField label="Conta de origem">
            <USelect v-model="payForm.sourceAccountId" :options="accountOptions" class="w-full" />
          </UFormField>
          <UFormField label="Forma de pagamento">
            <USelect v-model="payForm.paymentMethod" :options="payMethodOptions" class="w-full" />
          </UFormField>
          <UFormField label="Data do pagamento">
            <UInput v-model="payForm.paymentDate" type="date" required class="w-full" />
          </UFormField>
          <p v-if="payError" class="text-sm text-error-600">{{ payError }}</p>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="payModalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="paySaving">Confirmar pagamento</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { CreditCardInput } from '~/composables/useCreditCards'
import type { CreditCardPurchaseInput } from '~/composables/useCreditCardPurchases'
import type { CreditCardInvoice, CreditCardInvoicePaymentInput } from '~/composables/useCreditCardInvoices'

const { creditCards, create: createCard } = useCreditCards()
const { accounts } = useAccounts()
const { categories } = useCategories()
const toast = useToast()

const selectedCardId = ref<number | null>(null)

// Seleciona o primeiro cartão automaticamente quando a lista carrega
watch(creditCards, (list) => {
  if (!selectedCardId.value && list && list.length > 0) {
    selectedCardId.value = list[0].id
  }
}, { immediate: true })

const selectedCardIdRef = computed(() => selectedCardId.value)
const { invoices, pending: invoicesPending, refresh: refreshInvoices } = useCreditCardInvoices(selectedCardIdRef)
const { create: createPurchase } = useCreditCardPurchases(selectedCardIdRef)
const { pay } = useCreditCardInvoices(selectedCardIdRef)

const expenseCategoryOptions = computed(() =>
  (categories.value ?? []).filter((c: any) => c.context === 'EXPENSE').map((c: any) => ({ label: c.name, value: c.id }))
)
const accountOptions = computed(() => (accounts.value ?? []).map((a: any) => ({ label: a.name, value: a.id })))

const expenseTypeOptions = [
  { label: 'Fixa', value: 'FIXED' },
  { label: 'Variável', value: 'VARIABLE' }
]
const payMethodOptions = [
  { label: 'Dinheiro', value: 'CASH' },
  { label: 'Débito', value: 'DEBIT_CARD' },
  { label: 'Pix', value: 'PIX' }
]

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberta',
  CLOSED: 'Fechada',
  PAID: 'Paga',
  OVERDUE: 'Vencida'
}
const INSTALLMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Paga',
  OVERDUE: 'Vencida',
  CANCELLED: 'Cancelada'
}

function statusColor(status: string) {
  if (status === 'PAID') return 'success'
  if (status === 'OVERDUE') return 'error'
  return 'neutral'
}

function formatCurrency(value: number) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatMonth(referenceMonth: string) {
  const d = new Date(referenceMonth + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

// ---- Cartão ----
const cardModalOpen = ref(false)
const cardSaving = ref(false)
const cardError = ref('')
const cardForm = reactive<CreditCardInput>({ name: '', brand: null, creditLimit: 0, closingDay: 1, dueDay: 10 })

function openCreateCard() {
  cardForm.name = ''
  cardForm.brand = null
  cardForm.creditLimit = 0
  cardForm.closingDay = 1
  cardForm.dueDay = 10
  cardError.value = ''
  cardModalOpen.value = true
}

async function handleCardSubmit() {
  cardSaving.value = true
  cardError.value = ''
  try {
    await createCard({ ...cardForm })
    toast.add({ title: 'Cartão criado', color: 'success' })
    cardModalOpen.value = false
  } catch (e: any) {
    cardError.value = e?.data?.message ?? 'Não foi possível salvar o cartão'
  } finally {
    cardSaving.value = false
  }
}

// ---- Compra ----
const purchaseModalOpen = ref(false)
const purchaseSaving = ref(false)
const purchaseError = ref('')
const purchaseForm = reactive<CreditCardPurchaseInput>({
  categoryId: 0,
  description: '',
  store: null,
  totalAmount: 0,
  installmentCount: 1,
  purchaseDate: new Date().toISOString().slice(0, 10),
  notes: null,
  expenseType: 'VARIABLE'
})

function openCreatePurchase() {
  purchaseForm.categoryId = expenseCategoryOptions.value[0]?.value ?? 0
  purchaseForm.description = ''
  purchaseForm.store = null
  purchaseForm.totalAmount = 0
  purchaseForm.installmentCount = 1
  purchaseForm.purchaseDate = new Date().toISOString().slice(0, 10)
  purchaseForm.notes = null
  purchaseForm.expenseType = 'VARIABLE'
  purchaseError.value = ''
  purchaseModalOpen.value = true
}

async function handlePurchaseSubmit() {
  purchaseSaving.value = true
  purchaseError.value = ''
  try {
    await createPurchase({ ...purchaseForm })
    await refreshInvoices()
    toast.add({ title: 'Compra lançada', color: 'success' })
    purchaseModalOpen.value = false
  } catch (e: any) {
    purchaseError.value = e?.data?.message ?? 'Não foi possível lançar a compra'
  } finally {
    purchaseSaving.value = false
  }
}

// ---- Pagamento de fatura ----
const payModalOpen = ref(false)
const paySaving = ref(false)
const payError = ref('')
const payingInvoice = ref<CreditCardInvoice | null>(null)
const payForm = reactive<CreditCardInvoicePaymentInput>({
  sourceAccountId: 0,
  paymentMethod: 'PIX',
  paymentDate: new Date().toISOString().slice(0, 10),
  notes: null
})

function openPayInvoice(invoice: CreditCardInvoice) {
  payingInvoice.value = invoice
  payForm.sourceAccountId = accountOptions.value[0]?.value ?? 0
  payForm.paymentMethod = 'PIX'
  payForm.paymentDate = new Date().toISOString().slice(0, 10)
  payForm.notes = null
  payError.value = ''
  payModalOpen.value = true
}

async function handlePaySubmit() {
  if (!payingInvoice.value) return
  paySaving.value = true
  payError.value = ''
  try {
    await pay(payingInvoice.value.id, { ...payForm })
    toast.add({ title: 'Fatura paga', color: 'success' })
    payModalOpen.value = false
  } catch (e: any) {
    payError.value = e?.data?.message ?? 'Não foi possível pagar a fatura'
  } finally {
    paySaving.value = false
  }
}
</script>
