<!--
  ClipboardBadge Component
  
  A badge component that displays text with copy-to-clipboard functionality.
  Perfect for displaying Payment IDs, account numbers, or any copyable content.
  
  Usage Examples:
  
  Basic usage:
  <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" />
  
  With custom label:
  <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" label="Payment ID" />
  
  With custom length limit:
  <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" :max-length="15" />
  
  Without copy icon:
  <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" :show-icon="false" />
  
  Custom tooltip text:
  <ClipboardBadge 
    text="pi_3RM3bFB4GYNtG73L0kYxJJG5" 
    tooltip-text="Click to copy payment ID"
    copied-tooltip-text="Payment ID copied!"
  />
-->

<template>
  <UTooltip :text="tooltipText" :delay-duration="200" :content="{ side: 'bottom', sideOffset: 8 }">
    <UBadge
      :label="displayText"
      color="neutral"
      variant="outline"
      size="md"
      :trailing-icon="trailingIcon"
      class="font-mono text-xs select-none cursor-pointer hover:bg-gray-50 hover:underline dark:hover:bg-gray-800 transition-colors duration-200"
      :aria-label="`Copy ${props.text} to clipboard`"
      role="button"
      tabindex="0"
      :ui="{ trailingIcon: 'text-gray-500 dark:text-gray-400 size-3.5' }"
      @click="handleCopy"
      @keydown.enter="handleCopy"
      @keydown.space.prevent="handleCopy"
    />
  </UTooltip>
</template>

<script setup lang="ts">
interface Props {
  /** The text to be copied to clipboard */
  text: string
  /** Optional label to display before the text */
  label?: string
  /** Maximum number of characters to display (will be truncated with ...) */
  maxLength?: number
  /** Custom tooltip text when not copied */
  tooltipText?: string
  /** Custom tooltip text when copied */
  copiedTooltipText?: string
  /** Whether to show the copy icon */
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  maxLength: 20,
  tooltipText: undefined,
  copiedTooltipText: undefined,
  showIcon: true,
})

const { t } = useI18n()
const { copy, isCopied } = useClipboard()
const { showSuccess, showError } = useNotification()

// Computed properties
const displayText = computed(() => {
  const prefix = props.label ? `${props.label} ` : ''
  if (!props.text) return '-'

  const text =
    props.text.length > props.maxLength
      ? `${props.text.substring(0, props.maxLength)}...`
      : props.text
  return `${prefix}${text}`
})

const trailingIcon = computed(() => {
  if (!props.showIcon) return undefined
  return isCopied.value ? 'material-symbols:check' : 'tabler:clipboard-text'
})

const tooltipText = computed(() => {
  if (isCopied.value) {
    return props.copiedTooltipText || t('copy_success')
  }
  return props.tooltipText || t('copy_to_clipboard')
})

// Methods
const handleCopy = async () => {
  const success = await copy(props.text)

  if (success) {
    showSuccess({
      title: t('copy_success'),
      description: `${displayText.value} ${t('copy_success_message')}`,
      duration: 2000,
    })
  } else {
    showError({
      title: t('copy_failed'),
      description: `${displayText.value} ${t('copy_failed_message')}`,
      duration: 3000,
    })
  }
}
</script>
