<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { FeeModel } from '~/models/settlement'
import { useFeeConfigApi } from '~/composables/api/useFeeConfigApi'

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'settings.fee_config', to: '/settings/fee-config' },
    { label: 'view_fee_detail', active: true },
  ],
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const feeConfigApi = useFeeConfigApi()

const feeModel = ref<FeeModel>({
  code: '',
  name: '',
  fee_type: '',
  currency: '',
  fee_details: [],
  allocate_details: [],
  allocation_rule_id: '',
  supplier_id: '',
  id: '',
})

const loading = ref(true)

// Fetch fee config details
const fetchFeeConfig = async () => {
  try {
    loading.value = true
    const feeId = route.params.id as string

    // TODO: Replace with actual API call
    const response = await feeConfigApi.findFeeConfigById({ id: feeId })
    feeModel.value = response
    if (!feeModel.value) {
      throw new Error('Fee config not found')
    }
  } catch (error) {
    console.error('Error fetching fee config:', error)
    toast.add({
      title: t('error'),
      description: t('failed_to_load_fee_config'),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

const getFeeTypeLabel = (type: string) => {
  return type === 'fixed' ? t('fixed_fee') : t('percentage_fee')
}

const editFeeConfig = () => {
  router.push(`/settings/fee-config/${route.params.id}/edit`)
}

onMounted(() => {
  fetchFeeConfig()
})
</script>

<template>
  <div class="container mx-auto max-w-full px-1">
    <LoadingSpinner v-if="loading" fullscreen />

    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="p-6 lg:p-8">
        <!-- Header -->
        <div class="space-y-6">
          <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <UButton
                  color="primary"
                  variant="ghost"
                  icon="i-lucide-arrow-left"
                  size="xl"
                  class="mr-4 bg-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  @click="router.back()"
                />
                <div>
                  <h2 class="text-lg text-primary font-semibold dark:text-white flex items-center">
                    {{ t('view_fee_detail') }}
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ t('view_fee_detail_description') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('code') }}
              </label>
              <div
                class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 h-8 flex items-center"
              >
                <span class="text-sm text-gray-900 dark:text-gray-100">{{ feeModel.code }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('fee_name') }}
              </label>
              <div
                class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 h-8 flex items-center"
              >
                <span class="text-sm text-gray-900 dark:text-gray-100">{{ feeModel.name }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('fee_type') }}
              </label>
              <div
                class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 h-8 flex items-center"
              >
                <span class="text-sm text-gray-900 dark:text-gray-100">{{
                  getFeeTypeLabel(feeModel.fee_type)
                }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('currency') }}
              </label>
              <div
                class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 h-8 flex items-center"
              >
                <span class="text-sm text-gray-900 dark:text-gray-100">{{
                  feeModel.currency
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Two Tables Side by Side -->
        <div class="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start mt-8">
          <!-- Charge Fee Table -->
          <div class="xl:col-span-3 space-y-4">
            <div class="flex items-center">
              <h3 class="text-lg font-semibold text-primary dark:text-white">
                {{ t('charge_fee') }}
              </h3>
            </div>

            <div
              class="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th
                        class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider"
                      >
                        {{ t('start_amount') }}
                      </th>
                      <th
                        class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider"
                      >
                        {{ t('end_amount') }}
                      </th>
                      <th
                        class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider"
                      >
                        {{ t('fee_amount') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                  >
                    <tr
                      v-for="(feeDetail, index) in feeModel.fee_details"
                      :key="index"
                      class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {{
                          feeModel.fee_type === 'percentage'
                            ? `${feeDetail.start_amount}`
                            : formatCurrency(feeDetail.start_amount, feeModel.currency)
                        }}
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {{
                          feeModel.fee_type === 'percentage'
                            ? `${feeDetail.end_amount}`
                            : formatCurrency(feeDetail.end_amount, feeModel.currency)
                        }}
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {{
                          // formatAmount(
                          //   feeDetail.fee_amount,
                          //   (feeDetail.fee_type === 'percentage'
                          //     ? feeDetail.fee_rate > 0 || feeDetail.fee_type === 'percentage'
                          //       ? '%'
                          //       : feeModel.currency
                          //     : feeModel.currency),
                          //   { showSymbol: false}
                          // )
                          feeModel.fee_type === 'percentage'
                            ? `${feeDetail.fee_amount} ${
                                feeDetail.fee_rate > 0 || feeDetail.fee_type === 'percentage'
                                  ? '%'
                                  : feeModel.currency === 'KHR'
                                    ? '៛'
                                    : '$'
                              }`
                            : formatCurrency(feeDetail.fee_amount, feeModel.currency)
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div v-if="feeModel.fee_details.length === 0" class="p-8">
                  <TableEmptyState />
                </div>
              </div>
            </div>
          </div>

          <!-- Sharing Fee Table -->
          <div class="xl:col-span-2 space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-primary dark:text-white">
                {{ t('sharing_fee') }}
              </h3>
              <UTooltip text="The fee value is set to match the charge fees">
                <UIcon
                  name="i-lucide-info"
                  class="w-4 h-4 text-gray-600 hover:text-primary cursor-help transition-colors duration-200"
                />
              </UTooltip>
            </div>

            <div
              class="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th
                        class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider"
                      >
                        {{ t('name') }}
                      </th>
                      <th
                        class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider"
                      >
                        {{ t('fee_amount') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                  >
                    <tr
                      v-for="(sharing, index) in feeModel.allocate_details"
                      :key="index"
                      class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {{ sharing.name }}
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {{
                          feeModel.fee_type === 'percentage'
                            ? `${sharing.value}%`
                            : formatCurrency(sharing.value, feeModel.currency)
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div v-if="feeModel.allocate_details.length === 0" class="p-8">
                  <TableEmptyState />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <UButton color="primary" variant="outline" @click="router.back()">
            {{ t('back') }}
          </UButton>
          <UButton color="primary" icon="i-lucide-edit" @click="editFeeConfig">
            {{ t('edit') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
