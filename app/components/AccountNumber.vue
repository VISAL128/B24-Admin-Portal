<!--
  AccountNumber Component
  
  A component for displaying account numbers with copy-to-clipboard functionality
  and the ability to hide/show the account number for privacy.
  
  Usage Examples:
  
  Basic usage:
  <AccountNumber account-number="1234567890123456" />
  
  With custom label:
  <AccountNumber account-number="1234567890123456" label="Account No" />
  
  Initially hidden:
  <AccountNumber account-number="1234567890123456" :initially-hidden="true" />
  
  Without copy functionality:
  <AccountNumber account-number="1234567890123456" :show-copy="false" />
  
  With custom visibility settings:
  <AccountNumber 
    account-number="1234567890123456" 
    :show-visibility-toggle="false"
    :initially-hidden="false"
  />
  
  Custom mask character:
  <AccountNumber account-number="1234567890123456" mask-char="*" />
-->

<template>
  <div class="inline-flex items-center gap-2">
    <UTooltip
      :text="tooltipText"
      :delay-duration="200"
      :content="{ side: 'bottom', sideOffset: 8 }"
    >
      <UButton
        :label="displayText"
        color="neutral"
        variant="link"
        size="md"
        class="font-mono text-dm select-none cursor-pointer hover:underline transition-colors duration-200"
        :aria-label="`Copy ${props.accountNumber} to clipboard`"
        :ui="{ base: 'p-0' }"
        @click="handleCopy"
        @keydown.enter="handleCopy"
        @keydown.space.prevent="handleCopy"
      />
    </UTooltip>

    <!-- Visibility Toggle Button -->
    <UButton
      v-if="showVisibilityToggle"
      :icon="visibilityIcon"
      variant="ghost"
      size="xs"
      color="neutral"
      class="p-1 h-6 w-6"
      :aria-label="isHidden ? t('show_account_number') : t('hide_account_number')"
      @click="toggleVisibility"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** The account number to display and copy */
  accountNumber: string
  /** Optional label to display before the account number */
  label?: string
  /** Whether to initially hide the account number */
  initiallyHidden?: boolean
  /** Whether to show the copy functionality */
  showCopy?: boolean
  /** Whether to show the visibility toggle button */
  showVisibilityToggle?: boolean
  /** Character to use for masking (default: •) */
  maskChar?: string
  /** Custom tooltip text when not copied */
  tooltipText?: string
  /** Custom tooltip text when copied */
  copiedTooltipText?: string
  /** Number of visible characters at the start when masked */
  visibleStart?: number
  /** Number of visible characters at the end when masked */
  visibleEnd?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  initiallyHidden: false,
  showCopy: true,
  showVisibilityToggle: true,
  maskChar: '•',
  tooltipText: undefined,
  copiedTooltipText: undefined,
  visibleStart: 4,
  visibleEnd: 4,
})

const { t } = useI18n()
const { copy, isCopied } = useClipboard()
const { showSuccess, showError } = useNotification()

// Reactive state
const isHidden = ref(props.initiallyHidden)

// Computed properties
const maskedAccountNumber = computed(() => {
  if (!isHidden.value || !props.accountNumber) return props.accountNumber

  const accountNum = props.accountNumber
  const totalLength = accountNum.length

  // If account number is too short, just mask it completely
  if (totalLength <= props.visibleStart + props.visibleEnd) {
    return props.maskChar.repeat(Math.min(totalLength, 12))
  }

  const start = accountNum.substring(0, props.visibleStart)
  const end = accountNum.substring(totalLength - props.visibleEnd)
  const maskLength = Math.max(4, totalLength - props.visibleStart - props.visibleEnd)
  const mask = props.maskChar.repeat(maskLength)

  return `${start}${mask}${end}`
})

const displayText = computed(() => {
  const prefix = props.label ? `${props.label} ` : ''
  if (!props.accountNumber) return '-'

  return `${prefix}${maskedAccountNumber.value}`
})

// const trailingIcon = computed(() => {
//   if (!props.showCopy) return undefined
//   return isCopied.value ? 'material-symbols:check' : 'tabler:clipboard-text'
// })

const visibilityIcon = computed(() => {
  return isHidden.value ? 'material-symbols:visibility' : 'material-symbols:visibility-off'
})

const tooltipText = computed(() => {
  if (!props.showCopy) return ''

  if (isCopied.value) {
    return props.copiedTooltipText || t('copy_success')
  }
  return props.tooltipText || t('copy_account_number')
})

// Methods
const toggleVisibility = () => {
  isHidden.value = !isHidden.value
}

const handleCopy = async () => {
  if (!props.showCopy) return

  // Always copy the original account number, even if it's currently hidden
  const success = await copy(props.accountNumber)

  if (success) {
    showSuccess({
      title: t('copy_success'),
      description: t('copy_success_message'),
      duration: 2000,
    })
  } else {
    showError({
      title: t('copy_failed'),
      description: t('copy_failed_message'),
      duration: 3000,
    })
  }
}

// Expose methods for parent components
defineExpose({
  toggleVisibility,
  isHidden: readonly(isHidden),
})
</script>
