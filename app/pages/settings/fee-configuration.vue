<template>
  <div class="max-h-screen">
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-primary mb-2 dark:text-primary">
        {{ t('set_fee_configuration_title') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-300 text-sm">
        {{ t('set_fee_configuration_description') }}
      </p>
    </div>

    <!-- Currency Selector -->
    <div class="mb-8">
      <div
        class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-sm"
      >
        <button
          :class="[
            'px-6 py-2 text-sm font-medium rounded-md transition-all duration-200',
            selectedCurrency === 'KHR'
              ? 'bg-primary text-white shadow-sm dark:bg-primary'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
          ]"
          @click="switchCurrency('KHR')"
        >
          KHR
        </button>
        <button
          :class="[
            'px-6 py-2 text-sm font-medium rounded-md transition-all duration-200',
            selectedCurrency === 'USD'
              ? 'bg-primary text-white shadow-sm dark:bg-primary'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
          ]"
          @click="switchCurrency('USD')"
        >
          USD
        </button>
      </div>
    </div>

    <!-- Combined Fee Section -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[500px] max-h-[500px]"
    >
      <div class="p-2">
        <UTable
          :key="tableKey"
          ref="table"
          :data="transactionFee"
          :loading-animation="TABLE_CONSTANTS.LOADING_ANIMATION"
          :loading-color="TABLE_CONSTANTS.LOADING_COLOR"
          :columns="tableColumns"
          sticky
          class="h-[440px] max-h-[440px] rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800"
          :ui="{
            tbody: 'divide-y divide-gray-200 dark:divide-gray-700',
            tr: 'px-2 py-3',
            td: 'whitespace-nowrap px-2 py-3 text-sm text-gray-900 dark:text-gray-100',
            th: 'whitespace-nowrap px-2 py-3 text-sm text-gray-900 dark:text-gray-100',
          }"
        >
          <template #empty>
            <div class="py-30">
              <TableEmptyState />
            </div>
          </template>
        </UTable>

        <!-- Add Row Button -->
        <div class="mt-1 pl-2 flex justify-start">
          <UButton
            :label="t('add_row')"
            color="primary"
            variant="solid"
            class="text-xs disabled:bg-gray-300"
            :disabled="hasUnlimitedRow"
            @click="addRow"
          >
            <template #leading>
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            </template>
          </UButton>

          <!-- Add Supplier Modal -->
          <UModal
            v-model:open="showAddSuppliers"
            :dismissible="false"
            :title="t('add_fee_sharing_supplier_title')"
            :description="t('add_fee_sharing_supplier_description')"
            :ui="{
              title: 'text-lg font-semibold text-primary',
              description: 'text-sm text-gray-600',
            }"
          >
            <UButton
              :label="t('add_supplier')"
              color="primary"
              variant="solid"
              class="ml-4 text-xs"
              @click="fetchSharingSuppliers"
            >
              <template #leading>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </template>
            </UButton>

            <template #body>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Select Supplier</label
                  >
                  <USelectMenu
                    :items="filteredAvailableSuppliers"
                    :placeholder="t('choose_supplier')"
                    :search-input="false"
                    option-attribute="label"
                    value-attribute="value"
                    size="sm"
                    class="w-full"
                    :loading="loading"
                    @update:model-value="handleSupplierSelection"
                  />
                  <p
                    v-if="filteredAvailableSuppliers.length === 0 && !loading"
                    class="text-sm text-gray-500 mt-2"
                  >
                    {{ t('all_available_suppliers_added') }}
                  </p>
                </div>

                <div class="flex justify-end space-x-3 pt-4">
                  <UButton
                    :label="t('cancel')"
                    color="primary"
                    variant="outline"
                    class="text-xs w-21 justify-center"
                    @click="closeModal"
                  />
                  <UButton
                    :label="t('ok')"
                    color="primary"
                    variant="solid"
                    class="text-xs w-21 justify-center"
                    :disabled="
                      !newSupplier.name || filteredAvailableSuppliers.length === 0 || loading
                    "
                    @click="addSupplier"
                  />
                </div>
              </div>
            </template>
          </UModal>

          <!-- Remove Supplier Confirmation Modal -->
          <UModal
            v-model:open="showRemoveSupplierModal"
            :dismissible="false"
            :title="t('confirm')"
            :description="t('remove_supplier_sharing', { name: supplierToRemove?.name })"
            :ui="{
              title: 'text-lg font-semibold text-primary',
              description: 'text-sm text-gray-600',
            }"
          >
            <template #body>
              <div class="flex justify-end space-x-3 pt-4">
                <UButton
                  label="Cancel"
                  color="neutral"
                  variant="outline"
                  class="text-xs w-21 justify-center"
                  @click="showRemoveSupplierModal = false"
                />
                <UButton
                  :label="t('remove')"
                  color="error"
                  variant="solid"
                  class="text-xs w-21 justify-center"
                  @click="removeSupplier(supplierToRemove?.id || '')"
                />
              </div>
            </template>
          </UModal>
        </div>
      </div>
    </div>

    <!-- Show Message -->
    <UModal v-model:open="showValidationDialog" :dismissible="false">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <!-- Left side: Icon and Title -->
          <div class="flex items-center gap-3">
            <!-- Icon -->
            <div
              :class="dialogIconBgClass"
              class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full"
            >
              <UIcon :name="dialogIconName" class="h-5 w-5" :class="dialogTitleClass" />
            </div>

            <!-- Title -->
            <h3 :class="['text-base font-semibold leading-4', dialogTitleClass]">
              {{ validationDialogTitle }}
            </h3>
          </div>

          <!-- Right side: Close Icon -->
          <UButton
            icon="i-heroicons-x-mark"
            :color="validationDialogType === 'success' ? 'neutral' : 'error'"
            variant="ghost"
            size="md"
            square
            class="flex-shrink-0"
            @click="showValidationDialog = false"
          />
        </div>
      </template>
      <template #body>
        <div class="px-2">
          <div class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
            {{ validationDialogMessage }}
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <UButton color="primary" @click="showValidationDialog = false"> {{ t('ok') }} </UButton>
        </div>
      </template>
    </UModal>

    <!-- Fee Calculation Display -->
    <div
      class="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
    >
      <div class="flex items-center mb-4">
        <!-- Preview Icon -->
        <UIcon name="i-lucide-eye" class="w-5 h-5 text-primary dark:text-primary mr-2" />
        <!-- Header Text -->
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Preview</h3>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-400 dark:text-gray-500">
          {{ t('preview_fee_calculation_amount') }}:
          {{
            formatAmount(selectedCurrency === 'USD' ? 100 : 400000, selectedCurrency, {
              showSymbol: true,
            })
          }}
        </h3>

        <div
          v-if="transactionFee.length === 0"
          class="text-gray-500 text-xs dark:text-gray-400 italic"
        >
          {{ t('preview_fee_calculation_tip') }}
        </div>

        <div v-else>
          <p class="text-gray-500 text-sm dark:text-gray-400">
            <span class="font-medium">{{ t('transaction_fee') }}: </span>
            <span class="text-primary dark:text-primary font-semibold">
              {{
                formatAmount(feeCalculation.transactionFee, selectedCurrency, { showSymbol: true })
              }}
            </span>
          </p>

          <div v-if="Object.keys(feeCalculation.distribution).length > 0">
            <p class="font-medium text-gray-500 text-sm dark:text-gray-400 mb-2">
              {{ t('supplier_sharing_fee') }}:
            </p>
            <ul class="space-y-1 ml-4">
              <li
                v-for="(amount, supplier) in feeCalculation.distribution"
                :key="supplier"
                class="text-gray-600 text-sm dark:text-gray-300"
              >
                <span class="font-medium">• {{ supplier }}: </span>
                <span class="text-primary text-sm dark:text-primary">
                  {{ formatAmount(amount, selectedCurrency, { showSymbol: true }) }}
                </span>
              </li>
            </ul>
          </div>

          <div v-else class="text-gray-500 text-sm dark:text-gray-400 italic">
            {{ t('preview_fee_calculation_no_supplier') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-6 flex justify-end">
      <UButton
        :label="t('save')"
        color="primary"
        variant="solid"
        class="text-xs w-21 justify-center"
        @click="saveFeeConfiguration"
      >
        <template #leading>
          <UIcon name="i-heroicons-document-arrow-down" class="w-4 h-4" />
        </template>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransactionFeeRow, Supplier } from '~/models/feeConfiguration'
import FeeConfiguration from '~/models/feeConfiguration'
import { useI18n } from 'vue-i18n'
import type { SharingSupplier } from '~/models/settlement'
import { useFeeConfigApi } from '~/composables/api/useFeeConfigApi'
import type { TableColumn } from '@nuxt/ui'
import { h } from 'vue'
import { get } from '@vueuse/core'

const { t } = useI18n()

definePageMeta({
  auth: false,
  // breadcrumbs: [{ label: 'settings.fee_config', active: true }],
})

const feeConfig = ref(new FeeConfiguration())
const selectedCurrency = ref('KHR')
const showAddSuppliers = ref(false)
const showSettingsDropdown = ref(false)
const showRemoveSupplierModal = ref(false)
const supplierToRemove = ref<Supplier | null>(null)
const newSupplier = ref({ name: '', id: '' })
const errorHandler = useErrorHandler()
const errorMsg = ref('')
const loading = ref(true)
const toast = useToast()
const supplierList = ref<SharingSupplier[]>([])
const isInitialized = ref(false)
const showValidationDialog = ref(false)
const validationDialogTitle = ref('')
const validationDialogMessage = ref('')
const validationDialogType = ref<'error' | 'success'>('error')
// UI helpers for dynamic dialog icon and styles (prevent undefined name error)
const dialogIconBgClass = computed(() =>
  validationDialogType.value === 'success'
    ? 'bg-green-100 dark:bg-green-900/20'
    : 'bg-red-100 dark:bg-red-900/20'
)

const dialogTitleClass = computed(() =>
  validationDialogType.value === 'success'
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'
)

const dialogIconName = computed(() =>
  validationDialogType.value === 'success' ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'
)

const feeConfigApi = useFeeConfigApi()

const transactionFee = computed(() => {
  if (!isInitialized.value) return []
  return feeConfig.value.getCurrencyFees(selectedCurrency.value).transaction_fees
})

const distributionFee = computed(() => {
  if (!isInitialized.value) return []
  return feeConfig.value.getCurrencyFees(selectedCurrency.value).allocate_details
})

const visibleSuppliers = computed(() => {
  if (!isInitialized.value || distributionFee.value.length === 0) return []
  return distributionFee.value
  // return distributionFee.value.filter((supplier) => supplier.visible)
})

const feeCalculation = computed(() => {
  if (!isInitialized.value || transactionFee.value.length === 0) {
    return { transactionFee: 0, distribution: {} }
  }

  // Use different test amounts based on currency
  const testAmount = selectedCurrency.value === 'USD' ? 100 : 400000
  const calculation = feeConfig.value.calculateFees(selectedCurrency.value, testAmount)

  // Patch distribution for correct display based on fee type
  const result: any = { ...calculation }
  // Find the row that matches the test amount
  const row = transactionFee.value.find((r) => {
    if (r.unlimited) return true
    return (
      testAmount >= r.start_amount &&
      (r.unlimited || (r.end_amount !== null && testAmount <= r.end_amount))
    )
  })
  if (row && row.supplier_sharings && row.supplier_sharings.length > 0) {
    // Also update transactionFee for preview
    result.transactionFee =
      row.fee_type === 'fixed' ? row.fee_amount : (row.fee_amount / 100) * testAmount
    result.distribution = {}
    row.supplier_sharings.forEach((s) => {
      if (row.fee_type === 'fixed') {
        result.distribution[visibleSuppliers.value.find((vs) => vs.id === s.id)?.name || s.id] =
          s.value
      } else if (row.fee_type === 'percentage') {
        // Calculate the actual amount for each supplier
        const supplierAmount = (s.value / 100) * result.transactionFee
        result.distribution[visibleSuppliers.value.find((vs) => vs.id === s.id)?.name || s.id] =
          supplierAmount
      }
    })
  }

  return result
})

const hasUnlimitedRow = computed(() => {
  return transactionFee.value.some((row) => row.unlimited)
})

// Add a reactive key to force table re-render
const tableKey = ref(0)

// Computed property for dynamic table columns
const tableColumns = computed<TableColumn<TransactionFeeRow>[]>(() => {
  console.log('Recomputing table columns, visible suppliers:', visibleSuppliers.value.length)

  const staticColumns: TableColumn<TransactionFeeRow>[] = [
    {
      accessorKey: 'startAmount',
      size: 100,
      header: () => h('div', { class: 'text-right' }, t('start_amount')),
      cell: ({ row, table }) => {
        const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
        const rowData = row.original
        const UInput = resolveComponent('UInput')
        return h(UInput, {
          modelValue: formatAmount(rowData.start_amount || 0, selectedCurrency.value, {
            showSymbol: false,
          }),
          type: 'text',
          class: 'w-full',
          size: 'sm',
          ui: { base: 'text-right' },
          onInput: (event: Event) => handleAmountInput(event, index, 'start_amount'),
          onKeypress: handleNumericKeyPress,
        })
      },
    },
    {
      accessorKey: 'endAmount',
      header: () => h('div', { class: 'text-right' }, t('end_amount')),
      cell: ({ row, table }) => {
        const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
        const UInput = resolveComponent('UInput')
        const UButton = resolveComponent('UButton')
        const rowData = row.original
        return h(
          UInput,
          {
            modelValue: rowData.unlimited
              ? 'Unlimited'
              : formatAmount(rowData.end_amount || 0, selectedCurrency.value, {
                  showSymbol: false,
                }),
            type: 'text',
            placeholder: rowData.unlimited ? 'Unlimited' : 'Enter amount',
            disabled: rowData.unlimited,
            class: 'w-full pe-0',
            size: 'sm',
            ui: {
              base: rowData.unlimited
                ? 'text-right bg-gray-200 dark:bg-gray-600 dark:text-gray-300'
                : 'text-right',
              trailing: 'pe-0',
            },
            onInput: (event: Event) => handleAmountInput(event, index, 'end_amount'),
            onKeypress: handleNumericKeyPress,
          },
          {
            trailing: () =>
              h(
                UButton,
                {
                  color: 'primary',
                  variant: 'ghost',
                  size: 'sm',
                  square: true,
                  onClick: () => toggleUnlimited(index),
                },
                () => '∞'
              ),
          }
        )
      },
    },
    {
      accessorKey: 'feeType',
      header: () => h('div', { class: 'text-right' }, t('charge_type')),
      cell: ({ row, table }) => {
        const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
        const rowData = row.original
        const USelectMenu = resolveComponent('USelectMenu')
        return h(USelectMenu, {
          modelValue: {
            label:
              rowData.fee_type === 'percentage'
                ? '%'
                : selectedCurrency.value === 'KHR'
                  ? '៛'
                  : '$',
            value: rowData.fee_type === 'percentage' ? 'percentage' : 'fixed',
          },
          items: feeTypeOptions.value,
          placeholder: 'Select type',
          searchInput: false,
          optionAttribute: 'label',
          valueAttribute: 'value',
          size: 'sm',
          class: 'transition-all duration-200 w-full',
          'onUpdate:modelValue': (value: { value: string }) =>
            handleFeeDetailTypeChange(index, value.value),
          // onUpdateModelValue: (value: { value: string }) => handleFeeDetailTypeChange(index, value.value)
        })
      },
    },
    {
      accessorKey: 'feeAmount',
      header: () => h('div', { class: 'text-right' }, t('fee_amount')),
      cell: ({ row, table }) => {
        const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
        const rowData = row.original
        const UInput = resolveComponent('UInput')
        return h(
          UInput,
          {
            modelValue:
              rowData.fee_type === 'fixed'
                ? formatAmount(rowData.fee_amount || 0, selectedCurrency.value, {
                    showSymbol: false,
                  })
                : (rowData.fee_amount || 0).toString(),
            type: 'text',
            class: 'w-full',
            size: 'sm',
            ui: { base: 'text-right' },
            onInput: (event: Event) => handleFeeAmountInput(event, 'fee_amount', index),
            onKeypress: handleNumericKeyPress,
          },
          {
            trailing: () =>
              h(
                'span',
                { class: 'text-sm text-gray-500' },
                rowData.fee_type === 'fixed' ? getCurrencySymbol() : '%'
              ),
          }
        )
      },
    },
  ]

  // Force reactivity by explicitly depending on visibleSuppliers and tableKey
  const supplierColumns: TableColumn<TransactionFeeRow>[] = visibleSuppliers.value.map(
    (supplier) => {
      console.log(`Adding column for supplier: ${supplier.name} (${supplier.id})`)
      return {
        accessorKey: `supplier_${supplier.id}`,
        // header: () => h('div', { class: 'flex items-center justify-end space-x-2' }, [
        //   h('span', supplier.name),
        //   h('button', {
        //     class: 'text-xl text-red-500 hover:text-red-700 transition-colors ml-2',
        //     onClick: () => confirmRemoveSupplier(supplier)
        //   }, '×')
        // ]),
        header: () => {
          const UTooltip = resolveComponent('UTooltip')
          const UButton = resolveComponent('UButton')
          const UIcon = resolveComponent('UIcon')

          return h('div', { class: 'flex items-center justify-end space-x-2' }, [
            // Sharing icon
            h(
              UTooltip,
              { text: 'Sharing enabled', popper: { placement: 'top' } },
              {
                default: () =>
                  h(UIcon, {
                    // Try one of these heroicons depending on your set:
                    // name: 'i-heroicons-share-20-solid',
                    // name: 'i-heroicons-arrow-up-tray-20-solid',   // common "share" alt
                    name: 'i-heroicons-users-20-solid', // if “sharing with others” vibe
                    class: 'w-4 h-4 text-primary',
                  }),
              }
            ),
            h('span', supplier.name),

            h(
              UTooltip,
              { text: 'Remove fee sharing supplier', popper: { placement: 'top' } },
              {
                default: () =>
                  h(
                    UButton,
                    {
                      color: 'error',
                      variant: 'ghost',
                      size: 'xs',
                      square: true,
                      class: 'ml-2',
                      onClick: (e: MouseEvent) => {
                        e.stopPropagation() // avoid triggering header sort/resize
                        confirmRemoveSupplier(supplier)
                      },
                    },
                    {
                      default: () =>
                        h(UIcon, { name: 'i-heroicons-x-mark-20-solid', class: 'text-base' }),
                      // or: default: () => '×'
                    }
                  ),
              }
            ),
          ])
        },
        cell: ({ row, table }) => {
          const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
          const rowData = row.original
          const supplierData = rowData.supplier_sharings?.find((x) => x.id === supplier.id)
          const UInput = resolveComponent('UInput')
          return h(
            UInput,
            {
              modelValue:
                rowData.fee_type === 'fixed'
                  ? formatAmount(supplierData?.value || 0, selectedCurrency.value, {
                      showSymbol: false,
                    })
                  : (supplierData?.value || 0).toString(),
              type: 'text',
              class: 'w-full',
              size: 'sm',
              ui: { base: 'text-right' },
              onInput: (event: Event) => handleSupplierFeeInput(event, index, supplier.id),
              onKeypress: handleNumericKeyPress,
            },
            {
              trailing: () =>
                h(
                  'span',
                  { class: 'text-sm text-gray-500' },
                  rowData.fee_type === 'fixed' ? getCurrencySymbol() : '%'
                ),
            }
          )
        },
      }
    }
  )

  const actionColumn: TableColumn<TransactionFeeRow>[] = [
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ table, row }) => {
        const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
        return h('div', { class: 'flex items-center justify-center' }, [
          transactionFee.value.length > 1
            ? h(
                'button',
                {
                  class: 'text-2xl text-red-500 hover:text-red-700 transition-colors',
                  onClick: () =>
                    feeConfig.value.removeTransactionRow(selectedCurrency.value, index),
                },
                '×'
              )
            : null,
        ])
      },
    },
  ]

  const result = [...staticColumns, ...supplierColumns, ...actionColumn]
  console.log('Final table columns count:', result.length)
  return result
})

// Computed to filter out already added suppliers
const filteredAvailableSuppliers = computed(() => {
  const existingSupplierIds = new Set()
  distributionFee.value.forEach((supplier) => {
    existingSupplierIds.add(supplier.id)
  })

  return supplierList.value
    .filter((supplier) => !existingSupplierIds.has(supplier.id))
    .map((supplier) => ({
      label: supplier.name,
      value: supplier.id,
    }))
})

// Initialize and cleanup
onMounted(async () => {
  const handleClickOutside = () => {
    showSettingsDropdown.value = false
  }
  document.addEventListener('click', handleClickOutside)

  await feeConfig.value.initialize()
  isInitialized.value = true

  tableKey.value++

  // Wait for reactivity to update
  await nextTick()

  syncDistributionFeeRows()
})

onBeforeUnmount(() => {
  const handleClickOutside = () => {
    showSettingsDropdown.value = false
  }
  document.removeEventListener('click', handleClickOutside)
})

const TABLE_CONSTANTS = {
  LOADING_ANIMATION: 'spin',
  LOADING_COLOR: 'primary',
}

const addRow = () => {
  feeConfig.value.addRow(selectedCurrency.value)
  // Manually sync after adding a row
  nextTick(() => {
    syncDistributionFeeRows()
  })
}

// Options for fee type
const feeTypeOptions = computed(() => [
  { label: selectedCurrency.value === 'KHR' ? '៛' : '$', value: 'fixed' },
  { label: '%', value: 'percentage' },
])

const handleFeeDetailTypeChange = (index: number, value: string) => {
  console.log('Index:', index, 'Value:', value, 'FeeDetail:', transactionFee.value[index])
  const feeDetail = transactionFee.value[index]
  if (feeDetail) {
    // Update fee type
    transactionFee.value[index] = {
      ...feeDetail,
      fee_type: value as 'percentage' | 'fixed',
    }

    // If switching to percentage, reset fee_amount and each supplier value to 0
    if (value === 'percentage') {
      transactionFee.value[index].fee_amount = 0
      if (transactionFee.value[index].supplier_sharings) {
        transactionFee.value[index].supplier_sharings.forEach((s) => {
          s.value = 0
        })
      }
    }

    // Persist/update and refresh UI
    updateTransactionRow(index, transactionFee.value[index])

    // Force re-render of table to reflect the changes immediately
    tableKey.value++
    // allow DOM to update
    nextTick()
  }
}

// Add flag to prevent recursive calls
const isSyncing = ref(false)

const syncDistributionFeeRows = () => {
  // Prevent recursive calls
  if (isSyncing.value) return

  console.log('Syncing distribution fee rows...')
  isSyncing.value = true

  try {
    // Ensure each transaction fee row has supplier data for all visible suppliers
    transactionFee.value.forEach((txRow, _index) => {
      if (!txRow.supplier_sharings) {
        txRow.supplier_sharings = []
      }

      // Add missing suppliers to each transaction row
      visibleSuppliers.value.forEach((supplier) => {
        const existingSupplier = txRow.supplier_sharings.find((s) => s.id === supplier.id)
        if (!existingSupplier) {
          txRow.supplier_sharings.push({
            id: supplier.id,
            value: 0,
          })
        }
      })

      // Remove suppliers that are no longer visible
      txRow.supplier_sharings = txRow.supplier_sharings.filter((supplier) =>
        visibleSuppliers.value.some((vs) => vs.id === supplier.id)
      )
    })

    console.log('Distribution fee rows synced, transaction fee rows:', transactionFee.value.length)
    console.log('Visible suppliers:', visibleSuppliers.value.length)
  } finally {
    isSyncing.value = false
  }
}

const validateTableRow = (
  index: number,
  showToast = true,
  field: string = 'fee_amount'
): boolean => {
  const row = transactionFee.value[index]
  if (!row) return false

  // Validation 1: end_amount can't be less than start_amount
  if (
    field === 'end_amount' &&
    !row.unlimited &&
    row.end_amount !== null &&
    row.start_amount > row.end_amount
  ) {
    if (showToast) {
      toast.add({
        title: t('validation_error'),
        description: `${t('end_amount_cannot_be_less_than_start_amount')} - ${t('row_number', { row: index + 1 }) || `Row ${index + 1}`}`,
        color: 'error',
      })
    }
    return false
  }

  // New: For fixed fee type, fee_amount must not be greater than end_amount (when end_amount applies)
  if (
    field === 'fee_amount' &&
    row.fee_type === 'fixed' &&
    !row.unlimited &&
    row.fee_amount !== undefined &&
    row.fee_amount !== 0 &&
    row.end_amount !== null &&
    row.fee_amount > row.end_amount
  ) {
    if (showToast) {
      toast.add({
        title: t('validation_error'),
        description: t('fee_amount_cannot_exceed_end_amount', {
          fee: formatAmount(row.fee_amount, selectedCurrency.value),
          end: formatAmount(row.end_amount, selectedCurrency.value),
          row: index + 1,
        }),
        color: 'error',
      })
    }
    return false
  }

  if (
    field === 'fee_amount' &&
    row.fee_type === 'percentage' &&
    row.end_amount !== null &&
    row.fee_amount !== undefined &&
    ((row.unlimited && row.end_amount === 0) || (!row.unlimited && row.end_amount > 0)) &&
    row.fee_amount > 100
  ) {
    if (showToast) {
      toast.add({
        title: t('validation_error'),
        description: t('fee_amount_cannot_exceed_100_percent'),
        color: 'error',
      })
    }
    return false
  }

  // Validation 2: Sum of fee sharing suppliers checks
  const totalSupplierFees =
    row.supplier_sharings?.reduce((sum, supplier) => sum + (supplier.value || 0), 0) || 0
  const feeChargeValue = row.fee_amount || 0

  if (field === 'field_supplier' && row.fee_type === 'percentage') {
    // For percentage: total supplier fees cannot exceed the fee charge percentage
    if (totalSupplierFees > 100) {
      if (showToast) {
        toast.add({
          title: t('validation_error'),
          description: `${t('row_number', { row: index + 1 }) || `Row ${index + 1}`}: ${t(
            'total_supplier_fees_exceeds_fee_charge_percentage',
            { total: totalSupplierFees }
          )}`,
          color: 'error',
        })
      }
      return false
    }
  } else if (field === 'field_supplier') {
    // For fixed amount: total supplier fees cannot exceed the fee charge amount
    if (totalSupplierFees > feeChargeValue) {
      if (showToast) {
        toast.add({
          title: t('validation_error'),
          description: `${t('row_number', { row: index + 1 }) || `Row ${index + 1}`}: ${t(
            'total_supplier_fees_exceeds_fee_charge_fixed',
            {
              total: formatAmount(totalSupplierFees, selectedCurrency.value),
              fee: '100 %',
            }
          )}`,
          color: 'error',
        })
      }
      return false
    }
  }

  return true
}

const validateAllRows = (): boolean => {
  let isValid = true
  const errors: string[] = []
  if (!isInitialized.value || transactionFee.value.length === 0) {
    errors.push(t('transaction_fee_rows_cannot_be_empty'))
    isValid = false
  }
  transactionFee.value.forEach((row, index) => {
    // Check end amount vs start amount
    if (
      !row.unlimited &&
      ((row.end_amount !== null && row.start_amount > row.end_amount) || row.end_amount === 0)
    ) {
      errors.push(`• Row ${index + 1}: ${t('end_amount_cannot_be_less_than_start_amount')}`)
      isValid = false
    }

    // New: For fixed fee type ensure fee_amount not greater than end_amount
    if (
      row.fee_type === 'fixed' &&
      !row.unlimited &&
      row.end_amount !== null &&
      row.fee_amount !== undefined &&
      row.fee_amount > row.end_amount
    ) {
      errors.push(
        `• Row ${index + 1}: ${t('fee_amount_cannot_exceed_end_amount', {
          fee: formatAmount(row.fee_amount, selectedCurrency.value),
          end: formatAmount(row.end_amount, selectedCurrency.value),
        })}`
      )
      isValid = false
    }

    // Check supplier fees total equality depending on fee type
    const totalSupplierFees =
      row.supplier_sharings?.reduce((sum, supplier) => sum + (supplier.value || 0), 0) || 0
    const feeChargeValue = row.fee_amount || 0

    const EPS = 1e-6
    if (row.fee_type === 'percentage') {
      // Require sum of supplier percentages to equal 100%
      if (Math.abs(totalSupplierFees - 100) > EPS) {
        errors.push(
          `• Row ${index + 1}: ${t('total_supplier_fees_must_equal_100', { total: totalSupplierFees })}`
        )
        isValid = false
      }
      // keep existing check that fee_amount itself cannot exceed 100
      if (row.fee_amount > 100) {
        errors.push(`• Row ${index + 1}: ${t('fee_amount_cannot_exceed_100_percent')}`)
        isValid = false
      }
    } else {
      // fixed: require sum of supplier values to equal feeChargeValue
      if (Math.abs(totalSupplierFees - feeChargeValue) > EPS) {
        errors.push(
          `• Row ${index + 1}: ${t('total_supplier_fees_must_equal_fee_charge', {
            total: formatAmount(totalSupplierFees, selectedCurrency.value),
            fee: formatAmount(feeChargeValue, selectedCurrency.value),
          })}`
        )
        isValid = false
      }
    }

    // Additional validations
    if (
      row.start_amount < 0 ||
      (row.end_amount !== null && row.end_amount < 0) ||
      row.fee_amount < 0
    ) {
      errors.push(`• Row ${index + 1}: ${t('values_cannot_be_negative')}`)
      isValid = false
    }
  })

  if (!isValid && errors.length > 0) {
    // Show validation dialog instead of toast
    validationDialogTitle.value = t('validation_errors', 'Validation Errors')
    validationDialogMessage.value = `${errors.join('\n')}`
    validationDialogType.value = 'error' // set dialog type
    showValidationDialog.value = true
  }

  return isValid
}

const updateTransactionRow = (index: number, _row: TransactionFeeRow, field?: string) => {
  // Validate the row
  if (!validateTableRow(index, true, field)) {
    return
  }
  // Only sync when not already syncing
  if (!isSyncing.value) {
    syncDistributionFeeRows()
  }
}

const getRowTransactionFee = (index: number) => {
  const rowData = transactionFee.value[index]
  return rowData || null
}

// Fetch Data API
const fetchSharingSuppliers = async () => {
  try {
    loading.value = true
    supplierList.value = await feeConfigApi.getAllSharingSupplier()
    showAddSuppliers.value = true
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    toast.add({
      title: t('error'),
      description: t('failed_to_load_suppliers'),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

const saveFeeConfiguration = async () => {
  // Validate all rows before saving
  if (!validateAllRows()) {
    return
  }

  const data = feeConfig.value.toJSON()
  console.log('Saving fee configuration...', data)

  // --- Example: preview payload logged to console and shown in modal ---
  // This gives a short example to confirm what's being saved.
  // const preview = JSON.stringify(data, null, 2).slice(0, 1000) // cap length
  try {
    const result = await feeConfigApi.saveSupplierFeeConfig(data)
    if (result.length === 0) return
    // Show success dialog with small payload preview
    validationDialogTitle.value = t('success', 'Success')
    validationDialogMessage.value = t('configuration_saved_successfully')
    validationDialogType.value = 'success' // set dialog type
    showValidationDialog.value = true

    // developer console full payload for debugging
    console.log('Saved payload (full):', data)
  } catch (error: unknown) {
    errorMsg.value = (error as Error).message || 'Failed to save configuration.'
    errorHandler.handleApiError(error)
  }
}

const confirmRemoveSupplier = (supplier: Supplier) => {
  supplierToRemove.value = supplier
  showRemoveSupplierModal.value = true
}

const removeSupplier = async (supplierId: string) => {
  try {
    feeConfig.value.removeSupplier(selectedCurrency.value, supplierId)

    // Force table re-render by updating the key
    tableKey.value++

    // Sync distribution fee rows
    syncDistributionFeeRows()

    // Force reactivity update
    await nextTick()

    showSettingsDropdown.value = false
    showRemoveSupplierModal.value = false
    toast.add({
      title: t('success'),
      description: t('supplier_removed_successfully'),
      color: 'success',
    })
  } catch (error: unknown) {
    errorMsg.value = (error as Error).message || 'Failed to remove supplier.'
    errorHandler.handleApiError(error)
  }
}

const closeModal = () => {
  showAddSuppliers.value = false
  newSupplier.value = { name: '', id: '' }
}

const handleSupplierSelection = (payload: { label: string; value: string }) => {
  if (payload) {
    newSupplier.value = {
      id: payload.value,
      name: payload.label,
    }
  }
}

const addSupplier = async () => {
  if (!newSupplier.value.name || !newSupplier.value.id) return

  try {
    console.log('Adding supplier:', newSupplier.value)
    console.log('Before adding - visible suppliers:', visibleSuppliers.value.length)
    console.log('Before adding - distribution fee:', distributionFee.value.length)

    // Add supplier to the fee configuration
    feeConfig.value.addSupplier(
      selectedCurrency.value,
      newSupplier.value.id,
      newSupplier.value.name
    )

    // Wait for reactivity to update
    await nextTick()

    // Sync distribution fee rows to ensure data consistency
    syncDistributionFeeRows()

    // Force table re-render by updating the key
    tableKey.value++

    // Wait again for all updates to complete
    await nextTick()

    console.log('After adding supplier - visible suppliers:', visibleSuppliers.value.length)
    console.log('After adding supplier - distribution fee:', distributionFee.value.length)
    console.log('After adding supplier - table columns:', tableColumns.value.length)

    closeModal()

    toast.add({
      title: t('success'),
      description: t('supplier_added_successfully', { name: newSupplier.value.name }),
      color: 'success',
    })
  } catch (error: unknown) {
    console.error('Error adding supplier:', error)
    errorMsg.value = (error as Error).message || 'Failed to add supplier.'
    errorHandler.handleApiError(error)
  }
}

const toggleUnlimited = (index: number) => {
  const row = transactionFee.value[index]
  if (!row) return

  if (!row.unlimited) {
    transactionFee.value.forEach((r, i) => {
      if (i !== index) {
        r.unlimited = false
        if (r.end_amount === null) {
          r.end_amount = 0
        }
      }
    })

    row.unlimited = true
    row.end_amount = null
  } else {
    row.unlimited = false
    row.end_amount = row.end_amount || 0
  }

  updateTransactionRow(index, row)
}

const getCurrencySymbol = () => {
  return selectedCurrency.value === 'USD' ? '$' : '៛'
}

const formatAmount = (
  amount: number | undefined | null,
  currency?: string,
  options?: { showSymbol?: boolean }
) => {
  // Handle undefined, null, or NaN values
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0
  }

  const curr = currency || selectedCurrency.value
  const showSymbol = options?.showSymbol !== false

  if (curr === 'USD') {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return showSymbol ? `$${formatted}` : formatted
  } else {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return showSymbol ? `${formatted}៛` : formatted
  }
}

const handleFeeAmountInput = (event: Event, field: 'fee_amount', index: number) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // store cursor and original length
  const cursorPosition = target.selectionStart || 0
  const originalLength = value.length

  value = value.replace(/[^\d.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  const numValue = parseFloat(value) || 0
  const row = transactionFee.value[index]
  if (row) {
    row.fee_amount = numValue

    // --- Auto distribute supplier sharing values ---
    // Find suppliers for this row
    const suppliers = row.supplier_sharings || []
    const supplierCount = suppliers.length
    if (supplierCount > 0) {
      let shareValue = 0
      if (row.fee_type === 'fixed') {
        // Fixed: divide fee_amount equally
        shareValue = numValue / supplierCount
      } else if (row.fee_type === 'percentage') {
        // Percentage: divide fee_amount equally
        shareValue = 100 / supplierCount
      }
      // Set each supplier's value, last one gets the remainder for precision
      let totalAssigned = 0
      suppliers.forEach((s, i) => {
        if (i === supplierCount - 1) {
          // Last supplier: assign remainder to ensure sum equals fee_amount
          s.value = Math.max(
            0,
            row.fee_type === 'percentage' ? shareValue : numValue - totalAssigned
          )
        } else {
          s.value = Math.max(0, parseFloat(shareValue.toFixed(6)))
          totalAssigned += s.value
        }
      })
    }
    // --- End auto distribute ---

    // Validate after updating fee amount
    setTimeout(() => validateTableRow(index, true), 100)

    updateTransactionRow(index, row)
  }

  if (row?.fee_type === 'fixed') {
    const formattedValue = formatAmount(numValue, selectedCurrency.value, { showSymbol: false })
    target.value = formattedValue
  } else {
    target.value = numValue.toString()
  }

  // Calculate new cursor position after formatting and restore
  const newLength = target.value.length
  const lengthDiff = newLength - originalLength
  const newCursorPosition = Math.max(0, Math.min(cursorPosition + lengthDiff, newLength))
  nextTick(() => {
    try {
      target.setSelectionRange(newCursorPosition, newCursorPosition)
    } catch {
      /* empty */
    }
  })
}

const handleSupplierFeeInput = (event: Event, rowIndex: number, supplierId: string) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // store cursor and original length
  const cursorPosition = target.selectionStart || 0
  const originalLength = value.length

  value = value.replace(/[^\d.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  const numValue = parseFloat(value) || 0
  const row = transactionFee.value[rowIndex]
  if (!row) return

  // Find the supplier's previous value
  const supplier = row.supplier_sharings?.find((s) => s.id === supplierId)
  const oldValue = supplier?.value ?? 0

  const getSumSuppliers = row.supplier_sharings
    .filter((s) => s.id !== supplierId)
    .reduce((sum, s) => sum + (s.value || 0), 0)

  const totalSupplierFees =
    row.supplier_sharings?.reduce((sum, supplier) => sum + (supplier.value || 0), 0) || 0

  // Validation: supplier value must not exceed fee amount (fixed) or transaction fee (percentage)
  let maxValue = 0
  if (row.fee_type === 'fixed') {
    maxValue = row.fee_amount || 0
  } else if (row.fee_type === 'percentage') {
    // const testAmount = selectedCurrency.value === 'USD' ? 100 : 400000
    maxValue = (row.fee_amount / 100) * totalSupplierFees
  }
  const newSumRowSuppliers = getSumSuppliers + numValue
  if (row.fee_type === 'fixed' && newSumRowSuppliers !== maxValue) {
    // Use translation keys with params
    const maxValue = row.fee_amount || 0
    const description = t('total_supplier_fees_must_equal_fee_amount', {
      total: formatAmount(newSumRowSuppliers, selectedCurrency.value),
      fee: formatAmount(maxValue, selectedCurrency.value),
    })

    toast.add({
      title: t('validation_error'),
      description: `${t('row_number', { row: rowIndex + 1 }) || `Row ${rowIndex + 1}`}: ${description}`,
      color: 'error',
    })

    // Restore the old value in the cell and restore cursor at end
    feeConfig.value.updateSupplierFee(
      selectedCurrency.value,
      rowIndex,
      supplierId,
      newSumRowSuppliers > maxValue ? oldValue : numValue
    )
    target.value = formatAmount(oldValue, selectedCurrency.value, { showSymbol: false })
    nextTick(() => {
      try {
        target.setSelectionRange(oldValue.toString().length, oldValue.toString().length)
      } catch {
        /* empty */
      }
    })
    return
  } else if (row.fee_type === 'percentage' && newSumRowSuppliers !== 100) {
    // Use translation keys with params
    const description = t('total_supplier_fees_must_equal_100', {
      total: newSumRowSuppliers,
    })

    toast.add({
      title: t('validation_error'),
      description: `${t('row_number', { row: rowIndex + 1 }) || `Row ${rowIndex + 1}`}: ${description}`,
      color: 'error',
    })

    // Restore the old value in the cell and restore cursor at end
    feeConfig.value.updateSupplierFee(
      selectedCurrency.value,
      rowIndex,
      supplierId,
      newSumRowSuppliers > 100 ? oldValue : numValue
    )
    target.value = (newSumRowSuppliers > 100 ? oldValue : numValue).toString()
    nextTick(() => {
      try {
        target.setSelectionRange(oldValue.toString().length, oldValue.toString().length)
      } catch {
        /* empty */
      }
    })
    return
  }

  const supplierRow = distributionFee.value?.find((supplier) => supplier.id === supplierId)
  if (supplierRow !== null && supplierRow !== undefined) {
    feeConfig.value.updateSupplierFee(selectedCurrency.value, rowIndex, supplierId, numValue)
    setTimeout(() => validateTableRow(rowIndex, true), 100)
  }

  if (getRowTransactionFee(rowIndex)?.fee_type === 'fixed') {
    const formattedValue = formatAmount(numValue, selectedCurrency.value, { showSymbol: false })
    target.value = formattedValue
  } else {
    target.value = numValue.toString()
  }

  // Calculate new cursor position after formatting and restore
  const newLength = target.value.length
  const lengthDiff = newLength - originalLength
  const newCursorPosition = Math.max(0, Math.min(cursorPosition + lengthDiff, newLength))
  nextTick(() => {
    try {
      target.setSelectionRange(newCursorPosition, newCursorPosition)
    } catch {
      /* empty */
    }
  })
}

const handleNumericKeyPress = (event: KeyboardEvent) => {
  const char = String.fromCharCode(event.which)
  const input = event.target as HTMLInputElement
  const currentValue = input.value

  if (
    [8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
    (event.keyCode === 65 && event.ctrlKey === true) ||
    (event.keyCode === 67 && event.ctrlKey === true) ||
    (event.keyCode === 86 && event.ctrlKey === true) ||
    (event.keyCode === 88 && event.ctrlKey === true)
  ) {
    return
  }

  if ((char < '0' || char > '9') && char !== '.') {
    event.preventDefault()
    return
  }

  if (char === '.' && currentValue.indexOf('.') !== -1) {
    event.preventDefault()
  }
}

const switchCurrency = async (currency: string) => {
  selectedCurrency.value = currency

  // Force table re-render by updating the key
  tableKey.value++

  // Wait for reactivity to update
  await nextTick()

  // Sync distribution fee rows for the new currency
  syncDistributionFeeRows()

  console.log(`Switched to ${currency}, table refreshed`)
}

const handleAmountInput = (event: Event, index: number, field: 'start_amount' | 'end_amount') => {
  const target = event.target as HTMLInputElement
  let value = target.value

  if (field === 'end_amount' && transactionFee.value[index]?.unlimited) {
    return
  }

  // Store cursor position before formatting
  const cursorPosition = target.selectionStart || 0
  const originalLength = value.length

  // Remove all non-numeric characters except decimal point
  value = value.replace(/[^\d.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  const numValue = parseFloat(value) || 0
  const row = transactionFee.value[index]
  if (row) {
    if (field === 'start_amount') {
      row.start_amount = numValue
    } else if (field === 'end_amount') {
      row.end_amount = numValue
    }

    // Validate after updating amount
    setTimeout(() => validateTableRow(index, true), 100)

    updateTransactionRow(index, row, field)
  }

  // Format the value based on currency
  const formattedValue = formatAmount(numValue, selectedCurrency.value, { showSymbol: false })
  target.value = formattedValue

  // Calculate new cursor position after formatting
  const newLength = formattedValue.length
  const lengthDiff = newLength - originalLength
  const newCursorPosition = Math.max(0, Math.min(cursorPosition + lengthDiff, newLength))

  // Restore cursor position
  nextTick(() => {
    target.setSelectionRange(newCursorPosition, newCursorPosition)
  })
}
</script>
