<script setup lang="ts">
import type { StepperItem, AvatarProps, TableColumn } from "@nuxt/ui";
import type { Cpo, Supplier, CpoBySupplierRequest } from "~/models/settlement";
import type { CurrencyConfig, CurrencyFormatOptions } from "~/composables/utils/useCurrency";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import { useSupplierApi } from "~/composables/api/useSupplierApi";
import { useCurrency } from "~/composables/utils/useCurrency";

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
const modelValue = ref<CalendarDate | null>(now);

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
const selectedSuppliers = ref<Supplier[]>([]);
const cpoList = ref<Cpo[]>([]);
const selectedCurrency = ref<CurrencyConfig | null>(null);
const defaultCurrency: CurrencyConfig = {
  code: "KHR",
  symbol: "៛",
  name: "Cambodian Riel",
  decimals: 0,
  locale: "km-KH",
};

const columns: TableColumn<Cpo>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(resolveComponent('UCheckbox'), {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      h(resolveComponent('UCheckbox'), {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          row.toggleSelected(!!value),
        'aria-label': 'Select row'
      }),
    enableSorting: false,
    enableHiding: false
  },
  { accessorKey: "supplier.code", header: "Supplier Code" },
  { accessorKey: "supplier.name", header: "Supplier Name" },
  { accessorKey: "code", header: "CPO Code" },
  { accessorKey: "name", header: "CPO Name" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "address", header: "Address" },
];

const cpoSettlementColumns:TableColumn<Cpo>[] = [
  { accessorKey: "supplier.code", header: "CPO Code" },
  { accessorKey: "supplier.name", header: "CPO Name" },
  { accessorKey: "code", header: "Amount" },
  { accessorKey: "name", header: "Currency" },
  { accessorKey: "phone", header: "Settle To Bank" },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h(
        resolveComponent('UButton'),
        {
          size: 'xs',
          color: 'primary',
          onClick: () => handleViewCpo(row.original)
        },
        { default: () => 'View' }
      ),
    enableSorting: false,
    enableHiding: false
  }
];


const expanded = ref({ 1: true });

const stepper = useTemplateRef("stepper");
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

// Add this method in your <script setup>
function handleViewCpo(cpo: Cpo) {
  // Replace with your logic, e.g., open a modal or navigate
  alert(`View CPO: ${cpo.name} (${cpo.code})`);
}

onMounted(() => {
  // Fetch suppliers when the component is mounted
  fetchSuppliers();
  // Set default currency
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
      supplier_ids: selectedSuppliers.value.map(
        (supplier) => supplier.value.id
      ),
    };

    cpoList.value = await supplierApi.getListCPOApi(request);
  } catch (error) {
    console.error("Failed to fetch CPOs:", error);
  } finally {
    // Optionally handle loading state or errors
  }
};

// Add this method after fetchCpos function
const handleSupplierMenuChanged = async () => {
  // The selectedSuppliers is already updated by v-model
  cpoList.value = await supplierApi.getListCPOApi({
    supplier_ids: selectedSuppliers.value.map(supplier => supplier.id),
  });
};

definePageMeta({
  auth: false,
});
</script>

<template>
  <div
    class="w-full h-full bg-white rounded-lg p-6 shadow-lg dark:bg-gray-800 dark:text-gray-200 flex flex-col"
  >
    <UStepper ref="stepper" disabled :items="items" class="flex-1">
      <template #content="{ item }">
        <div class="flex flex-col h-full justify-between">
          <UCard
            variant="subtle"
            class="flex-1"
            v-if="item.title === t('settlement.generate.steps.supplier.title')"
          >
            <template #header>
              <!-- Header -->
              <div class="flex flex-row gap-4 justify-start">
                <div class="w-1/2">
                  <h1 class="text-sm mb-2 font-semibold">
                    Select Suppliers for Settlement
                  </h1>
                  <USelectMenu
                    v-model="selectedSuppliers"
                    :items="
                      supplierKeys.map((supplier) => ({
                        label: supplier.name,
                        value: supplier,
                      }))
                    "
                    icon="i-lucide-user"
                    label="Select Suppliers"
                    placeholder="Choose suppliers..."
                    multiple
                    required
                    class="w-full"
                    @change="handleSupplierMenuChanged"
                  >
                    <template #leading="{ modelValue, ui }">
                      <!-- Display icon and count of selected suppliers -->
                      <UIcon name="i-lucide-users" class="mr-2 text-gray-500" />
                    </template>
                  </USelectMenu>
                </div>
                <!-- Select Cut of Date -->
                <div class="w-50">
                  <h1 class="text-sm mb-2 font-semibold">
                    Select Cut of Date
                  </h1>
                  <UPopover class="w-full">
                    <UButton
                      color="neutral"
                      variant="subtle"
                      icon="i-lucide-calendar"
                    >
                      {{
                        modelValue
                          ? df.format(modelValue.toDate(getLocalTimeZone()))
                          : "Select a date"
                      }}
                    </UButton>
                    <template #content>
                      <UCalendar v-model="modelValue" class="p-2" />
                    </template>
                  </UPopover>
                </div>
                <!-- Select Currency -->
                 <div class="w-50">
                  <h1 class="text-sm mb-2 font-semibold">
                    Select Currency
                  </h1>
                  <USelectMenu
                    v-model="selectedCurrency"
                    :items="useCurrency().getAllCurrencies.value.map((currency) => ({
                      label: currency.name,
                      value: currency.code,
                    }))"
                    icon="i-lucide-dollar-sign"
                    label="Select Currency"
                    placeholder="Choose a currency..."
                    class="w-full"
                  />
                 </div>
              </div>
            </template>
            <h1 class="text-sm font-semibold mb-2">
              Selected Suppliers ({{ selectedSuppliers.length }})
            </h1>
            <UTable ref="table" :data="cpoList" :columns="columns" sticky class="flex-1 overflow-auto" />
            <!-- <div class="overflow-auto max-h-96 rounded-lg border border-gray-200">
              
            </div> -->

            <!-- <template #footer>
            <Placeholder class="h-8" />
          </template> -->
          </UCard>

          <!-- Reconciliation -->
<!-- Reconciliation -->
          <UCard
            variant="subtle"
            class="flex-1"
            v-if="item.title === t('settlement.generate.steps.reconciliation.title')"
          >
            <template>
              <!-- Header -->
              <div
                class="flex flex-row gap-4 justify-start"
                v-if="
                  item.title === t('settlement.generate.steps.supplier.title')
                "
              >
                <USelectMenu
                  v-model="selectedSuppliers"
                  :items="
                    supplierKeys.map((supplier) => ({
                      label: supplier.name,
                      value: supplier,
                    }))
                  "
                  icon="i-lucide-user"
                  label="Select Suppliers"
                  placeholder="Choose suppliers..."
                  multiple
                  class="w-1/2"
                >
                  <template #leading="{ modelValue, ui }">
                    <!-- Display icon and count of selected suppliers -->
                    <UIcon name="i-lucide-users" class="mr-2 text-gray-500" />
                  </template>
                </USelectMenu>
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="subtle"
                    icon="i-lucide-calendar"
                  >
                    {{
                      modelValue
                        ? df.format(modelValue.toDate(getLocalTimeZone()))
                        : "Select a date"
                    }}
                  </UButton>
                  <template #content>
                    <UCalendar v-model="modelValue" class="p-2" />
                  </template>
                </UPopover>
              </div>
            </template>
            <h1 class="text-sm font-semibold mb-5">
              List settlement CPOs
            </h1>
  
            <UTable ref="table" :data="cpoList" :columns="cpoSettlementColumns" sticky class="flex-1 overflow-auto" />
            </UCard>

          <!-- Navigation buttons moved to bottom -->
          <div class="mt-4 flex justify-between items-center">
            <UButton
              :disabled="!stepper?.hasPrev"
              @click="stepper?.prev()"
            >
              {{ t("settlement.generate.navigation.prev") }}
            </UButton>

            <UButton
              :disabled="!stepper?.hasNext || !canProceedToNext"
              @click="stepper?.next()"
            >
            Reconciliation Settlement
              <!-- {{ t("settlement.generate.navigation.next") }} -->
            </UButton>
          </div>
        </div>
      </template>
    </UStepper>
  </div>
</template>
