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
          {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }} -
          {{ df.format(modelValue.end.toDate(getLocalTimeZone())) }}
        </template>
        <template v-else>
          {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }}
        </template>
      </template>
      <template v-else>
        {{ t('pick_a_date') }}
      </template>
    </UButton>
    <template #content>
      <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
        <div class="hidden sm:flex flex-col py-4">
          <UButton
            v-for="(range, index) in ranges"
            :key="index"
            :label="range.label"
            color="neutral"
            variant="ghost"
            class="rounded-none px-6"
            :class="[
              isRangeSelected(range.duration)
                ? 'bg-primary/15 dark:bg-primary/15 hover:bg-primary/10 dark:hover:bg-primary/10'
                : 'hover:bg-primary/10 dark:hover:bg-primary/10',
            ]"
            truncate
            @click="selectRange(range.duration)"
          />
        </div>
        <UCalendar v-model="modelValue" class="p-2" :number-of-months="2" range />
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, isSameDay } from '@internationalized/date'
import { sub } from 'date-fns'
import type { Duration } from 'date-fns'

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
  }
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

const open = ref(false)
const df = new DateFormatter('en-US', { dateStyle: 'medium' })

// Create a computed property for v-model support
const modelValue = computed({
  get: () => props.modelValue,
  set: (value: DateRange) => emit('update:modelValue', value)
})

const ranges = [
  { label: t('wallet_page.date_ranges.today'), duration: { days: 1 } },
  { label: t('wallet_page.date_ranges.yesterday'), duration: { days: 2 } },
  { label: t('wallet_page.date_ranges.last_7_days'), duration: { days: 7 } },
  { label: t('wallet_page.date_ranges.last_14_days'), duration: { days: 14 } },
  { label: t('wallet_page.date_ranges.last_30_days'), duration: { days: 30 } },
  { label: t('wallet_page.date_ranges.last_3_months'), duration: { months: 3 } },
  { label: t('wallet_page.date_ranges.last_6_months'), duration: { months: 6 } },
  { label: t('wallet_page.date_ranges.last_year'), duration: { years: 1 } },
]

function isRangeSelected(duration: Duration) {
  const startDate = sub(new Date(), duration)
  const endDate = new Date()

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
    props.modelValue?.start && props.modelValue?.end &&
    isSameDay(props.modelValue.start, startCalendarDate) &&
    isSameDay(props.modelValue.end, endCalendarDate)
  )
}

function selectRange(duration: Duration) {
  const startDate = sub(new Date(), duration)
  const endDate = new Date()

  const newValue = {
    start: new CalendarDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()),
    end: new CalendarDate(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()),
  }
  
  emit('update:modelValue', newValue)
}

// Watch for changes in modelValue and close popover when both start and end dates are selected
watch(() => props.modelValue, (newValue) => {
  if (newValue?.start && newValue?.end) {
    // Use nextTick to ensure the UI updates before closing
    nextTick(() => {
      open.value = false
    })
  }
}, { deep: true })
</script>
