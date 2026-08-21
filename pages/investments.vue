<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-medium">Investimentos</h1>
      <div class="flex gap-2">
        <UButton variant="outline" icon="i-heroicons-flag" @click="openCreateGoal">Novo objetivo</UButton>
        <UButton icon="i-heroicons-plus" @click="openCreateInvestment">Novo investimento</UButton>
      </div>
    </div>

    <!-- Objetivos -->
    <h2 class="text-base font-medium mb-3">Objetivos</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div v-for="goal in financialGoals ?? []" :key="goal.id" class="border rounded-lg p-4">
        <p class="font-medium">{{ goal.name }}</p>
        <p class="text-sm text-neutral-500 mb-2">
          Meta: {{ goal.targetAmount != null ? formatCurrency(goal.targetAmount) : '—' }}
          <span v-if="goal.targetDate"> até {{ formatDate(goal.targetDate) }}</span>
        </p>
        <p class="text-sm">Aportado: <span class="font-medium">{{ formatCurrency(goal.totalContributed) }}</span></p>
        <UProgress v-if="goal.targetAmount" :value="progressPercent(goal)" class="mt-2" />
      </div>
      <div v-if="(financialGoals ?? []).length === 0" class="text-sm text-neutral-500">
        Nenhum objetivo cadastrado ainda.
      </div>
    </div>

    <!-- Investimentos -->
    <h2 class="text-base font-medium mb-3">Investimentos</h2>
    <div class="flex flex-col gap-3">
      <div v-for="investment in investments ?? []" :key="investment.id" class="border rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">{{ investment.name }}</p>
            <p class="text-sm text-neutral-500">
              {{ TYPE_LABELS[investment.type] }}
              <span v-if="goalName(investment.financialGoalId)"> · {{ goalName(investment.financialGoalId) }}</span>
            </p>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-medium">{{ formatCurrency(investment.totalContributed) }}</span>
            <UButton size="xs" variant="outline" @click="openContribute(investment)">Novo aporte</UButton>
          </div>
        </div>
      </div>
      <div v-if="(investments ?? []).length === 0" class="text-sm text-neutral-500">
        Nenhum investimento cadastrado ainda.
      </div>
    </div>

    <!-- Modal: novo objetivo -->
    <UModal v-model="goalModalOpen">
      <UCard>
        <template #header><span class="font-medium">Novo objetivo</span></template>
        <form class="flex flex-col gap-4" @submit.prevent="handleGoalSubmit">
          <UFormField label="Nome"><UInput v-model="goalForm.name" required class="w-full" /></UFormField>
          <UFormField label="Valor alvo">
            <UInput v-model.number="goalForm.targetAmount" type="number" step="0.01" min="0" class="w-full" />
          </UFormField>
          <UFormField label="Data alvo"><UInput v-model="goalForm.targetDate" type="date" class="w-full" /></UFormField>
          <p v-if="goalError" class="text-sm text-error-600">{{ goalError }}</p>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="goalModalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="goalSaving">Salvar</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal: novo investimento -->
    <UModal v-model="investmentModalOpen">
      <UCard>
        <template #header><span class="font-medium">Novo investimento</span></template>
        <form class="flex flex-col gap-4" @submit.prevent="handleInvestmentSubmit">
          <UFormField label="Nome"><UInput v-model="investmentForm.name" required class="w-full" /></UFormField>
          <UFormField label="Tipo">
            <USelect v-model="investmentForm.type" :options="typeOptions" class="w-full" />
          </UFormField>
          <UFormField label="Objetivo (opcional)">
            <USelect v-model="investmentForm.financialGoalId" :options="goalOptions" class="w-full" />
          </UFormField>
          <UFormField label="Descrição"><UTextarea v-model="investmentForm.description" class="w-full" /></UFormField>
          <p v-if="investmentError" class="text-sm text-error-600">{{ investmentError }}</p>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="investmentModalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="investmentSaving">Salvar</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal: aporte -->
    <UModal v-model="contributeModalOpen">
      <UCard>
        <template #header><span class="font-medium">Novo aporte{{ contributingInvestment ? ' - ' + contributingInvestment.name : '' }}</span></template>
        <form class="flex flex-col gap-4" @submit.prevent="handleContributeSubmit">
          <UFormField label="Conta de origem">
            <USelect v-model="contributeForm.accountId" :options="accountOptions" class="w-full" />
          </UFormField>
          <UFormField label="Valor">
            <UInput v-model.number="contributeForm.amount" type="number" step="0.01" min="0.01" required class="w-full" />
          </UFormField>
          <UFormField label="Data">
            <UInput v-model="contributeForm.contributionDate" type="date" required class="w-full" />
          </UFormField>
          <UFormField label="Observações"><UTextarea v-model="contributeForm.notes" class="w-full" /></UFormField>
          <p v-if="contributeError" class="text-sm text-error-600">{{ contributeError }}</p>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="contributeModalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="contributeSaving">Confirmar aporte</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { FinancialGoal, FinancialGoalInput } from '~/composables/useFinancialGoals'
import type { Investment, InvestmentInput } from '~/composables/useInvestments'
import type { InvestmentContributionInput } from '~/composables/useInvestmentContributions'

const { financialGoals, create: createGoal, refresh: refreshGoals } = useFinancialGoals()
const { investments, create: createInvestment, refresh: refreshInvestments } = useInvestments()
const { accounts } = useAccounts()
const toast = useToast()

const TYPE_LABELS: Record<string, string> = {
  CDB: 'CDB',
  TREASURY: 'Tesouro Direto',
  STOCK: 'Ação',
  ETF: 'ETF',
  FUND: 'Fundo',
  CRYPTO: 'Cripto',
  OTHER: 'Outro'
}
const typeOptions = Object.entries(TYPE_LABELS).map(([value, label]) => ({ label, value }))

const goalOptions = computed(() => [
  { label: 'Nenhum', value: null },
  ...(financialGoals.value ?? []).map(g => ({ label: g.name, value: g.id }))
])
const accountOptions = computed(() => (accounts.value ?? []).map((a: any) => ({ label: a.name, value: a.id })))

function goalName(goalId: number | null) {
  if (!goalId) return null
  return financialGoals.value?.find(g => g.id === goalId)?.name ?? null
}

function progressPercent(goal: FinancialGoal) {
  if (!goal.targetAmount || goal.targetAmount <= 0) return 0
  return Math.min(100, Math.round((goal.totalContributed / goal.targetAmount) * 100))
}

function formatCurrency(value: number) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(value: string) {
  return new Date(value + 'T00:00:00').toLocaleDateString('pt-BR')
}

// ---- Objetivo ----
const goalModalOpen = ref(false)
const goalSaving = ref(false)
const goalError = ref('')
const goalForm = reactive<FinancialGoalInput>({ name: '', targetAmount: null, targetDate: null })

function openCreateGoal() {
  goalForm.name = ''
  goalForm.targetAmount = null
  goalForm.targetDate = null
  goalError.value = ''
  goalModalOpen.value = true
}

async function handleGoalSubmit() {
  goalSaving.value = true
  goalError.value = ''
  try {
    await createGoal({ ...goalForm })
    toast.add({ title: 'Objetivo criado', color: 'success' })
    goalModalOpen.value = false
  } catch (e: any) {
    goalError.value = e?.data?.message ?? 'Não foi possível salvar o objetivo'
  } finally {
    goalSaving.value = false
  }
}

// ---- Investimento ----
const investmentModalOpen = ref(false)
const investmentSaving = ref(false)
const investmentError = ref('')
const investmentForm = reactive<InvestmentInput>({ name: '', type: 'CDB', description: null, financialGoalId: null })

function openCreateInvestment() {
  investmentForm.name = ''
  investmentForm.type = 'CDB'
  investmentForm.description = null
  investmentForm.financialGoalId = null
  investmentError.value = ''
  investmentModalOpen.value = true
}

async function handleInvestmentSubmit() {
  investmentSaving.value = true
  investmentError.value = ''
  try {
    await createInvestment({ ...investmentForm })
    toast.add({ title: 'Investimento criado', color: 'success' })
    investmentModalOpen.value = false
  } catch (e: any) {
    investmentError.value = e?.data?.message ?? 'Não foi possível salvar o investimento'
  } finally {
    investmentSaving.value = false
  }
}

// ---- Aporte ----
const contributeModalOpen = ref(false)
const contributeSaving = ref(false)
const contributeError = ref('')
const contributingInvestment = ref<Investment | null>(null)
const contributingInvestmentId = computed(() => contributingInvestment.value?.id ?? null)
const { create: createContribution } = useInvestmentContributions(contributingInvestmentId)

const contributeForm = reactive<InvestmentContributionInput>({
  accountId: 0,
  contributionDate: new Date().toISOString().slice(0, 10),
  amount: 0,
  notes: null
})

function openContribute(investment: Investment) {
  contributingInvestment.value = investment
  contributeForm.accountId = accountOptions.value[0]?.value ?? 0
  contributeForm.contributionDate = new Date().toISOString().slice(0, 10)
  contributeForm.amount = 0
  contributeForm.notes = null
  contributeError.value = ''
  contributeModalOpen.value = true
}

async function handleContributeSubmit() {
  contributeSaving.value = true
  contributeError.value = ''
  try {
    await createContribution({ ...contributeForm })
    toast.add({ title: 'Aporte lançado', color: 'success' })
    contributeModalOpen.value = false
    // Atualiza o total exibido nos cards de objetivo/investimento
    await Promise.all([refreshGoals(), refreshInvestments()])
  } catch (e: any) {
    contributeError.value = e?.data?.message ?? 'Não foi possível lançar o aporte'
  } finally {
    contributeSaving.value = false
  }
}
</script>
