<script setup lang="ts">
import type { StepperItem, TableRow, TableColumn } from "@nuxt/ui";
import type {
  Cpo,
  Supplier,
  CpoBySupplierRequest,
  InitQuerySettlement,
  SettlementInquiryResponse,
  Settlement,
  TransactionAllocation,
  ConfirmSettlementRequest,
  ConfirmSettlementResponse,
} from "~/models/settlement";
import type {
  CurrencyConfig,
  CurrencyFormatOptions,
} from "~/composables/utils/useCurrency";
import {
  CalendarDate,
  CalendarDateTime,
  DateFormatter,
  getLocalTimeZone,
  Time,
} from "@internationalized/date";
import { useSupplierApi } from "~/composables/api/useSupplierApi";
import { useCurrency } from "~/composables/utils/useCurrency";
import EmptyState from "~/components/TableEmptyState.vue";
import { LOCAL_STORAGE_KEYS } from "~/utils/constants";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const supplierApi = useSupplierApi();

// Load user preferences for time format
const storage = useStorage();
const userPreferences = computed(() => {
  const prefs = storage.getItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
  return prefs || { 
    timeFormat: "24h", 
    currency: "USD",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Default to browser timezone
  };
});

const df = new DateFormatter("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

// Create a CalendarDate for today in the local time zone
const today = new Date();
const now = new CalendarDateTime(
  today.getFullYear(),
  today.getMonth() + 1,
  today.getDate(),
  23,
  59
);
const cutOffDatetime = shallowRef(now); // Default with time

// Create computed properties that sync with cutOffDatetime
// Generate hour options based on user preference
const getHourOptions = computed(() => {
  if (userPreferences.value.timeFormat === "12h") {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = i + 1; // Start from 1 to 12
      return {
        label: hour.toString().padStart(2, "0"),
        value: hour,
      };
    });
  } else {
    return Array.from({ length: 24 }, (_, i) => ({
      label: i.toString().padStart(2, "0"),
      value: i,
    }));
  }
});

// Generate minute options (same for both formats)
const getMinuteOptions = computed(() => {
  return Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));
});

// Generate second options (same for both formats)
const getSecondOptions = computed(() => {
  return Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));
});

// AM/PM options for 12-hour format
const getPeriodOptions = computed(() => {
  return [
    { label: "AM", value: "AM" },
    { label: "PM", value: "PM" },
  ];
});

// Handle hour selection based on format
const cutOffDateHour = computed({
  get: () => {
    if (userPreferences.value.timeFormat === "12h") {
      const hour24 = cutOffDatetime.value.hour;
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      return {
        label: hour12.toString().padStart(2, "0"),
        value: hour12,
      };
    } else {
      return {
        label: cutOffDatetime.value.hour.toString().padStart(2, "0"),
        value: cutOffDatetime.value.hour,
      };
    }
  },
  set: (hour: { label: string; value: number }) => {
    if (userPreferences.value.timeFormat === "12h") {
      // Convert 12-hour to 24-hour format
      const period = cutOffDatePeriod.value.value;
      let hour24 = hour.value;
      if (period === "AM" && hour.value === 12) {
        hour24 = 0;
      } else if (period === "PM" && hour.value !== 12) {
        hour24 = hour.value + 12;
      }
      cutOffDatetime.value = cutOffDatetime.value.set({ hour: hour24 });
    } else {
      cutOffDatetime.value = cutOffDatetime.value.set({ hour: hour.value });
    }
  },
});

// Handle minute selection
const cutOffDateMinute = computed({
  get: () => ({
    label: cutOffDatetime.value.minute.toString().padStart(2, "0"),
    value: cutOffDatetime.value.minute,
  }),
  set: (minute: { label: string; value: number }) => {
    cutOffDatetime.value = cutOffDatetime.value.set({ minute: minute.value });
  },
});

// Handle second selection
const cutOffDateSecond = computed({
  get: () => ({
    label: cutOffDatetime.value.second.toString().padStart(2, "0"),
    value: cutOffDatetime.value.second,
  }),
  set: (second: { label: string; value: number }) => {
    cutOffDatetime.value = cutOffDatetime.value.set({ second: second.value });
  },
});

// Handle AM/PM selection for 12-hour format
const cutOffDatePeriod = computed({
  get: () => {
    const hour = cutOffDatetime.value.hour;
    const period = hour >= 12 ? "PM" : "AM";
    return { label: period, value: period };
  },
  set: (period: { label: string; value: string }) => {
    const currentHour = cutOffDatetime.value.hour;
    let newHour = currentHour;

    if (period.value === "AM" && currentHour >= 12) {
      newHour = currentHour - 12;
    } else if (period.value === "PM" && currentHour < 12) {
      newHour = currentHour + 12;
    }

    cutOffDatetime.value = cutOffDatetime.value.set({ hour: newHour });
  },
});

// Format time display based on user preference
const formatTimeDisplay = computed(() => {
  if (!cutOffDatetime.value) return "";

  const date = cutOffDatetime.value.toDate(getLocalTimeZone());
  // Get locale base on current language
  const locale = useI18n().locale.value || "en-US";

  if (userPreferences.value.timeFormat === "12h") {
    return new DateFormatter(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    }).format(date);
  } else {
    return new DateFormatter(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: false,
    }).format(date);
  }
});

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
const isLoadingSupplier = ref(false);
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

const isConfirmModalShow = ref(false);
const isProcessWithMockupDate = false;

// Add currency options computed property
const currencyOptions = computed(() =>
  useCurrency().getAllCurrencies.value.map((currency) => ({
    label: `${currency.name} (${currency.code})`,
    value: currency,
  }))
);

// Set default currency based on user preferences
const setDefaultCurrency = () => {
  if (!selectedCurrency.value && currencyOptions.value.length > 0) {
    // Try to find currency from user preferences
    const preferredCurrency = currencyOptions.value.find(
      (option) => option.value.code === userPreferences.value.currency
    );

    if (preferredCurrency) {
      selectedCurrency.value = preferredCurrency;
    } else {
      // Fall back to default currency if user preference currency is not available
      const fallbackCurrency = currencyOptions.value.find(
        (option) => option.value.code === defaultCurrency.code
      );
      selectedCurrency.value = fallbackCurrency || currencyOptions.value[0];
    }
  }
};

// Step 2 reconciliation
const selectedCpo = ref<Cpo[]>([]);
const selectedCpoIds = ref<Set<string>>(new Set());

// Add search functionality
const searchQuery = ref("");

// Add computed property for filtered CPO list
const filteredCpoList = computed(() => {
  if (!searchQuery.value.trim()) {
    return cpoList.value;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return cpoList.value.filter(
    (cpo) =>
      cpo.code.toLowerCase().includes(query) ||
      cpo.name.toLowerCase().includes(query) ||
      cpo.email?.includes(query) ||
      cpo.address?.includes(query)
  );
});

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
    cpoList.value.length > 0 &&
    selectedCpoIds.value.size === cpoList.value.length
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
        modelValue: isSomeSelected.value
          ? "indeterminate"
          : isAllSelected.value,
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
    size: 50,
    maxSize: 50,
  },
  // {
  //   accessorKey: "parent_supplier.code",
  //   header: () => t("settlement.generate.form.supplier_code"),
  //   size: 120,
  //   maxSize: 120,
  // },
  // {
  //   accessorKey: "parent_supplier.name",
  //   header: () => t("settlement.generate.form.supplier_name"),
  //   size: 180,
  //   maxSize: 200,
  // },
  { 
    accessorKey: "code", 
    header: () => t("settlement.generate.form.biller_code"),
    size: 120,
    maxSize: 120,
  },
  { 
    accessorKey: "name", 
    header: () => t("settlement.generate.form.biller_name"),
    size: 200,
    maxSize: 250,
  },
  { 
    accessorKey: "phone", 
    header: () => t("settlement.generate.form.phone"),
    size: 130,
    maxSize: 130,
  },
  { 
    accessorKey: "email", 
    header: () => t("settlement.generate.form.email"),
    size: 200,
    maxSize: 250,
  },
  // {
  //   accessorKey: "address",
  //   header: () => t("settlement.generate.form.address"),
  //   size: 200,
  //   maxSize: 300,
  // },
];

const cpoSettlementColumns: TableColumn<Settlement>[] = [
  {
    accessorKey: "cpo.code",
    header: () => t("settlement.generate.form.cpo_code"),
    size: 120,
    maxSize: 120,
    cell: ({row}) => {
      const cpo = getCpoById(row.original.party_id);
      return cpo ? cpo.code : row.original.cpo.code;
    },
  },
  {
    accessorKey: "cpo.name",
    header: () => t("settlement.generate.form.cpo_name"),
    size: 200,
    maxSize: 250,
    cell: ({row}) => {
      const cpo = getCpoById(row.original.party_id);
      return cpo ? cpo.name : row.original.cpo.name;
    },
  },
  {
    accessorKey: "amount",
    header: () => t("settlement.generate.form.amount"),
    cell: ({row}) => useCurrency().formatAmount(row.original.amount, row.original.currency || 'USD'),
    size: 140,
    maxSize: 140,
  },
  {
    accessorKey: "currency",
    header: () => t("settlement.generate.form.currency"),
    size: 80,
    maxSize: 80,
  },
  {
    accessorKey: "settlement_bank_id",
    header: () => t("settlement.generate.form.settle_to_bank"),
    size: 150,
    maxSize: 150,
  },
  {
    id: "actions",
    header: () => t("settlement.generate.form.actions"),
    cell: ({ row }) => {
      const isCurrentlyViewing = selectedCpoSettlement.value?.party_id === row.original.party_id;
      return h(
        resolveComponent("UButton"),
        {
          size: "xs",
          color: isCurrentlyViewing ? "neutral" : "primary",
          onClick: () => handleViewCpo(row.original),
        },
        { default: () => isCurrentlyViewing ? t("settlement.generate.form.viewing") : t("settlement.generate.form.view") }
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 100,
    maxSize: 100,
  },
];

const cpoSettlementTransactionColumns: TableColumn<TransactionAllocation>[] = [
  {
    accessorKey: "tran_date",
    header: () => t("settlement.generate.form.date"),
    size: 150,
    maxSize: 150,
  },
  {
    accessorKey: "amount",
    header: () => h('div', {class: 'text-center'}, t("settlement.generate.form.amount"),),
    cell: ({ row }) => h('div', { class: 'text-right' }, useCurrency().formatCurrency(row.original.amount, row.original.currency_id || 'USD')),
    size: 150,
    maxSize: 150,
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
      cutOffDatetime.value !== null &&
      selectedCurrency.value !== undefined &&
      selectedCpo.value.length > 0
    );
  }
  return true; // Allow proceeding for other steps
});
let listInquirySettlement = ref<SettlementInquiryResponse>();
let confirmSettlementResponse = ref<ConfirmSettlementResponse | null>(null);
let selectedCpoSettlement = ref<Settlement | null>(null);
function handleRowClick(row: SettlementInquiryResponse) {
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
  // Set default currency based on user preferences
  setDefaultCurrency();
});

// Watch for currency options changes to set default currency
watch(
  currencyOptions,
  () => {
    setDefaultCurrency();
  },
  { immediate: true }
);

const fetchSuppliers = async () => {
  try {
    isLoadingSupplier.value = true;
    supplierKeys.value = await supplierApi.getSuppliers();
    if (isProcessWithMockupDate) {
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
  } finally {
    isLoadingSupplier.value = false;
  }
};

const fetchInquirySettlementCpo = async () => {
  if (selectedSuppliers.value.length === 0) return;
  try {
    const request: InitQuerySettlement = {
      parties:
        selectedCpo.value?.map((cpo) => ({
          id: cpo.id,
          type: "2",
        })) || [],
      main_supplier_id: selectedSupplier.value?.value.id || "",
      cutoff_date: cutOffDatetime.value
        ? cutOffDatetime.value.toDate(userPreferences.value.timezone).toISOString()
        : new Date().toISOString(),
      currency: selectedCurrency.value?.value.code || defaultCurrency.code,
    };

    const response = await supplierApi.getInquirySettlement(request);
    if (isProcessWithMockupDate)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    listInquirySettlement.value = response;
  } catch (error) {
    console.error("Failed to fetch CPOs:", error);
  } finally {
    // Optionally handle loading state or errors
  }
};

const onReconciliationNext = async () => {
  await fetchInquirySettlementCpo();
  stepper.value?.next();
};

const router = useRouter();
function onConfirm() {
  router.push("/settlement/wallet-settlement");
}

// Clear selection when supplier changes
const handleSupplierMenuChanged = async () => {
  // Reset CPO list and selection when suppliers change
  cpoList.value = [];
  selectedCpo.value = [];
  selectedCpoIds.value.clear();
  searchQuery.value = ""; // Clear search when supplier changes

  if (!selectedSupplier.value) return;
  selectedSuppliers.value = [selectedSupplier.value!];
  // This for multiple suppliers
  if (selectedSuppliers.value.length === 0) return;
  cpoList.value = await supplierApi.getListCPOApi({
    parent_supplier_ids: selectedSuppliers.value.map((s) => s.value.id),
  });
  
  // Auto-select all CPOs by default
  if (cpoList.value.length > 0) {
    toggleAllSelection(true);
    selectedCpo.value = [...cpoList.value];
  }
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

// Handle submit settlement function
const handleSubmitSettlement = async () => {
  try {
    const payload: ConfirmSettlementRequest = {
      settlement_token: listInquirySettlement.value?.token || "",
    };
    const response = await supplierApi.confirmSettlementAPI(payload);
    if (isProcessWithMockupDate)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    // Check if response is valid
    if (response.error) {
      console.error("Error confirming settlement:", response.error);
      alert(`Error confirming settlement: ${response.error}`);
      return;
    }
    if (response.data) {
      // Handle successful settlement submission
      console.log("Settlement submitted successfully:", response);
      confirmSettlementResponse.value = response.data; // Store the response
      isConfirmModalShow.value = false; // Close confirmation modal
      // Process to next step
      stepper.value?.next();
    } else {
      // Handle error in submission
      console.error("Settlement submission failed:", response);
    }
  } catch (error) {
    console.error("Failed to submit settlement:", error);
  }
};

// Clear reconciliation data when going back to supplier selection
const clearReconciliationData = () => {
  listInquirySettlement.value = undefined;
  selectedCpoSettlement.value = null;
  confirmSettlementResponse.value = null;
};

// Handle back navigation from reconciliation step
const handleBackToSupplierSelection = () => {
  clearReconciliationData();
  stepper.value?.prev();
};

// Get Cpo by cpo id
const getCpoById = (cpoId: string): Cpo | undefined => {
  return cpoList.value.find((cpo) => cpo.id === cpoId);
};

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'Settlement', to: '/settlement' },
    { label: "Wallet Settlement", to: "/settlement/wallet-settlement" },
    { label: "Generate Settlement", active: true },
  ],
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
            class="flex-1 mt-4"
            v-if="item.title === t('settlement.generate.steps.supplier.title')"
          >
            <template #header>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Supplier Selector -->
                <div>
                  <h1 class="text-sm mb-2 font-semibold">
                    {{ t("settlement.generate.form.select_main_supplier") }}
                  </h1>
                  <div class="flex flex-row items-center gap-2">
                    <USelectMenu
                      v-model="selectedSupplier"
                      :items="
                        supplierKeys.map((supplier) => ({
                          label: `${supplier.code} - ${supplier.name}`,
                          value: supplier,
                        }))
                      "
                      option-attribute="value"
                      required
                      icon="i-lucide-user"
                      label="Select Suppliers"
                      :placeholder="
                        isLoadingSupplier 
                          ? t('settlement.generate.form.loading_suppliers') || 'Loading suppliers...'
                          : t('settlement.generate.form.choose_suppliers')
                      "
                      :disabled="isLoadingSupplier"
                      class="w-full"
                      @change="handleSupplierMenuChanged"
                    >
                      <template #leading="{ modelValue, ui }">
                        <UIcon
                          :name="isLoadingSupplier ? 'i-lucide-loader-2' : 'i-lucide-users'"
                          :class="['mr-2 text-gray-500', { 'animate-spin': isLoadingSupplier }]"
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
                      class="w-full justify-start"
                    >
                      {{
                        cutOffDatetime
                          ? formatTimeDisplay
                          : t("settlement.generate.form.select_date")
                      }}
                    </UButton>
                    <template #content>
                      <div class="p-4 space-y-4">
                        <UCalendar v-model="cutOffDatetime" />
                        <div class="border-t pt-4">
                          <label class="block text-sm font-semibold mb-2">
                            {{ t("settlement.generate.form.select_time") }}
                          </label>
                          <div class="flex gap-2">
                            <USelectMenu
                              v-model="cutOffDateHour"
                              :items="getHourOptions"
                              :placeholder="t('settlement.generate.form.hour')"
                              class="flex-1"
                              :search-input="false"
                            />
                            <USelectMenu
                              v-model="cutOffDateMinute"
                              :items="getMinuteOptions"
                              :placeholder="
                                t('settlement.generate.form.minute')
                              "
                              class="flex-1"
                              :search-input="false"
                            />
                            <USelectMenu
                              v-model="cutOffDateSecond"
                              :items="getSecondOptions"
                              :placeholder="
                                t('settlement.generate.form.second')
                              "
                              class="flex-1"
                              :search-input="false"
                            />
                            <USelectMenu
                              v-if="userPreferences.timeFormat === '12h'"
                              v-model="cutOffDatePeriod"
                              :items="getPeriodOptions"
                              placeholder="AM/PM"
                              class="flex-1"
                              :search-input="false"
                            />
                          </div>
                        </div>
                      </div>
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
                    :search-input="false"
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
              <div class="flex items-center justify-between mb-4">
                <h1 class="text-sm font-semibold">
                  {{ t("settlement.generate.form.biller_list") }} ({{
                    filteredCpoList.length || 0
                  }})
                  <span
                    v-if="
                      searchQuery && (filteredCpoList.length || 0) !== (cpoList.length || 0)
                    "
                    class="text-gray-500"
                  >
                    of {{ cpoList.length || 0 }}
                  </span>
                </h1>

                <!-- Search Input -->
                <div class="w-64">
                  <UInput
                    v-model="searchQuery"
                    icon="i-lucide-search"
                    :placeholder="t('settlement.generate.form.search_biller')"
                    class="w-full"
                    :trailing="searchQuery ? true : false"
                  >
                    <template #trailing v-if="searchQuery">
                      <UButton
                        icon="i-lucide-x"
                        size="xs"
                        color="gray"
                        variant="ghost"
                        @click="searchQuery = ''"
                      />
                    </template>
                  </UInput>
                </div>
              </div>

              <!-- Add selected row data to the CPO list -->
              <div class="flex-1 border border-gray-200 rounded-lg">
                <UTable
                  ref="table"
                  :data="filteredCpoList"
                  :columns="columns"
                  sticky
                  class="min-w-[800px] w-full h-100"
                  @row:click="(row: Cpo) => toggleRowSelection(row)"
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
                class="flex-2 overflow-x-auto border border-gray-200 rounded-lg"
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
              <Transition
                name="slide-left"
                enter-active-class="transition-all duration-300 ease-out"
                leave-active-class="transition-all duration-300 ease-in"
                enter-from-class="transform translate-x-full opacity-0"
                enter-to-class="transform translate-x-0 opacity-100"
                leave-from-class="transform translate-x-0 opacity-100"
                leave-to-class="transform translate-x-full opacity-0"
              >
                <div
                  v-if="
                    selectedCpoSettlement?.transaction_allocations &&
                    selectedCpoSettlement.transaction_allocations.length > 0
                  "
                  class="lg:w-1/3 lg:flex-1 p-4 border border-gray-200 rounded-lg bg-white min-h-[300px] flex flex-col shadow-lg"
                >
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">
                      {{ t("settlement.generate.form.transaction_history") }}
                    </h3>
                    <UButton
                      icon="i-lucide-x"
                      size="xs"
                      color="gray"
                      variant="ghost"
                      @click="selectedCpoSettlement = null"
                      class="hover:bg-gray-100 transition-colors duration-200"
                    />
                  </div>
                  <div
                    class="flex-1 border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <UTable
                        ref="table"
                        :data="selectedCpoSettlement.transaction_allocations"
                        :columns="cpoSettlementTransactionColumns"
                        sticky
                        class="w-full animate-fade-in"
                        :style="{ maxHeight: detailTableHeight }"
                      />
                  </div>
                  <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm font-semibold text-gray-600">
                      {{ t("settlement.generate.form.total_amount") }}:
                      <span class="font-bold text-gray-800 ml-1">
                        {{
                          useCurrency().formatAmount(
                            selectedCpoSettlement.amount,
                            selectedCpoSettlement.currency
                              ? selectedCpoSettlement.currency
                              : defaultCurrency.code
                          )
                        }}
                        <span class="ml-1">
                          {{
                            selectedCpoSettlement.currency
                              ? selectedCpoSettlement.currency
                              : defaultCurrency.code
                          }}</span
                        >
                      </span>
                    </p>
                  </div>
                </div>
              </Transition>
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
              class="w-10/12 h-10/12 bg-green-50 border border-green-200 rounded-lg p-8 text-center shadow-sm items-center justify-center content-center"
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
              @click="handleBackToSupplierSelection"
            >
              {{ t("settlement.generate.form.back") }}
            </UButton>

            <UButton
              v-if="
                item.title === t('settlement.generate.steps.supplier.title')
              "
              :disabled="!stepper?.hasNext || !canProceedToNext"
              @click="onReconciliationNext"
              loading-auto
            >
              {{ t("settlement.generate.form.reconcile_settle") }}
            </UButton>
            <!-- Show confirm modal to confirm settlement -->
            <UModal
              transition
              v-bind:open="isConfirmModalShow"
              :close="false"
              :title="t('settlement.generate.form.confirm_settlement_title')"
              :body="t('settlement.generate.form.confirm_settlement_body')"
              v-if="
                item.title ===
                t('settlement.generate.steps.reconciliation.title') //&& showConfirmModal
              "
            >
              <UButton
              :disabled="(listInquirySettlement?.settlements?.length || 0) === 0"
                :label="t('settlement.generate.form.confirm_settlement')"
                @click="isConfirmModalShow = true"
              />

              <template #body>
                <div class="flex flex-col items-center text-center py-6">
                  <!-- Icon with circle background using Bill24 colors -->
                  <div
                    class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style="background-color: #eaf6fc"
                  >
                    <UIcon
                      name="i-lucide-alert-triangle"
                      class="text-3xl opacity-80"
                      style="color: #43b3de"
                    />
                  </div>

                  <!-- Question text -->
                  <h4 class="text-lg font-semibold mb-1">
                    {{
                      t("settlement.generate.form.confirm_settlement_message")
                    }}
                  </h4>

                  <!-- Description text -->
                  <p
                    class="max-w-md text-sm leading-relaxed"
                    style="color: #b2aaa3"
                  >
                    {{
                      t(
                        "settlement.generate.form.confirm_settlement_description"
                      )
                    }}
                  </p>
                </div>
              </template>
              <template #footer>
                <div class="flex justify-end gap-3 w-full">
                  <UButton
                    variant="outline"
                    style="border-color: #d0c8c1;"
                    @click="isConfirmModalShow = false"
                  >
                    {{
                      t(
                        "settlement.generate.form.confirm_settlement_buttons.no"
                      )
                    }}
                  </UButton>
                  <UButton
                    style="background-color: #43b3de; color: #ffffff"
                    loading-auto
                    @click="handleSubmitSettlement"
                  >
                    {{
                      t(
                        "settlement.generate.form.confirm_settlement_buttons.yes"
                      )
                    }}
                  </UButton>
                </div>
              </template>
            </UModal>
            <!-- Show No Cpo Settlement Modal -->
             <!-- <UModal
             v-bind:open="showNoCpoSettlementModal"
             v-bind:close="false"
             transition
             :title="t('settlement.generate.form.no_cpo_settlement_title')"
             >
             <template #body>
                <div class="flex flex-col items-center text-center py-6">
                  <div
                    class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style="background-color: #fff3cd"
                  >
                    <UIcon
                      name="i-lucide-alert-triangle"
                      class="text-3xl opacity-80"
                      style="color: #ffc107"
                    />
                  </div>

                  
                  <h4 class="text-lg font-semibold mb-1">
                    {{
                      t("settlement.generate.form.no_cpo_settlement_message")
                    }}
                  </h4>
                  <p
                    class="max-w-md text-sm leading-relaxed"
                    style="color: #b2aaa3"
                  >
                    {{
                      t(
                        "settlement.generate.form.no_cpo_settlement_description"
                      )
                    }}
                  </p>
                </div>
              </template>
              <template #footer>
                <div class="flex justify-end gap-3 w-full">
                  <UButton
                    style="background-color: #43b3de; color: #ffffff"
                    @click="showNoCpoSettlementModal = false"
                  >
                    {{
                      t(
                        "yes"
                      )
                    }}
                  </UButton>
                </div>
              </template>
            </UModal> -->
          </div>
        </div>
      </template>
    </UStepper>
  </div>
</template>

<style scoped>
.slide-left-enter-active, .slide-left-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-left-enter-from, .slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-left-enter-to {
  transform: translateX(0);
  opacity: 1;
}

/* Enhanced master table animations */
.master-table-container {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
}

.master-table-container.with-detail {
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
}

.master-table-container.full-width {
  box-shadow: none;
}

/* Bill24 color for highlight effect */
.master-table-container:after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 3px;
  background-color: #43B3DE;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.master-table-container.with-detail:after {
  opacity: 0.5;
}

/* Add smooth flex transitions */
.flex-2, .flex-\[2\] {
  transition: flex 0.5s ease-in-out;
}
</style>
