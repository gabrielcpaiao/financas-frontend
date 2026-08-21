import type { CreditCardInstallment } from '~/composables/useCreditCardPurchases'

export interface CreditCardInvoice {
  id: number
  creditCardId: number
  referenceMonth: string
  closingDate: string
  dueDate: string
  status: 'OPEN' | 'CLOSED' | 'PAID' | 'OVERDUE'
  paidAt: string | null
  totalAmount: number
  installments: CreditCardInstallment[]
}

export interface CreditCardInvoicePaymentInput {
  sourceAccountId: number
  paymentMethod: 'CASH' | 'DEBIT_CARD' | 'PIX'
  paymentDate: string
  notes: string | null
}

export function useCreditCardInvoices(cardId: Ref<number | null>) {
  const api = useApi()

  const { data: invoices, pending, refresh } = useAsyncData<CreditCardInvoice[]>(
    () => `credit-card-invoices-${cardId.value}`,
    () => (cardId.value ? api.get(`/credit-cards/${cardId.value}/invoices`) : Promise.resolve([])),
    { default: () => [], watch: [cardId] }
  )

  async function pay(invoiceId: number, input: CreditCardInvoicePaymentInput) {
    await api.post(`/credit-card-invoices/${invoiceId}/pay`, input)
    await refresh()
  }

  return { invoices, pending, refresh, pay }
}
