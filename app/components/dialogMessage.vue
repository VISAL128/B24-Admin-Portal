<template>
  <UModal v-model="isModalOpen" :dismissible="false">
    <UCard :ui="{ }">
      <template #header>
        <div class="flex items-center gap-3">
          <!-- Icon -->
          <div v-if="showIcon" class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full" :class="iconBackgroundClass">
            <UIcon :name="iconName" class="h-5 w-5" :class="iconClass" />
          </div>
          
          <!-- Title -->
          <h3 v-if="title" class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {{ title }}
          </h3>
        </div>
      </template>

      <!-- Content -->
       
      <div class="px-4 py-5 sm:p-6">
        <div v-if="message" class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
          {{ message }}
        </div>
        <slot v-else />
      </div>

      <!-- Actions -->
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            v-if="showCancel && cancelText"
            color="error"
            variant="outline"
            @click="handleCancel"
          >
            {{ cancelText }}
          </UButton>
          <UButton
            v-if="confirmText"
            :color="confirmButtonColor"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
  title?: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  confirmText?: string
  cancelText?: string
  showIcon?: boolean
  showCancel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'confirm',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showIcon: true,
  showCancel: true
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

// Computed for modal state
const isModalOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// Computed properties for styling
const iconName = computed(() => {
  const icons = {
    success: 'i-heroicons-check-circle',
    error: 'i-heroicons-x-circle',
    warning: 'i-heroicons-exclamation-triangle',
    info: 'i-heroicons-information-circle',
    confirm: 'i-heroicons-question-mark-circle'
  }
  return icons[props.type]
})

const iconBackgroundClass = computed(() => {
  const classes = {
    success: 'bg-green-100 dark:bg-green-900/20',
    error: 'bg-red-100 dark:bg-red-900/20',
    warning: 'bg-yellow-100 dark:bg-yellow-900/20',
    info: 'bg-blue-100 dark:bg-blue-900/20',
    confirm: 'bg-blue-100 dark:bg-blue-900/20'
  }
  return classes[props.type]
})

const iconClass = computed(() => {
  const classes = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    confirm: 'text-blue-600 dark:text-blue-400'
  }
  return classes[props.type]
})

const confirmButtonColor = computed((): "success" | "error" | "warning" | "info" | "primary" | "secondary" | "neutral" => {
  const colors = {
    success: 'success' as const,
    error: 'error' as const,
    warning: 'warning' as const,
    info: 'info' as const,
    confirm: 'primary' as const
  }
  return colors[props.type]
})

// Event handlers
const handleConfirm = () => {
  emit('confirm')
  emit('update:open', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:open', false)
}
</script>

