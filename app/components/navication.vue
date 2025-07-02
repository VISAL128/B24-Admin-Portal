<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const { t } = useI18n()

const route = useRoute()
let itemsCal = computed( ()=>{
  return [];
})
const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: t("dashboard"),
      icon: 'i-material-symbols-light-space-dashboard-rounded',
      size: 'lg',
      to: '/',
      active: false,
    },
    {
      label: t("settlements"),
      icon: 'i-material-symbols-light-lab-profile-rounded',
      size: 'lg',
      active: false,
      open: false,
      children: [
        {
          label: t("wallet_settlements"),
          icon: 'i-material-symbols-light-lab-profile-rounded',
          size: 'lg',
          to: '/settlement/wallet-settlement',
          active: false,
        },
      ],
    },
    {
      label: t("settings"),
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

onMounted(() => {
  activateCurrentRoute();
});

// Initialize active state based on current route
function activateCurrentRoute() {
  const currentPath = route.path;
  
  items.value.forEach(group => {
    group.forEach(item => {
      // Reset active state for all items
      item.active = false;
      
      // Check if current item matches the route
      if (item.to === currentPath) {
        item.active = true;
      }
      
      // Handle children items
      if (item.children) {
        let hasActiveChild = false;
        item.children.forEach(child => {
          child.active = false;
          if (child.to === currentPath) {
            child.active = true;
            hasActiveChild = true;
          }
        });
        
        // If a child is active, keep the parent open and active
        if (hasActiveChild) {
          item.active = true;
          item.open = true;
        }
      }
    });
  });
}

// Get version from runtime config
const { $config } = useNuxtApp()
const appVersion = ref($config.public.appVersion || 'v1.0.0')
</script>

<template>
  <div class="flex flex-col h-full">
    <UNavigationMenu highlight popover :collapsed="props.collapsed" orientation="vertical" :items="items" class="w-full flex-1" size="lg" :ui="{
      linkLeadingIcon: 'shrink-0 size-6',
      linkLabel: 'text-md truncate',
      link: 'p-2 cursor-pointer',
      transition: 'ease-in-out duration-800',
    }"/>
    
    <div v-if="!props.collapsed" class="mt-auto p-2 border-t border-gray-200 dark:border-gray-700">
      <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
        {{ appVersion }}
      </p>
    </div>
  </div>
</template>
