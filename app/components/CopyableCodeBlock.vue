<template>
  <div class="relative group">
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 relative">
      <!-- Copy Button Overlay -->
      <UButton
        variant="ghost"
        size="xs"
        :icon="copied ? 'material-symbols:check' : 'tabler:clipboard-text'"
        @click="copyContent"
        :class="[
          'absolute top-2 right-2 z-10 transition-all duration-200',
          'opacity-0 group-hover:opacity-100',
          'bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm',
          'border border-gray-200 dark:border-gray-600',
          'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100',
          'shadow-sm hover:shadow-md',
          copied ? 'opacity-100 text-green-600 dark:text-green-400' : '',
        ]"
        :title="copied ? 'Copied!' : 'Copy to clipboard'"
      />

      <!-- Code Content -->
      <div class="pr-8">
        <slot>
          <pre
            v-if="content"
            class="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap break-all"
            >{{ formattedContent }}</pre
          >
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'

interface Props {
  content?: any
  jsonFormat?: boolean
  successMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  jsonFormat: true,
  successMessage: 'Content copied to clipboard',
})

const { copy } = useClipboard()
const notification = useNotification()
const copied = ref(false)

const formattedContent = computed(() => {
  if (!props.content) return ''

  if (props.jsonFormat && typeof props.content === 'object') {
    return JSON.stringify(props.content, null, 2)
  }

  return typeof props.content === 'string' ? props.content : String(props.content)
})

const copyContent = async () => {
  try {
    await copy(formattedContent.value)
    copied.value = true

    notification.showSuccess({
      title: props.successMessage,
      description: 'Content has been copied to clipboard.',
    })

    // Reset copied state after 2 seconds
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    notification.showError({
      title: 'Copy Failed',
      description: 'Failed to copy content to clipboard',
    })
  }
}
</script>
