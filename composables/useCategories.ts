export interface Category {
  id: number
  name: string
  color: string
  context: 'INCOME' | 'EXPENSE'
  parentId: number | null
  active: boolean
}

export interface CategoryInput {
  name: string
  color: string
  context: Category['context']
  parentId: number | null
}

export function useCategories() {
  const api = useApi()

  const { data: categories, pending, refresh } = useAsyncData<Category[]>(
    'categories',
    () => api.get('/categories'),
    { default: () => [] }
  )

  async function create(input: CategoryInput) {
    await api.post('/categories', input)
    await refresh()
  }

  async function update(id: number, input: CategoryInput) {
    await api.put(`/categories/${id}`, input)
    await refresh()
  }

  async function deactivate(id: number) {
    await api.del(`/categories/${id}`)
    await refresh()
  }

  return { categories, pending, refresh, create, update, deactivate }
}