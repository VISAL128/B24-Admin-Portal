<template>
  <div class="relative">
    <USelectMenu
      v-bind="$attrs"
      :items="enhancedItems"
      @update:model-value="handleModelValue"
      @open="handleOpen"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';

interface Props {
  items: Array<{ label: string; value: string | number }>
  modelValue?: { label: string; value: string | number } | null
  columnId?: string
  hasMore?: boolean
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:model-value', value: any): void
  (e: 'load-more', columnId: string): void
}>()

const isOpen = ref(false)
const scrollObserver = ref<IntersectionObserver | null>(null)

const enhancedItems = computed(() => {
  const items = [...props.items]
  
  // Add load more trigger item
  if (props.hasMore && !props.isLoading) {
    items.push({
      label: `📄 Load More ${props.columnId === 'collectionBank' ? 'Collection' : 'Settlement'} Banks...`,
      value: '__LOAD_MORE__' as string | number,
    })
  }
  
  // Add loading indicator
  if (props.isLoading) {
    items.push({
      label: `⏳ Loading ${props.columnId === 'collectionBank' ? 'collection' : 'settlement'} banks...`,
      value: '__LOADING__' as string | number,
    })
  }
  
  return items
})

const handleModelValue = (value: any) => {
  // Handle special values
  if (value?.value === '__LOAD_MORE__') {
    if (props.columnId) {
      emit('load-more', props.columnId)
    }
    return // Don't emit the actual value change
  }
  
  if (value?.value === '__LOADING__') {
    return // Don't emit loading state changes
  }
  
  emit('update:model-value', value)
}

const handleOpen = () => {
  isOpen.value = true
  
  // Set up intersection observer for scroll detection
  nextTick(() => {
    setupScrollDetection()
  })
}

const handleClose = () => {
  isOpen.value = false
  cleanupScrollDetection()
}

const setupScrollDetection = () => {
  // Find the dropdown menu element
  const dropdownEl = document.querySelector('[role="listbox"]') as HTMLElement
  if (!dropdownEl) return
  
  // Create intersection observer for the last few items
  scrollObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement
          const isLoadMoreItem = target.textContent?.includes('Load More')
          
          if (isLoadMoreItem && props.hasMore && !props.isLoading) {
            console.log('📄 Load more item is visible, triggering load more')
            if (props.columnId) {
              emit('load-more', props.columnId)
            }
          }
        }
      })
    },
    { 
      root: dropdownEl,
      threshold: 0.5 
    }
  )
  
  // Observe the last item in the dropdown
  const items = dropdownEl.querySelectorAll('[role="option"]')
  if (items.length > 0) {
    const lastItem = items[items.length - 1]
    if (lastItem) {
      scrollObserver.value.observe(lastItem)
    }
  }
}

const cleanupScrollDetection = () => {
  if (scrollObserver.value) {
    scrollObserver.value.disconnect()
    scrollObserver.value = null
  }
}

// Cleanup on unmount
onBeforeUnmount(() => {
  cleanupScrollDetection()
})
</script>
