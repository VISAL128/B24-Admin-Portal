<template>
  <div class="inline-flex items-center gap-2">
    <span
      :class="[
        'cursor-pointer hover:underline transition-colors',
        textClass || 'text-sm text-primary dark:text-primary',
        fontClass || 'font-mono break-all',
      ]"
      @click="handleCopy"
    >
      {{ displayText }}
    </span>
    <button
      :class="[
        'inline-flex items-center justify-center w-4 h-4 rounded transition-colors focus:outline-none focus:ring-0',
        copied
          ? 'text-green-600 dark:text-green-400'
          : 'text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
      ]"
      :title="copied ? 'Copied!' : 'Copy to clipboard'"
      @click="handleCopy"
    >
      <UIcon :name="copied ? 'i-heroicons-check' : 'i-lucide-copy'" class="w-3 h-3" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'

interface Props {
  text: string
  displayText?: string
  textClass?: string
  fontClass?: string
  showNotification?: boolean
  notificationTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  displayText: undefined,
  textClass: '',
  fontClass: '',
  showNotification: true,
  notificationTitle: 'Copied!',
})

const { copy } = useClipboard()
const notification = useNotification()
const copied = ref(false)

const handleCopy = async (event?: Event) => {
  // Prevent event propagation to parent elements (like buttons)
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  try {
    await copy(props.text)
    copied.value = true

    if (props.showNotification) {
      notification.showSuccess({
        title: props.notificationTitle,
        description: `${props.text} has been copied to clipboard.`,
      })
    }

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    if (props.showNotification) {
      notification.showError({
        title: 'Error',
        description: 'Failed to copy to clipboard',
      })
    }
  }
}
</script>
