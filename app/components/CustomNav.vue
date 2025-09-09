<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  items: any[]
  isCollapsed?: boolean
}>()

const route = useRoute()
const openItems = ref<string[]>([])

function isItemActive(item: any): boolean {
  if (item.to && item.to === route.path) {
    return true
  }
  if (item.children) {
    return item.children.some(isItemActive)
  }
  return false
}

function toggleItem(label: string) {
  if (openItems.value.includes(label)) {
    openItems.value = openItems.value.filter((item) => item !== label)
  } else {
    openItems.value.push(label)
  }
}

onMounted(() => {
  // Initially open parent if a child is active
  props.items.forEach((item) => {
    if (item.children && item.children.some(isItemActive)) {
      openItems.value.push(item.label)
    }
  })
})
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Navigation -->
    <nav class="flex-1 space-y-1">
      <div v-for="item in items" :key="item.label" class="flex justify-center">
        <!-- Standard Link -->
        <NuxtLink
          v-if="!item.children"
          :to="item.to"
          class="group flex items-center rounded-md text-sm font-medium"
          :class="[
            isItemActive(item)
              ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
              : `text-gray-500 dark:text-gray-400 ${isCollapsed ? 'hover:bg-primary-100 dark:hover:bg-primary-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'} hover:text-gray-900 dark:hover:text-white`,
            isCollapsed ? 'p-2' : 'w-full gap-3 px-3 py-3',
          ]"
        >
          <UIcon :name="item.icon" class="h-5 w-5 flex-shrink-0" />
          <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
        </NuxtLink>

        <!-- Collapsible Menu -->
        <div v-else class="w-full">
          <button
            type="button"
            class="group flex items-center rounded-md text-left text-sm font-medium"
            :class="[
              isItemActive(item)
                ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                : `text-gray-500 dark:text-gray-400 ${isCollapsed ? 'hover:bg-primary-100 dark:hover:bg-primary-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'} hover:text-gray-900 dark:hover:text-white`,
              isCollapsed ? 'p-2' : 'w-full gap-3 px-3 py-3',
            ]"
            @click="toggleItem(item.label)"
          >
            <UIcon :name="item.icon" class="h-5 w-5 flex-shrink-0" />
            <span v-if="!isCollapsed" class="flex-1 truncate">{{ item.label }}</span>
            <UIcon
              v-if="!isCollapsed"
              name="i-heroicons-chevron-down"
              class="h-5 w-5 transform transition-transform duration-200"
              :class="{ 'rotate-180': openItems.includes(item.label) }"
            />
          </button>
          <div v-if="!isCollapsed && openItems.includes(item.label)" class="mt-1 space-y-1 pl-10">
            <NuxtLink
              v-for="child in item.children"
              :key="child.label"
              :to="child.to"
              class="group flex items-center gap-3 rounded-md py-2 pl-5 pr-3 text-sm font-medium"
              :class="
                isItemActive(child)
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              "
            >
              <UIcon :name="child.icon" class="h-5 w-5 flex-shrink-0" />
              <span class="truncate">{{ child.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>
