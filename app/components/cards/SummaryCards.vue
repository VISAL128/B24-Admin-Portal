<template>
  <div class="grid gap-3 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
    <!-- Loading State - Shimmer Cards -->
    <div
      v-if="isLoading"
      v-for="n in skeletonCount"
      :key="`skeleton-${n}`"
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2 animate-pulse"
    >
      <!-- Title and Filter Label Skeleton -->
      <div class="flex justify-between items-start">
        <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>

      <!-- Values Skeleton -->
      <div class="flex flex-wrap justify-between gap-x-4">
        <!-- Single value skeleton -->
        <div v-if="n <= 2" class="flex items-baseline gap-1">
          <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
        <!-- Multiple values skeleton (for currency cards) -->
        <div v-else class="flex flex-wrap gap-x-4">
          <div class="flex items-baseline gap-1">
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
            <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
          <div class="flex items-baseline gap-1">
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
            <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        </div>
      </div>

      <!-- Date Range Skeleton -->
      <div class="flex items-center space-x-1">
        <div class="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
      </div>
    </div>

    <!-- Actual Data Cards -->
    <div
      v-else
      v-for="card in cards"
      :key="card.title"
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2"
    >
      <!-- Title and Filter Label -->
      <div class="flex justify-between items-start">
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ card.title }}</h3>
        <!-- <span class="text-xs font-medium text-primary whitespace-nowrap">
          {{ card.filterLabel }}
        </span> -->
      </div>

      <!-- Values -->
      <div class="flex flex-wrap justify-between gap-x-4">
        <!-- Display "-" when no values -->
        <div
          v-if="!card.values || card.values.length === 0"
          class="text-md font-bold text-gray-900 dark:text-white"
        >
          -
        </div>
        <!-- Display actual values -->
        <div
          v-else
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
        <UIcon v-if="card.dateRange" name="i-heroicons-calendar-days" class="w-4 h-4 text-primary" />
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
  key?: string
  title: string
  values: SummaryCardValue[]
  filterLabel: string
  dateRange: string
}

interface Props {
  cards: SummaryCard[]
  isLoading?: boolean
  skeletonCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  skeletonCount: 4
})
</script>
