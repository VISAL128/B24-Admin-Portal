<template>
  <div class="grid gap-3 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
    <div
      v-for="card in cards"
      :key="card.title"
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2"
    >
      <!-- Title and Filter Label -->
      <div class="flex justify-between items-start">
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ card.title }}</h3>
        <span class="text-xs font-medium text-primary whitespace-nowrap">
          {{ card.filterLabel }}
        </span>
      </div>

      <!-- Values -->
      <div class="flex flex-wrap justify-between gap-x-4">
        <div
          v-for="(val, idx) in card.values"
          :key="idx"
          class="text-md font-bold text-gray-900 dark:text-white flex items-baseline gap-1"
        >
          <span v-if="'currency' in val" class="text-xs font-medium">
            {{ val.currency }}
          </span>
          {{ useCurrency().formatAmount(val.value) }}
        </div>
      </div>

      <!-- Date Range -->
      <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-1">
        <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-primary" />
        <span class="whitespace-nowrap">{{ card.dateRange }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrency } from '~/composables/utils/useCurrency'

export interface SummaryCardValue {
  value: number
  currency?: string
}

export interface SummaryCard {
  title: string
  values: SummaryCardValue[]
  filterLabel: string
  dateRange: string
}

interface Props {
  cards: SummaryCard[]
}

defineProps<Props>()
</script>
