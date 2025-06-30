<script setup lang="ts">
import type { StepperItem, AvatarProps } from "@nuxt/ui";
// import type { Supplier } from "~/models/supplier";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import { useSupplierApi } from "~/composables/api/useSupplierApi";
import type { Supplier } from "~/models/settlement";

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

const { data: suppliers, status } = await useFetch(
  "https://67a575efc0ac39787a1e5b0d.mockapi.io/v1/api/customer",
  {
    key: "typicode-users",
    transform: (data: Supplier[]) => {
      return data?.map((supplier) => ({
        label: supplier.name,
        value: String(supplier.id),
        // avatar: { src: supplier.avatar, alt: supplier.name },
      }));
    },
    lazy: true,
  }
);

const selectedSuppliers = ref([]);

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
</script>
<template>
  <div
    class="w-full h-full bg-white rounded-lg p-6 shadow-lg dark:bg-gray-800 dark:text-gray-200 flex flex-col"
  >
    <UStepper ref="stepper" disabled :items="items">
      <template #content="{ item }">
        <UDivider class="mb-4" />
        <!-- Selection -->
         <div class="flex-1 flex flex-row gap-4 justify-start" v-if="item.title === t('settlement.generate.steps.supplier.title')">
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
            <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
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
