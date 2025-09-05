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
            selectedCurrency === Currency.KHR
              ? 'bg-primary text-white shadow-sm dark:bg-primary'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
          ]"
          @click="switchCurrency(Currency.KHR.toString())"
        >
          {{ Currency.KHR }}
        </button>
        <button
          :class="[
            'px-6 py-2 text-sm font-medium rounded-md transition-all duration-200',
            selectedCurrency === Currency.USD
              ? 'bg-primary text-white shadow-sm dark:bg-primary'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
          ]"
          @click="switchCurrency(Currency.USD.toString())"
        >
          {{ Currency.USD }}
        </button>
      </div>
    </div>

    <!-- Combined Fee Section -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[400px] max-h-[500px]"
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
          class="h-[340px] max-h-[440px] rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800"
          :ui="{
            tbody: 'divide-y divide-gray-200 dark:divide-gray-700',
            tr: 'px-2 py-3',
            td: 'whitespace-nowrap px-2 py-3 text-sm text-gray-900 dark:text-gray-100',
            th: 'whitespace-nowrap px-2 py-3 text-sm text-gray-900 dark:text-gray-100',
          }"
        >
          <template #empty>
            <div class="py-20">
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
            :title="t('add_fee_sharing_party_title')"
            :description="t('add_fee_sharing_party_description')"
            :ui="{
              title: 'text-lg font-semibold text-primary',
              description: 'text-sm text-gray-600',
            }"
          >
            <UButton
              :label="t('add_party')"
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{
                    t('s_party')
                  }}</label>
                  <USelectMenu
                    :items="filteredAvailableSuppliers"
                    :placeholder="t('choose_party')"
                    :search-input="false"
                    option-attribute="label"
                    value-attribute="value"
                    size="sm"
                    class="w-full"
                    :loading="loading"
                    @update:model-value="handleSupplierSelection"
                  />
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
            :description="t('remove_party_sharing', { name: supplierToRemove?.name })"
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
            formatAmount(selectedCurrency === Currency.USD ? 100 : 400000, selectedCurrency, {
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
              {{ t('party_sharing_fee') }}:
            </p>
            <ul class="space-y-1 ml-4">
              <li
                v-for="(amount, supplier) in feeCalculation.distribution"
                :key="supplier"
                class="text-gray-600 text-sm dark:text-gray-300"
              >
                <span class="font-medium">• {{ getDisplaySupplierName(String(supplier)) }}: </span>
                <span class="text-primary text-sm dark:text-primary">
                  {{ formatAmount(amount, selectedCurrency, { showSymbol: true }) }}
                </span>
              </li>
            </ul>
          </div>

          <div v-else class="text-gray-500 text-sm dark:text-gray-400 italic">
            {{ t('preview_fee_calculation_no_parties') }}
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
import { FeeType } from '~/utils/enumModel'
import { useAuth } from '~/composables/useAuth'

const { t } = useI18n()
const auth = useAuth()

definePageMeta({
  auth: false,
  breadcrumbs: [{ label: 'settings.fee_config', active: true }],
})

const feeConfig = ref(new FeeConfiguration())
const selectedCurrency = ref(Currency.KHR.toString())
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

// Unified error state for all fields
const fieldErrors = ref<Record<number, Record<string, string>>>({})
const inputRefs = ref<Record<string, HTMLInputElement>>({})

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
})

const feeCalculation = computed(() => {
  if (!isInitialized.value || transactionFee.value.length === 0) {
    return { transactionFee: 0, distribution: {} }
  }

  const testAmount = selectedCurrency.value === Currency.USD ? 100 : 400000
  const calculation = feeConfig.value.calculateFees(selectedCurrency.value, testAmount)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = { ...calculation }
  const row = transactionFee.value.find((r) => {
    if (r.unlimited) return true
    return (
      testAmount >= r.start_amount &&
      (r.unlimited || (r.end_amount !== null && testAmount <= r.end_amount))
    )
  })
  if (row && row.supplier_sharings && row.supplier_sharings.length > 0) {
    result.transactionFee =
      row.fee_type === FeeType.Fixed ? row.fee_amount : (row.fee_amount / 100) * testAmount
    result.distribution = {}
    row.supplier_sharings.forEach((s) => {
      if (row.fee_type === FeeType.Fixed) {
        result.distribution[visibleSuppliers.value.find((vs) => vs.id === s.id)?.name || s.id] =
          s.value
      } else if (row.fee_type === FeeType.Percentage) {
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

const tableKey = ref(0)

const tableColumns = computed<TableColumn<TransactionFeeRow>[]>(() => {
  const staticColumns: TableColumn<TransactionFeeRow>[] = [
    {
      accessorKey: 'startAmount',
      size: 100,
      header: () => h('div', { class: 'text-right' }, t('start_amount')),
      cell: ({ row, table }) => {
        const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
        const rowData = row.original
        const UInput = resolveComponent('UInput')
        const UTooltip = resolveComponent('UTooltip')
        const errorMessage = fieldErrors.value[index]?.start_amount || ''

        const inputComponent = h(UInput, {
          modelValue: formatAmount(rowData.start_amount || 0, selectedCurrency.value, {
            showSymbol: false,
          }),
          type: 'text',
          class: `w-full ${errorMessage ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`,
          size: 'sm',
          ui: { base: 'text-right' },
          onBlur: (event: Event) => handleAmountInput(event, index, 'start_amount'),
          onKeypress: handleNumericKeyPress,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref: (el: any) => {
            if (el && el.$el) {
              const input = el.$el.querySelector('input')
              if (input) {
                inputRefs.value[`${index}_start_amount`] = input
              }
            }
          },
        })

        return h('div', { class: 'relative' }, [
          errorMessage
            ? h(
                UTooltip,
                {
                  text: errorMessage,
                  popper: { placement: 'top' },
                  ui: {
                    background: 'bg-red-100 dark:bg-red-900/20',
                    text: 'text-red-600 dark:text-red-400',
                  },
                },
                { default: () => inputComponent }
              )
            : inputComponent,
        ])
      },
    },
    {
      accessorKey: 'endAmount',
      header: () => h('div', { class: 'text-right' }, t('end_amount')),
      cell: ({ row, table }) => {
        const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
        const rowData = row.original
        const UInput = resolveComponent('UInput')
        const UButton = resolveComponent('UButton')
        const UTooltip = resolveComponent('UTooltip')
        const errorMessage = fieldErrors.value[index]?.end_amount || ''
        const hasError = !!errorMessage
        const inputComponent = h(
          UInput,
          {
            modelValue: rowData.unlimited
              ? KEY_CONSTANTS.UNLIMITED
              : formatAmount(rowData.end_amount || 0, selectedCurrency.value, {
                  showSymbol: false,
                }),
            type: 'text',
            color: hasError ? 'error' : 'primary',
            placeholder: rowData.unlimited ? KEY_CONSTANTS.UNLIMITED : 'Enter amount',
            disabled: rowData.unlimited,
            class: `w-full pe-0 ${errorMessage ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`,
            size: 'sm',
            ui: {
              base: rowData.unlimited
                ? 'text-right bg-gray-200 dark:bg-gray-600 dark:text-gray-300'
                : 'text-right',
              trailing: 'pe-0',
            },
            onBlur: async (event: Event) => await handleAmountInput(event, index, 'end_amount'),
            onKeypress: handleNumericKeyPress,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref: (el: any) => {
              if (el && el.$el) {
                const input = el.$el.querySelector('input')
                if (input) {
                  inputRefs.value[`${index}_end_amount`] = input
                }
              }
            },
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
                  disabled: Object.keys(fieldErrors.value || {}).length > 0 ? true : false, // Disable if any field in this row has errors
                  onClick: () => toggleUnlimited(index),
                },
                () => '∞'
              ),
          }
        )

        return h('div', { class: 'relative' }, [
          errorMessage
            ? h(
                UTooltip,
                {
                  text: errorMessage,
                  popper: { placement: 'top' },
                  ui: {
                    background: 'bg-red-100 dark:bg-red-900/20',
                    text: 'text-red-600 dark:text-red-400',
                  },
                },
                { default: () => inputComponent }
              )
            : inputComponent,
        ])
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
              rowData.fee_type === FeeType.Percentage
                ? '%'
                : selectedCurrency.value === Currency.KHR
                  ? '៛'
                  : '$',
            value: rowData.fee_type === FeeType.Percentage ? FeeType.Percentage : FeeType.Fixed,
          },
          items: feeTypeOptions.value,
          placeholder: 'Select type',
          searchInput: false,
          optionAttribute: 'label',
          valueAttribute: 'value',
          size: 'sm',
          class: 'transition-all duration-200 w-full',
          disabled: Object.keys(fieldErrors.value || {}).length > 0,
          'onUpdate:modelValue': (value: { value: string }) =>
            handleFeeDetailTypeChange(index, value.value),
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
        const UTooltip = resolveComponent('UTooltip')
        const errorMessage = fieldErrors.value[index]?.fee_amount || ''
        const hasError = !!errorMessage
        const inputComponent = h(
          UInput,
          {
            modelValue:
              rowData.fee_type === FeeType.Fixed
                ? formatAmount(rowData.fee_amount || 0, selectedCurrency.value, {
                    showSymbol: false,
                  })
                : (rowData.fee_amount || 0).toString(),
            type: 'text',
            class: `w-full ${errorMessage ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`,
            size: 'sm',
            color: hasError ? 'error' : 'primary',
            ui: { base: 'text-right' },
            onBlur: (event: Event) => handleAmountInput(event, index, 'fee_amount'),
            onKeypress: handleNumericKeyPress,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref: (el: any) => {
              if (el && el.$el) {
                const input = el.$el.querySelector('input')
                if (input) {
                  inputRefs.value[`${index}_fee_amount`] = input
                }
              }
            },
          },
          {
            trailing: () =>
              h(
                'span',
                { class: 'text-sm text-gray-500' },
                rowData.fee_type === FeeType.Fixed ? getCurrencySymbol() : '%'
              ),
          }
        )

        return h('div', { class: 'relative' }, [
          errorMessage
            ? h(
                UTooltip,
                {
                  text: errorMessage,
                  popper: { placement: 'top' },
                  ui: {
                    background: 'bg-red-100 dark:bg-red-900/20',
                    text: 'text-red-600 dark:text-red-400',
                  },
                },
                { default: () => inputComponent }
              )
            : inputComponent,
        ])
      },
    },
  ]

  const supplierColumns: TableColumn<TransactionFeeRow>[] = visibleSuppliers.value.map(
    (supplier) => {
      return {
        accessorKey: `supplier_${supplier.id}`,
        header: () => {
          const UTooltip = resolveComponent('UTooltip')
          const UButton = resolveComponent('UButton')
          const UIcon = resolveComponent('UIcon')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const children: any[] = [
            h(
              UTooltip,
              { text: t('sharing_enabled'), popper: { placement: 'top' } },
              {
                default: () =>
                  h(UIcon, {
                    name: 'i-heroicons-users-20-solid',
                    class: 'w-4 h-4 text-primary',
                  }),
              }
            ),
            h('span', supplier.isDisabled ? `${supplier.name} (${t('you')})` : supplier.name),
          ]

          if (supplier.isDisabled === false) {
            children.push(
              h(
                UTooltip,
                { text: t('remove_fee_sharing_party'), popper: { placement: 'top' } },
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
                          e.stopPropagation()
                          confirmRemoveSupplier(supplier)
                        },
                      },
                      {
                        default: () =>
                          h(UIcon, { name: 'i-heroicons-x-mark-20-solid', class: 'text-base' }),
                      }
                    ),
                }
              )
            )
          }

          return h('div', { class: 'flex items-center justify-end space-x-2' }, children)
        },
        cell: ({ row, table }) => {
          const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
          const rowData = row.original
          const supplierData = rowData.supplier_sharings?.find((x) => x.id === supplier.id)
          const UInput = resolveComponent('UInput')
          const UTooltip = resolveComponent('UTooltip')
          const errorMessage = fieldErrors.value[index]?.[`supplier_${supplier.id}`] || ''

          const inputComponent = h(
            UInput,
            {
              modelValue:
                rowData.fee_type === FeeType.Fixed
                  ? formatAmount(supplierData?.value || 0, selectedCurrency.value, {
                      showSymbol: false,
                    })
                  : (supplierData?.value || 0).toString(),
              type: 'text',
              class: `w-full ${errorMessage ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`,
              size: 'sm',
              ui: { base: 'text-right' },
              onBlur: (event: Event) => handleAmountInput(event, index, `supplier_${supplier.id}`),
              onKeypress: handleNumericKeyPress,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ref: (el: any) => {
                if (el && el.$el) {
                  const input = el.$el.querySelector('input')
                  if (input) {
                    inputRefs.value[`${index}_supplier_${supplier.id}`] = input
                  }
                }
              },
            },
            {
              trailing: () =>
                h(
                  'span',
                  { class: 'text-sm text-gray-500' },
                  rowData.fee_type === FeeType.Fixed ? getCurrencySymbol() : '%'
                ),
            }
          )

          return h('div', { class: 'relative' }, [
            errorMessage
              ? h(
                  UTooltip,
                  {
                    text: errorMessage,
                    popper: { placement: 'top' },
                    ui: {
                      background: 'bg-red-100 dark:bg-red-900/20',
                      text: 'text-red-600 dark:text-red-400',
                    },
                  },
                  { default: () => inputComponent }
                )
              : inputComponent,
          ])
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

  return [...staticColumns, ...supplierColumns, ...actionColumn]
})

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

onMounted(async () => {
  const handleClickOutside = () => {
    showSettingsDropdown.value = false
  }
  document.addEventListener('click', handleClickOutside)

  // Get default supplier info at the top level where composables can be used
  const defaultSupplier = auth.currentProfile.value
  const defaultSupplierId = defaultSupplier?.id || '3904u39fu39u090f3f3'
  const defaultSupplierName = defaultSupplier?.name || 'Default Supplier'

  await feeConfig.value.initialize(defaultSupplierId, defaultSupplierName)
  isInitialized.value = true

  tableKey.value++

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
  nextTick(() => {
    syncDistributionFeeRows()
  })
}

const feeTypeOptions = computed(() => [
  { label: selectedCurrency.value === Currency.KHR ? '៛' : '$', value: FeeType.Fixed },
  { label: '%', value: FeeType.Percentage.toString() },
])

const handleFeeDetailTypeChange = (index: number, value: string) => {
  const feeDetail = transactionFee.value[index]
  if (feeDetail) {
    transactionFee.value[index] = {
      ...feeDetail,
      fee_type: value as FeeType.Percentage | FeeType.Fixed,
    }

    if (value === FeeType.Percentage) {
      transactionFee.value[index].fee_amount = 0
      if (transactionFee.value[index].supplier_sharings) {
        transactionFee.value[index].supplier_sharings.forEach((s) => {
          s.value = 0
        })
      }
    }

    updateTransactionRow(index, transactionFee.value[index])
    tableKey.value++
    nextTick()
  }
}

const isSyncing = ref(false)

const syncDistributionFeeRows = () => {
  if (isSyncing.value) return
  console.log('Syncing distribution fee rows...')
  isSyncing.value = true

  try {
    transactionFee.value.forEach((txRow, _index) => {
      if (!txRow.supplier_sharings) {
        txRow.supplier_sharings = []
      }

      visibleSuppliers.value.forEach((supplier) => {
        const existingSupplier = txRow.supplier_sharings.find((s) => s.id === supplier.id)
        if (!existingSupplier) {
          txRow.supplier_sharings.push({
            id: supplier.id,
            value: 0,
          })
        }
      })

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
  showToast = false,
  field: string = 'fee_amount'
): boolean => {
  const row = transactionFee.value[index]
  if (!row) return true

  // Initialize fieldErrors for this row if not already done
  if (!fieldErrors.value[index]) {
    fieldErrors.value[index] = {}
  }
  fieldErrors.value[index][field] = ''

  // Validation 1: start_amount can't be negative
  if (field === 'start_amount' && row.start_amount < 0) {
    fieldErrors.value[index][field] = t('values_cannot_be_negative')
    if (showToast) {
      toast.add({
        title: t('validation_error'),
        description: `${t('row_number', { row: index + 1 })}: ${t('values_cannot_be_negative')}`,
        color: 'error',
      })
    }
    return false
  }

  // Validation 2: end_amount can't be less than start_amount
  if (
    field === 'end_amount' &&
    !row.unlimited &&
    row.end_amount !== null &&
    row.end_amount !== 0 &&
    row.start_amount > row.end_amount
  ) {
    fieldErrors.value[index][field] = t('end_amount_cannot_be_less_than_start_amount')
    if (showToast) {
      toast.add({
        title: t('validation_error'),
        description: `${t('row_number', { row: index + 1 })}: ${t(
          'end_amount_cannot_be_less_than_start_amount'
        )}`,
        color: 'error',
      })
    }
    return false
  }

  // Validation 3: For fixed fee type, fee_amount must not be greater than end_amount
  if (
    field === 'fee_amount' &&
    row.fee_type === FeeType.Fixed &&
    !row.unlimited &&
    row.fee_amount !== undefined &&
    row.fee_amount !== 0 &&
    row.end_amount !== null &&
    row.fee_amount > row.end_amount
  ) {
    fieldErrors.value[index][field] = t('fee_amount_cannot_exceed_end_amount', {
      fee: formatAmount(row.fee_amount, selectedCurrency.value),
      end: formatAmount(row.end_amount, selectedCurrency.value),
      row: index + 1,
    })
    if (showToast) {
      toast.add({
        title: t('validation_error'),
        description: `${t('row_number', { row: index + 1 })}: ${t(
          'fee_amount_cannot_exceed_end_amount',
          {
            fee: formatAmount(row.fee_amount, selectedCurrency.value),
            end: formatAmount(row.end_amount, selectedCurrency.value),
          }
        )}`,
        color: 'error',
      })
    }
    return false
  }

  // Validation 4: For percentage fee type, fee_amount cannot exceed 100%
  if (
    field === 'fee_amount' &&
    row.fee_type === FeeType.Percentage &&
    row.fee_amount !== undefined &&
    row.fee_amount > 100
  ) {
    fieldErrors.value[index][field] = t('fee_amount_cannot_exceed_100_percent')
    if (showToast) {
      toast.add({
        title: t('validation_error'),
        description: `${t('row_number', { row: index + 1 })}: ${t(
          'fee_amount_cannot_exceed_100_percent'
        )}`,
        color: 'error',
      })
    }
    return false
  }

  // Validation 5: Sum of fee sharing suppliers checks
  const totalSupplierFees =
    row.supplier_sharings?.reduce((sum, supplier) => sum + (supplier.value || 0), 0) || 0
  const feeChargeValue = row.fee_amount || 0

  if (field.includes('supplier_') && row.fee_type === FeeType.Percentage) {
    if (totalSupplierFees > 100) {
      fieldErrors.value[index][field] = t('total_party_fees_exceeds_fee_charge_percentage', {
        total: totalSupplierFees,
      })
      if (showToast) {
        toast.add({
          title: t('validation_error'),
          description: `${t('row_number', { row: index + 1 })}: ${t(
            'total_party_fees_exceeds_fee_charge_percentage',
            { total: totalSupplierFees }
          )}`,
          color: 'error',
        })
      }
      return false
    }
  } else if (field.includes('supplier_')) {
    if (totalSupplierFees > feeChargeValue) {
      fieldErrors.value[index][field] = t('total_party_fees_exceeds_fee_charge_fixed', {
        total: formatAmount(totalSupplierFees, selectedCurrency.value),
        fee: '100 %',
      })
      if (showToast) {
        toast.add({
          title: t('validation_error'),
          description: `${t('row_number', { row: index + 1 })}: ${t(
            'total_party_fees_exceeds_fee_charge_fixed',
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

  fieldErrors.value = {}
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
    // Initialize fieldErrors for this row
    if (!fieldErrors.value[index]) {
      fieldErrors.value[index] = {}
    }

    if (
      !row.unlimited &&
      ((row.end_amount !== null && row.start_amount > row.end_amount) || row.end_amount === 0)
    ) {
      errors.push(`• Row ${index + 1}: ${t('end_amount_cannot_be_less_than_start_amount')}`)
      fieldErrors.value[index].end_amount = t('end_amount_cannot_be_less_than_start_amount')
      isValid = false
    }

    if (
      row.fee_type === FeeType.Fixed &&
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
      fieldErrors.value[index].fee_amount = t('fee_amount_cannot_exceed_end_amount', {
        fee: formatAmount(row.fee_amount, selectedCurrency.value),
        end: formatAmount(row.end_amount, selectedCurrency.value),
      })
      isValid = false
    }

    const totalSupplierFees =
      row.supplier_sharings?.reduce((sum, supplier) => sum + (supplier.value || 0), 0) || 0
    const feeChargeValue = row.fee_amount || 0

    const EPS = 1e-6
    if (row.fee_type === FeeType.Percentage) {
      if (Math.abs(totalSupplierFees - 100) > EPS) {
        errors.push(
          `• Row ${index + 1}: ${t('total_party_fees_must_equal_100', { total: totalSupplierFees })}`
        )
        if (Array.isArray(row.supplier_sharings)) {
          row.supplier_sharings.forEach((supplier) => {
            if (!fieldErrors.value[index]) {
              fieldErrors.value[index] = {}
            }
            fieldErrors.value[index][`supplier_${supplier.id}`] = t(
              'total_party_fees_must_equal_100',
              { total: totalSupplierFees }
            )
          })
        }
        isValid = false
      }
      if (row.fee_amount > 100) {
        errors.push(`• Row ${index + 1}: ${t('fee_amount_cannot_exceed_100_percent')}`)
        fieldErrors.value[index].fee_amount = t('fee_amount_cannot_exceed_100_percent')
        isValid = false
      }
    } else {
      if (Math.abs(totalSupplierFees - feeChargeValue) > EPS) {
        errors.push(
          `• Row ${index + 1}: ${t('total_party_fees_must_equal_fee_charge', {
            total: formatAmount(totalSupplierFees, selectedCurrency.value),
            fee: formatAmount(feeChargeValue, selectedCurrency.value),
          })}`
        )
        if (Array.isArray(row.supplier_sharings)) {
          row.supplier_sharings.forEach((supplier) => {
            if (!fieldErrors.value[index]) {
              fieldErrors.value[index] = {}
            }
            fieldErrors.value[index][`supplier_${supplier.id}`] = t(
              'total_party_fees_must_equal_fee_charge',
              {
                total: formatAmount(totalSupplierFees, selectedCurrency.value),
                fee: formatAmount(feeChargeValue, selectedCurrency.value),
              }
            )
          })
        }
        isValid = false
      }
    }

    if (
      row.start_amount < 0 ||
      (row.end_amount !== null && row.end_amount < 0) ||
      row.fee_amount < 0
    ) {
      if (row.start_amount < 0) {
        errors.push(`• Row ${index + 1}: ${t('values_cannot_be_negative')}`)
        fieldErrors.value[index].start_amount = t('values_cannot_be_negative')
      }
      if (row.end_amount !== null && row.end_amount < 0) {
        errors.push(`• Row ${index + 1}: ${t('values_cannot_be_negative')}`)
        fieldErrors.value[index].end_amount = t('values_cannot_be_negative')
      }
      if (row.fee_amount < 0) {
        errors.push(`• Row ${index + 1}: ${t('values_cannot_be_negative')}`)
        fieldErrors.value[index].fee_amount = t('values_cannot_be_negative')
      }
      isValid = false
    }
  })

  if (isValid && errors.length === 0) {
    //loop check transaction fee rows base on currency of feeConfig

    for (const row of feeConfig.value.toJSON()) {
      if (row.transaction_fees.length === 0) {
        errors.push(t('currency_fee_details_cannot_be_empty', { currency: row.currency }))
        isValid = false
        break
      }
    }
  }

  if (!isValid && errors.length > 0) {
    validationDialogTitle.value = t('validation_errors', 'Validation Errors')
    validationDialogMessage.value = `${errors.join('\n')}`
    validationDialogType.value = 'error'
    showValidationDialog.value = true
  }

  return isValid
}

const updateTransactionRow = (index: number, _row: TransactionFeeRow, field?: string) => {
  if (!validateTableRow(index, false, field)) {
    return
  }
  if (!isSyncing.value) {
    syncDistributionFeeRows()
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getRowTransactionFee = (index: number) => {
  const rowData = transactionFee.value[index]
  return rowData || null
}

const fetchSharingSuppliers = async () => {
  try {
    loading.value = true
    supplierList.value = await feeConfigApi.getAllSharingSupplier()
    showAddSuppliers.value = true
  } catch (error) {
    console.error('Error fetching parties:', error)
    toast.add({
      title: t('error'),
      description: t('failed_to_load_parties'),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

const saveFeeConfiguration = async () => {
  if (!validateAllRows()) {
    return
  }

  const data = feeConfig.value.toJSON()
  console.log('Saving fee configuration...', data)

  try {
    const result = await feeConfigApi.saveSupplierFeeConfig(data)
    if (result.length === 0) return
    validationDialogTitle.value = t('success', 'Success')
    validationDialogMessage.value = t('configuration_saved_successfully')
    validationDialogType.value = 'success'
    showValidationDialog.value = true
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
    tableKey.value++
    syncDistributionFeeRows()
    await nextTick()
    showSettingsDropdown.value = false
    showRemoveSupplierModal.value = false
    toast.add({
      title: t('success'),
      description: t('party_removed_successfully'),
      color: 'success',
    })
  } catch (error: unknown) {
    errorMsg.value = (error as Error).message || 'Failed to remove party.'
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
    feeConfig.value.addSupplier(
      selectedCurrency.value,
      newSupplier.value.id,
      newSupplier.value.name
    )

    await nextTick()
    syncDistributionFeeRows()
    tableKey.value++
    await nextTick()

    closeModal()

    toast.add({
      title: t('success'),
      description: t('party_added_successfully'),
      color: 'success',
    })
  } catch (error: unknown) {
    console.error('Error adding party:', error)
    errorMsg.value = (error as Error).message || 'Failed to add party.'
    errorHandler.handleApiError(error)
  }
}

const toggleUnlimited = (index: number) => {
  const row = transactionFee.value[index]
  if (!row) return

  // Check if there are any validation errors for this row
  const hasRowErrors = Object.keys(fieldErrors.value[index] || {}).some(
    (key) => fieldErrors.value[index]?.[key] !== ''
  )
  if (hasRowErrors) {
    toast.add({
      title: t('validation_error'),
      description: t('fix_validation_errors_before_toggle_unlimited'),
      color: 'error',
    })
    return
  }

  // Clear any existing end_amount errors when toggling unlimited
  if (fieldErrors.value[index]?.end_amount) {
    fieldErrors.value[index].end_amount = ''
  }

  if (!row.unlimited) {
    // Set this row to unlimited and disable unlimited for other rows
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
    // Disable unlimited for this row
    row.unlimited = false
    row.end_amount = row.start_amount + 1 || 0
  }

  // Force table refresh to update UI
  tableKey.value++
  nextTick(() => {
    updateTransactionRow(index, row, 'end_amount')
  })
}

const getCurrencySymbol = () => {
  return selectedCurrency.value === Currency.USD ? '$' : '៛'
}

const formatAmount = (
  amount: number | undefined | null,
  currency?: string,
  options?: { showSymbol?: boolean }
) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0
  }

  const curr = currency || selectedCurrency.value
  const showSymbol = options?.showSymbol !== false

  if (curr === Currency.USD) {
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

const handleAmountInput = async (
  event: Event,
  index: number,
  field: 'start_amount' | 'end_amount' | 'fee_amount' | string
) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Prevent input for end_amount if unlimited is true
  if (field === 'end_amount' && transactionFee.value[index]?.unlimited) {
    return
  }

  const cursorPosition = target.selectionStart || 0
  const originalLength = value.length

  // Clean input value
  value = value.replace(/[^\d.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  const numValue = parseFloat(value) || 0
  const row = transactionFee.value[index]
  if (!row) return

  // Handle different field types
  if (field === 'start_amount') {
    row.start_amount = numValue
  } else if (field === 'end_amount') {
    row.end_amount = numValue
  } else if (field === 'fee_amount') {
    row.fee_amount = numValue

    // Auto-distribute fee_amount to suppliers
    const suppliers = row.supplier_sharings || []
    const supplierCount = suppliers.length
    if (supplierCount > 0) {
      let shareValue = 0
      if (row.fee_type === FeeType.Fixed) {
        shareValue = numValue / supplierCount
      } else if (row.fee_type === FeeType.Percentage) {
        shareValue = 100 / supplierCount
      }
      let totalAssigned = 0
      suppliers.forEach((s, i) => {
        if (i === supplierCount - 1) {
          s.value = Math.max(
            0,
            row.fee_type === FeeType.Percentage ? shareValue : numValue - totalAssigned
          )
        } else {
          s.value = Math.max(0, parseFloat(shareValue.toFixed(6)))
          totalAssigned += s.value
        }
      })
    }
  } else if (field.startsWith('supplier_')) {
    const supplierId = field.replace('supplier_', '')
    const supplier = row.supplier_sharings?.find((s) => s.id === supplierId)
    const oldValue = supplier?.value ?? 0

    // Calculate sum of other suppliers
    const getSumSuppliers =
      row.supplier_sharings
        ?.filter((s) => s.id !== supplierId)
        .reduce((sum, s) => sum + (s.value || 0), 0) || 0

    const totalSupplierFees = getSumSuppliers + numValue
    const maxValue = row.fee_type === FeeType.Percentage ? 100 : row.fee_amount || 0

    // Validate supplier fee
    if (
      (row.fee_type === FeeType.Percentage && totalSupplierFees > 100) ||
      (row.fee_type === FeeType.Fixed && totalSupplierFees > maxValue)
    ) {
      const description =
        row.fee_type === FeeType.Percentage
          ? t('total_party_fees_must_equal_100', { total: totalSupplierFees })
          : t('total_party_fees_must_equal_fee_charge', {
              total: formatAmount(totalSupplierFees, selectedCurrency.value),
              fee: formatAmount(maxValue, selectedCurrency.value),
            })
      if (!fieldErrors.value[index]) {
        fieldErrors.value[index] = {}
      }
      fieldErrors.value[index][field] = description
      toast.add({
        title: t('validation_error'),
        description: `${t('row_number', { row: index + 1 })}: ${description}`,
        color: 'error',
      })

      feeConfig.value.updateSupplierFee(selectedCurrency.value, index, supplierId, oldValue)
      target.value =
        row.fee_type === FeeType.Fixed
          ? formatAmount(oldValue, selectedCurrency.value, { showSymbol: false })
          : oldValue.toString()

      nextTick(() => {
        try {
          target.setSelectionRange(target.value.length, target.value.length)
        } catch {
          /* empty */
        }
      })
      return
    }

    if (supplier) {
      feeConfig.value.updateSupplierFee(selectedCurrency.value, index, supplierId, numValue)
    }
  }

  // Validate the row
  const isValid = validateTableRow(index, false, field)
  if (!isValid) {
    const formattedValue =
      row.fee_type === FeeType.Fixed || (field !== 'fee_amount' && !field.startsWith('supplier_'))
        ? formatAmount(numValue || 0, selectedCurrency.value, { showSymbol: false })
        : numValue.toString()
    target.value = formattedValue

    await nextTick()
    requestAnimationFrame(() => {
      const inputRef = inputRefs.value[`${index}_${field}`]
      if (inputRef) {
        inputRef.focus()
        inputRef.setSelectionRange(formattedValue.length, formattedValue.length)
      } else {
        target.focus()
        target.setSelectionRange(formattedValue.length, formattedValue.length)
      }
    })
    return
  } else {
    if (fieldErrors.value[index]?.[field]) {
      fieldErrors.value[index][field] = ''
    }
  }

  updateTransactionRow(index, row, field)

  // Format output value
  const formattedValue =
    row.fee_type === FeeType.Fixed || (field !== 'fee_amount' && !field.startsWith('supplier_'))
      ? formatAmount(numValue, selectedCurrency.value, { showSymbol: false })
      : numValue.toString()
  target.value = formattedValue

  const newLength = formattedValue.length
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
  try {
    // Get default supplier info at the top level where composables can be used
    const defaultSupplier = auth.currentProfile.value
    const defaultSupplierId = defaultSupplier?.id || '3904u39fu39u090f3f3'
    const defaultSupplierName = `${defaultSupplier?.name || 'Default Supplier'} (${t('you')})`

    // Ensure the currency configuration exists before switching
    if (!feeConfig.value.hasCurrency(currency)) {
      // Initialize the currency if it doesn't exist
      feeConfig.value.initializeCurrency(currency, defaultSupplierId, defaultSupplierName)
    }

    selectedCurrency.value = currency
    fieldErrors.value = {} // Clear errors when switching currency
    tableKey.value++
    await nextTick()
    syncDistributionFeeRows()
    console.log(`Switched to ${currency}, table refreshed`)
  } catch (error) {
    console.error('Error switching currency:', error)
    toast.add({
      title: t('error'),
      description: t('failed_to_switch_currency') || `Failed to switch to ${currency}`,
      color: 'error',
    })

    // Revert to KHR if switching failed
    selectedCurrency.value = Currency.KHR.toString()
  }
}

const getDisplaySupplierName = (key: string) => {
  const found = visibleSuppliers.value.find((s) => s.id === key || s.name === key)
  if (!found) return key
  return found.isDisabled ? `${found.name} (${t('you')})` : found.name
}
</script>
