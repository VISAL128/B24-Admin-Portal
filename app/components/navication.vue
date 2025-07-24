<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// const { showInfo } = useNotification()

const { t } = useI18n()

const route = useRoute()

// Reactive state for active navigation items
const activeStates = ref({
  dashboard: false,
  transactions: false,
  digitalWallet: false,
  wallet: false,
  settlement: false,
  organization: false,
  banks: false,
  subBillers: false,
  users: false,
  reports: false,
  transactionSummary: false,
  transactionAllocation: false,
  settings: false,
  settingsGenerateDetails: false,
  settingsFeeConfig: false,
  settingsDeveloperTools: false,
})

const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: t('dashboard'),
      icon: 'i-material-symbols-space-dashboard-outline',
      size: 'lg',
      class: 'text-sm',
      to: '/',
      active: activeStates.value.dashboard,
    },
    {
      label: t('transactions'),
      icon: 'i-material-symbols-receipt-long',
      size: 'lg',
      to: '/transactions',
      active: activeStates.value.transactions,
    },
    {
      label: t('digital_wallet'),
      icon: 'i-material-symbols-account-balance-wallet-outline',
      size: 'lg',
      active: activeStates.value.digitalWallet,
      defaultOpen: true,
      children: [
        {
          label: t('wallet'),
          // icon: 'i-material-symbols-light-wallet',
          size: 'lg',
          to: '/digital-wallet/wallet',
          // onSelect: () => {
          //   showInfo({
          //     title: t('wallet_coming_soon'),
          //     description: t('wallet_coming_soon_message'),
          //   })
          // },
          active: activeStates.value.wallet,
        },
        {
          label: t('settlement_menu'),
          // icon: 'i-material-symbols-light-payments',
          size: 'lg',
          to: '/digital-wallet/settlement',
          active: activeStates.value.settlement,
        },
      ],
    },
    // {
    //   label: t('navigation.organization'),
    //   icon: 'i-material-symbols-light-home-work',
    //   size: 'lg',
    //   active: activeStates.value.organization,
    //   children: [
    //     {
    //       label: t('navigation.banks'),
    //       // icon: 'i-material-symbols-account-balance-rounded',
    //       size: 'lg',
    //       to: '/organization/banks',
    //       active: activeStates.value.banks,
    //     },
    //     {
    //       label: t('navigation.sub_billers'),
    //       // icon: 'i-material-symbols-light:article-person',
    //       size: 'lg',
    //       to: '/organization/sub-billers',
    //       active: activeStates.value.subBillers,
    //     },
    //     {
    //       label: t('navigation.users'),
    //       // icon: 'i-material-symbols-light-group',
    //       size: 'lg',
    //       to: '/organization/users',
    //       active: activeStates.value.users,
    //     },
    //   ],
    // },
    // {
    //   label: t('navigation.reports'),
    //   icon: 'i-material-symbols-light-bar-chart',
    //   size: 'lg',
    //   active: activeStates.value.reports,
    //   children: [
    //     {
    //       label: t('navigation.transaction_summary'),
    //       // icon: 'i-material-symbols-light-summarize',
    //       size: 'lg',
    //       to: '/reports/transaction-summary',
    //       active: activeStates.value.transactionSummary,
    //     },
    //     {
    //       label: t('navigation.transaction_allocate'),
    //       // icon: 'i-material-symbols-light-switch-access-shortcut',
    //       size: 'lg',
    //       to: '/reports/transaction-allocation',
    //       active: activeStates.value.transactionAllocation,
    //     },
    //   ],
    // },
    {
      label: t('settings.title'),
      icon: 'i-material-symbols-settings-outline',
      size: 'lg',
      active: activeStates.value.settings,
      children: [
        {
          label: t('settings.generate_details'),
          // icon: 'i-lucide-settings',
          size: 'lg',
          to: '/settings/generate-details',
          active: activeStates.value.settingsGenerateDetails,
        },
        // {
        //   label: t('settings.fee_config'),
        //   // icon: 'i-material-symbols-light-switch-access-shortcut',
        //   size: 'lg',
        //   to: '/settings/fee-config',
        //   active: activeStates.value.settingsFeeConfig,
        // },
        // {
        //   label: t('navbar.developer_tools'),
        //   // icon: 'i-material-symbols-light-code',
        //   size: 'lg',
        //   to: '/settings/developer-tool',
        //   active: activeStates.value.settingsDeveloperTools,
        // },
      ],
    },
  ],
])

watch(
  () => route.path,
  () => {
    activateCurrentRoute()
  }
)

onMounted(() => {
  activateCurrentRoute()
})

// Initialize active state based on current route
function activateCurrentRoute() {
  const currentPath = route.path

  // Reset all active states
  Object.keys(activeStates.value).forEach((key) => {
    activeStates.value[key as keyof typeof activeStates.value] = false
  })

  // Set active based on current path
  if (currentPath === '/') {
    activeStates.value.dashboard = true
  } else if (currentPath === '/transactions') {
    activeStates.value.transactions = true
  } else if (currentPath === '/settings') {
    activeStates.value.settings = true
  }
  // Digital Wallet routes
  else if (currentPath === '/digital-wallet/wallet') {
    activeStates.value.digitalWallet = true
    activeStates.value.wallet = true
  } else if (
    currentPath === '/digital-wallet/settlement' ||
    currentPath === '/digital-wallet/settlement/generate' ||
    currentPath.startsWith('/digital-wallet/settlement/details')
  ) {
    activeStates.value.digitalWallet = true
    activeStates.value.settlement = true
  } else if (currentPath.startsWith('/digital-wallet')) {
    activeStates.value.digitalWallet = true
  }
  // Organization routes
  else if (currentPath === '/organization/banks') {
    activeStates.value.organization = true
    activeStates.value.banks = true
  } else if (currentPath === '/organization/sub-billers') {
    activeStates.value.organization = true
    activeStates.value.subBillers = true
  } else if (currentPath === '/organization/users') {
    activeStates.value.organization = true
    activeStates.value.users = true
  } else if (currentPath.startsWith('/organization')) {
    activeStates.value.organization = true
  }
  // Reports routes
  else if (currentPath === '/reports/transaction-summary') {
    activeStates.value.reports = true
    activeStates.value.transactionSummary = true
  } else if (currentPath === '/reports/transaction-allocation') {
    activeStates.value.reports = true
    activeStates.value.transactionAllocation = true
  } else if (currentPath.startsWith('/reports')) {
    activeStates.value.reports = true
  } else if (currentPath === '/settings/generate-details') {
    activeStates.value.settings = true
    activeStates.value.settingsGenerateDetails = true
  } else if (currentPath.startsWith('/settings/fee-config')) {
    activeStates.value.settings = true
    activeStates.value.settingsFeeConfig = true
  } else if (currentPath === '/settings/developer-tool') {
    activeStates.value.settings = true
    activeStates.value.settingsDeveloperTools = true
  }
  // Legacy settlement routes (keeping for backwards compatibility)
  else if (currentPath.startsWith('/settlement')) {
    activeStates.value.digitalWallet = true
    activeStates.value.settlement = true
  } else if (currentPath === '/settings/fee-config') {
    activeStates.value.settings = true
    activeStates.value.settingsFeeConfig = true
  }
}

// Get version from runtime config
const { $config } = useNuxtApp()
const appVersion = ref($config.public.appVersion || 'v1.0.0')
const props = defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <div class="flex flex-col h-full">
    <UNavigationMenu
      highlight
      tooltip
      popover
      arrow
      :collapsed="props.collapsed"
      orientation="vertical"
      :items="items"
      class="w-full flex-1 transition-all duration-200"
      :ui="{
        linkLeadingIcon: 'shrink-0 size-4.5',
        linkLabel: 'text-sm font-medium truncate',
        link: 'p-2 cursor-pointer transition-colors duration-200',
        linkTrailingIcon: 'shrink-0 size-4',
      }"
    />

    <div v-if="!props.collapsed" class="mt-auto p-2">
      <p class="text-xs text-gray-400 dark:text-gray-400 font-semibold">
        {{ t('splash.version') }}
        <span>
          {{ appVersion }}
        </span>
      </p>
    </div>
  </div>
</template>
