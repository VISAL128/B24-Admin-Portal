<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const colorMode = useColorMode()
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
    <div :class="isNavExpanded ? 'px-6 pt-4' : 'flex justify-center mt-4 max-h-10'" v-bind="attrs">
      <img
        :src="
          isNavExpanded
            ? colorMode.value === 'dark'
              ? '/images/payment-logo-dark.png'
              : '/images/payment-logo.png'
            : '/images/Bill24 logo.png'
        "
        alt="Bill24 Logo"
        :class="isNavExpanded ? 'w-full h-auto scale-80' : 'w-10 h-10 scale-80'"
        class="cursor-pointer"
        @click="navigateTo('/')"
      />
    </div>
  </ClientOnly>
</template>
