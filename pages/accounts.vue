<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-medium">Contas</h1>
      <UButton icon="i-heroicons-plus" @click="openCreate">Nova conta</UButton>
    </div>

    <UTable :rows="accounts ?? []" :columns="columns" :loading="pending">
      <template #type-data="{ row }">
        {{ ACCOUNT_TYPE_LABELS[row.type] }}
      </template>
      <template #initialBalance-data="{ row }">
        {{ formatCurrency(row.initialBalance) }}
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
          <span class="font-medium">{{ editingId ? 'Editar conta' : 'Nova conta' }}</span>
        </template>

        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          
          <UFormField label="Nome">
            <UInput
              v-model="form.name"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField label="Tipo">
            <USelect
              v-model="form.type"
              :options="typeOptions"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Saldo inicial">
            <UInput
              v-model.number="form.initialBalance"
              type="number"
              min="0"
              step="0.01"
              required
              class="w-full"
            />
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
import type { Account, AccountInput } from '~/composables/useAccounts'

const { accounts, pending, create, update, deactivate } = useAccounts()
const toast = useToast()

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'type', label: 'Tipo' },
  { key: 'initialBalance', label: 'Saldo inicial' },
  { key: 'actions', label: '', class: 'text-right' }
]

const typeOptions = Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({ label, value }))

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const errorMessage = ref('')

const form = reactive<AccountInput>({ name: '', type: 'CHECKING', initialBalance: 0 })

function resetForm() {
  form.name = ''
  form.type = 'CHECKING'
  form.initialBalance = 0
  errorMessage.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  modalOpen.value = true
}

function openEdit(row: Account) {
  editingId.value = row.id
  form.name = row.name
  form.type = row.type
  form.initialBalance = row.initialBalance
  errorMessage.value = ''
  modalOpen.value = true
}

async function handleSubmit() {
  saving.value = true
  errorMessage.value = ''
  try {
    if (editingId.value !== null) {
      await update(editingId.value, { ...form })
      toast.add({
        title: 'Conta atualizada',
        color: 'success'
      })
    } else {
      await create({ ...form })
      toast.add({
        title: 'Conta criada',
        color: 'success'
      })
    }
    modalOpen.value = false
  } catch (e: any) {
    errorMessage.value = e?.data?.message ?? 'Não foi possível salvar a conta'
  } finally {
    saving.value = false
  }
}

async function confirmDeactivate(row: Account) {
  if (!confirm(`Desativar a conta "${row.name}"?`)) return
  try {
    await deactivate(row.id)
    toast.add({ title: 'Conta desativada', color: 'success' })
  } catch {
    toast.add({ title: 'Erro ao desativar conta', color: 'error' })
  }
}

function formatCurrency(value: number) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>