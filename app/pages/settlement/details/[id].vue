<template>
  <div class="flex flex-col space-y-6">
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
    <div v-else-if="settlementDetails" class="gap-4 flex flex-row">
      <div class="flex flex-1 flex-col gap-4">
        <UCard>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t("settlement_history_details.total_amount") }}
          </p>
          <p class="text-2xl font-semibold text-primary">
            {{
              useCurrency().formatAmount(settlementDetails.records.total_amount)
            }}
            {{
              settlementDetails.records.currency_id ||
              settlementDetails.records.currency
            }}
          </p>
        </UCard>
        <!-- Settlement overview card -->
        <UCard class="flex-1">
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

          <div
            class="flex flex-row justify-between md:grid-rows-2 lg:grid-rows-3"
          >
            <div class="flex flex-col items-start text-center">
              <UIcon name="i-lucide-calendar" class="w-8 h-8 mb-2" />
              <h3 class="text-sm font-medium opacity-90 mb-1">
                {{ $t("settlement_history_details.settlement_date") }}
              </h3>
              <p class="text-gray-700 dark:text-gray-300">
                {{
                  useFormat().formatDateTime(
                    settlementDetails.records.settlement_date, {
                      dateStyle: userPreferences?.dateFormat || "medium",
                      timeStyle: userPreferences?.timeFormat || "short",
                    }
                  )
                }}
              </p>
            </div>

            <div class="flex flex-col items-start text-center">
              <UIcon name="i-lucide-users" class="w-8 h-8 mb-2" />
              <h3 class="text-sm font-medium opacity-90 mb-1">
                {{ $t("settlement_history_details.total_supplier") }}
              </h3>
              <p class="text-gray-700 dark:text-gray-300">
                {{ settlementDetails.records.total_supplier }}
              </p>
            </div>

            <div class="flex flex-col items-start text-center">
              <UIcon name="i-lucide-user-check" class="w-8 h-8 mb-2" />
              <h3 class="text-sm font-medium opacity-90 mb-1">
                {{ $t("settlement_history_details.settled_by") }}
              </h3>
              <p class="text-gray-700 dark:text-gray-300">
                {{ settlementDetails.records.settled_by }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
      <!-- Settlement stats card -->
      <UCard class="flex-1">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t("settlement.statistics") }}
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
                  {{ $t("settlement.total_transactions") }}
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
                  {{ $t("settlement.successful") }}
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
                <h3
                  class="text-xs font-medium text-white text-shadow-xs mb-0.5 truncate"
                >
                  {{ $t("settlement.failed") }}
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
      :settlementHistorys="settlementHistoryDetails"
      :totalPage="settlementDetails?.total_page || 1"
      :settlement_id="settlementId"
      :total="settlementDetails?.total_record || 0"
      :currentQuery="settlementHistoryQuery"
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
} from "~/models/settlement";
import SettlementHistoryTable from "~/components/tables/SettlementHistoryTable.vue";
import type { SettlementHistoryDetailQuery } from "~/models/settlement";
import { useCurrency } from "~/composables/utils/useCurrency";
import { useFormat } from "~/composables/utils/useFormat";
import { useUserPreferences } from "~/composables/utils/useUserPreferences";
const supplierApi = useSupplierApi();


const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { execute } = useApiExecutor();
const { copy, isCopied } = useClipboard();

definePageMeta({
  auth: true,
  breadcrumbs: [
    {
      label: "wallet_settlements",
      to: "/settlement/wallet-settlement",
    },
    {
      label: "details",
      active: true,
    },
  ],
});

// Get settlement ID from route params
const settlementId = route.params.id as string;

const userPreferences = useUserPreferences().getPreferences();

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
const fetchSettlementDetails = async (showError = true) => {
  loading.value = true;
  error.value = "";

  try {
    // Direct call to the API function without using execute
    const response = await supplierApi.getSettlementHistoryById(
      settlementHistoryQuery.value
    );
    if (response && response.records) {
      settlementDetails.value = response;
      settlementHistoryDetails.value = response.records.settle_details || [];
    }
    else {
      if (showError) {
        await useNotification().showError({
          title: "No Settlement Details Found",
          description: "No settlement details found for this ID.",
        });
      }
      if (settlementHistoryDetails.value) {
        settlementHistoryDetails.value = [];
      }
    }

  } catch (e: any) {
    error.value = e.message || "Failed to load settlement details";
    useErrorHandler().handleApiError(e);
    // Optionally, you can show a toast notification here
  } finally {
    loading.value = false;
  }
};

// Handle search submit from SettlementHistoryTable
const handleSearchSubmit = (query: SettlementHistoryDetailQuery) => {
  console.log("Search query submitted:", query);
  settlementHistoryQuery.value = query;
  fetchSettlementDetails(false);
};

// Load data on component mount
onMounted(() => {
  fetchSettlementDetails();
});

useHead({
  title: `${t("settlement.details_title")} - Bill24 Admin Portal`,
});
</script>
