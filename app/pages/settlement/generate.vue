<script setup lang="ts">
import type { StepperItem, TableRow, TableColumn } from "@nuxt/ui";
import type {
  Cpo,
  Supplier,
  CpoBySupplierRequest,
  InitQuerySettlement,
  CpoSettlement,
  Settlement,
  TransactionAllocation,
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
import EmptyState from "~/components/TableEmptyState.vue";

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
const cutOffDate = shallowRef(new CalendarDate(2022, 1, 10)); // Default to a specific date

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

const showConfirmModal = ref(false);

const supplierKeys = ref<Supplier[]>([]);
const selectedSuppliers = ref<{ label: string; value: Supplier }[]>([]);
const selectedSupplier = ref<{ label: string; value: Supplier } | undefined>(
  undefined
);
const cpoList = ref<Cpo[]>([]);
const selectedCurrency = ref<
  { label: string; value: CurrencyConfig } | undefined
>(undefined);
const defaultCurrency: CurrencyConfig = {
  code: "KHR",
  symbol: "៛",
  name: "Cambodian Riel",
  decimals: 0,
  locale: "km-KH",
};

const isLoading = ref(false);

// Add currency options computed property
const currencyOptions = computed(() =>
  useCurrency().getAllCurrencies.value.map((currency) => ({
    label: `${currency.name} (${currency.code})`,
    value: currency,
  }))
);

// Step 2 reconciliation
const selectedCpo = ref<Cpo[]>([]);
const selectedCpoIds = ref<Set<string>>(new Set());

// Add methods to handle selection
const isRowSelected = (cpo: Cpo) => {
  return selectedCpoIds.value.has(cpo.id);
};

const toggleRowSelection = (cpo: Cpo) => {
  if (selectedCpoIds.value.has(cpo.id)) {
    selectedCpoIds.value.delete(cpo.id);
    selectedCpo.value = selectedCpo.value.filter((item) => item.id !== cpo.id);
  } else {
    selectedCpoIds.value.add(cpo.id);
    selectedCpo.value.push(cpo);
  }
};

const toggleAllSelection = (selectAll: boolean) => {
  if (selectAll) {
    selectedCpoIds.value = new Set(cpoList.value.map((cpo) => cpo.id));
    selectedCpo.value = [...cpoList.value];
  } else {
    selectedCpoIds.value.clear();
    selectedCpo.value = [];
  }
};

const isAllSelected = computed(() => {
  return (
    cpoList.value.length > 0 && selectedCpoIds.value.size === cpoList.value.length
  );
});

const isSomeSelected = computed(() => {
  return (
    selectedCpoIds.value.size > 0 &&
    selectedCpoIds.value.size < cpoList.value.length
  );
});

const columns: TableColumn<Cpo>[] = [
  {
    id: "select",
    header: () =>
      h(resolveComponent("UCheckbox"), {
        modelValue: isSomeSelected.value ? "indeterminate" : isAllSelected.value,
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          toggleAllSelection(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      h(resolveComponent("UCheckbox"), {
        modelValue: isRowSelected(row.original),
        "onUpdate:modelValue": () => toggleRowSelection(row.original),
        "aria-label": "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "supplier.code",
    header: () => t("settlement.generate.form.supplier_code"),
  },
  {
    accessorKey: "supplier.name",
    header: () => t("settlement.generate.form.supplier_name"),
  },
  { accessorKey: "code", header: () => t("settlement.generate.form.cpo_code") },
  { accessorKey: "name", header: () => t("settlement.generate.form.cpo_name") },
  { accessorKey: "phone", header: () => t("settlement.generate.form.phone") },
  { accessorKey: "email", header: () => t("settlement.generate.form.email") },
  {
    accessorKey: "address",
    header: () => t("settlement.generate.form.address"),
  },
];

const cpoSettlementColumns: TableColumn<Settlement>[] = [
  {
    accessorKey: "supplier.code",
    header: () => t("settlement.generate.form.cpo_code"),
  },
  {
    accessorKey: "supplier.name",
    header: () => t("settlement.generate.form.cpo_name"),
  },
  { accessorKey: "amount", header: () => t("settlement.generate.form.amount") },
  {
    accessorKey: "currency",
    header: () => t("settlement.generate.form.currency"),
  },
  {
    accessorKey: "settlement_bank_id",
    header: () => t("settlement.generate.form.settle_to_bank"),
  },
  {
    id: "actions",
    header: () => t("settlement.generate.form.actions"),
    cell: ({ row }) =>
      h(
        resolveComponent("UButton"),
        {
          size: "xs",
          color: "primary",
          onClick: () => handleViewCpo(row.original),
        },
        { default: () => t("settlement.generate.form.view") }
      ),
    enableSorting: false,
    enableHiding: false,
  },
];

const cpoSettlementTransactionColumns: TableColumn<TransactionAllocation>[] = [
  {
    accessorKey: "tran_date",
    header: () => t("settlement.generate.form.transaction_date"),
  },
  {
    accessorKey: "bank_ref",
    header: () => t("settlement.generate.form.bank_ref"),
  },
  {
    accessorKey: "bank_name",
    header: () => t("settlement.generate.form.bank_name"),
  },
  {
    accessorKey: "amount",
    header: () => t("settlement.generate.form.transaction_amount"),
  },
];

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
  // Check if can proceed to Reconcile
  if (currentStepTitle === t("settlement.generate.steps.supplier.title")) {
    return (
      selectedSuppliers.value.length > 0 &&
      cutOffDate.value !== null &&
      selectedCurrency.value !== undefined &&
      selectedCpo.value.length > 0
    );
  }
  return true; // Allow proceeding for other steps
});
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

onMounted(() => {
  // Fetch suppliers when the component is mounted
  fetchSuppliers();
  // Set default currency
  // selectedCurrency.value = defaultCurrency;
});

const fetchSuppliers = async () => {
  try {
    supplierKeys.value = await supplierApi.getSuppliers();
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
  }
};

const fetchInquirySettlementCpo = async () => {
  if (selectedSuppliers.value.length === 0) return;
  try {
    const request: InitQuerySettlement = {
      parties: selectedCpo.value?.map((cpo) => ({
        id: cpo.id,
        type: "cpo",
      })) || [],
      main_supplier_id: selectedSupplier.value?.value.id || "",
      cutoff_date: cutOffDate.value
        ? cutOffDate.value.toDate(getLocalTimeZone()).toISOString()
        : new Date().toISOString(),
      currency: selectedCurrency.value?.value.code || defaultCurrency.code,
    };

    const response = await supplierApi.getInquirySettlement(request);
    listInquirySettlement.value = response;
  } catch (error) {
    console.error("Failed to fetch CPOs:", error);
  } finally {
    // Optionally handle loading state or errors
  }
};

function onReconciliationNext() {
  console.log("Selected CPOs:", selectedCpo.value.length);
  fetchInquirySettlementCpo();
  stepper.value?.next();
}

const router = useRouter();
function onConfirm() {
  router.push("/settlement/generate");
}

// Clear selection when supplier changes
const handleSupplierMenuChanged = async () => {
  // Reset CPO list and selection when suppliers change
  cpoList.value = [];
  selectedCpo.value = [];
  selectedCpoIds.value.clear();

  if (!selectedSupplier.value) return;
  selectedSuppliers.value = [selectedSupplier.value!];
  // This for multiple suppliers
  if (selectedSuppliers.value.length === 0) return;
  cpoList.value = await supplierApi.getListCPOApi({
    parent_supplier_ids: selectedSuppliers.value.map((s) => s.value.id),
  });
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

// function onCpoListTableSelect(row: TableRow<Cpo>, e?: Event) {
//   row.toggleSelected(!row.getIsSelected())
//   // Add row data to selectedCpo
//   if (row.getIsSelected()) {
//     selectedCpo.value.push(row.original)
//   } else {
//     selectedCpo.value = selectedCpo.value.filter(cpo => cpo.id !== row.original.id)
//   }
// }
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
                    {{ t("settlement.generate.form.select_suppliers") }}
                  </h1>
                  <div class="flex flex-row items-center gap-2">
                    <USelectMenu
                      v-model="selectedSupplier"
                      :items="
                        supplierKeys.map((supplier) => ({
                          label: supplier.name,
                          value: supplier,
                        }))
                      "
                      option-attribute="value"
                      required
                      icon="i-lucide-user"
                      label="Select Suppliers"
                      :placeholder="
                        t('settlement.generate.form.choose_suppliers')
                      "
                      class="w-full"
                      @change="handleSupplierMenuChanged"
                    >
                      <template #leading="{ modelValue, ui }">
                        <UIcon
                          name="i-lucide-users"
                          class="mr-2 text-gray-500"
                        />
                      </template>
                    </USelectMenu>
                    <!-- <UButton
                    icon="i-lucide-x"
                    size="md"
                    color="neutral"
                    variant="outline"
                    @click="selectedSuppliers = []"
                  >
                    Clear
                  </UButton> -->
                  </div>
                </div>

                <!-- Cutoff Date -->
                <div>
                  <h1 class="text-sm mb-2 font-semibold">
                    {{ t("settlement.generate.form.select_cutoff_date") }}
                  </h1>
                  <UPopover class="w-full">
                    <UButton
                      color="neutral"
                      variant="subtle"
                      icon="i-lucide-calendar"
                    >
                      {{
                        cutOffDate
                          ? df.format(cutOffDate.toDate(getLocalTimeZone()))
                          : t("settlement.generate.form.select_date")
                      }}
                    </UButton>
                    <template #content>
                      <UCalendar v-model="cutOffDate" class="p-2" />
                    </template>
                  </UPopover>
                </div>

                <!-- Currency Selector -->
                <div>
                  <h1 class="text-sm mb-2 font-semibold">
                    {{ t("settlement.generate.form.select_currency") }}
                  </h1>
                  <USelectMenu
                    v-model="selectedCurrency"
                    :items="currencyOptions"
                    option-attribute="value"
                    icon="i-lucide-dollar-sign"
                    :placeholder="t('settlement.generate.form.choose_currency')"
                    class="w-full"
                  >
                    <template #leading>
                      <UIcon
                        name="i-lucide-dollar-sign"
                        class="mr-2 text-gray-500"
                      />
                    </template>
                  </USelectMenu>
                </div>
              </div>
            </template>

            <!-- Cpo List Table -->
            <div class="mt-4 flex flex-col">
              <h1 class="text-sm font-semibold mb-2">
                {{ t("settlement.generate.form.cpo_list") }} ({{
                  cpoList.length
                }})
              </h1>
              <!-- Add selected row data to the CPO list -->
              <div class="flex-1 border border-gray-200 rounded-lg bg-white">
                <UTable
                  ref="table"
                  :data="cpoList"
                  :columns="columns"
                  sticky
                  class="min-w-[800px] w-full h-100"
                  @row:click="(row: Cpo) => toggleRowSelection(row)"
                >
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
                  <h3 class="text-lg font-semibold">
                    {{ t("settlement.generate.form.transaction_history") }}
                  </h3>
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
                    />
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
                {{
                  t("settlement.generate.form.settlement_request_successful")
                }}
              </h2>
              <p class="text-green-700 mb-6">
                {{ t("settlement.generate.form.settlement_request_message") }}
              </p>
              <UButton color="primary" size="lg" @click="onConfirm()">
                {{
                  t("settlement.generate.form.done") ||
                  t("settlement.generate.form.back_to_list")
                }}
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
              {{ t("settlement.generate.form.back") }}
            </UButton>

            <UButton
              v-if="
                item.title === t('settlement.generate.steps.supplier.title')
              "
              :disabled="!stepper?.hasNext || !canProceedToNext"
              @click="onReconciliationNext()"
            >
              {{ t("settlement.generate.form.reconcile_settle") }}
            </UButton>
            <UButton
              v-if="
                item.title ===
                t('settlement.generate.steps.reconciliation.title') && !showConfirmModal
              "
              :disabled="!stepper?.hasNext || !canProceedToNext"
              @click="onReconciliationNext()"
            >
              {{ t("settlement.generate.form.confirm_settlement") }}
            </UButton>
            <!-- Show confirm modal to confirm settlement -->
            <UModal
              :transition="true"
              :title="t('settlement.generate.form.confirm_settlement')"
              :body="t('settlement.generate.form.confirm_settlement_body')"
              v-if="
                item.title ===
                t('settlement.generate.steps.reconciliation.title') && showConfirmModal
              "
            >
              <UButton
                :label="t('settlement.generate.form.confirm_settlement')"
              />

              <template #body>
                <Placeholder class="h-48" />
              </template>
            </UModal>
          </div>
        </div>
      </template>
    </UStepper>
  </div>
</template>