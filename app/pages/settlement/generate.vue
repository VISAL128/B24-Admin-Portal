<script setup lang="ts">
import type { StepperItem, AvatarProps, TableColumn } from "@nuxt/ui";
import type {
  Cpo,
  Supplier,
  CpoBySupplierRequest,
  InitQuerySettlement,
  CpoSettlement,
  Settlement,
  TransactionAllocation, ConfirmSettlementRequest,
} from "~/models/settlement";
import type {
  CurrencyConfig,
  CurrencyFormatOptions,
} from "~/composables/utils/useCurrency";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import { useSupplierApi } from "~/composables/api/useSupplierApi";
import { useCurrency } from "~/composables/utils/useCurrency";
import EmptyState from '~/components/TableEmptyState.vue';
import {formatColumnValue} from '~/utils/helper';

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const supplierApi = useSupplierApi();

const df = new DateFormatter("en-US", {
  dateStyle: "medium",
});

// Create a CalendarDate for today in the local time zone
const today = new Date();
const now = new CalendarDate(
  today.getFullYear(),
  today.getMonth() + 1,
  today.getDate()
);
const modelValue = ref<Date | null>(
  now ? now.toDate(getLocalTimeZone()) : null
);

const { t } = useI18n();

const items: StepperItem[] = [
  {
    title: t("settlement.generate.steps.supplier.title"),
    description: t("settlement.generate.steps.supplier.description"),
    icon: "i-lucide-users",
  },
  {
    title: t("settlement.generate.steps.reconciliation.title"),
    description: t("settlement.generate.steps.reconciliation.description"),
    icon: "i-lucide-check-square",
  },
  {
    title: t("settlement.generate.steps.confirmation.title"),
    description: t("settlement.generate.steps.confirmation.description"),
    icon: "i-lucide-check-circle",
  },
];

const supplierKeys = ref<Supplier[]>([]);
const selectedSuppliers = ref<{ label: string; value: Supplier }[]>([]);
const cpoList = ref<Cpo[]>([]);
const selectedCurrency = ref<CurrencyConfig | null>(null);
const defaultCurrency: CurrencyConfig = {
  code: "KHR",
  symbol: "៛",
  name: "Cambodian Riel",
  decimals: 0,
  locale: "km-KH",
};

const isLoading = ref(false);

// Step 2 reconciliation
const selectedCpo = ref<Cpo[]>([]);

const columns: TableColumn<Cpo>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(resolveComponent("UCheckbox"), {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      h(resolveComponent("UCheckbox"), {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "supplier.code", header: "Supplier Code" },
  { accessorKey: "supplier.name", header: "Supplier Name" },
  { accessorKey: "code", header: "CPO Code" },
  { accessorKey: "name", header: "CPO Name" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "address", header: "Address" },
];


const cpoSettlementColumns: TableColumn<Settlement>[] = [
  {
    accessorKey: "supplier.code",
    header: "CPO Code",
    cell: ({ row }) =>
      h("div", { class: "text-left" }, [
        formatColumnValue(ColumnType.Text, row.original, "supplier.code")
      ])
  },
  {
    accessorKey: "supplier.name",
    header: "CPO Name",
    cell: ({ row }) =>
      h("div", { class: "text-left" }, [
        formatColumnValue(ColumnType.Text, row.original, "supplier.name")
      ])
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      h("div", { class: "text-right" }, [
        formatColumnValue(ColumnType.Number, row.original, "amount", "currency")
      ])
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) =>
      h("div", { class: "text-center" }, [
        formatColumnValue(ColumnType.Text, row.original, "currency")
      ])
  },
  {
    accessorKey: "settlement_bank_id",
    header: "Settle To Bank",
    cell: ({ row }) =>
      h("div", { class: "text-left" }, [
        formatColumnValue(ColumnType.Text, row.original, "settlement_bank_id")
      ])
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) =>
      h(
        resolveComponent("UButton"),
        {
          size: "xs",
          color: "primary",
          onClick: () => handleViewCpo(row.original),
        },
        { default: () => "View" }
      ),
    enableSorting: false,
    enableHiding: false,
  },
];

const cpoSettlementTransactionColumns: (TableColumn<TransactionAllocation> & {
  type?: ColumnType;
  currencyKey?: string;
})[] = [
  {
    accessorKey: 'tran_date',
    header: 'Date',
    cell: ({ row }) =>
      h('div', { class: 'text-left' }, [
        formatColumnValue(ColumnType.Date, row.original, 'tran_date'),
      ]),
  },
  {
    accessorKey: 'bank_ref',
    header: 'Bank Ref',
    cell: ({ row }) =>
      h('div', { class: 'text-left' }, [
        formatColumnValue(ColumnType.Text, row.original, 'bank_ref'),
      ]),
  },
  {
    accessorKey: 'bank_name',
    header: 'Bank Name',
    cell: ({ row }) =>
      h('div', { class: 'text-left' }, [
        formatColumnValue(ColumnType.Text, row.original, 'bank_name'),
      ]),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) =>
      h('div', { class: 'text-right' }, [
        formatColumnValue(ColumnType.Number, row.original, 'amount', 'currency_id'),
      ]),
  },
];



const expanded = ref({ 1: true });

const stepper = ref<{
  next: () => void;
  prev: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
} | null>(null);
const currentStepIndex = ref(0);

function handleStepChange(newIndex: number) {
  currentStepIndex.value = newIndex;
}

// Computed property to validate if current step can proceed
const canProceedToNext = computed(() => {
  const currentStepTitle = items[currentStepIndex.value]?.title;
  if (currentStepTitle === t("settlement.generate.steps.supplier.title")) {
    return selectedSuppliers.value.length > 0 && modelValue.value !== null;
  }
  return true; // Allow proceeding for other steps
});
const listSelectedCpo = ref<Cpo | null>(null);
let listInquirySettlement = ref<CpoSettlement>();
let selectedCpoSettlement = ref<Settlement | null>(null);
function handleRowClick(row: CpoSettlement) {
  // selectedCpo.value = row;
}

function handleViewCpo(cpo: Settlement) {
  // Replace with your logic, e.g., open a modal or navigate
  // alert(`View CPO: ${cpo.id} (${cpo.amount})`);
  selectedCpoSettlement.value = cpo;
}

onMounted(async () => {
  await fetchSuppliers();
  selectedCurrency.value = defaultCurrency;
});

const fetchSuppliers = async () => {
  try {
    supplierKeys.value = await supplierApi.getSuppliers();
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
  }
};

// Function to fetch CPOs based on selected suppliers
const fetchCpos = async () => {
  if (selectedSuppliers.value.length === 0) return;
  try {
    const request: CpoBySupplierRequest = {
      supplier_ids: selectedSuppliers.value.map((s) => s.value.id),
    };

    cpoList.value = await supplierApi.getListCPOApi(request);
  } catch (error) {
    console.error("Failed to fetch CPOs:", error);
  } finally {
    // Optionally handle loading state or errors
  }
};

const fetchInquirySettlementCpo = async () => {
  if (selectedSuppliers.value.length === 0) return;
  try {
    const request: InitQuerySettlement = {
      main_supplier_id: selectedSuppliers.value.map((s) => s.value.id),
      cutoff_date: modelValue.value
        ? modelValue.value.toISOString()
        : new Date().toISOString(),
      currency: selectedCurrency.value?.code || defaultCurrency.code,
    };

    const response = await supplierApi.getInquirySettlement(request);
    listInquirySettlement.value = response;
  } catch (error) {
    console.error("Failed to fetch CPOs:", error);
  } finally {
    // Optionally handle loading state or errors
  }
};

async function onReconciliationNext() {
  isLoading.value = true;
  await fetchInquirySettlementCpo();
  isLoading.value = false;
  stepper.value?.next();
}

async function onSubmitSettle() {
  isLoading.value = true;
  try {
    const request: ConfirmSettlementRequest = {
      token: ""
    };

    const response = await supplierApi.confirmSettlementAPI(request);
    const data = response;
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    alert("Failed to fetch CPOs: " + errorMessage);
  } finally {
    isLoading.value = false;
    return;
  }
  stepper.value?.next();
}

const router = useRouter();
function onConfirm() {
  router.push('/settlement/generate')
}

const handleSupplierMenuChanged = async () => {
  // Reset CPO list when suppliers change
  cpoList.value = [];
  if (selectedSuppliers.value.length === 0) return;
   isLoading.value = true;
  cpoList.value = await supplierApi.getListCPOApi({
    supplier_ids: selectedSuppliers.value.map((s) => s.value.id),
  });
  isLoading.value = false;
};

// Add viewport height tracking
const { height: windowHeight } = useWindowSize();

// Calculate responsive table heights
const tableHeight = computed(() => {
  const baseHeight = windowHeight.value || 768;
  // Reserve space for header, stepper, and other UI elements
  const availableHeight = Math.max(baseHeight, 300);
  return `${Math.min(availableHeight * 0.4, 400)}px`;
});

const detailTableHeight = computed(() => {
  const baseHeight = windowHeight.value || 768;
  const availableHeight = Math.max(baseHeight, 300);
  return `${Math.min(availableHeight * 0.6, 500)}px`;
});

definePageMeta({
  auth: false,
});

import { ref, onMounted, onUnmounted } from "vue";

function useWindowSize(): { height: Ref<number> } {
  const height = ref(window.innerHeight);

  const updateHeight = () => {
    height.value = window.innerHeight;
  };

  onMounted(() => {
    window.addEventListener("resize", updateHeight);
    updateHeight();
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateHeight);
  });

  return { height };
}
</script>
<template>
  <div
    class="w-full h-full bg-white rounded-lg p-6 shadow-lg dark:bg-gray-800 dark:text-gray-200 flex flex-col"
  >
    <UStepper ref="stepper" disabled :items="items" class="flex-1">
      <template #content="{ item }">
        <div class="flex flex-col h-full justify-between">
          <!-- Step 1: Supplier Selection -->
          <UCard
            variant="subtle"
            class="flex-1 mt-4"
            v-if="item.title === t('settlement.generate.steps.supplier.title')"
          >
            <template #header>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Supplier Selector -->
                <div>
                  <h1 class="text-sm mb-2 font-semibold">
                    Select Suppliers for Settlement
                  </h1>
                  <div class="flex flex-row items-center gap-2">
                    <USelectMenu
                    v-model="selectedSuppliers"
                    :items="
                      supplierKeys.map((supplier) => ({
                        label: supplier.name,
                        value: supplier,
                      }))
                    "
                    option-attribute="value"
                    multiple
                    required
                    icon="i-lucide-user"
                    label="Select Suppliers"
                    placeholder="Choose suppliers..."
                    class="w-full"
                    @change="handleSupplierMenuChanged"
                  >
                    <template #leading="{ modelValue, ui }">
                      <UIcon name="i-lucide-users" class="mr-2 text-gray-500" />
                    </template>
                  </USelectMenu>
                  <UButton
                    icon="i-lucide-x"
                    size="md"
                    color="neutral"
                    variant="outline"
                    @click="selectedSuppliers = []"
                  >
                    Clear
                  </UButton>
                  </div>
                </div>

                <!-- Cutoff Date -->
                <div>
                  <h1 class="text-sm mb-2 font-semibold">Select Cutoff Date</h1>
                  <UPopover class="w-full">
                    <UButton
                      color="neutral"
                      variant="subtle"
                      icon="i-lucide-calendar"
                    >
                      {{
                        modelValue
                          ? df.format(
                              modelValue instanceof CalendarDate
                                ? modelValue.toDate(getLocalTimeZone())
                                : modelValue
                            )
                          : "Select a date"
                      }}
                    </UButton>
                    <template #content>
                      <UCalendar :v-model="modelValue" class="p-2" />
                    </template>
                  </UPopover>
                </div>

                <!-- Currency Selector -->
                <div>
                  <h1 class="text-sm mb-2 font-semibold">Select Currency</h1>
                  <USelectMenu
                    :v-model="selectedCurrency"
                    :items="
                      useCurrency().getAllCurrencies.value.map((currency) => ({
                        label: currency.name,
                        value: currency.code,
                      }))
                    "
                    icon="i-lucide-dollar-sign"
                    label="Select Currency"
                    placeholder="Choose a currency..."
                    class="w-full"
                  />
                </div>
              </div>
            </template>

            <!-- Selected Suppliers Table -->
            <div class="mt-4 flex flex-col">
              <h1 class="text-sm font-semibold mb-2">
                Selected Suppliers ({{ selectedSuppliers.length }})
              </h1>
              <div class="flex-1 border border-gray-200 rounded-lg bg-white">
                <UTable
                  ref="table"
                  :data="cpoList"
                  :columns="columns"
                  sticky
                  class="min-w-[800px] w-full"
                  :style="{ maxHeight: tableHeight }"
                  :loading="isLoading"
              >
                <template #empty>
                  <EmptyState></EmptyState>
                </template>
              </UTable>
              </div>
            </div>
          </UCard>

          <!-- Step 2: Reconciliation -->
          <div
            v-if="
              item.title === t('settlement.generate.steps.reconciliation.title') 
            "
          >
            <div class="flex flex-col lg:flex-row gap-6 mt-4">
              <!-- Master Table -->
              <div
                class="flex-1 overflow-x-auto border border-gray-200 rounded-lg bg-white"
              >
                <div class="overflow-x-auto">
                  <UTable
                    ref="table"
                    :data="listInquirySettlement?.settlements || []"
                    :columns="cpoSettlementColumns"
                    sticky
                    class="min-w-[800px] w-full h-150"
                    @row:click="handleRowClick"
                    >
                <template #empty>
                  <EmptyState></EmptyState>
                </template>
              </UTable>
                </div>
              </div>

              <!-- Detail Table -->
              <div
                v-if="
                  selectedCpoSettlement?.transaction_allocations &&
                  selectedCpoSettlement.transaction_allocations.length > 0
                "
                class="lg:w-1/3 p-4 border border-gray-200 rounded-lg bg-white min-h-[300px] flex flex-col"
              >
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-semibold">Transaction History</h3>
                  <UButton
                    icon="i-lucide-x"
                    size="xs"
                    color="gray"
                    @click="selectedCpoSettlement = null"
                  />
                </div>
                <div
                  class="flex-1 overflow-x-auto border border-gray-200 rounded-lg"
                >
                  <div class="overflow-x-auto">
                    <UTable
                      ref="table"
                      :data="selectedCpoSettlement.transaction_allocations"
                      :columns="cpoSettlementTransactionColumns"
                      sticky
                      class="min-w-[600px] w-full"
                      :style="{ maxHeight: detailTableHeight }"
                      :loading="isLoading"
                      
                      >
                <template #empty>
                  <EmptyState></EmptyState>
                </template>
              </UTable>
                    <!-- Footer summary as a separate div -->
                    <div class="flex justify-end bg-gray-50 border-t border-gray-200 font-semibold">
                      <span class="mr-0">Total:</span>
                      <span class="font-bold">
                        {{
                          selectedCpoSettlement.transaction_allocations
                            .reduce((sum, txn) => sum + (txn.amount || 0), 0)
                            .toLocaleString()
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Settlement Request Success -->
          <div
            v-if="
              item.title === t('settlement.generate.steps.confirmation.title')
            "
            class="flex flex-1 items-center justify-center mt-6"
          >
            <div
              class="w-full max-w-xl bg-green-50 border border-green-200 rounded-lg p-8 text-center shadow-sm"
            >
              <UIcon
                name="i-lucide-check-circle"
                class="text-green-500 text-6xl mb-4"
              />
              <h2 class="text-2xl font-bold text-green-700 mb-2">
                {{ "Settlement Request Successful!" }}
              </h2>
              <p class="text-green-700 mb-6">
                {{ "Your settlement request has been submitted successfully." }}
              </p>
              <UButton color="primary" size="lg" @click="onConfirm()">
                {{ t(" Done ") || "Back to List" }}
              </UButton>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <UButton
              v-if="
                item.title ===
                t('settlement.generate.steps.reconciliation.title')
              "
              :disabled="!stepper?.hasPrev"
              @click="stepper?.prev()"
            >
              Back
            </UButton>

            <UButton
              v-if="
                item.title === t('settlement.generate.steps.supplier.title')
              "
              :disabled="!stepper?.hasNext || !canProceedToNext"
              @click="onReconciliationNext()"
            >
              Reconcile & Settle
            </UButton>
            <UButton
              v-if="
                item.title ===
                t('settlement.generate.steps.reconciliation.title')
              "
              :disabled="!stepper?.hasNext || !canProceedToNext"
              :loading="isLoading"
              @click="onSubmitSettle()"
            >
              Confirm To Settlement
            </UButton>
          </div>
        </div>
      </template>
    </UStepper>
  </div>
</template>
