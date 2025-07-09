<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

interface Props {
  collapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
});

const { t } = useI18n();

const route = useRoute();

// Reactive state for active navigation items
const activeStates = ref({
  dashboard: false,
  settlements: false,
  settlementsOpen: false,
  walletSettlements: false,
  settings: false,
  transactions: false,
});

const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: t("dashboard"),
      icon: "i-material-symbols-light-space-dashboard-rounded",
      size: "lg",
      to: "/",
      active: activeStates.value.dashboard,
    },
    {
      label: t("transactions"),
      icon: 'i-material-symbols-sticky-note-2-rounded',
      size: 'lg',
      to: '/transactions',
      active: activeStates.value.transactions,    
    },
    {
      label: t("settlements"),
      icon: "i-material-symbols-light-lab-profile-rounded",
      size: "lg",
      active: activeStates.value.settlements,
      open: activeStates.value.settlementsOpen,
      children: [
        {
          label: t("wallet_settlements"),
          icon: "i-material-symbols-light-lab-profile-rounded",
          size: "lg",
          to: "/settlement/wallet-settlement",
          active: activeStates.value.walletSettlements,
        },
      ],
    },
    {
      label: t("settings.title"),
      icon: "i-material-symbols-light-settings-rounded",
      size: "lg",
      to: "/settings",
      active: activeStates.value.settings,
    },
  ],
]);

watch(
  () => route.path,
  (newPath, oldPath) => {
    activateCurrentRoute();
  }
);

onMounted(() => {
  activateCurrentRoute();
});

// Initialize active state based on current route
function activateCurrentRoute() {
  const currentPath = route.path;

  // Reset all active states
  activeStates.value.dashboard = false;
  activeStates.value.settlements = false;
  activeStates.value.settlementsOpen = false;
  activeStates.value.walletSettlements = false;
  activeStates.value.settings = false;
  activeStates.value.transactions = false;

  // Set active based on current path
  if (currentPath === "/") {
    activeStates.value.dashboard = true;
  } else if (currentPath === "/settings") {
    activeStates.value.settings = true;
  }
  else if (
    currentPath === '/transactions') {
    activeStates.value.transactions = true;
  }
  else if (currentPath.startsWith('/settlement/wallet-settlement/generate')) {
    activeStates.value.settlements = true;
    activeStates.value.settlementsOpen = true;
    activeStates.value.walletSettlements = true;
  }
  else if (currentPath.startsWith('/settlement/wallet-settlement')) {
    activeStates.value.settlements = true;
    activeStates.value.settlementsOpen = true;
    activeStates.value.walletSettlements = true;
  }
  else if (currentPath.startsWith("/settlement/wallet-settlement") ||
    currentPath.startsWith("/settlement/wallet-settlement/generate") ||
    currentPath.startsWith("/settlement/details")
  ) {
    activeStates.value.settlements = true;
    activeStates.value.settlementsOpen = true;
    activeStates.value.walletSettlements = true;
  } else if (currentPath.startsWith("/settlement")) {
    activeStates.value.settlements = true;
    activeStates.value.settlementsOpen = true;
  }
}

// Get version from runtime config
const { $config } = useNuxtApp();
const appVersion = ref($config.public.appVersion || "v1.0.0");
</script>

<template>
  <div class="flex flex-col h-full">
    <UNavigationMenu
      highlight
      popover
      :collapsed="props.collapsed"
      orientation="vertical"
      :items="items"
      class="w-full flex-1"
      :ui="{
        linkLeadingIcon: 'shrink-0 size-6',
        linkLabel: 'text-md truncate',
        link: 'p-2 cursor-pointer',
      }"
    />

    <div
      v-if="!props.collapsed"
      class="mt-auto p-2 border-t border-gray-200 dark:border-gray-700"
    >
      <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
        {{ appVersion }}
      </p>
    </div>
  </div>
</template>
