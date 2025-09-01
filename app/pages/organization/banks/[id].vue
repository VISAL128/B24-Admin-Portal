<template>
  <div class="flex flex-col h-full w-full space-y-3 overflow-hidden">
    <!-- Header - Commented out since breadcrumb back button provides navigation -->
    <!-- <PageHeader :title="bank?.nameKh" :subtitle="bank?.name" /> -->

    <!-- <UnderDevelopment v-if="true" /> -->
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
          <div v-else-if="bank" class="space-y-4">
            <UAvatar :name="bank.name" :src="bank.logoUrl" size="3xl" />

            <!-- Bank Information -->
            <div class="bg-gray-50 dark:bg-gray-800/50 p-3 space-y-3 rounded-lg">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {{ t('banks.bank_name') }}
                  </label>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ bank.name }}
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {{ t('banks.name_kh') }}
                  </label>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ bank.nameKh || '-' }}
                  </p>
                </div>
              </div>

              <!-- Horizontal Divider -->
              <Divider />

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {{ t('banks.status') }}
                  </label>
                  <StatusBadge :status="getActiveStatus()" size="sm" />
                </div>
              </div>

              <Divider />

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {{ t('banks.is_settlement_bank') }}
                  </label>
                  <StatusBadge
                    :status="bank.isSettlementBank ? 'yes' : 'no'"
                    :use-translation="true"
                    size="sm"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {{ t('banks.is_collection_bank') }}
                  </label>
                  <StatusBadge
                    :status="bank.isCollectionBank ? 'yes' : 'no'"
                    :use-translation="true"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Connected Services -->
        <UCard :ui="appConfig.ui.card.slots">
          <template #header>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
                <UIcon name="material-symbols:account-tree-outline" class="w-4 h-4 text-primary" />
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                {{ t('banks.connected_services.title') }}
              </h3>
            </div>
          </template>

          <!-- Connected Services Card Skeleton -->
          <div v-if="loadingBankInfo" class="space-y-3">
            <div class="flex gap-2 mb-3">
              <USkeleton v-for="n in 2" :key="n" class="h-8 w-24 rounded-xl" />
            </div>
            <div class="space-y-3">
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
              </div>
            </div>
          </div>

          <!-- Connected Services Content -->
          <div v-else class="space-y-4">
            <div v-if="!bank?.services || bank.services.length === 0" class="text-center py-8">
              <UIcon name="i-lucide-unplug" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('banks.connected_services.no_services') }}
              </p>
            </div>

            <div v-else>
              <ReusableTabs v-model="activeServiceTab" :tabs="serviceTabs" size="sm">
                <template #default="{ activeTab }">
                  <div class="mt-4">
                    <div v-for="service in bank.services" :key="service.code">
                      <div
                        v-if="service.code === activeTab"
                        class="space-y-4 max-h-[400px] overflow-y-auto"
                      >
                        <!-- Service Information -->
                        <div class="grid grid-cols-1 gap-4">
                          <div class="bg-gray-50 dark:bg-gray-800/50 p-3 space-y-3 rounded-lg">
                            <div class="flex flex-row gap-3 justify-between">
                              <div>
                                <label
                                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                                >
                                  {{ t('banks.connected_services.name') }}
                                </label>
                                <p class="text-sm text-gray-900 dark:text-white">
                                  {{ getServiceName(service) }}
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                  {{ getServiceSubTitle(service) }}
                                </p>
                              </div>
                              <ConfirmDialog
                                v-model="showToggleStatusDialog"
                                :message="getServiceStatusHintText(service)"
                                :additional-info="t('banks.connected_services.toggle_status_info')"
                                :loading="loadingToggleServiceStatus"
                                :title="
                                  service.status === BankServiceStatus.Active
                                    ? t('banks.connected_services.inactive') +
                                      ' ' +
                                      getServiceName(service)
                                    : t('banks.connected_services.active') +
                                      ' ' +
                                      getServiceName(service)
                                "
                                @confirm="
                                  toggleServiceStatus(
                                    service.supplierBankServiceId,
                                    service.status === BankServiceStatus.Active ? false : true
                                  )
                                "
                              >
                                <UButton
                                  :icon="
                                    service.status === BankServiceStatus.Active
                                      ? 'material-symbols:close-rounded'
                                      : 'material-symbols:play-arrow-outline-rounded'
                                  "
                                  variant="soft"
                                  :color="getServiceStatusColor(service)"
                                  size="sm"
                                  class="h-7"
                                >
                                  {{ getServiceStatusText(service) }}
                                </UButton>
                              </ConfirmDialog>
                              <!-- <UPopover
                                mode="click"
                                position="bottom-end"
                              >
                                <UButton icon="material-symbols:more-vert" variant="ghost" size="sm" class="items-center justify-center rounded-lg size-8" />

                                <template #content>
                                  <div class="flex flex-col gap-2 p-2">
                                    <UTooltip :text="getServiceStatusText(service)">
                                      <UButton icon="material-symbols:play-arrow-outline-rounded" variant="soft" :color="getServiceStatusColor(service)" size="sm" >
                                        {{ getServiceStatusText(service) }}
                                      </UButton>
                                    </UTooltip>
                                  </div>
                                </template>
                              </UPopover> -->
                            </div>

                            <!-- Horizontal Divider -->
                            <Divider />

                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label
                                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                                >
                                  {{ t('status.header') }}
                                </label>
                                <StatusBadge
                                  :status="service.status === 1 ? 'active' : 'inactive'"
                                  size="sm"
                                />
                              </div>
                              <div>
                                <label
                                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                                >
                                  {{ t('banks.activated_date') }}
                                </label>
                                <p class="text-sm text-gray-900 dark:text-white">
                                  {{ formatDateTime(service.activatedDate) }}
                                </p>
                              </div>
                            </div>
                            <Divider v-if="service.description" />
                            <div v-if="service.description" class="mt-3">
                              <label
                                class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                              >
                                {{ t('banks.connected_services.description') }}
                              </label>
                              <p class="text-sm text-gray-900 dark:text-white">
                                {{
                                  currentLanguage === 'km'
                                    ? service.descriptionKh
                                    : service.description
                                }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- Service Accounts -->
                        <div class="flex flex-col gap-3">
                          <div class="flex items-center">
                            <div
                              class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2"
                            >
                              <UIcon
                                name="material-symbols:credit-card-outline"
                                class="w-4 h-4 text-primary"
                              />
                            </div>
                            <h4 class="text-base font-semibold text-gray-900 dark:text-white">
                              {{ t('banks.account_information') }}
                            </h4>
                          </div>

                          <div
                            v-if="!service.accounts || service.accounts.length === 0"
                            class="text-center py-6"
                          >
                            <UIcon
                              name="material-symbols:credit-card-outline"
                              class="w-8 h-8 text-gray-400 mx-auto mb-2"
                            />
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                              {{ t('banks.no_accounts_found') }}
                            </p>
                          </div>

                          <div v-else class="space-y-3">
                            <div
                              ref="accountsScrollContainer"
                              class="space-y-3 max-h-[330px] overflow-y-auto"
                              :class="{ 'pr-2': service.accounts.length > 2 }"
                              @scroll="handleAccountsScroll"
                            >
                              <div
                                v-for="account in service.accounts"
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
                                    <AccountNumber
                                      :account-number="account.code"
                                      initially-hidden
                                    />
                                  </div>
                                  <div>
                                    <label
                                      class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                                    >
                                      {{ t('banks.account_name') }}
                                    </label>
                                    <p class="text-sm text-gray-900 dark:text-white">
                                      {{ account.name }}
                                    </p>
                                  </div>
                                  <div>
                                    <label
                                      class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                                    >
                                      {{ t('banks.currency_code') }}
                                    </label>
                                    <p class="text-sm text-gray-900 dark:text-white">
                                      {{ account.currency_id }}
                                    </p>
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

                            <!-- Scroll hint for multiple accounts - moved to bottom with float animation -->
                            <div class="h-4">
                              <div
                                v-if="service.accounts.length > 2 && !isScrolledToBottom"
                                class="text-center pt-2"
                              >
                                <p
                                  class="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 animate-bounce"
                                >
                                  <UIcon
                                    name="material-symbols:keyboard-double-arrow-down-rounded"
                                    class="w-3 h-3"
                                  />
                                  {{ t('banks.connected_services.scroll_hint') }}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </ReusableTabs>
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

        <!-- Summary Cards -->
        <CardsSummaryCards
          v-show="!tblFull"
          :cards="summarys"
          :is-loading="loadingBankInfo"
          :skeleton-count="summarys.length"
          class="p-3"
        />

        <!-- Settlement History Table Content -->
        <ExTable
          :key="`bank-settlements-${bankLoaded ? bank?.id : 'loading'}`"
          :table-id="`bank-settlements`"
          :columns="settlementColumns"
          :fetch-data-fn="fetchSettlements"
          :show-date-filter="true"
          :show-search="true"
          show-row-number
          :search-tooltip="t('search_by_settler')"
          class="border-0 max-h-[800px] overflow-auto"
          @row-click="handleRowClick"
          @data-changed="handleDataChanged"
          @fullscreen-toggle="(isFullScreen) => (tblFull = isFullScreen)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { SummaryCard } from '~/components/cards/SummaryCards.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import ExTable from '~/components/tables/ExTable.vue'
import type { BaseTableColumn, TableFetchResult } from '~/components/tables/table'
import ReusableTabs from '~/components/ui/ReusableTabs.vue'
import { useBankApi } from '~/composables/api/useBankApi'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useFormat } from '~/composables/utils/useFormat'
import type { BankAccount, BankDetailsResponse, BankService } from '~/models/bank'
import type { QueryParams } from '~/models/baseModel'
import type { SettlementHistoryQuery, SettlementHistoryRecord } from '~/models/settlement'
import { ColumnType, SettlementHistoryStatus } from '~/utils/enumModel'
import { formatAmountV2, getTranslatedStatusLabel } from '~/utils/helper'
import appConfig from '~~/app.config'

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
const { getBankById, updateBankServiceStatus } = useBankApi()
const { getSettlementHistory } = useSupplierApi()
const { formatDate, formatDateTime } = useFormat()
const errorHandler = useErrorHandler()
const { showSuccess } = useNotification()
const currentLanguage = computed(() => useLanguage().getLanguage())

const bank = ref<BankDetailsResponse | null>(null)
const bankAccounts = ref<BankAccount[]>([])
const loadingBankInfo = ref(false)
const loadingToggleServiceStatus = ref(false)
const tblFull = ref(false)
const bankLoaded = ref(false)
const dateRangeFilterDisplay = ref('')
const activeServiceTab = ref('')
const isScrolledToBottom = ref(false)
const accountsScrollContainer = ref<HTMLElement | null>(null)
const showToggleStatusDialog = ref(false)

// Summary data for cards
const summaryData = ref({
  total_amount_khr: 0,
  total_amount_usd: 0,
  total_settled: 0,
  success: 0,
  failed: 0,
})

const supplierBankServiceId = computed(() => route.params.id as string)

// Helper functions for the new bank structure
const getActiveStatus = () => {
  if (!bank.value?.services || bank.value.services.length === 0) return 'inactive'
  // Consider active if any service has status 1
  return bank.value.services.some((service) => service.status === 1) ? 'active' : 'inactive'
}

// Service icon mapping
const getServiceIcon = (serviceCode: string): string => {
  const iconMap: Record<string, string> = {
    WALLET: 'i-lucide-wallet',
    DEEPLINK: 'i-lucide-link',
    KHQR: 'i-lucide-qr-code',
    DEFAULT: 'i-lucide-settings',
  }
  return iconMap[serviceCode] || iconMap['DEFAULT'] || 'i-lucide-settings'
}

// Helper function for service name
const getServiceName = (service: BankService) => {
  return currentLanguage.value === 'km'
    ? service.nameKh
      ? service.nameKh
      : service.name
    : service.name
}

// Computed property for service tabs
const serviceTabs = computed(() => {
  if (!bank.value?.services) return []

  return bank.value.services.map((service) => ({
    label: getServiceName(service),
    value: service.code,
    icon: getServiceIcon(service.code),
  }))
})

const getServiceSubTitle = (service: BankService) => {
  return currentLanguage.value === 'km'
    ? service.subTitleKh
      ? service.subTitleKh
      : service.subTitle
    : service.subTitle
}

const getServiceStatusText = (service: BankService) => {
  return service.status === 1
    ? t('banks.connected_services.inactive')
    : t('banks.connected_services.active')
}

const getServiceStatusHintText = (service: BankService) => {
  return service.status === 1
    ? t('banks.connected_services.make_inactive_hint')
    : t('banks.connected_services.make_active_hint')
}

const getServiceStatusColor = (service: BankService) => {
  return service.status === 1 ? 'error' : 'success'
}

// Summary cards configuration
const summarys = computed<SummaryCard[]>(() => [
  {
    key: 'total_amount',
    title: t('settlement.total_amount'),
    values: [
      { value: summaryData.value.total_amount_khr, currency: 'KHR' },
      { value: summaryData.value.total_amount_usd, currency: 'USD' },
    ],
    filterLabel: '',
    dateRange: dateRangeFilterDisplay.value,
  },
  {
    key: 'total_settled',
    title: t('settlement.total_settled'),
    values: [{ value: summaryData.value.total_settled }],
    filterLabel: '',
    dateRange: dateRangeFilterDisplay.value,
  },
  {
    key: 'success',
    title: t('settlement.success'),
    values: [{ value: summaryData.value.success }],
    filterLabel: '',
    dateRange: dateRangeFilterDisplay.value,
  },
  {
    key: 'failed',
    title: t('settlement.failed'),
    values: [{ value: summaryData.value.failed }],
    filterLabel: '',
    dateRange: dateRangeFilterDisplay.value,
  },
])

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
    id: 'created_by',
    accessorKey: 'created_by',
    header: t('table.settlement-history.columns.created_by'),
    type: ColumnType.Text,
    enableSorting: true,
    cell: ({ row }) => row.original.created_by || '-',
  },
  {
    id: 'total_settled',
    accessorKey: 'total_settled',
    headerText: 'table.settlement-history.columns.total_settled',
    type: ColumnType.Number,
    enableSorting: true,
    cell: ({ row }) => {
      const total = row.original.total_settled

      const UBadge = resolveComponent('UBadge')

      return h(
        UBadge,
        {
          color: 'primary',
          variant: 'subtle',
          class: 'flex items-center justify-center gap-2',
        },
        () => [h('span', { class: 'text-xs h-4' }, `${t('total')}: ${total}`)]
      )
    },
  },
  {
    id: 'success',
    accessorKey: 'success',
    headerText: 'table.settlement-history.columns.success',
    type: ColumnType.Number,
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')
      const Icon = resolveComponent('UIcon')
      return h(
        UBadge,
        {
          color: 'success',
          variant: 'subtle',
          class: 'flex items-center justify-center gap-2',
        },
        () => [
          h(Icon, { name: 'material-symbols:check-circle-rounded', class: 'w-4 h-4' }),
          h('span', {}, row.original.success),
        ]
      )
    },
  },
  {
    id: 'failed',
    accessorKey: 'failed',
    headerText: 'table.settlement-history.columns.failed',
    type: ColumnType.Number,
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')
      const Icon = resolveComponent('UIcon')
      return h(
        UBadge,
        {
          color: 'error',
          variant: 'subtle',
          class: 'flex items-center justify-center gap-2',
        },
        () => [
          h(Icon, { name: 'material-symbols:cancel-rounded', class: 'w-4 h-4' }),
          h('span', {}, row.original.failed),
        ]
      )
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: t('table.settlement-history.columns.status'),
    type: ColumnType.Text,
    enableColumnFilter: true,
    filterType: 'status',
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

// Handle data changes and update summary
const handleDataChanged = (
  result: TableFetchResult<SettlementHistoryRecord[]> & Record<string, unknown>
) => {
  // Update summary data with the result
  summaryData.value = {
    total_amount_khr: (result.sum_total_amount_khr as number) || 0,
    total_amount_usd: (result.sum_total_amount_usd as number) || 0,
    total_settled: (result.sum_total_settled as number) || 0,
    success: (result.sum_success as number) || 0,
    failed: (result.sum_failed as number) || 0,
  }
}

// Fetch settlement data for the table
const fetchSettlements = async (
  params?: QueryParams
): Promise<(TableFetchResult<SettlementHistoryRecord[]> & Record<string, unknown>) | null> => {
  try {
    // Update date range display
    if (params?.start_date && params?.end_date) {
      dateRangeFilterDisplay.value = `${formatDate(params.start_date)} - ${formatDate(params.end_date)}`
    }

    // Wait for bank data to be loaded before fetching settlements
    if (!bankLoaded.value || !bank.value?.id) {
      return {
        data: [],
        total_record: 0,
        total_page: 0,
      }
    }

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
      status: params.Statuses || undefined,
      banks: [bank.value.id],
      currencies:
        params.filters
          .filter((filter) => filter.field === 'currency_id')
          .map((filter) => filter.value as string) || undefined,
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
  bankLoaded.value = false
  try {
    const response = await getBankById(supplierBankServiceId.value)
    bank.value = response
    // Extract bank accounts from all services in the response
    if (response?.services) {
      bankAccounts.value = response.services.flatMap((service) => service.accounts || [])
      // Set the first service as active tab
      if (response.services.length > 0 && response.services[0]) {
        activeServiceTab.value = response.services[0].code
      }
    }
    // Mark bank as loaded after successful fetch
    bankLoaded.value = true
  } catch (error) {
    errorHandler.handleApiError(error)
    router.push('/organization/banks')
  } finally {
    loadingBankInfo.value = false
  }
}

const toggleServiceStatus = async (sbsId: string, newStatus: boolean) => {
  if (!bank.value) return

  try {
    loadingToggleServiceStatus.value = true
    // Call the API to update the service status
    const success = await updateBankServiceStatus(sbsId, newStatus)
    if (success) {
      showSuccess({
        title: t('notifications.success'),
        description: t('notifications.service_status_updated_successfully'),
      })
      await fetchBank()
    }
  } catch (error) {
    errorHandler.handleApiError(error)
  } finally {
    loadingToggleServiceStatus.value = false
  }
}

const handleAccountsScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target) return

  // Check if scrolled to bottom (with small tolerance of 1px)
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  isScrolledToBottom.value = scrollTop + clientHeight >= scrollHeight - 1
}

onMounted(() => {
  fetchBank()
})
</script>
