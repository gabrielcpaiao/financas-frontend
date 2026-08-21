export interface CreditCardInstallment {
  id: number
  purchaseId: number
  description: string
  store: string | null
  categoryId: number
  installmentNumber: number
  installmentCount: number
  amount: number
  dueDate: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
}

export interface CreditCardPurchase {
  id: number
  creditCardId: number
  categoryId: number
  description: string
  store: string | null
  totalAmount: number
  installmentCount: number
  purchaseDate: string
  notes: string | null
  installments: CreditCardInstallment[]
}

export interface CreditCardPurchaseInput {
  categoryId: number
  description: string
  store: string | null
  totalAmount: number
  installmentCount: number
  purchaseDate: string
  notes: string | null
  expenseType: 'FIXED' | 'VARIABLE' | null
}

export function useCreditCardPurchases(cardId: Ref<number | null>) {
  const api = useApi()

  const { data: purchases, pending, refresh } = useAsyncData<CreditCardPurchase[]>(
    () => `credit-card-purchases-${cardId.value}`,
    () => (cardId.value ? api.get(`/credit-cards/${cardId.value}/purchases`) : Promise.resolve([])),
    { default: () => [], watch: [cardId] }
  )

  async function create(input: CreditCardPurchaseInput) {
    if (!cardId.value) return
    await api.post(`/credit-cards/${cardId.value}/purchases`, input)
    await refresh()
  }

  return { purchases, pending, refresh, create }
}
