<template>
  <div class="flex flex-col h-full space-y-4">
    <!-- Loading state -->
    <!-- <div v-if="loading" class="flex justify-center items-center py-10">
      <UIcon
        name="i-lucide-loader-circle"
        class="animate-spin h-8 w-8 text-gray-500"
      />
    </div> -->
    <LoadingSpinner v-if="loading" fullscreen />

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Error"
      color="error"
      variant="soft"
      icon="i-lucide-alert-circle"
    >
      {{ error }}
    </UAlert>

    <!-- Content when data is loaded -->
    <div v-else-if="settlementDetails" class="gap-4 flex flex-shrink-0 flex-row">
      <div class="flex flex-1 flex-col gap-4">
        <UCard>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('settlement_history_details.total_amount') }}
          </p>
          <AmountWithCurrency
            :amount="settlementDetails.records.total_amount"
            :currency="settlementDetails.records.currency || settlementDetails.records.currency_id"
            variant="primary"
            size="xl"
          />
        </UCard>
        <!-- Settlement card -->
        <UCard class="flex-1">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-md font-semibold text-gray-900 dark:text-white">
                {{ $t('settlement.title') }}
              </h2>
              <UBadge
                :color="
                  settlementDetails.records.success > settlementDetails.records.fail
                    ? 'success'
                    : 'error'
                "
                size="md"
                variant="soft"
              >
                {{
                  settlementDetails.records.success > settlementDetails.records.fail
                    ? $t('settlement_history_details.status_success')
                    : $t('settlement_history_details.status_failed')
                }}
              </UBadge>
            </div>
          </template>

          <div class="flex flex-row justify-between md:grid-rows-2 lg:grid-rows-4">
            <div class="flex flex-col items-start text-center">
              <UIcon name="material-symbols:calendar-today-outline-rounded" :class="iconSizeClass" class="mb-2" />
              <h3 class="text-sm font-medium opacity-90 mb-1">
                {{ $t('settlement_history_details.settlement_date') }}
              </h3>
              <p class="text-gray-700 font-semibold dark:text-gray-300">
                {{
                  useFormat().formatDateTime(settlementDetails.records.settlement_date, {
                    dateStyle: userPreferences?.dateFormat || 'medium',
                    timeStyle: userPreferences?.timeFormat || 'short',
                  })
                }}
              </p>
            </div>

            <div class="flex flex-col items-start text-center">
              <UIcon name="material-symbols:group-outline-rounded" :class="iconSizeClass" class="mb-2" />
              <h3 class="text-sm font-medium opacity-90 mb-1">
                {{ $t('settlement_history_details.total_sub_biller') }}
              </h3>
              <p class="text-gray-700 font-semibold dark:text-gray-300">
                {{ settlementDetails.records.total_supplier }}
              </p>
            </div>

            <div class="flex flex-col items-start text-center">
              <UIcon name="material-symbols:credit-card-outline" :class="iconSizeClass" class="mb-2" />
              <h3 class="text-sm font-medium opacity-90 mb-1">
                {{ $t('settlement_history_details.total_transactions') }}
              </h3>
              <p class="text-gray-700 font-semibold dark:text-gray-300">
                {{ settlementDetails.records.totalSettled }}
              </p>
            </div>

            <div class="flex flex-col items-start text-center">
              <UIcon name="material-symbols:check-circle-outline" :class="iconSizeClass" class="mb-2" />
              <h3 class="text-sm font-medium opacity-90 mb-1">
                {{ $t('settlement_history_details.settled_by') }}
              </h3>
              <p class="text-gray-700 font-semibold dark:text-gray-300">
                {{ settlementDetails.records.settled_by }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
      <!-- Settlement stats card -->
      <UCard class="flex-1">
        <template #header>
          <h2 class="text-md font-semibold text-gray-900 dark:text-white">
            {{ $t('settlement.statistics') }}
          </h2>
        </template>

        <div class="grid grid-rows-1 md:grid-rows-3 gap-3">
          <!-- Total transactions card -->
          <div class="bg-primary/70 rounded-xl p-3 text-white shadow-sm">
            <div class="flex items-center gap-2">
              <div
                class="bg-white/30 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
              >
                <UIcon name="i-lucide-sigma" class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-medium opacity-95 mb-0.5 truncate">
                  {{ $t('settlement.total_transactions') }}
                </h3>
                <p class="text-lg font-bold">
                  {{ settlementDetails.records.totalSettled }}
                </p>
              </div>
            </div>
          </div>

          <!-- Success transactions card -->
          <div class="bg-success/60 rounded-xl p-3 text-white shadow-sm">
            <div class="flex items-center gap-2">
              <div
                class="bg-white/30 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
              >
                <UIcon name="i-lucide-check" class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-medium opacity-95 mb-0.5 truncate">
                  {{ $t('settlement.successful') }}
                </h3>
                <p class="text-lg font-bold">
                  {{ settlementDetails.records.success }}
                </p>
              </div>
            </div>
          </div>

          <!-- Failed transactions card -->
          <div class="bg-error/60 rounded-xl p-3 text-white shadow-sm">
            <div class="flex items-center gap-2">
              <div
                class="bg-white/30 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
              >
                <UIcon name="i-lucide-x text-white" class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-medium text-white text-shadow-xs mb-0.5 truncate">
                  {{ $t('settlement.failed') }}
                </h3>
                <p class="text-lg font-bold">
                  {{ settlementDetails.records.fail }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <SettlementHistoryTable
      v-if="!loading && !error && settlementDetails"
      :settlement-historys="settlementHistoryDetails"
      :total-page="settlementDetails?.total_page || 1"
      :settlement-id="settlementId"
      :total="settlementDetails?.total_record || 0"
      :current-query="settlementHistoryQuery"
      :on-search-submit="handleSearchSubmit"
      :currency="settlementDetails.records.currency || settlementDetails.records.currency_id"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '#i18n'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import type {
  SettlementHistoryDetail,
  SettlementHistoryDetailResponse,
  SettlementHistoryDetailQuery,
} from '~/models/settlement'
import SettlementHistoryTable from '~/components/tables/SettlementHistoryTable.vue'
import { useFormat } from '~/composables/utils/useFormat'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
const supplierApi = useSupplierApi()

const { t } = useI18n()
const route = useRoute()

definePageMeta({
  auth: true,
  breadcrumbs: [
    {
      label: 'settlement_menu',
      to: '/digital-wallet/settlement',
    },
    {
      label: 'details',
      active: true,
    },
  ],
})

// Get settlement ID from route params
const settlementId = route.params.id as string

const userPreferences = useUserPreferences().getPreferences()

// State management
const loading = ref(true)
const error = ref('')
const settlementDetails = ref<SettlementHistoryDetailResponse>()
const settlementHistoryDetails = ref<SettlementHistoryDetail[]>([])
const settlementHistoryQuery = ref<SettlementHistoryDetailQuery>({
  search: '',
  status: 'success',
  settlement_history_id: settlementId,
  page: 1,
  page_size: 10,
})

// Fetch settlement details
const fetchSettlementDetails = async (showError = true) => {
  loading.value = true
  error.value = ''

  try {
    // Direct call to the API function without using execute
    const response = await supplierApi.getSettlementHistoryById(settlementHistoryQuery.value)
    if (response && response.records) {
      settlementDetails.value = response
      settlementHistoryDetails.value = response.records.settle_details || []
    } else {
      if (showError) {
        await useNotification().showError({
          title: 'No Settlement Details Found',
          description: 'No settlement details found for this ID.',
        })
      }
      if (settlementHistoryDetails.value) {
        settlementHistoryDetails.value = []
      }
    }
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Failed to load settlement details'
    useErrorHandler().handleApiError(e)
    // Optionally, you can show a toast notification here
  } finally {
    loading.value = false
  }
}

// Handle search submit from SettlementHistoryTable
const handleSearchSubmit = (query: SettlementHistoryDetailQuery) => {
  console.log('Search query submitted:', query)
  settlementHistoryQuery.value = query
  fetchSettlementDetails(false)
}

// Load data on component mount
onMounted(() => {
  fetchSettlementDetails()
})

useHead({
  title: `${t('settlement.details_title')} - Bill24 Payment Portal`,
})

const iconSizeClass = 'w-5 h-5'
</script>

<style>
.text-sm2 {
  font-size: 0.775rem;
}
</style>
