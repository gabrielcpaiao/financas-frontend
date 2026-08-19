export interface Transaction {
  id: number
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'CARD_PAYMENT' | 'INVESTMENT'
  transactionDate: string
  description: string
  amount: number
  sourceAccountId: number | null
  destinationAccountId: number | null
  categoryId: number | null
  expenseType: 'FIXED' | 'VARIABLE' | null
  paymentMethod: 'CASH' | 'DEBIT_CARD' | 'PIX' | 'CREDIT_CARD' | null
  notes: string | null
}

export interface TransactionInput {
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  transactionDate: string
  description: string
  amount: number
  sourceAccountId: number | null
  destinationAccountId: number | null
  categoryId: number | null
  expenseType: 'FIXED' | 'VARIABLE' | null
  paymentMethod: 'CASH' | 'DEBIT_CARD' | 'PIX' | 'CREDIT_CARD' | null
  notes: string | null
}

export function useTransactions(from: Ref<string>, to: Ref<string>) {
  const api = useApi()

  const { data: transactions, pending, refresh } = useAsyncData<Transaction[]>(
    'transactions',
    () => api.get(`/transactions?from=${from.value}&to=${to.value}`),
    { default: () => [], watch: [from, to] }
  )

  async function create(input: TransactionInput) {
    await api.post('/transactions', input)
    await refresh()
  }

  async function update(id: number, input: TransactionInput) {
    await api.put(`/transactions/${id}`, input)
    await refresh()
  }

  async function remove(id: number) {
    await api.del(`/transactions/${id}`)
    await refresh()
  }

  return { transactions, pending, refresh, create, update, remove }
}