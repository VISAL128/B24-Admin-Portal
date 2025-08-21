<template>
  <UModal
    v-model="isOpen"
    :title="title"
    :ui="appConfig.ui.modal.slots"
    :transition="true"
    :fullscreen="false"
  >
    <!-- Slot for custom content -->
    <div v-if="$slots.default">
      <slot />
    </div>
    <template #close="{ close }">
      <UTooltip :text="t('close')" :kbds="['esc']" :delay-duration="200">
        <UButton variant="ghost" class="w-8 h-8 px-1.5 rounded-2xl" color="neutral">
          <UIcon
            name="material-symbols:close"
            size="50"
            class="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="close"
          />
        </UButton>
      </UTooltip>
    </template>
    <template #body>
      <div class="flex flex-col items-center h-32 text-center">
        <!-- Icon with circle background using Bill24 colors -->
        <div
          class="size-14 rounded-full flex items-center justify-center mb-4 bg-primary/10"
        >
          <UIcon
            name="material-symbols:question-mark"
            size="24"
            class="text-3xl opacity-80"
            style="color: #43b3de"
          />
        </div>

        <!-- Question text -->
        <h4 v-if="message" class="text-md font-semibold mb-1">
          {{ message }}
        </h4>

        <!-- Additional info section -->
        <div
          v-if="additionalInfo || $slots.additionalInfo"
          class="text-sm text-gray-600 dark:text-gray-400"
        >
          <slot name="additionalInfo">
            {{ additionalInfo }}
          </slot>
        </div>
      </div>
    </template>
    <template #footer="{ close }">
      <div class="flex justify-end gap-3">
        <UButton
          v-if="showCancelButton"
          :variant="cancelButtonVariant"
          :color="cancelButtonColor"
          :disabled="loading"
          size="sm"
          class="min-w-16 justify-center"
          @click="
            () => {
              close()
              handleCancel()
            }
          "
        >
          {{ cancelButtonText }}
        </UButton>

        <UButton
          :variant="confirmButtonVariant"
          :color="confirmButtonColor"
          :loading="loading"
          :disabled="disabled"
          size="sm"
          @click="handleConfirm"
        >
          {{ confirmButtonText }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import appConfig from '~~/app.config'

type ButtonVariant = 'solid' | 'outline' | 'link' | 'soft' | 'subtle' | 'ghost'
type ButtonColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  title?: string
  message?: string
  additionalInfo?: string
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonColor?: ButtonColor
  cancelButtonColor?: ButtonColor
  confirmButtonVariant?: ButtonVariant
  cancelButtonVariant?: ButtonVariant
  showCancelButton?: boolean
  loading?: boolean
  disabled?: boolean
  destructive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  message: undefined,
  additionalInfo: undefined,
  confirmButtonText: undefined,
  cancelButtonText: undefined,
  confirmButtonColor: undefined,
  cancelButtonColor: undefined,
  confirmButtonVariant: 'solid',
  cancelButtonVariant: 'outline',
  showCancelButton: true,
  loading: false,
  disabled: false,
  destructive: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm' | 'cancel'): void
}>()

// Computed for v-model
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Computed properties for button styling
const confirmButtonText = computed(() => {
  if (props.confirmButtonText) return props.confirmButtonText
  if (props.destructive) return t('delete')
  return t('confirm')
})

const cancelButtonText = computed(() => {
  return props.cancelButtonText || t('cancel')
})

const confirmButtonColor = computed((): ButtonColor => {
  if (props.confirmButtonColor) return props.confirmButtonColor
  if (props.destructive) return 'error'
  return 'primary'
})

const cancelButtonColor = computed((): ButtonColor => {
  return props.cancelButtonColor || 'neutral'
})

const title = computed(() => {
  if (props.title) return props.title
  if (props.destructive) return t('confirm_button.title')
  return t('confirmation')
})

// Event handlers
const handleConfirm = () => {
  emit('confirm')
  if (!props.loading) {
    emit('update:modelValue', false)
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
