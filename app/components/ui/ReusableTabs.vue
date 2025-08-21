<template>
  <div>
    <!-- Tab Navigation -->
    <div class="flex gap-2 mb-3">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        class="relative flex flex-col items-center"
        @click="selectTab(tab.value)"
      >
        <!-- Tab Wrapper -->
        <div
          class="flex items-center cursor-pointer transition-all duration-200 ease-in-out rounded-t-xl"
          :class="[
            sizeClasses.wrapper,
            modelValue === tab.value
              ? activeTabClasses
              : inactiveTabClasses
          ]"
        >
          <UIcon 
            :name="tab.icon" 
            :class="[
              sizeClasses.icon,
              modelValue === tab.value ? 'mr-2' : 'mr-2'
            ]" 
          />
          <span 
            :class="[
              sizeClasses.text,
              'font-medium'
            ]"
          >
            {{ tab.label }}
          </span>
        </div>

        <!-- Underline -->
        <div
          v-if="modelValue === tab.value"
          class="h-[2px] rounded-full w-[65%]"
          :class="underlineClasses"
        ></div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="relative">
      <slot :activeTab="modelValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Tab {
  label: string
  value: string
  icon: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
  activeColor?: string
  backgroundColor?: string
  size?: 'sm' | 'md' | 'lg'
  customActiveClass?: string
  customInactiveClass?: string
  customUnderlineClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeColor: 'primary',
  backgroundColor: 'primary/5',
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectTab = (value: string) => {
  emit('update:modelValue', value)
}

// Computed classes based on props
const activeTabClasses = computed(() => {
  if (props.customActiveClass) {
    return props.customActiveClass
  }
  
  // Default active tab styling
  return 'bg-primary/5 text-primary'
})

const inactiveTabClasses = computed(() => {
  if (props.customInactiveClass) {
    return props.customInactiveClass
  }
  
  // Default inactive tab styling
//   return 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50'
return ' hover:bg-primary/5 text-primary'
})

const underlineClasses = computed(() => {
  if (props.customUnderlineClass) {
    return props.customUnderlineClass
  }
  
  // Default underline styling
  return 'bg-primary'
})

// Size-based classes
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return {
        wrapper: 'gap-1 px-2 py-1',
        icon: 'w-3 h-3',
        text: 'text-xs'
      }
    case 'lg':
      return {
        wrapper: 'gap-3 px-6 py-3',
        icon: 'w-5 h-5',
        text: 'text-base'
      }
    default: // md
      return {
        wrapper: 'gap-2 px-4 py-2',
        icon: 'w-4 h-4',
        text: 'text-sm'
      }
  }
})
</script>
