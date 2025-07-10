<template>
  <div class="space-y-6">
    <UCard>
      <h1 class="text-2xl font-bold mb-4 text-primary">
        {{ $t('welcome') }} <span class="font-italic">, {{ user?.fullName || 'Guest' }}</span>
      </h1>
      <p class="text-gray-600 mb-4">{{ $t('index.navigation_instructions') }}</p>
      <p class="text-sm text-gray-500">
        {{ $t('index.current_version') }}: {{ $config.public.appVersion }}
      </p>
    </UCard>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UCard class="h-full">
        <template #header>
          <h2 class="text-lg font-semibold text-primary">{{ $t('index.quick_actions') }}</h2>
        </template>
        <div class="space-y-3">
          <NuxtLink
            to="/digital-wallet/generate"
            class="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-[#EAF6FC] dark:hover:bg-gray-500 transition-colors"
          >
            <div class="font-medium text-primary">{{ $t('generate_settlement') }}</div>
            <div class="text-sm text-gray-600">{{ $t('index.generate_settlement_desc') }}</div>
          </NuxtLink>
          <NuxtLink
            to="/settings"
            class="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-[#EAF6FC] dark:hover:bg-gray-500 transition-colors"
          >
            <div class="font-medium text-primary">{{ $t('settings.title') }}</div>
            <div class="text-sm text-gray-600">{{ $t('index.settings_desc') }}</div>
          </NuxtLink>
        </div>
      </UCard>

      <!-- <UCard class="h-full">
                <template #header>
                    <h2 class="text-lg font-semibold text-[#43B3DE]">{{ $t('index.system_status') }}</h2>
                </template>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-[#211e1f]">{{ $t('index.authentication') }}</span>
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{{ $t('index.active') }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-[#211e1f]">{{ $t('index.database') }}</span>
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{{ $t('index.connected') }}</span>
                    </div>
                </div>
            </UCard> -->
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { t } = useI18n()

useHead({
  title: `${t('dashboard')} - Bill24 Admin Portal`,
})

definePageMeta({
  auth: true,
})
</script>
