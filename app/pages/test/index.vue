<template>
    <div>
        <LoadingSpinner
            message="Loading..."
            description="Please wait while we fetch the data."
            size="md"
            :fullscreen="false"
        />
    </div>
    <UCard class="h-full">
                <template #header>
                    <h2 class="text-lg font-semibold text-[#43B3DE]">{{ $t('index.system_status') }}</h2>
                </template>
                <UButton
                    class="mb-4"
                    @click="getProfile"
                >
                    {{ $t('index.refresh') }}
                </UButton>
            </UCard>

            <h2>
code: {{ cookie || 'No code available' }}
            </h2>
</template>

<script lang="ts" setup>
import { usePgwModuleApi } from '~/composables/api/usePgwModuleApi';
const { t } = useI18n()
const api = usePgwModuleApi()
const cookie = useCookie('profile')


const getProfile = async () => {
    try {
        const profile = await api.getProfile()
        console.log('Profile:', profile)
    } catch (error) {
        console.error('Error fetching profile:', error)
    }
}
</script>