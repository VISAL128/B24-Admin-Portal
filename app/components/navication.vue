<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  isCollapsed?: boolean
}>()

const items = computed(() => [
  // {
  //   label: 'Home',
  //   icon: 'i-heroicons-home',
  //   children: [
  //     {
  //       label: 'Dashboard',
  //       to: '/',
  //       icon: 'i-heroicons-chart-bar-square',
  //     },
  //     {
  //       label: 'Transactions',
  //       to: '/transactions',
  //       icon: 'i-heroicons-banknotes',
  //     },
  //   ],
  // },
  {
    label: t('suppliers'),
    icon: 'i-heroicons-building-storefront',
    to: '/suppliers',
  },
  {
    label: t('banks_list'),
    icon: 'i-heroicons-building-library',
    to: '/banks',
  },
])

// Get version from runtime config
const { $config } = useNuxtApp()
const appVersion = ref($config.public.appVersion || 'v1.0.0')
</script>

<template>
  <div class="flex h-full flex-col">
    <CustomNav :items="items" :is-collapsed="props.isCollapsed" />

    <!-- Version Footer -->
    <div v-if="!props.isCollapsed" class="mt-auto p-4">
      <p class="text-xs font-semibold text-gray-400 dark:text-gray-400">
        {{ t('splash.version') }}
        <span>
          {{ appVersion }}
        </span>
      </p>
    </div>
  </div>
</template>
