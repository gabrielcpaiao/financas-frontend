<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-medium">Categorias</h1>
      <UButton icon="i-heroicons-plus" @click="openCreate">Nova categoria</UButton>
    </div>

    <UTable :rows="categories ?? []" :columns="columns" :loading="pending">
      <template #color-data="{ row }">
        <span class="inline-block w-4 h-4 rounded-full align-middle mr-2" :style="{ backgroundColor: row.color }" />
        {{ row.color }}
      </template>
      <template #context-data="{ row }">
        <UBadge :color="row.context === 'INCOME' ? 'success' : 'error'" variant="subtle">
          {{ row.context === 'INCOME' ? 'Receita' : 'Despesa' }}
        </UBadge>
      </template>
      <template #parentId-data="{ row }">
        {{ parentName(row.parentId) }}
      </template>
      <template #actions-data="{ row }">
        <div class="flex gap-2 justify-end">
          <UButton icon="i-heroicons-pencil" size="xs" variant="ghost" color="neutral" @click="openEdit(row)" />
          <UButton icon="i-heroicons-trash" size="xs" variant="ghost" color="error" @click="confirmDeactivate(row)" />
        </div>
      </template>
    </UTable>

    <UModal v-model="modalOpen">
      <UCard>
        <template #header>
          <span class="font-medium">{{ editingId ? 'Editar categoria' : 'Nova categoria' }}</span>
        </template>

        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <UFormField label="Nome">
            <UInput v-model="form.name" required class="w-full" />
          </UFormField>

          <UFormField label="Contexto">
            <USelect v-model="form.context" :options="contextOptions" class="w-full" />
          </UFormField>

          <UFormField label="Categoria pai (opcional)">
            <USelect v-model="form.parentId" :options="parentOptions" class="w-full" />
          </UFormField>

          <UFormField label="Cor">
            <input v-model="form.color" type="color" class="w-16 h-9 rounded border border-gray-300 dark:border-gray-700" />
          </UFormField>

          <p v-if="errorMessage" class="text-sm text-error-600">{{ errorMessage }}</p>

          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="modalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="saving">Salvar</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Category, CategoryInput } from '~/composables/useCategories'

const { categories, pending, create, update, deactivate } = useCategories()
const toast = useToast()

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'context', label: 'Contexto' },
  { key: 'parentId', label: 'Categoria pai' },
  { key: 'color', label: 'Cor' },
  { key: 'actions', label: '', class: 'text-right' }
]

const contextOptions = [
  { label: 'Receita', value: 'INCOME' },
  { label: 'Despesa', value: 'EXPENSE' }
]

const parentOptions = computed(() => [
  { label: 'Nenhuma (categoria raiz)', value: null },
  ...(categories.value ?? [])
    .filter(c => c.context === form.context && c.id !== editingId.value)
    .map(c => ({ label: c.name, value: c.id }))
])

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const errorMessage = ref('')

const form = reactive<CategoryInput>({ name: '', color: '#0F766E', context: 'EXPENSE', parentId: null })

function resetForm() {
  form.name = ''
  form.color = '#0F766E'
  form.context = 'EXPENSE'
  form.parentId = null
  errorMessage.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  modalOpen.value = true
}

function openEdit(row: Category) {
  editingId.value = row.id
  form.name = row.name
  form.color = row.color
  form.context = row.context
  form.parentId = row.parentId
  errorMessage.value = ''
  modalOpen.value = true
}

function parentName(parentId: number | null) {
  if (!parentId) return '—'
  return categories.value?.find(c => c.id === parentId)?.name ?? '—'
}

async function handleSubmit() {
  saving.value = true
  errorMessage.value = ''
  try {
    if (editingId.value) {
      await update(editingId.value, { ...form })
      toast.add({ title: 'Categoria atualizada', color: 'success' })
    } else {
      await create({ ...form })
      toast.add({ title: 'Categoria criada', color: 'success' })
    }
    modalOpen.value = false
  } catch (e: any) {
    errorMessage.value = e?.data?.message ?? 'Não foi possível salvar a categoria'
  } finally {
    saving.value = false
  }
}

async function confirmDeactivate(row: Category) {
  if (!confirm(`Desativar a categoria "${row.name}"?`)) return
  try {
    await deactivate(row.id)
    toast.add({ title: 'Categoria desativada', color: 'success' })
  } catch {
    toast.add({ title: 'Erro ao desativar categoria', color: 'error' })
  }
}
</script>