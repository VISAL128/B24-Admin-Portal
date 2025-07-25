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
      class="w-36"
      :ui="{ leading: 'ps-4' }"
    >
      <template #leading="{ modelValue }">
        <div v-if="modelValue" class="size-2 rounded" :class="getStatusColor(modelValue)" />
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
import { computed } from 'vue'

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
    case 'warning':
      return 'bg-warning text-black'
    case 'active':
      return 'bg-active text-white'
    case 'inactive':
      return 'bg-gray-500 text-white'
    case 'canceled':
    case 'cancelled':
    case 'expired':
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
  set: (value) => emit('update:modelValue', value),
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
    default:
      return status
  }
}

// Remove a specific status from selection (only for multiple mode)
const removeStatus = (statusToRemove: string) => {
  if (!props.multiple) return

  if (Array.isArray(props.modelValue)) {
    const currentStatuses = props.modelValue
    const newSelection = currentStatuses.filter((item) => item.value !== statusToRemove)
    emit('update:modelValue', newSelection)
  }
}

// Clear all selections
const clearAll = () => {
  if (props.multiple) {
    emit('update:modelValue', [])
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
