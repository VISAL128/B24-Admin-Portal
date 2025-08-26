<template>
  <div class="flex flex-col h-full space-y-4">
    <!-- PageHeader - Commented out since breadcrumb back button provides navigation -->
    <!-- <PageHeader
      :title="t('settlement_history_details.title')"
      :subtitle="t('settlement_history_details.subtitle')"
    /> -->
    <!-- Loading skeleton that matches the actual content layout -->
    <div v-if="loading" class="gap-4 flex flex-col space-y-4">
      <!-- Main content row skeleton -->
      <div class="gap-4 flex flex-shrink-0 flex-row">
        <!-- Left column skeleton -->
        <div class="flex flex-1 flex-col gap-4">
          <!-- Total amount card skeleton -->
          <div
            class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <USkeleton class="h-4 w-32 mb-3" />
            <USkeleton class="h-8 w-48" />
          </div>

          <!-- Settlement card skeleton -->
          <div
            class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex-1"
          >
            <!-- Header skeleton -->
            <div class="flex items-center justify-between mb-6 pb-4">
              <USkeleton class="h-6 w-24" />
              <USkeleton class="h-6 w-16 rounded-full" />
            </div>

            <!-- Stats grid skeleton -->
            <div class="flex flex-row justify-between gap-4">
              <div v-for="i in 4" :key="i" class="flex flex-col items-start text-center">
                <USkeleton class="h-5 w-5 rounded mb-2" />
                <USkeleton class="h-4 w-20 mb-1" />
                <USkeleton class="h-5 w-16" />
              </div>
            </div>
          </div>
        </div>

        <!-- Right column skeleton (Statistics card) -->
        <div
          class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex-1"
        >
          <!-- Header skeleton -->
          <div class="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <USkeleton class="h-6 w-20" />
          </div>

          <!-- Stats cards skeleton -->
          <div class="grid grid-rows-1 md:grid-rows-3 gap-3">
            <div v-for="i in 3" :key="i" class="rounded-xl p-3 bg-gray-100 dark:bg-gray-700">
              <div class="flex items-center gap-2">
                <USkeleton class="w-8 h-8 rounded-lg flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <USkeleton class="h-3 w-24 mb-1" />
                  <USkeleton class="h-5 w-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table skeleton -->
      <div
        class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <!-- Table header skeleton -->
        <div class="flex items-center justify-between mb-4">
          <USkeleton class="h-8 w-64" />
          <div class="flex gap-2">
            <USkeleton class="h-8 w-24" />
            <USkeleton class="h-8 w-24" />
          </div>
        </div>

        <!-- Table rows skeleton -->
        <div class="space-y-3">
          <div
            v-for="i in 5"
            :key="i"
            class="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-4 w-20" />
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="flex flex-1 items-center justify-center">
      <UCard class="bg-error-100 dark:bg-error-300/50" variant="solid">
        <LottieJson
          path="/animations/lotties/alert-icon.json"
          width="30rem"
          height="6rem"
          :loop="false"
          renderer="svg"
        />
        <div class="text-center">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-2">
            {{ error || t('error.something_went_wrong') }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ errorDesc || t('error.try_again_later') }}
          </p>
          <UButton
            color="neutral"
            variant="outline"
            class="mt-2"
            @click="navigateTo('/digital-wallet/settlement')"
          >
            {{ $t('navigate_back') }}
          </UButton>
        </div>
      </UCard>
    </div>

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
        <UCard class="flex-1" :ui="appConfig.ui.card.slots">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
                  <UIcon name="material-symbols:contract-edit-outline-rounded" class="w-4 h-4 text-primary" />
                </div>
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                  {{ $t('settlement.title') }}
                </h3>
              </div>
              <StatusBadgeV2
                v-if="settlementDetails.records.success || settlementDetails.records.failed"
                :status="
                  settlementDetails.records.success > settlementDetails.records.failed
                    ? 'success'
                    : 'failed'
                "
                :size="'md'"
                :variant="'subtle'"
              />
            </div>
          </template>

          <div class="flex flex-row justify-between md:grid-rows-2 lg:grid-rows-4">
            <div class="flex flex-col items-start text-center">
              <UIcon
                name="material-symbols:calendar-today-outline-rounded"
                :class="iconSizeClass"
                class="mb-2"
              />
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
              <UIcon
                name="material-symbols:group-outline-rounded"
                :class="iconSizeClass"
                class="mb-2"
              />
              <h3 class="text-sm font-medium opacity-90 mb-1">
                {{ $t('settlement_history_details.total_sub_biller') }}
              </h3>
              <p class="text-gray-700 font-semibold dark:text-gray-300">
                {{ settlementDetails.records.total_supplier }}
              </p>
            </div>

            <div class="flex flex-col items-start text-center">
              <UIcon
                name="material-symbols:credit-card-outline"
                :class="iconSizeClass"
                class="mb-2"
              />
              <h3 class="text-sm font-medium opacity-90 mb-1">
                {{ $t('settlement_history_details.total_transactions') }}
              </h3>
              <p class="text-gray-700 font-semibold dark:text-gray-300">
                {{ settlementDetails.records.totalSettled }}
              </p>
            </div>

            <div class="flex flex-col items-start text-center">
              <UIcon
                name="material-symbols:check-circle-outline"
                :class="iconSizeClass"
                class="mb-2"
              />
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
      <UCard class="flex-1" :ui="appConfig.ui.card.slots">
        <template #header>
          <div class="flex items-center">
            <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
              <UIcon name="material-symbols:chat-info-outline" class="w-4 h-4 text-primary" />
            </div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('settlement.statistics') }}
            </h3>
          </div>
        </template>

        <div class="grid grid-rows-1 md:grid-rows-3 gap-3">
          <!-- Total transactions card -->
          <div class="bg-primary/70 rounded-xl p-3 text-white shadow-sm">
            <div class="flex items-center gap-2">
              <div
                class="bg-white/30 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
              >
                <UIcon name="uil:invoice" class="w-4 h-4" />
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
                  {{ settlementDetails.records.failed }}
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
import { useI18n } from '#i18n'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import SettlementHistoryTable from '~/components/tables/SettlementHistoryTable.vue'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import { useFormat } from '~/composables/utils/useFormat'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import type {
  SettlementHistoryDetail,
  SettlementHistoryDetailQuery,
  SettlementHistoryDetailResponse,
} from '~/models/settlement'
import appConfig from '~~/app.config'
const supplierApi = useSupplierApi()

const { t } = useI18n()
const route = useRoute()
const notification = useNotification()

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
const errorDesc = ref('')
const settlementDetails = ref<SettlementHistoryDetailResponse>()
const settlementHistoryDetails = ref<SettlementHistoryDetail[]>([])
const settlementHistoryQuery = ref<SettlementHistoryDetailQuery>({
  search: '',
  status: '',
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
        notification.showError({
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
  } finally {
    loading.value = false
  }
}

// Handle search submit from SettlementHistoryTable
const handleSearchSubmit = (query: SettlementHistoryDetailQuery) => {
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
