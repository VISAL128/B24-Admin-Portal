<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
const isNavExpanded = ref(true)
const props = defineProps<{
  isHeaderNavOpen?: boolean
  size?: string | number
}>()

// Watch for prop changes and update local state
watch(
  () => props.isHeaderNavOpen,
  (newVal) => {
    if (newVal !== undefined) {
      isNavExpanded.value = newVal
    }
  },
  { immediate: true }
)
</script>

<template>
  <ClientOnly>
    <div
      :class="
        isNavExpanded
          ? 'px-8 pt-4 flex items-center justify-center gap-2'
          : 'flex justify-center mt-4 max-h-10'
      "
      v-bind="attrs"
      class="cursor-pointer"
      @click="navigateTo('/')"
    >
      <img
        :src="isNavExpanded ? '/images/Bill24 logo.png' : '/images/Bill24 logo.png'"
        alt="Bill24 Logo"
        :class="isNavExpanded ? 'h-7' : 'w-10 h-10'"
      />
      <span
        v-if="isNavExpanded"
        class="text-xl font-bold whitespace-nowrap text-primary-color"
        >Internal Portal</span
      >
    </div>
  </ClientOnly>
</template>
