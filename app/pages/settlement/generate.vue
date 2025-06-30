<script setup lang="ts">
import type { StepperItem, TableColumn } from "@nuxt/ui";
import type { Cpo, Supplier, CpoBySupplierRequest } from "~/models/settlement";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import { useSupplierApi } from "~/composables/api/useSupplierApi";
import type { Supplier } from "~/models/settlement";

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

const suppliers = ref<Supplier[]>([]);
const selectedSuppliers = ref<Supplier[]>([]);
const cpoList = ref<Cpo[]>([]);
const columns: TableColumn<Cpo>[] = [
  {
    id: "expand",
    cell: ({ row }) =>
      h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        "aria-label": "Expand",
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("date")).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const color = {
        paid: "success" as const,
        failed: "error" as const,
        refunded: "neutral" as const,
      }[row.getValue("status") as string];

      return h(UBadge, { class: "capitalize", variant: "subtle", color }, () =>
        row.getValue("status")
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: () => h("div", { class: "text-right" }, "Amount"),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"));

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
      }).format(amount);

      return h("div", { class: "text-right font-medium" }, formatted);
    },
  },
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

onMounted(() => {
  // Fetch suppliers when the component is mounted
  fetchSuppliers();
});

const fetchSuppliers = async () => {
  try {
    suppliers.value = await supplierApi.getSuppliers();
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
  }
};

// Function to fetch CPOs based on selected suppliers
const fetchCpos = async () => {
  if (selectedSuppliers.value.length === 0) return
  try {
    const request: CpoBySupplierRequest = {
      supplier_ids: selectedSuppliers.value.map((supplier) => supplier.id)
    }
    
    cpoList.value = await supplierApi.getCPOsBySuppliers(request);
  } catch (error) {
    console.error('Failed to fetch CPOs:', error)
  } finally {
    // Optionally handle loading state or errors
  }
}

definePageMeta({
  auth: false,
});
</script>

<template>
  <div
    class="w-full h-full bg-white rounded-lg p-6 shadow-lg dark:bg-gray-800 dark:text-gray-200 flex flex-col"
  >
    <UStepper ref="stepper" disabled :items="items">
      <template #content="{ item }">
        <!-- Selection -->
        <UCard variant="subtle">
          <template
            #header
            v-if="item.title === t('settlement.generate.steps.supplier.title')"
          >
            <h1 class="text-sm mb-5 font-semibold">
              Select Suppliers for Settlement
            </h1>
            <div
              class="flex flex-row gap-4 justify-start"
              v-if="
                item.title === t('settlement.generate.steps.supplier.title')
              "
            >
              <USelectMenu
                v-model="selectedSuppliers"
                :items="suppliers"
                :loading="status === 'pending'"
                icon="i-lucide-user"
                label="Select Suppliers"
                placeholder="Choose suppliers..."
                multiple
                class="w-1/2"
              >
                <template #leading="{ modelValue, ui }">
                  <!-- <UAvatar
              v-if="modelValue"
              v-bind="modelValue.avatar"
              :size="(ui.leadingAvatarSize() as AvatarProps['size'])"
              :class="ui.leadingAvatar()"
            /> -->
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
            Selected Suppliers ({{ selectedSuppliers.length }})
          </h1>
          <UButton v-on:click="fetchCpos" color="primary" class="mb-4">
            Fetch CPOs
          </UButton>
          <UTable
            v-model:expanded="expanded"
            :data="cpoList"
            :columns="columns"
            :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
            class="flex-1"
          >
            <template #expanded="{ row }">
              <pre>{{ row.original }}</pre>
            </template>
          </UTable>

          <!-- <template #footer>
            <Placeholder class="h-8" />
          </template> -->
        </UCard>

        <!-- Reconciliation -->

        <!-- Navigation buttons moved to bottom -->
        <div class="mt-4 flex justify-between items-center">
          <UButton
            leading-icon="i-lucide-arrow-left"
            :disabled="!stepper?.hasPrev"
            @click="stepper?.prev()"
          >
            {{ t("settlement.generate.navigation.prev") }}
          </UButton>

          <UButton
            trailing-icon="i-lucide-arrow-right"
            :disabled="!stepper?.hasNext || !canProceedToNext"
            @click="stepper?.next()"
          >
            {{ t("settlement.generate.navigation.next") }}
          </UButton>
        </div>
      </template>
    </UStepper>
  </div>
</template>
