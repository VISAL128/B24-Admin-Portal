<template>
  <div class="relative group">
    <div class="rounded-lg p-3 relative" style="background-color: #202d64;">
      <!-- Copy Button Overlay -->
      <UButton
        variant="ghost"
        size="xs"
        :icon="copied ? 'material-symbols:check' : 'tabler:clipboard-text'"
        @click="copyContent"
        :class="[
          'absolute top-2 right-2 z-10 transition-all duration-200',
          'opacity-0 group-hover:opacity-100',
          'bg-white/20 backdrop-blur-sm',
          'border border-white/30',
          'text-white/80 hover:text-white',
          'shadow-sm hover:shadow-md',
          copied ? 'opacity-100 text-green-400' : '',
        ]"
        :title="copied ? 'Copied!' : 'Copy to clipboard'"
      />

      <!-- Code Content -->
      <div class="pr-8">
        <slot>
          <pre
            v-if="content"
            class="text-sm text-white font-mono whitespace-pre-wrap break-all"
            >{{ formattedContent }}</pre
          >
        </slot>
        
        <!-- Show More/Less Button -->
        <div v-if="shouldShowToggle" class="mt-2 pt-2 border-t border-white/20">
          <button
            @click="toggleExpanded"
            class="text-xs text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-1"
          >
            <span>{{ isExpanded ? 'Show Less' : 'Show More' }}</span>
            <UIcon 
              :name="isExpanded ? 'material-symbols:expand-less' : 'material-symbols:expand-more'" 
              class="w-3 h-3"
            />
          </button>
        </div>
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
  maxLength?: number
  showTruncated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  jsonFormat: true,
  successMessage: 'Content copied to clipboard',
  maxLength: 500,
  showTruncated: true,
})

const { copy } = useClipboard()
const notification = useNotification()
const copied = ref(false)
const isExpanded = ref(false)

const fullContent = computed(() => {
  if (!props.content) return ''

  if (props.jsonFormat && typeof props.content === 'object') {
    return JSON.stringify(props.content, null, 2)
  }

  return typeof props.content === 'string' ? props.content : String(props.content)
})

const formattedContent = computed(() => {
  const content = fullContent.value
  
  if (!props.showTruncated || isExpanded.value || content.length <= props.maxLength) {
    return content
  }
  
  return content.substring(0, props.maxLength) + '...'
})

const shouldShowToggle = computed(() => {
  return props.showTruncated && fullContent.value.length > props.maxLength
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const copyContent = async () => {
  try {
    // Always copy the full content, not the truncated version
    await copy(fullContent.value)
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
