export interface Investment {
  id: number
  name: string
  type: 'CDB' | 'TREASURY' | 'STOCK' | 'ETF' | 'FUND' | 'CRYPTO' | 'OTHER'
  description: string | null
  financialGoalId: number | null
  active: boolean
  totalContributed: number
}

export interface InvestmentInput {
  name: string
  type: Investment['type']
  description: string | null
  financialGoalId: number | null
}

export function useInvestments() {
  const api = useApi()

  const { data: investments, pending, refresh } = useAsyncData<Investment[]>(
    'investments',
    () => api.get('/investments'),
    { default: () => [] }
  )

  async function create(input: InvestmentInput) {
    await api.post('/investments', input)
    await refresh()
  }

  async function update(id: number, input: InvestmentInput) {
    await api.put(`/investments/${id}`, input)
    await refresh()
  }

  async function remove(id: number) {
    await api.del(`/investments/${id}`)
    await refresh()
  }

  return { investments, pending, refresh, create, update, remove }
}
