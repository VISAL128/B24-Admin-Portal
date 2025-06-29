<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'

const items: StepperItem[] = [
  {
    title: 'Supplier',
    description: 'Select suppliers for settlement',
    icon: 'i-lucide-users'
  }, {
    title: 'Reconciliation',
    description: 'Reconcile transactions',
    icon: 'i-lucide-check-square'
  }, {
    title: 'Confirmation',
    description: 'Confirm settlement',
    icon: 'i-lucide-check-circle'
  }
]

const stepper = useTemplateRef('stepper')
</script>

<template>
  <div class="w-full h-full bg-white rounded-lg p-6 shadow-lg dark:bg-gray-800 dark:text-gray-200">
    <UStepper ref="stepper" :items="items">
      <template #content="{ item }">
        <Placeholder class="aspect-video">
          {{ item.title }}
        </Placeholder>
      </template>
    </UStepper>

    <div class="flex gap-2 justify-between mt-4">
      <UButton
        leading-icon="i-lucide-arrow-left"
        :disabled="!stepper?.hasPrev"
        @click="stepper?.prev()"
      >
        Prev
      </UButton>

      <UButton
        trailing-icon="i-lucide-arrow-right"
        :disabled="!stepper?.hasNext"
        @click="stepper?.next()"
      >
        Next
      </UButton>
    </div>
  </div>
</template>