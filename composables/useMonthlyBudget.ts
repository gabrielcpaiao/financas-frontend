export interface MonthlyBudget {
  id: number
  categoryId: number
  categoryName: string | null
  referenceMonth: string
  plannedAmount: number
  realizedAmount: number
  difference: number
}

export interface MonthlyBudgetInput {
  categoryId: number
  referenceMonth: string
  plannedAmount: number
}

export function useMonthlyBudget(referenceMonth: Ref<string>) {
  const api = useApi()

  const { data: budgets, pending, refresh } = useAsyncData<MonthlyBudget[]>(
    () => `monthly-budgets-${referenceMonth.value}`,
    () => api.get(`/monthly-budgets?referenceMonth=${referenceMonth.value}`),
    { default: () => [], watch: [referenceMonth] }
  )

  async function upsert(input: MonthlyBudgetInput) {
    await api.post('/monthly-budgets', input)
    await refresh()
  }

  return { budgets, pending, refresh, upsert }
}
