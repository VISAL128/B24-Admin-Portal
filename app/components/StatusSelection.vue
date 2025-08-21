<template>
  <div class="space-y-2">
    <USelectMenu
      v-model="selectedStatuses"
      :items="statusOptions"
      :placeholder="placeholder"
      :multiple="props.multiple"
      :search-input="props.searchable"
      :search-attributes="['label']"
      value-attribute="value"
      option-attribute="label"
      size="sm"
      trailing-icon=""
      class="min-w-36 w-full max-w-96"
    >
      <!-- Custom display for multiple selection only -->
      <template v-if="props.multiple" #default="{ open }">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-1 flex-1 min-w-0">
            <!-- Show status badges for specific statuses -->
            <template v-if="hasSpecificStatusesSelected && specificSelectedStatuses.length > 1">
              <StatusBadgeV2
                v-for="status in specificSelectedStatuses.slice(0, 3)"
                :key="status.value"
                :status="status.value"
                :variant="badgeVariant"
                size="sm"
                :use-translation="useTranslation"
                class="shrink-0"
              />
              <!-- Show count if more than 3 selected with tooltip -->
              <UTooltip
                v-if="specificSelectedStatuses.length > 3"
                :text="getOverflowTooltipText()"
                :popper="{ placement: 'bottom' }"
              >
                <span class="text-xs text-gray-500 font-medium shrink-0">
                  +{{ specificSelectedStatuses.length - 3 }}
                </span>
              </UTooltip>
            </template>
            <!-- Show "All status", single specific status, or placeholder -->
            <template v-else>
              <div v-if="hasAllStatusSelected" class="flex items-center gap-2">
                <div class="size-2 rounded bg-gray-700 dark:bg-gray-200" />
                <span class="text-xs">{{ t('status.all') }}</span>
              </div>
              <div
                v-else-if="
                  hasSpecificStatusesSelected &&
                  specificSelectedStatuses.length === 1 &&
                  specificSelectedStatuses[0]
                "
                class="flex items-center gap-2"
              >
                <div class="size-2 rounded" :class="getStatusColor(specificSelectedStatuses[0])" />
                <span class="text-xs">{{ specificSelectedStatuses[0].label }}</span>
              </div>
              <span v-else class="text-xs text-gray-500">{{ placeholder }}</span>
            </template>
          </div>
          <UIcon
            name="i-heroicons-chevron-down-20-solid"
            class="size-4 text-gray-400 transition-transform duration-200 shrink-0"
            :class="{ 'rotate-180': open }"
          />
        </div>
      </template>

      <template #item-leading="{ item }">
        <div v-if="item" class="size-2 rounded" :class="getStatusColor(item)" />
      </template>
    </USelectMenu>

    <!-- Selected Status Pills with remove option (Optional Display - only for multiple) -->
    <div
      v-if="props.multiple && showSelectedPills && selectedStatusesArray.length > 0"
      class="flex flex-wrap gap-2"
    >
      <div
        v-for="status in selectedStatusesArray"
        :key="status"
        class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1"
      >
        <StatusBadgeV2
          :status="status"
          :variant="badgeVariant"
          size="xs"
          :use-translation="useTranslation"
        />
        <UButton
          icon="i-heroicons-x-mark-20-solid"
          size="xs"
          color="neutral"
          variant="ghost"
          class="rounded-full"
          @click="removeStatus(status)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: { label: string; value: string } | { label: string; value: string }[]
  placeholder?: string
  availableStatuses?: string[]
  badgeVariant?: 'solid' | 'outline' | 'soft' | 'subtle'
  badgeSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  useTranslation?: boolean
  showSelectedPills?: boolean
  includeAllStatuses?: boolean
  multiple?: boolean
  searchable?: boolean
}

// Default status options based on StatusBadgeV2 component
const defaultStatuses = [
  'all',
  'success',
  'completed',
  'failed',
  'error',
  'pending',
  'active',
  'inactive',
  'warning',
  'canceled',
  'cancelled',
  'expired',
  'reversed',
  'processing',
  'in-progress',
]

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ label: '', value: '' }),
  placeholder: '',
  availableStatuses: () => [],
  badgeVariant: 'subtle',
  badgeSize: 'sm',
  size: 'sm',
  useTranslation: true,
  showSelectedPills: false,
  includeAllStatuses: true,
  multiple: true,
  searchable: true,
})

const emit = defineEmits<{
  'update:modelValue': [
    value: { label: string; value: string } | { label: string; value: string }[],
  ]
}>()

const { t } = useI18n()

// Computed placeholder
const placeholder = computed(() => {
  return props.placeholder || t('status.header')
})

const statusOptions = computed(() => {
  const statuses = props.includeAllStatuses
    ? [...new Set([...defaultStatuses, ...props.availableStatuses])]
    : props.availableStatuses.length > 0
      ? props.availableStatuses
      : defaultStatuses

  const optionStatuses = statuses
    .map((status) => ({
      value: status === 'all' ? '' : status.toLowerCase(),
      label: props.useTranslation ? getTranslatedStatus(status) : status,
    }))
    .sort((a, b) => {
      // Sort 'all' first if it exists
      if (a.value === '' && b.value !== '') return -1
      if (b.value === '' && a.value !== '') return 1
      // Otherwise sort alphabetically
      return a.label.localeCompare(b.label)
    })

  return optionStatuses
})

const getStatusColor = (
  status: { label: string; value: string } | { label: string; value: string }[]
): string => {
  const statusValue = Array.isArray(status)
    ? status[0]?.value.toLowerCase()
    : status.value.toLowerCase()

  switch (statusValue) {
    case 'success':
    case 'completed':
      return 'bg-success text-white'
    case 'failed':
    case 'error':
      return 'bg-error text-white'
    case 'pending':
    case 'expired':
    case 'warning':
      return 'bg-warning text-black'
    case 'active':
      return 'bg-active text-white'
    case 'inactive':
      return 'bg-gray-500 text-white'
    case 'canceled':
    case 'cancelled':
      return 'bg-gray-300 text-black'
    case 'reversed':
      return 'bg-orange-500 text-white'
    case 'processing':
    case 'in-progress':
      return 'bg-secondary text-white'
    default:
      return 'bg-gray-700 dark:bg-gray-200 text-black'
  }
}

// Selected statuses with reactive binding
const selectedStatuses = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!props.multiple) {
      emit('update:modelValue', value)
      return
    }

    // Handle multiple selection logic
    if (Array.isArray(value)) {
      const newSelection = [...value]

      // Prevent unselecting when only 1 item is currently selected
      const currentSelection = Array.isArray(props.modelValue) ? props.modelValue : []
      if (currentSelection.length === 1 && newSelection.length === 0) {
        // Don't allow deselecting the last item - keep current selection
        return
      }

      const hasAllStatus = newSelection.some((item) => item.value === '')
      const hasSpecificStatuses = newSelection.some((item) => item.value !== '')

      // If both "All" and specific statuses are selected
      if (hasAllStatus && hasSpecificStatuses) {
        // Find the last selected item to determine which action to take
        const currentValues = Array.isArray(props.modelValue)
          ? props.modelValue.map((item) => item.value)
          : []
        const newValues = newSelection.map((item) => item.value)

        // Find what was added
        const addedValue = newValues.find((val) => !currentValues.includes(val))

        if (addedValue === '') {
          // "All" was just selected, clear specific statuses
          const allOption = newSelection.find((item) => item.value === '')
          emit('update:modelValue', allOption ? [allOption] : [])
        } else {
          // A specific status was selected, remove "All"
          const filteredSelection = newSelection.filter((item) => item.value !== '')
          emit('update:modelValue', filteredSelection)
        }
      } else {
        // Normal case - no conflict
        emit('update:modelValue', value)
      }
    } else {
      emit('update:modelValue', value)
    }
  },
})

// Helper computed to always get an array for template rendering
const selectedStatusesArray = computed(() => {
  if (!props.multiple) {
    if (
      props.modelValue &&
      typeof props.modelValue === 'object' &&
      !Array.isArray(props.modelValue)
    ) {
      return [props.modelValue.value]
    }
    return []
  }

  if (Array.isArray(props.modelValue)) {
    return props.modelValue.map((item) => item.value)
  }

  return []
})

// Computed to check if specific statuses (non-"All") are selected
const hasSpecificStatusesSelected = computed(() => {
  if (!Array.isArray(props.modelValue)) return false
  return props.modelValue.some((item) => item.value !== '')
})

// Computed to check if "All" status is selected
const hasAllStatusSelected = computed(() => {
  if (!Array.isArray(props.modelValue)) {
    return props.modelValue?.value === ''
  }
  return props.modelValue.some((item) => item.value === '')
})

// Computed to get only specific statuses (excluding "All")
const specificSelectedStatuses = computed(() => {
  if (!Array.isArray(props.modelValue)) return []
  return props.modelValue.filter((item) => item.value !== '')
})

// Get translated status text
const getTranslatedStatus = (status: string): string => {
  const statusValue = status.toLowerCase()

  switch (statusValue) {
    case 'all':
      return t('status.all')
    case 'pending':
      return t('status.pending')
    case 'processing':
      return t('status.processing')
    case 'completed':
      return t('status.completed')
    case 'failed':
      return t('status.failed')
    case 'success':
      return t('status.success')
    case 'error':
      return t('status.error')
    case 'active':
      return t('status.active')
    case 'inactive':
      return t('status.inactive')
    case 'cancel':
      return t('status.cancel')
    case 'expire':
      return t('status.expire')
    case 'reversed':
      return t('status.reversed')
    default:
      return status
  }
}

// Get tooltip text for overflow statuses
const getOverflowTooltipText = (): string => {
  if (!Array.isArray(props.modelValue) || specificSelectedStatuses.value.length <= 3) {
    return ''
  }

  const overflowStatuses = specificSelectedStatuses.value.slice(3)
  return overflowStatuses.map((status) => getTranslatedStatus(status.value)).join(', ')
}

// Remove a specific status from selection (only for multiple mode)
const removeStatus = (statusToRemove: string) => {
  if (!props.multiple) return

  if (Array.isArray(props.modelValue)) {
    const currentStatuses = props.modelValue

    // Prevent removing if it's the last selected status
    if (currentStatuses.length === 1) {
      return
    }

    const newSelection = currentStatuses.filter((item) => item.value !== statusToRemove)

    // If no statuses are left after removal, optionally add "All" back
    if (newSelection.length === 0 && props.includeAllStatuses) {
      const allOption = statusOptions.value.find((option) => option.value === '')
      if (allOption) {
        emit('update:modelValue', [allOption])
        return
      }
    }

    emit('update:modelValue', newSelection)
  }
}

// Clear all selections (but maintain at least one for multiple mode)
const clearAll = () => {
  if (props.multiple) {
    // For multiple mode, set to "All" option to maintain at least one selection
    if (props.includeAllStatuses) {
      const allOption = statusOptions.value.find((option) => option.value === '')
      if (allOption) {
        emit('update:modelValue', [allOption])
        return
      }
    }
    // If no "All" option available, keep current selection (don't clear)
    return
  } else {
    emit('update:modelValue', { label: '', value: '' })
  }
}

// Select all available statuses (only for multiple mode)
const selectAll = () => {
  if (!props.multiple) return

  const allValues = statusOptions.value
  emit('update:modelValue', allValues)
}

// Expose methods for parent component
defineExpose({
  clearAll,
  selectAll,
  removeStatus,
})
</script>
