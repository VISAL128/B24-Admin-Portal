<template>
  <div class="flex flex-col space-y-6">
    <!-- Breadcrumb and header section -->
    <div class="flex flex-wrap items-center justify-between gap-4 px-4 py-4 bg-white dark:bg-gray-900 rounded shadow">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/settlement" class="hover:text-primary transition-colors">
            {{ $t('settlement.dashboard_title') }}
          </NuxtLink>
          <span>/</span>
          <span>{{ $t('settlement.details_title') }}</span>
        </div>
        <h1 class="text-xl font-bold">{{ $t('settlement.details_title') }} #{{ settlementId }}</h1>
      </div>

      <div class="flex items-center gap-2">
        <UButton color="primary" icon="i-lucide-arrow-left" @click="goBack">
          {{ $t('back') }}
        </UButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-10">
      <UIcon name="i-lucide-loader-2" class="animate-spin h-8 w-8 text-gray-500" />
    </div>

    <!-- Error state -->
    <UAlert v-else-if="error" title="Error" color="error" variant="soft" icon="i-lucide-alert-circle">
      {{ error }}
    </UAlert>

    <!-- Content when data is loaded -->
    <div v-else-if="settlementDetails" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Settlement overview card -->
      <UCard class="lg:col-span-1">
        <!-- <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ $t('settlement.overview') }}</h2>
            <UBadge color="primary" size="lg">
              {{ settlementDetails.success ? $t('settlement.status.success') : $t('settlement.status.failed') }}
            </UBadge>
          </div>
        </template> -->

        <div class="space-y-4">
          <div class="flex justify-between items-center py-2 border-b dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400">{{ $t('settlement_id') }}</span>
            <span class="font-medium">{{ settlementDetails.settlement_id }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400">{{ $t('settlement_date') }}</span>
            <span class="font-medium">{{ formatDate(settlementDetails.settlement_date) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400">{{ $t('total_supplier') }}</span>
            <span class="font-medium">{{ settlementDetails.total_supplier }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400">{{ $t('total_amount') }}</span>
            <span class="font-medium">{{ settlementDetails.total_amount }} {{ settlementDetails.currency }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400">{{ $t('settled_by') }}</span>
            <span class="font-medium">{{ settlementDetails.settled_by }}</span>
          </div>
        </div>
      </UCard>

      <!-- Settlement stats card -->
      <UCard class="lg:col-span-2">
        <template #header>
          <h2 class="text-lg font-semibold">{{ $t('settlement.statistics') }}</h2>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Total transactions card -->
          <UCard class="bg-gray-50 dark:bg-gray-800">
            <div class="flex flex-col items-center text-center p-2">
              <UIcon name="i-lucide-sigma" class="w-8 h-8 text-gray-600 mb-2" />
              <h3 class="text-lg font-medium">{{ $t('settlement.total_transactions') }}</h3>
              <p class="text-3xl font-bold">{{ settlementDetails.total_Settled }}</p>
            </div>
          </UCard>

          <!-- Success transactions card -->
          <UCard class="bg-green-50 dark:bg-green-900/20">
            <div class="flex flex-col items-center text-center p-2">
              <UIcon name="i-lucide-check" class="w-8 h-8 text-green-600 mb-2" />
              <h3 class="text-lg font-medium">{{ $t('settlement.successful') }}</h3>
              <p class="text-3xl font-bold text-green-600">{{ settlementDetails.success }}</p>
            </div>
          </UCard>

          <!-- Failed transactions card -->
          <UCard class="bg-red-50 dark:bg-red-900/20">
            <div class="flex flex-col items-center text-center p-2">
              <UIcon name="i-lucide-x" class="w-8 h-8 text-red-600 mb-2" />
              <h3 class="text-lg font-medium">{{ $t('settlement.failed') }}</h3>
              <p class="text-3xl font-bold text-red-600">{{ settlementDetails.fail }}</p>
            </div>
          </UCard>
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
    <SettlementHistoryTable :settlementHistorys="settlementHistoryDetails" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '#i18n';
import { useSupplierApi } from '~/composables/api/useSupplierApi';
import { useApiExecutor } from '~/composables/api/useApiExecutor';
import type { SettlementHistoryDetail, SettlementHistoryRecord } from '~/models/settlement';
import SettlementHistoryTable from '~/components/tables/SettlementHistoryTable.vue';
const supplierApi = useSupplierApi();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { execute } = useApiExecutor();

// Get settlement ID from route params
const settlementId = route.params.id as string;

// State management
const loading = ref(true);
const error = ref('');
const settlementDetails = ref<SettlementHistoryRecord>();
const settlementHistoryDetails = ref<SettlementHistoryDetail[]>([]);

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
    case 'completed':
    case 'success':
      return 'success';
    case 'pending':
    case 'processing':
      return 'warning';
    case 'failed':
    case 'error':
      return 'error';
    default:
      return 'neutral';
  }
};

// Go back to settlement list
const goBack = () => {
  router.back();
};

// Fetch settlement details
const fetchSettlementDetails = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Direct call to the API function without using execute
    const response = await supplierApi.getSettlementHistoryById(settlementId);
    settlementDetails.value = response;
    settlementHistoryDetails.value = response.settle_details || [];
  } catch (e: any) {
    console.error('Error fetching settlement details:', e);
    error.value = e.message || 'Failed to load settlement details';
  } finally {
    loading.value = false;
  }
};

// Load data on component mount
onMounted(() => {
  fetchSettlementDetails();
});

definePageMeta({
  auth: true
});

useHead({
  title: `${t('settlement.details_title')} - Bill24 Admin Portal`
});

</script>
