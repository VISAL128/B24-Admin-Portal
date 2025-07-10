<template>
    <div>
        <LoadingSpinner
            message="Loading..."
            description="Please wait while we fetch the data."
            size="md"
            :fullscreen="false"
        />
    </div>
    <UButton
                    class="mb-4"
                    @click="getProfile"
                >
                    {{ $t('index.refresh') }}
                </UButton>

            <h2>
profile data: {{ profileSupplier || 'No code available' }}
            </h2>

            <SimpleSplashScreen />
</template>

<script lang="ts" setup>
import { usePgwModuleApi } from '~/composables/api/usePgwModuleApi';
const { t } = useI18n()
const api = usePgwModuleApi()
const profileSupplier = useCookie('profile')


const getProfile = async () => {
    try {
        const profile = await api.getProfile()
        profileSupplier.value = JSON.stringify(profile.data) || 'No code available'
    } catch (error) {
        console.error('Error fetching profile:', error)
    }
}
</script>