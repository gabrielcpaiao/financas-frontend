export interface MonthlySummary {
  referenceMonth: string
  salary: number
  extraIncome: number
  fixedExpenses: number
  creditCardExpenses: number
  variableExpenses: number
  investments: number
  result: number
}

export function useMonthlySummary(year: Ref<number>) {
  const api = useApi()

  const { data: months, pending, refresh } = useAsyncData<MonthlySummary[]>(
    () => `monthly-summary-${year.value}`,
    () => api.get(`/monthly-summary/annual?year=${year.value}`),
    { default: () => [], watch: [year] }
  )

  return { months, pending, refresh }
}
