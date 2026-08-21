export interface CreditCard {
  id: number
  name: string
  brand: string | null
  creditLimit: number
  closingDay: number
  dueDay: number
  active: boolean
}

export interface CreditCardInput {
  name: string
  brand: string | null
  creditLimit: number
  closingDay: number
  dueDay: number
}

export function useCreditCards() {
  const api = useApi()

  const { data: creditCards, pending, refresh } = useAsyncData<CreditCard[]>(
    'credit-cards',
    () => api.get('/credit-cards'),
    { default: () => [] }
  )

  async function create(input: CreditCardInput) {
    await api.post('/credit-cards', input)
    await refresh()
  }

  async function update(id: number, input: CreditCardInput) {
    await api.put(`/credit-cards/${id}`, input)
    await refresh()
  }

  async function remove(id: number) {
    await api.del(`/credit-cards/${id}`)
    await refresh()
  }

  return { creditCards, pending, refresh, create, update, remove }
}
