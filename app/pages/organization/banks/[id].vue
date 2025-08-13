<template>
  <div class="flex flex-col h-full w-full space-y-3 overflow-hidden">
    <!-- Header -->
    <PageHeader
      :title="bank?.supplier_bank_service?.name_kh"
      :subtitle="bank?.supplier_bank_service?.name"
    />

    <!-- Content -->
    <div class="flex-1 overflow-auto space-y-3">
      <!-- Bank Information Cards -->
      <div v-if="!tblFull" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <!-- General Information -->
        <UCard :ui="appConfig.ui.card.slots">
          <template #header>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
                <UIcon name="material-symbols:chat-info-outline" class="w-4 h-4 text-primary" />
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                {{ t('banks.general_information') }}
              </h3>
            </div>
          </template>

          <!-- General Information Card Skeleton -->
          <div v-if="loadingBankInfo" class="space-y-4">
            <!-- Avatar Skeleton -->
            <USkeleton class="w-12 h-12 rounded-full" />

            <!-- Bank Name Grid Skeleton -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <USkeleton class="h-3 w-20 mb-1" />
                <USkeleton class="h-4 w-24" />
              </div>
              <div>
                <USkeleton class="h-3 w-20 mb-1" />
                <USkeleton class="h-4 w-28" />
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-200 dark:border-gray-700" />

            <!-- Status Grid Skeleton -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <USkeleton class="h-3 w-16 mb-1" />
                <USkeleton class="h-5 w-16 rounded-full" />
              </div>
              <div>
                <USkeleton class="h-3 w-24 mb-1" />
                <USkeleton class="h-4 w-32" />
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-200 dark:border-gray-700" />

            <!-- Bank Type Grid Skeleton -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <USkeleton class="h-3 w-24 mb-1" />
                <USkeleton class="h-5 w-12 rounded-full" />
              </div>
              <div>
                <USkeleton class="h-3 w-24 mb-1" />
                <USkeleton class="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>

          <!-- General Information Content -->
          <div v-else-if="bank?.supplier_bank_service" class="space-y-4">
            <UAvatar
              :name="bank.supplier_bank_service.name"
              :src="bank.supplier_bank_service.logo"
              size="3xl"
            />
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.bank_name') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ bank.supplier_bank_service.name }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.name_kh') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ bank.supplier_bank_service.name_kh || '-' }}
                </p>
              </div>
            </div>
            <Divider />
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.is_active') }}
                </label>
                <StatusBadge
                  :status="bank.supplier_bank_service.active ? 'active' : 'inactive'"
                  size="sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.activated_date') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ formatDateTime(bank.supplier_bank_service.activated_date) }}
                </p>
              </div>
            </div>
            <Divider />
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.is_settlement_bank') }}
                </label>
                <StatusBadge
                  :status="bank.supplier_bank_service.is_settlement_bank ? 'yes' : 'no'"
                  :use-translation="true"
                  size="sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.is_collection_bank') }}
                </label>
                <StatusBadge
                  :status="bank.supplier_bank_service.is_collection_bank ? 'yes' : 'no'"
                  :use-translation="true"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Account Information -->
        <UCard :ui="appConfig.ui.card.slots">
          <template #header>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
                <UIcon
                  name="material-symbols:inbox-text-person-outline"
                  class="w-4 h-4 text-primary"
                />
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                {{ t('banks.account_information') }}
              </h3>
            </div>
          </template>

          <!-- Account Information Card Skeleton -->
          <div v-if="loadingBankInfo" class="space-y-3">
            <div
              v-for="n in 2"
              :key="n"
              class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <USkeleton class="h-3 w-20 mb-1" />
                  <USkeleton class="h-4 w-32" />
                </div>
                <div>
                  <USkeleton class="h-3 w-20 mb-1" />
                  <USkeleton class="h-4 w-28" />
                </div>
                <div>
                  <USkeleton class="h-3 w-16 mb-1" />
                  <USkeleton class="h-4 w-12" />
                </div>
                <div>
                  <USkeleton class="h-3 w-16 mb-1" />
                  <USkeleton class="h-5 w-16 rounded-full" />
                </div>
              </div>
              <div class="mt-2">
                <USkeleton class="h-4 w-20 rounded-full" />
              </div>
            </div>
          </div>

          <!-- Account Information Content -->
          <div v-else class="space-y-4">
            <div v-if="bankAccounts.length === 0" class="text-center py-8">
              <UIcon name="i-lucide-credit-card" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('banks.no_accounts_found') }}
              </p>
            </div>

            <div v-else class="space-y-3">
              <!-- Scrollable container for accounts with max height for 2 items -->
              <div
                class="space-y-3 max-h-[315px] overflow-y-auto"
                :class="{ 'pr-2': bankAccounts.length > 2 }"
              >
                <div
                  v-for="account in bankAccounts"
                  :key="account.id"
                  class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                      >
                        {{ t('banks.account_number') }}
                      </label>
                      <p class="text-sm text-gray-900 dark:text-white font-mono">
                        {{ account.code }}
                      </p>
                    </div>
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                      >
                        {{ t('banks.account_name') }}
                      </label>
                      <p class="text-sm text-gray-900 dark:text-white">{{ account.name }}</p>
                    </div>
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                      >
                        {{ t('banks.currency_code') }}
                      </label>
                      <p class="text-sm text-gray-900 dark:text-white">{{ account.currency_id }}</p>
                    </div>
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                      >
                        {{ t('status.header') }}
                      </label>
                      <StatusBadge :status="account.status" size="sm" />
                    </div>
                  </div>
                  <div v-if="account.is_default" class="mt-2">
                    <UBadge color="primary" variant="subtle" size="xs">
                      {{ t('banks.default_account') }}
                    </UBadge>
                  </div>
                </div>
              </div>

              <!-- Show scroll indicator if there are more than 2 accounts -->
              <div v-if="bankAccounts.length > 2" class="text-center">
                <p class="text-xs text-gray-500 dark:text-gray-400 animate-bounce">
                  {{ t('wallet_page.scroll_hint') }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Settlement History Table -->
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-start">
            <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
              <UIcon name="material-symbols:chat-info-outline" class="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('settlement_history_title') }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ t('banks.settlement_history_desc') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Settlement History Table Content -->
        <ExTable
          :table-id="`bank-settlements`"
          :columns="settlementColumns"
          :fetch-data-fn="fetchSettlements"
          :show-date-filter="true"
          :show-search="true"
          show-row-number
          :search-tooltip="t('search_by_settler')"
          class="border-0 max-h-[800px] overflow-auto"
          @row-click="handleRowClick"
          @fullscreen-toggle="(isFullScreen) => (tblFull = isFullScreen)"
        />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="!loading && !loadingBankInfo && !bank?.supplier_bank_service"
      class="flex items-center justify-center flex-1"
    >
      <div class="text-center">
        <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ t('banks.no_banks_found') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ t('banks.bank_not_found_desc') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBankApi } from '~/composables/api/useBankApi'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import { useFormat } from '~/composables/utils/useFormat'
import { useErrorHandler } from '~/composables/useErrorHandler'
import type { BankAccount, BankDetailsResponse } from '~/models/bank'
import type { SettlementHistoryRecord, SettlementHistoryQuery } from '~/models/settlement'
import type { BaseTableColumn, TableFetchResult } from '~/components/tables/table'
import type { QueryParams } from '~/models/baseModel'
import { ColumnType } from '~/utils/enumModel'
import { getTranslatedStatusLabel, formatAmountV2 } from '~/utils/helper'
import ExTable from '~/components/tables/ExTable.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import PageHeader from '~/components/PageHeader.vue'
import appConfig from '~~/app.config'

// Define settlement history status enum
enum SettlementHistoryStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SUCCESS = 'success',
}

definePageMeta({
  auth: true,
  breadcrumbs: [
    { label: 'navigation.banks', to: '/organization/banks' },
    { label: 'banks.bank_details', active: true },
  ],
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getBankById } = useBankApi()
const { getSettlementHistory } = useSupplierApi()
const { formatDateTime } = useFormat()
const errorHandler = useErrorHandler()

const bank = ref<BankDetailsResponse | null>(null)
const bankAccounts = ref<BankAccount[]>([])
const loading = ref(false)
const loadingBankInfo = ref(false)
const tblFull = ref(false)

const supplierBankServiceId = computed(() => route.params.id as string)

// Settlement table columns configuration
const settlementColumns = computed((): BaseTableColumn<SettlementHistoryRecord>[] => [
  {
    id: 'created_date',
    accessorKey: 'created_date',
    header: t('table.settlement-history.columns.created_date'),
    type: ColumnType.Date,
    enableSorting: true,
    cell: ({ row }) => formatDateTime(row.original.created_date),
  },
  {
    id: 'total_settled',
    accessorKey: 'total_settled',
    header: t('table.settlement-history.columns.total_settled'),
    type: ColumnType.Number,
    enableSorting: true,
    cell: ({ row }) => row.original.total_settled?.toLocaleString() || '0',
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: t('table.settlement-history.columns.status'),
    type: ColumnType.Text,
    enableColumnFilter: true,
    filterOptions: Object.values(SettlementHistoryStatus).map((status) => ({
      label: getTranslatedStatusLabel(status),
      value: status,
    })),
    cell: ({ row }) =>
      h(StatusBadge, {
        status: row.original.status,
        type: 'settlement',
      }),
  },
  {
    id: 'created_by',
    accessorKey: 'created_by',
    header: t('table.settlement-history.columns.created_by'),
    type: ColumnType.Text,
    enableSorting: true,
    cell: ({ row }) => row.original.created_by || '-',
  },
  {
    id: 'currency_id',
    accessorKey: 'currency_id',
    // header: t('table.settlement-history.columns.currency_id'),
    type: ColumnType.Text,
    enableColumnFilter: true,
    filterOptions: [
      { label: t('currency.usd'), value: 'USD' },
      { label: t('currency.khr'), value: 'KHR' },
    ],
    cell: ({ row }) => row.original.currency_id,
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: t('table.settlement-history.columns.total_amount'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        formatAmountV2(row.original.total_amount, row.original.currency_id)
      ),
    type: ColumnType.Amount,
    enableSorting: true,
  },
])

const handleRowClick = (rowData: SettlementHistoryRecord) => {
  router.push(`/digital-wallet/settlement/details/${rowData.id}`)
}

// Fetch settlement data for the table
const fetchSettlements = async (
  params?: QueryParams
): Promise<(TableFetchResult<SettlementHistoryRecord[]> & Record<string, unknown>) | null> => {
  try {
    if (!params) {
      return {
        data: [],
        total_record: 0,
        total_page: 0,
      }
    }

    const query: SettlementHistoryQuery = {
      page: params.page || 1,
      page_size: params.page_size || 10,
      supplier_id: '',
      search: params.search || undefined,
      start_date: params.start_date || undefined,
      end_date: params.end_date || undefined,
      status: params.statuses || undefined,
      banks: bank.value?.supplier_bank_service?.bank_id
        ? [bank.value.supplier_bank_service.bank_id]
        : [],
    }

    const response = await getSettlementHistory(query)

    if (!response) {
      return {
        data: [],
        total_record: 0,
        total_page: 0,
      }
    }

    return {
      data: response.records || [],
      total_record: response.total_record || 0,
      total_page: response.total_page || 0,
      page: response.page || params.page || 1,
      sum_total_amount_khr: response.sum_total_amount_khr || 0,
      sum_total_amount_usd: response.sum_total_amount_usd || 0,
      sum_total_settled: response.sum_total_settled || 0,
      sum_success: response.sum_success || 0,
      sum_failed: response.sum_failed || 0,
    }
  } catch (error) {
    console.error('Error fetching settlement data:', error)
    errorHandler.handleApiError(error)
    return {
      data: [],
      total_record: 0,
      total_page: 0,
    }
  }
}

const fetchBank = async () => {
  if (!supplierBankServiceId.value) return

  loadingBankInfo.value = true
  try {
    const response = await getBankById(supplierBankServiceId.value)
    bank.value = response
    // Extract bank accounts from the response
    if (response?.accounts) {
      bankAccounts.value = response.accounts
    }
  } catch (error) {
    errorHandler.handleApiError(error)
    router.push('/organization/banks')
  } finally {
    loadingBankInfo.value = false
  }
}

onMounted(() => {
  fetchBank()
})
</script>
