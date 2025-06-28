<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const route = useRoute()

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Dashboard',
      icon: 'i-material-symbols-light-space-dashboard-rounded',
      size: 'lg',
      to:'/',
      active: false,
    },
      // settlements with child items wallet settlements
    {
      label: 'Settlements',
      icon: 'i-material-symbols-light-lab-profile-rounded',
      size: 'lg',
      active: true,
      open: true,
      children: [
        {
          label: 'Wallet Settlements',
          icon: 'i-material-symbols-light-lab-profile-rounded',
          size: 'lg',
          to: '/settlement/wallet-settlement',
          active: true,
        },
      ],

    },
    {
      label: 'Settings',
      icon: 'i-material-symbols-light-settings-rounded',
      size: 'lg',
      to: '/settings',
      active: false,
    },
  ]
])

watch(() => route.path, (newPath, oldPath) => {
  activateCurrentRoute();
});

// Initialize active state based on current route
function activateCurrentRoute() {
  items.value.forEach(group => {
    console.log(group);
  });
}
</script>

<template>
  <UNavigationMenu highlight popover :collapsed="false" orientation="vertical" :items="items" class="w-full" size="lg" :ui="{
    linkLeadingIcon: 'shrink-0 size-6',
    linkLabel: 'text-md truncate',
    link: 'p-2 cursor-pointer'
  }"/>
</template>
