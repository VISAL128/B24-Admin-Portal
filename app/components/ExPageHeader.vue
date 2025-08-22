<template>
  <div
    :class="rootClasses"
  >
    <div class="flex items-center justify-between gap-2 px-3 py-2">
      <!-- Left -->
      <div class="flex items-center gap-2 min-w-0">
        <!-- Back button: icon-only on small screens, icon+text on >=sm -->
        <UButton
          v-if="showBackButton"
          variant="soft"
          color="primary"
          size="sm"
          class="sm:inline-flex hidden"
          icon="i-lucide-arrow-left"
          :aria-label="backAriaLabel"
          @click="handleBack"
        >
       
        </UButton>

        <UButton
          v-if="showBackButton"
          variant="ghost"
          color="neutral"
          size="sm"
          class="sm:hidden inline-flex"
          icon="i-lucide-arrow-left"
          :aria-label="backAriaLabel"
          square
          @click="handleBack"
        />

        <!-- Optional breadcrumb slot -->
        <div
          v-if="$slots.breadcrumbs"
          :class="[
            props.showBreadcrumbsOnMobile ? 'flex' : 'hidden sm:flex',
            'items-center text-xs text-gray-500 dark:text-gray-400'
          ]"
        >
          <slot name="breadcrumbs" />
        </div>

        <!-- Divider between back/breadcrumbs and title -->
        <span
          v-if="(title || subtitle) && (showBackButton || $slots.breadcrumbs) && !hideDivider"
          :class="['hidden sm:block w-px h-6', dividerColorClasses]"
        />

        <!-- Title -->
        <div v-if="title || subtitle" class="min-w-0">
          <h1 v-if="title" class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ subtitle }}
          </p>
        </div>

        <!-- Custom left slot -->
        <slot name="left" />
      </div>

      <!-- Right -->
      <div class="flex items-center gap-2 shrink-0">
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

        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, type RouteLocationRaw } from 'vue-router'

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
  sticky?: boolean
  /** Where to go if history is empty */
  fallbackTo?: RouteLocationRaw
  /** Tailwind classes for divider color (bg-*) */
  dividerColor?: string
  /** Tailwind classes for border color (border-*) */
  borderColor?: string
  /** Hide the vertical divider between breadcrumbs/back and title */
  hideDivider?: boolean
  /** Show breadcrumb slot also on mobile (< sm). Defaults to false */
  showBreadcrumbsOnMobile?: boolean
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
  sticky: true,
  fallbackTo: '/',
  dividerColor: 'bg-gray-200 dark:bg-gray-800',
  borderColor: 'border-gray-200 dark:border-gray-800',
  hideDivider: false,
  showBreadcrumbsOnMobile: false
})

const emit = defineEmits<{
  back: []
  statusToggle: []
}>()

const { t } = useI18n()
const router = useRouter()
const backAriaLabel = computed(() => props.backButtonText || t('back'))

const handleBack = () => {
  if (props.customBackHandler) return props.customBackHandler()
  emit('back')
  if (window.history.length > 1) router.back()
  else router.push(props.fallbackTo)
}

const handleStatusToggle = () => emit('statusToggle')

// Keyboard shortcut: Alt/Option + Left Arrow
const onKey = (e: KeyboardEvent) => {
  if ((e.altKey || e.metaKey) && e.key === 'ArrowLeft') {
    e.preventDefault()
    handleBack()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// Computed classes
const dividerColorClasses = computed(() => props.dividerColor)
const rootClasses = computed(() => [
  'w-full',
  props.sticky ? 'sticky top-0 z-30' : '',
  'backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-gray-900/70',
  'bg-white/95 dark:bg-gray-900/95 border-b',
  props.borderColor
])

// expose for template
const sticky = props.sticky
const hideDivider = computed(() => props.hideDivider)
</script>
