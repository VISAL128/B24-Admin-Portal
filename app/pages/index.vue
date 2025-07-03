<template>
    <div class="space-y-6">
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h1 class="text-2xl font-bold text-[#211e1f] mb-4">Welcome <span class="font-italic">{{ user?.fullName || 'Guest' }}</span> to the Bill24 Admin Portal</h1>
            <p class="text-gray-600 mb-4">Use the navigation menu to explore different sections.</p>
            <p class="text-sm text-gray-500">Current version: {{ $config.public.appVersion }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UCard class="h-full">
                <template #header>
                    <h2 class="text-lg font-semibold text-[#43B3DE]">Quick Actions</h2>
                </template>
                <div class="space-y-3">
                    <NuxtLink to="/settlement/wallet-settlement/generate" class="block p-3 rounded-lg bg-gray-50 hover:bg-[#EAF6FC] transition-colors">
                        <div class="font-medium text-[#211e1f]">Generate Settlement</div>
                        <div class="text-sm text-gray-600">Generate settlement for suppliers</div>
                    </NuxtLink>
                    <NuxtLink to="/settings" class="block p-3 rounded-lg bg-gray-50 hover:bg-[#EAF6FC] transition-colors">
                        <div class="font-medium text-[#211e1f]">System Settings</div>
                        <div class="text-sm text-gray-600">Configure system preferences</div>
                    </NuxtLink>
                </div>
            </UCard>
            
            <UCard class="h-full">
                <template #header>
                    <h2 class="text-lg font-semibold text-[#43B3DE]">System Status</h2>
                </template>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-[#211e1f]">Authentication</span>
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-[#211e1f]">Database</span>
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Connected</span>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
const { user } = useAuth()

useHead({
  title: 'Dashboard - Bill24 Admin Portal'
})
const {t} = useI18n()
// let breadcrumbs = computed(() => [
//   { label: 'dashboard', to: '/dashboard' },
//   { label: 'Home', to: '/', active: true }
// ])
definePageMeta({
  auth: true,
  // breadcrumbs: breadcrumbs
})


</script>