<template>
    <!-- <div>
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
            </h2> -->

            <SplashScreen />
</template>

<script lang="ts" setup>
import SplashScreen from '~/components/SplashScreen.vue';
</script>