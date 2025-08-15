<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      PageHeader Component Examples
    </h1>
    
    <!-- Basic Usage -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Basic Usage</h2>
      <PageHeader 
        title="Basic Page Title"
        subtitle="This is a basic example with title and subtitle"
      />
    </div>

    <!-- With Status Button -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">With Status Toggle Button</h2>
      <PageHeader 
        title="Resource Management"
        subtitle="Active resource configuration"
        :show-status-button="true"
        :status-button-config="statusConfig"
        @status-toggle="handleStatusToggle"
      />
    </div>

    <!-- With Custom Actions -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">With Custom Actions</h2>
      <PageHeader 
        title="User Profile"
        subtitle="Manage user account and preferences"
        :actions="customActions"
      />
    </div>

    <!-- With Slots -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">With Custom Slots</h2>
      <PageHeader title="Dashboard Overview">
        <template #left>
          <UBadge color="success" variant="soft" size="sm">
            {{ t('status.active') }}
          </UBadge>
        </template>
        
        <template #right>
          <UButton 
            icon="i-lucide-refresh-cw" 
            variant="ghost" 
            size="sm"
            @click="refresh"
          >
            {{ t('wallet_page.refresh') }}
          </UButton>
        </template>
      </PageHeader>
    </div>

    <!-- Without Back Button -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Without Back Button</h2>
      <PageHeader 
        title="Welcome Page"
        subtitle="No back navigation needed"
        :show-back-button="false"
      />
    </div>

    <!-- Loading State -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">With Loading State</h2>
      <PageHeader 
        title="Processing Request"
        subtitle="Please wait while we process your request"
        :show-status-button="true"
        :status-button-config="loadingStatusConfig"
      />
    </div>

    <!-- Multiple Actions -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Multiple Action Buttons</h2>
      <PageHeader 
        title="Advanced Configuration"
        subtitle="Manage system settings and preferences"
        :actions="multipleActions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotification } from '~/composables/useNotification'
import PageHeader from '~/components/PageHeader.vue'
import type { StatusButtonConfig, PageHeaderAction } from '~/components/PageHeader.vue'

definePageMeta({
  auth: true,
  breadcrumbs: [
    { label: 'components', to: '/examples' },
    { label: 'PageHeader Examples', active: true },
  ],
})

const { t } = useI18n()
const notification = useNotification()

const isActive = ref(true)

// Status button configuration
const statusConfig = computed((): StatusButtonConfig => ({
  text: isActive.value ? 'Deactivate' : 'Activate',
  color: isActive.value ? 'error' : 'success',
  icon: isActive.value ? 'material-symbols:block' : 'material-symbols:play-circle-outline',
  loading: false,
}))

// Loading status configuration
const loadingStatusConfig = computed((): StatusButtonConfig => ({
  text: 'Processing...',
  color: 'warning',
  icon: 'i-lucide-loader',
  loading: true,
}))

// Custom actions
const customActions: PageHeaderAction[] = [
  {
    text: 'Edit',
    icon: 'i-lucide-edit',
    color: 'primary',
    onClick: () => {
      notification.showSuccess({
        title: 'Edit Action',
        description: 'Edit button clicked!',
      })
    },
  },
  {
    text: 'Settings',
    icon: 'i-lucide-settings',
    color: 'neutral',
    variant: 'outline',
    onClick: () => {
      notification.showInfo({
        title: 'Settings',
        description: 'Settings button clicked!',
      })
    },
  },
]

// Multiple actions
const multipleActions: PageHeaderAction[] = [
  {
    text: 'Save',
    icon: 'i-lucide-save',
    color: 'success',
    onClick: () => {
      notification.showSuccess({
        title: 'Saved',
        description: 'Configuration saved successfully!',
      })
    },
  },
  {
    text: 'Reset',
    icon: 'i-lucide-rotate-ccw',
    color: 'warning',
    variant: 'outline',
    onClick: () => {
      notification.showWarning({
        title: 'Reset',
        description: 'Configuration reset to defaults.',
      })
    },
  },
  {
    text: 'Export',
    icon: 'i-lucide-download',
    color: 'info',
    variant: 'soft',
    onClick: () => {
      notification.showInfo({
        title: 'Export',
        description: 'Configuration exported successfully!',
      })
    },
  },
  {
    text: 'Delete',
    icon: 'i-lucide-trash',
    color: 'error',
    variant: 'ghost',
    onClick: () => {
      notification.showError({
        title: 'Delete',
        description: 'This would delete the configuration.',
      })
    },
  },
]

const handleStatusToggle = () => {
  isActive.value = !isActive.value
  notification.showSuccess({
    title: 'Status Updated',
    description: `Resource is now ${isActive.value ? 'active' : 'inactive'}.`,
  })
}

const refresh = () => {
  notification.showSuccess({
    title: 'Refreshed',
    description: 'Data has been refreshed.',
  })
}
</script>
