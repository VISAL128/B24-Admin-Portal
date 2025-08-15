<template>
  <UPopover v-model:open="open">
    <UButton
      color="neutral"
      variant="subtle"
      size="sm"
      icon="material-symbols:calendar-month-outline-rounded"
      class="bg-gray hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700"
    >
      <template v-if="modelValue.start">
        <template v-if="modelValue.end">
          {{ formatDate(modelValue.start.toDate(getLocalTimeZone())) }} -
          {{ formatDate(modelValue.end.toDate(getLocalTimeZone())) }}
        </template>
        <template v-else>
          {{ formatDate(modelValue.start.toDate(getLocalTimeZone())) }}
        </template>
      </template>
      <template v-else>
        {{ t('pick_a_date') }}
      </template>
    </UButton>
    <template #content>
      <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
        <div class="hidden sm:flex flex-col py-4 max-h-96 overflow-hidden min-w-0 w-52">
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <UButton
              v-for="(range, index) in ranges"
              :key="index"
              :label="range.label"
              color="neutral"
              variant="ghost"
              class="rounded-none px-6 w-full justify-start mb-1"
              :class="[
                isRangeSelected(range.duration)
                  ? 'bg-primary/15 dark:bg-primary/15 hover:bg-primary/10 dark:hover:bg-primary/10'
                  : 'hover:bg-primary/10 dark:hover:bg-primary/10',
              ]"
              truncate
              @click="selectRange(range.duration)"
            >
              <template #default>
                <div class="flex flex-col items-start w-full">
                  <span class="font-medium">{{ range.label }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">{{
                    getDateRangePreview(range.duration)
                  }}</span>
                </div>
              </template>
            </UButton>
          </div>
        </div>
        <UCalendar v-model="modelValue" class="p-2" :number-of-months="2" range />
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { CalendarDate, getLocalTimeZone, isSameDay } from '@internationalized/date'
import { sub } from 'date-fns'
import type { Duration } from 'date-fns'
import { useFormat } from '~/composables/utils/useFormat'

interface DateRange {
  start: CalendarDate
  end: CalendarDate
}

interface Props {
  modelValue?: DateRange
}

interface Emits {
  (e: 'update:modelValue', value: DateRange): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {
    const today = new Date()
    return {
      start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
    }
  },
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { formatDate } = useFormat()

const open = ref(false)
// const df = new DateFormatter('en-US', { dateStyle: 'medium' })

// Create a computed property for v-model support
const modelValue = computed({
  get: () => props.modelValue,
  set: (value: DateRange) => emit('update:modelValue', value),
})

const ranges = computed(() => [
  {
    label: t('wallet_page.date_ranges.today'),
    duration: { days: 0 },
  },
  {
    label: t('wallet_page.date_ranges.yesterday'),
    duration: { days: 1 },
  },
  {
    label: t('wallet_page.date_ranges.this_week'),
    duration: { days: 0, isCurrentWeek: true },
  },
  {
    label: t('wallet_page.date_ranges.last_7_days'),
    duration: { days: 7 },
  },
  {
    label: t('wallet_page.date_ranges.this_month'),
    duration: { days: 0, isCurrentMonth: true },
  },
  {
    label: t('wallet_page.date_ranges.last_30_days'),
    duration: { days: 30 },
  },
  {
    label: t('wallet_page.date_ranges.this_quarter'),
    duration: { days: 0, isCurrentQuarter: true },
  },
  {
    label: t('wallet_page.date_ranges.last_quarter'),
    duration: { days: 0, isLastQuarter: true },
  },
  {
    label: t('wallet_page.date_ranges.this_year'),
    duration: { days: 0, isCurrentYear: true },
  },
  {
    label: t('wallet_page.date_ranges.last_year'),
    duration: { years: 1 },
  },
])

// Function to get date range preview
function getDateRangePreview(
  duration: Duration & {
    isCurrentWeek?: boolean
    isCurrentMonth?: boolean
    isCurrentQuarter?: boolean
    isCurrentYear?: boolean
    isLastQuarter?: boolean
  }
) {
  let startDate: Date
  let endDate: Date
  const now = new Date()

  if (duration.isCurrentWeek) {
    // Start of current week (Monday)
    const currentDay = now.getDay()
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1
    startDate = sub(now, { days: daysToMonday })
    startDate.setHours(0, 0, 0, 0)
    // End of current week (Sunday)
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isCurrentMonth) {
    // First day of current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    // Last day of current month
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isCurrentQuarter) {
    // First day of current quarter
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
    startDate = new Date(now.getFullYear(), quarterStartMonth, 1)
    // Last day of current quarter
    const quarterEndMonth = quarterStartMonth + 2
    endDate = new Date(now.getFullYear(), quarterEndMonth + 1, 0)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isCurrentYear) {
    // January 1 of current year
    startDate = new Date(now.getFullYear(), 0, 1)
    // December 31 of current year
    endDate = new Date(now.getFullYear(), 11, 31)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isLastQuarter) {
    // First day of last quarter
    const currentQuarterStart = Math.floor(now.getMonth() / 3) * 3
    const lastQuarterStart = currentQuarterStart - 3
    if (lastQuarterStart < 0) {
      startDate = new Date(now.getFullYear() - 1, 9, 1) // Q4 of previous year
      endDate = new Date(now.getFullYear() - 1, 11, 31) // End of Q4
    } else {
      startDate = new Date(now.getFullYear(), lastQuarterStart, 1)
      const lastQuarterEnd = lastQuarterStart + 2
      endDate = new Date(now.getFullYear(), lastQuarterEnd + 1, 0) // Last day of quarter
    }
  } else if (duration.years === 1) {
    // Complete last year (January 1 to December 31 of previous year)
    startDate = new Date(now.getFullYear() - 1, 0, 1)
    endDate = new Date(now.getFullYear() - 1, 11, 31)
    endDate.setHours(23, 59, 59, 999)
  } else {
    startDate = sub(now, duration)
    // For single day ranges (today, yesterday), end date should be same as start date
    endDate = duration.days === 0 || duration.days === 1 ? startDate : now
  }

  // Format the dates
  const startFormatted = formatDate(startDate)
  const endFormatted = formatDate(endDate)

  // Return formatted range
  if (startFormatted === endFormatted) {
    return startFormatted
  } else {
    return `${startFormatted} - ${endFormatted}`
  }
}

function isRangeSelected(
  duration: Duration & {
    isCurrentWeek?: boolean
    isCurrentMonth?: boolean
    isCurrentQuarter?: boolean
    isCurrentYear?: boolean
    isLastQuarter?: boolean
  }
) {
  let startDate: Date
  let endDate: Date
  const now = new Date()

  if (duration.isCurrentWeek) {
    // Start of current week (Monday)
    const currentDay = now.getDay()
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1
    startDate = sub(now, { days: daysToMonday })
    startDate.setHours(0, 0, 0, 0)
    // End of current week (Sunday)
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isCurrentMonth) {
    // First day of current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    // Last day of current month
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isCurrentQuarter) {
    // First day of current quarter
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
    startDate = new Date(now.getFullYear(), quarterStartMonth, 1)
    // Last day of current quarter
    const quarterEndMonth = quarterStartMonth + 2
    endDate = new Date(now.getFullYear(), quarterEndMonth + 1, 0)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isCurrentYear) {
    // January 1 of current year
    startDate = new Date(now.getFullYear(), 0, 1)
    // December 31 of current year
    endDate = new Date(now.getFullYear(), 11, 31)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isLastQuarter) {
    // First day of last quarter
    const currentQuarterStart = Math.floor(now.getMonth() / 3) * 3
    const lastQuarterStart = currentQuarterStart - 3
    if (lastQuarterStart < 0) {
      startDate = new Date(now.getFullYear() - 1, 9, 1) // Q4 of previous year
      endDate = new Date(now.getFullYear() - 1, 11, 31) // End of Q4
    } else {
      startDate = new Date(now.getFullYear(), lastQuarterStart, 1)
      const lastQuarterEnd = lastQuarterStart + 2
      endDate = new Date(now.getFullYear(), lastQuarterEnd + 1, 0) // Last day of quarter
    }
  } else if (duration.years === 1) {
    // Complete last year (January 1 to December 31 of previous year)
    startDate = new Date(now.getFullYear() - 1, 0, 1)
    endDate = new Date(now.getFullYear() - 1, 11, 31)
    endDate.setHours(23, 59, 59, 999)
  } else {
    startDate = sub(now, duration)
    // For single day ranges (today, yesterday), end date should be same as start date
    endDate = duration.days === 0 || duration.days === 1 ? startDate : now
  }

  const startCalendarDate = new CalendarDate(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    startDate.getDate()
  )
  const endCalendarDate = new CalendarDate(
    endDate.getFullYear(),
    endDate.getMonth() + 1,
    endDate.getDate()
  )

  return (
    props.modelValue?.start &&
    props.modelValue?.end &&
    isSameDay(props.modelValue.start, startCalendarDate) &&
    isSameDay(props.modelValue.end, endCalendarDate)
  )
}

function selectRange(
  duration: Duration & {
    isCurrentWeek?: boolean
    isCurrentMonth?: boolean
    isCurrentQuarter?: boolean
    isCurrentYear?: boolean
    isLastQuarter?: boolean
  }
) {
  let startDate: Date
  let endDate: Date
  const now = new Date()

  if (duration.isCurrentWeek) {
    // Start of current week (Monday)
    const currentDay = now.getDay()
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1
    startDate = sub(now, { days: daysToMonday })
    startDate.setHours(0, 0, 0, 0)
    // End of current week (Sunday)
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isCurrentMonth) {
    // First day of current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    // Last day of current month
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isCurrentQuarter) {
    // First day of current quarter
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
    startDate = new Date(now.getFullYear(), quarterStartMonth, 1)
    // Last day of current quarter
    const quarterEndMonth = quarterStartMonth + 2
    endDate = new Date(now.getFullYear(), quarterEndMonth + 1, 0)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isCurrentYear) {
    // January 1 of current year
    startDate = new Date(now.getFullYear(), 0, 1)
    // December 31 of current year
    endDate = new Date(now.getFullYear(), 11, 31)
    endDate.setHours(23, 59, 59, 999)
  } else if (duration.isLastQuarter) {
    // First day of last quarter
    const currentQuarterStart = Math.floor(now.getMonth() / 3) * 3
    const lastQuarterStart = currentQuarterStart - 3
    if (lastQuarterStart < 0) {
      startDate = new Date(now.getFullYear() - 1, 9, 1) // Q4 of previous year
      endDate = new Date(now.getFullYear() - 1, 11, 31) // End of Q4
    } else {
      startDate = new Date(now.getFullYear(), lastQuarterStart, 1)
      const lastQuarterEnd = lastQuarterStart + 2
      endDate = new Date(now.getFullYear(), lastQuarterEnd + 1, 0) // Last day of quarter
    }
  } else if (duration.years === 1) {
    // Complete last year (January 1 to December 31 of previous year)
    startDate = new Date(now.getFullYear() - 1, 0, 1)
    endDate = new Date(now.getFullYear() - 1, 11, 31)
    endDate.setHours(23, 59, 59, 999)
  } else {
    startDate = sub(now, duration)
    // For single day ranges (today, yesterday), end date should be same as start date
    endDate = duration.days === 0 || duration.days === 1 ? startDate : now
  }

  const newValue = {
    start: new CalendarDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()),
    end: new CalendarDate(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()),
  }

  emit('update:modelValue', newValue)
}

// Watch for changes in modelValue and close popover when both start and end dates are selected
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue?.start && newValue?.end) {
      // Use nextTick to ensure the UI updates before closing
      nextTick(() => {
        open.value = false
      })
    }
  },
  { deep: true }
)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.8);
}
</style>
