<template>
  <UInput
    :id="`ex-search-${Math.random().toString(36).substring(2, 15)}`"
    v-model="searchValue"
    :name="`ex-search-${Math.random().toString(36).substring(2, 15)}`"
    :placeholder="placeholder"
    :icon="icon"
    :ui="appConfig.ui.input.slots"
    :class="inputClass"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    @input="onInput"
    @keyup.enter="onEnter"
    @focus="onFocus"
    @blur="onBlur"
  >
    <template v-if="searchValue && showClearButton" #trailing>
      <UButton
        v-if="searchValue && showClearButton"
        :icon="clearIcon"
        variant="link"
        :size="size"
        class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-0"
        :ui="appConfig.ui.button.slots"
        @click="clearSearch"
      />
    </template>

    <template v-if="searchTooltip" #leading>
      <UTooltip :text="searchTooltip" :delay-duration="300">
        <UIcon :size="size" name="material-symbols:search-rounded" class="text-gray-400" />
      </UTooltip>
    </template>

  </UInput>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import appConfig from '~~/app.config'

interface Props {
  modelValue?: string
  placeholder?: string
  icon?: string
  clearIcon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  inputClass?: string
  disabled?: boolean
  loading?: boolean
  showClearButton?: boolean
  debounceMs?: number
  searchTooltip?: string
}

interface Emits {
  (e: 'update:modelValue' | 'input' | 'enter', value: string): void
  (e: 'focus' | 'blur', event: FocusEvent): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: undefined,
  icon: 'material-symbols:search-rounded',
  clearIcon: 'material-symbols:close',
  size: 'sm',
  inputClass: 'w-64',
  disabled: false,
  loading: false,
  showClearButton: true,
  debounceMs: 0,
  searchTooltip: undefined
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

// Computed placeholder with fallback to translation
const placeholder = computed(() => {
  return props.placeholder || t('search')
})

// Local reactive value for the search input
const searchValue = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value)
  },
})

// Debounce timer ref
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Handle input with optional debouncing
const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value

  if (props.debounceMs > 0) {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      emit('input', value)
    }, props.debounceMs)
  } else {
    emit('input', value)
  }
}

// Handle enter key press
const onEnter = () => {
  emit('enter', searchValue.value)
}

// Handle focus event
const onFocus = (event: FocusEvent) => {
  emit('focus', event)
}

// Handle blur event
const onBlur = (event: FocusEvent) => {
  emit('blur', event)
}

// Clear search function
const clearSearch = () => {
  searchValue.value = ''
  emit('clear')
}

// Watch for modelValue changes to clear debounce timer
watch(
  () => props.modelValue,
  () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }
)

// Cleanup on unmount
onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>
