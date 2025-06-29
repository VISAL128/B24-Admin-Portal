<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'

const { t } = useI18n()

const items: StepperItem[] = [
  {
    title: t('settlement.generate.steps.supplier.title'),
    description: t('settlement.generate.steps.supplier.description'),
    icon: 'i-lucide-users'
  }, {
    title: t('settlement.generate.steps.reconciliation.title'),
    description: t('settlement.generate.steps.reconciliation.description'),
    icon: 'i-lucide-check-square'
  }, {
    title: t('settlement.generate.steps.confirmation.title'),
    description: t('settlement.generate.steps.confirmation.description'),
    icon: 'i-lucide-check-circle'
  }
]

const suppliers = ref(["Supplier A", "Supplier B", "Supplier C"])
const { data: suppliersData } = await useAsyncData('suppliers', () => $fetch('/api/suppliers', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
}))

const stepper = useTemplateRef('stepper')
</script>

<template>
  <div class="w-full h-full bg-white rounded-lg p-6 shadow-lg dark:bg-gray-800 dark:text-gray-200 flex flex-col">
    <UStepper ref="stepper" :items="items">
      <template #content="{ item }">
        <Placeholder class="aspect-video">
          {{ item.title }}
        </Placeholder>
      </template>
    </UStepper>

    <!-- Make this div as the main content area, set it height to the remaining space -->
    <div class="mt-6 flex-1">
      <USelectMenu
        :items="suppliers || []"
        class="w-full"
        multiple
      />
    </div>
    
    <!-- Navigation buttons moved to bottom -->
    <div class="mt-4 flex justify-between items-center">
      <UButton
        leading-icon="i-lucide-arrow-left"
        :disabled="!stepper?.hasPrev"
        @click="stepper?.prev()"
      >
        {{ t('settlement.generate.navigation.prev') }}
      </UButton>

      <UButton
        trailing-icon="i-lucide-arrow-right"
        :disabled="!stepper?.hasNext"
        @click="stepper?.next()"
      >
        {{ t('settlement.generate.navigation.next') }}
      </UButton>
    </div>
  </div>
</template>