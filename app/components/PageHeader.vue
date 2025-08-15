<template>
  <div class="flex items-center justify-between px-2 py-2 bg-white dark:bg-gray-900 rounded shadow">
    <!-- Left Section -->
    <div class="flex items-center gap-2">
      <UButton
        v-if="showBackButton"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
        @click="handleBack"
      >
        {{ backButtonText || t('back') }}
      </UButton>
      
      <!-- Title section -->
      <div v-if="title || subtitle" class="ml-2">
        <h1 v-if="title" class="text-md font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400">
          {{ subtitle }}
        </p>
      </div>
      
      <!-- Custom left slot -->
      <slot name="left" />
    </div>

    <!-- Right Section -->
    <div class="flex items-center gap-2">
      <!-- Status toggle button -->
      <UButton
        v-if="showStatusButton && statusButtonConfig"
        :color="statusButtonConfig.color"
        variant="soft"
        :icon="statusButtonConfig.icon"
        size="sm"
        :loading="statusButtonConfig.loading"
        @click="handleStatusToggle"
      >
        {{ statusButtonConfig.text }}
      </UButton>
      
      <!-- Custom action buttons -->
      <UButton
        v-for="(action, index) in actions"
        :key="`action-${index}`"
        :color="action.color || 'primary'"
        :variant="action.variant || 'solid'"
        :icon="action.icon"
        :size="action.size || 'sm'"
        :loading="action.loading"
        :disabled="action.disabled"
        @click="action.onClick"
      >
        {{ action.text }}
      </UButton>
      
      <!-- Custom right slot -->
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

export interface PageHeaderAction {
  text: string
  onClick: () => void
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'link'
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
}

export interface StatusButtonConfig {
  text: string
  color: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  icon: string
  loading?: boolean
}

interface Props {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backButtonText?: string
  customBackHandler?: () => void
  showStatusButton?: boolean
  statusButtonConfig?: StatusButtonConfig
  actions?: PageHeaderAction[]
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  showBackButton: true,
  backButtonText: undefined,
  customBackHandler: undefined,
  showStatusButton: false,
  statusButtonConfig: undefined,
  actions: () => [],
})

const emit = defineEmits<{
  back: []
  statusToggle: []
}>()

const { t } = useI18n()
const router = useRouter()

const handleBack = () => {
  if (props.customBackHandler) {
    props.customBackHandler()
  } else {
    emit('back')
    router.back()
  }
}

const handleStatusToggle = () => {
  emit('statusToggle')
}
</script>
