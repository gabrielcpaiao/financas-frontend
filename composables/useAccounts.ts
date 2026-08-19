export interface Account {
  id: number
  name: string
  type: 'CHECKING' | 'SAVINGS' | 'DIGITAL' | 'CASH' | 'OTHER'
  initialBalance: number
  active: boolean
}

export interface AccountInput {
  name: string
  type: Account['type']
  initialBalance: number
}

export const ACCOUNT_TYPE_LABELS: Record<Account['type'], string> = {
  CHECKING: 'Conta corrente',
  SAVINGS: 'Poupança',
  DIGITAL: 'Conta digital',
  CASH: 'Dinheiro',
  OTHER: 'Outro'
}

export function useAccounts() {
  const api = useApi()

  const { data: accounts, pending, refresh } = useAsyncData<Account[]>(
    'accounts',
    () => api.get('/accounts'),
    { default: () => [] }
  )

  async function create(input: AccountInput) {
    await api.post('/accounts', input)
    await refresh()
  }

  async function update(id: number, input: AccountInput) {
    await api.put(`/accounts/${id}`, input)
    await refresh()
  }

  async function deactivate(id: number) {
    await api.del(`/accounts/${id}`)
    await refresh()
  }

  return { accounts, pending, refresh, create, update, deactivate }
}