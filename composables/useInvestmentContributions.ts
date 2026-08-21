export interface InvestmentContribution {
  id: number
  investmentId: number
  accountId: number
  contributionDate: string
  amount: number
  notes: string | null
}

export interface InvestmentContributionInput {
  accountId: number
  contributionDate: string
  amount: number
  notes: string | null
}

export function useInvestmentContributions(investmentId: Ref<number | null>) {
  const api = useApi()

  const { data: contributions, pending, refresh } = useAsyncData<InvestmentContribution[]>(
    () => `investment-contributions-${investmentId.value}`,
    () => (investmentId.value ? api.get(`/investments/${investmentId.value}/contributions`) : Promise.resolve([])),
    { default: () => [], watch: [investmentId] }
  )

  async function create(input: InvestmentContributionInput) {
    if (!investmentId.value) return
    await api.post(`/investments/${investmentId.value}/contributions`, input)
    await refresh()
  }

  return { contributions, pending, refresh, create }
}
