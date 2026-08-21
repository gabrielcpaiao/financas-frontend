export interface FinancialGoal {
  id: number
  name: string
  targetAmount: number | null
  targetDate: string | null
  active: boolean
  totalContributed: number
}

export interface FinancialGoalInput {
  name: string
  targetAmount: number | null
  targetDate: string | null
}

export function useFinancialGoals() {
  const api = useApi()

  const { data: financialGoals, pending, refresh } = useAsyncData<FinancialGoal[]>(
    'financial-goals',
    () => api.get('/financial-goals'),
    { default: () => [] }
  )

  async function create(input: FinancialGoalInput) {
    await api.post('/financial-goals', input)
    await refresh()
  }

  async function update(id: number, input: FinancialGoalInput) {
    await api.put(`/financial-goals/${id}`, input)
    await refresh()
  }

  async function remove(id: number) {
    await api.del(`/financial-goals/${id}`)
    await refresh()
  }

  return { financialGoals, pending, refresh, create, update, remove }
}
