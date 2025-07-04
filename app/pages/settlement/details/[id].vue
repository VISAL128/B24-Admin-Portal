<template>
  <div class="flex flex-col space-y-6">
    <!-- Breadcrumb and header section -->
    <!-- <div
      class="flex flex-wrap items-center justify-between gap-4 px-4 py-4 bg-white dark:bg-gray-900 rounded shadow"
    >
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <NuxtLink
            to="/settlement"
            class="hover:text-primary transition-colors"
          >
            {{ $t("settlement.dashboard_title") }}
          </NuxtLink>
          <span>/</span>
          <span>{{ $t("settlement.details_title") }}</span>
        </div>
        <h1 class="text-xl font-bold">
          {{ $t("settlement.details_title") }} #{{ settlementId }}
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <UButton color="primary" icon="i-lucide-arrow-left" @click="goBack">
          {{ $t("back") }}
        </UButton>
      </div>
    </div> -->

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-10">
      <UIcon
        name="i-lucide-loader-circle"
        class="animate-spin h-8 w-8 text-gray-500"
      />
    </div>

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
    <div v-else-if="settlementDetails" class="space-y-2 px-4">
      <UCard>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t("settlement_history_details.total_amount") }}
        </p>
        <p class="text-2xl font-semibold text-primary dark:text-white">
          {{ useCurrency().formatAmount(settlementDetails.records.total_amount) }}
          {{ settlementDetails.records.currency }}
        </p>
      </UCard>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Settlement overview card -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ $t("settlement.overview") }}
              </h2>
              <UBadge
                :color="
                  settlementDetails.records.success >
                  settlementDetails.records.fail
                    ? 'success'
                    : 'error'
                "
                size="lg"
                variant="soft"
              >
                {{
                  settlementDetails.records.success >
                  settlementDetails.records.fail
                    ? $t("settlement_history_details.status_success")
                    : $t("settlement_history_details.status_failed")
                }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-6">
            <div
              class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
            >
              <span
                class="text-sm font-medium text-gray-600 dark:text-gray-400"
                >{{ $t("settlement_id") }}</span
              >
              <div class="flex flex-row justify-end items-center gap-2">
                <span
                  class="text-right text-sm2 font-semibold text-gray-900 dark:text-white"
                  >{{ settlementDetails.records.settlement_history_id }}</span
                >
                <UButton
                  size="sm"
                  color="info"
                  variant="ghost"
                  :icon="isCopied ? 'i-lucide-check' : 'i-lucide-copy'"
                  :class="
                    isCopied
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-[#43B3DE]'
                  "
                  @click="copySettlementId"
                  :title="isCopied ? 'Copied!' : 'Copy to clipboard'"
                />
              </div>
            </div>
            <div
              class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
            >
              <span
                class="text-sm font-medium text-gray-600 dark:text-gray-400"
                >{{ $t("settlement_date") }}</span
              >
              <span class="font-semibold text-gray-900 dark:text-white">{{
                formatDate(
                  settlementDetails.records.settlement_date.toString() || ""
                )
              }}</span>
            </div>
            <div
              class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
            >
              <span
                class="text-sm font-medium text-gray-600 dark:text-gray-400"
                >{{ $t("total_supplier") }}</span
              >
              <span class="font-semibold text-gray-900 dark:text-white">{{
                settlementDetails.records.total_supplier
              }}</span>
            </div>
            <div
              class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
            >
              <span
                class="text-sm font-medium text-gray-600 dark:text-gray-400"
                >{{ $t("total_amount") }}</span
              >
              <span class="font-semibold text-[#43B3DE]"
                >{{ settlementDetails.records.total_amount }}
                {{ settlementDetails.records.currency }}</span
              >
            </div>
            <div class="flex justify-between items-center py-3">
              <span
                class="text-sm font-medium text-gray-600 dark:text-gray-400"
                >{{ $t("settled_by") }}</span
              >
              <span class="font-semibold text-gray-900 dark:text-white">{{
                settlementDetails.records.settled_by
              }}</span>
            </div>
          </div>
        </UCard>

        <!-- Settlement stats card -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t("settlement.statistics") }}
            </h2>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Total transactions card -->
            <div
              class="bg-gradient-to-br from-[#43B3DE] to-[#7FCDE8] rounded-lg p-6 text-white"
            >
              <div class="flex flex-col items-center text-center">
                <div class="bg-white/20 p-3 rounded-full mb-4">
                  <UIcon name="i-lucide-sigma" class="w-8 h-8" />
                </div>
                <h3 class="text-sm font-medium opacity-90 mb-2">
                  {{ $t("settlement.total_transactions") }}
                </h3>
                <p class="text-3xl font-bold">
                  {{ settlementDetails.records.totalSettled }}
                </p>
              </div>
            </div>

            <!-- Success transactions card -->
            <div
              class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white"
            >
              <div class="flex flex-col items-center text-center">
                <div class="bg-white/20 p-3 rounded-full mb-4">
                  <UIcon name="i-lucide-check" class="w-8 h-8" />
                </div>
                <h3 class="text-sm font-medium opacity-90 mb-2">
                  {{ $t("settlement.successful") }}
                </h3>
                <p class="text-3xl font-bold">
                  {{ settlementDetails.records.success }}
                </p>
              </div>
            </div>

            <!-- Failed transactions card -->
            <div
              class="bg-gradient-to-br from-red-200 to-red-300 rounded-lg p-6 text-white"
            >
              <div class="flex flex-col items-center text-center">
                <div class="bg-white/20 p-3 rounded-full mb-4">
                  <UIcon name="i-lucide-x" class="w-8 h-8" />
                </div>
                <h3 class="text-sm font-medium opacity-90 mb-2">
                  {{ $t("settlement.failed") }}
                </h3>
                <p class="text-3xl font-bold">
                  {{ settlementDetails.records.fail }}
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Settlement details table (Optional) -->

        <!-- <UCard class="lg:col-span-3">
        <template #header>
          <h2 class="text-lg font-semibold">{{ $t('settlement.transactions') }}</h2>
        </template>
        
        <div class="text-center py-4 text-gray-500">
          <p>{{ $t('settlement.detailed_transactions_message') }}</p>
        </div>
      </UCard> -->
      </div>
    </div>
    <SettlementHistoryTable
      :settlementHistorys="settlementHistoryDetails"
      :totalPage="settlementDetails?.total_page || 1"
      :settlement_id="settlementId"
      :total="settlementDetails?.total_record || 0"
      :onSearchSubmit="handleSearchSubmit"
    />
  </div>
</template>

<style>
.text-sm2 {
  font-size: 0.775rem;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "#i18n";
import { useSupplierApi } from "~/composables/api/useSupplierApi";
import { useApiExecutor } from "~/composables/api/useApiExecutor";
import { useClipboard } from "~/composables/useClipboard";
import type {
  SettlementHistoryDetail,
  SettlementHistoryDetailResponse,
  SettlementHistoryRecord,
  SettlementHistoryResponse,
} from "~/models/settlement";
import SettlementHistoryTable from "~/components/tables/SettlementHistoryTable.vue";
import type { SettlementHistoryDetailQuery } from "~/models/settlement";
import { useCurrency } from "~/composables/utils/useCurrency";
const supplierApi = useSupplierApi();

definePageMeta({
  auth: true,
  breadcrumbs: [
    {
      label: "Wallet Settlement",
      to: "/settlement/wallet-settlement",
    },
    {
      label: "Details",
      active: true,
    },
  ],
});
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { execute } = useApiExecutor();
const { copy, isCopied } = useClipboard();

// Get settlement ID from route params
const settlementId = route.params.id as string;

// State management
const loading = ref(true);
const error = ref("");
const settlementDetails = ref<SettlementHistoryDetailResponse>();
const settlementHistoryDetails = ref<SettlementHistoryDetail[]>([]);
const settlementHistoryQuery = ref<SettlementHistoryDetailQuery>({
  search: "",
  status: "success",
  settlement_history_id: settlementId,
  page: 1,
  page_size: 10,
});

// Format date for display
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

// Determine status color based on status value
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "success":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "failed":
    case "error":
      return "error";
    default:
      return "neutral";
  }
};

// Go back to settlement list
const goBack = () => {
  router.back();
};

// Copy settlement ID to clipboard
const copySettlementId = async () => {
  const success = await copy(
    settlementDetails.value?.records.settlement_history_id?.toString() || ""
  );
  if (success) {
    // Optional: Show toast notification
    console.log("Settlement ID copied to clipboard");
  }
};

// Fetch settlement details
const fetchSettlementDetails = async () => {
  loading.value = true;
  error.value = "";

  try {
    // Direct call to the API function without using execute
    const response = await supplierApi.getSettlementHistoryById(
      settlementHistoryQuery.value
    );

    settlementDetails.value = response;
    settlementHistoryDetails.value = response.records.settle_details || [];
  } catch (e: any) {
    console.error("Error fetching settlement details:", e);
    error.value = e.message || "Failed to load settlement details";
  } finally {
    loading.value = false;
  }
};

// Handle search submit from SettlementHistoryTable
const handleSearchSubmit = (query: SettlementHistoryDetailQuery) => {
  console.log("Search query submitted:", query);
  settlementHistoryQuery.value = query;
  fetchSettlementDetails();
};

// Load data on component mount
onMounted(() => {
  fetchSettlementDetails();
});

useHead({
  title: `${t("settlement.details_title")} - Bill24 Admin Portal`,
});
</script>
