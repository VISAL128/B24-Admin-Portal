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
      @click="handleCopy"
      :class="[
        'inline-flex items-center justify-center w-4 h-4 rounded transition-colors',
        copied
          ? 'text-green-600 dark:text-green-400'
          : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
      ]"
      :title="copied ? 'Copied!' : 'Copy to clipboard'"
    >
      <UIcon
        :name="copied ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'"
        class="w-3 h-3"
      />
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

const handleCopy = async () => {
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
  } catch (error) {
    if (props.showNotification) {
      notification.showError({
        title: 'Error',
        description: 'Failed to copy to clipboard',
      })
    }
  }
}
</script>
