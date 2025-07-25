<template>
  <div
    class="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-[white] via-[#caf0f8] to-white transition-all duration-500"
  >
    <!-- Main Content - Centered -->
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <!-- Logo Section -->
        <div class="mb-8 animate-pulse">
          <img
            src="/images/Bill24 logo.png"
            alt="Bill24 Logo"
            class="mx-auto h-20 w-auto transition-transform duration-1000 ease-out"
          />
        </div>

        <!-- App Title -->
        <!-- <ShinyText
          text="Just some shiny text!"
          :disabled="false"
          :speed="3"
          class-name="text-3xl font-bold text-[#211e1f] animate-fade-in-up"
        /> -->
        <h1 class="mb-4 text-3xl font-bold text-[#211e1f] animate-fade-in-up">
          {{ t('splash.title') }}
        </h1>

        <!-- Subtitle -->
        <p class="mb-8 text-lg text-[#211e1f]/80 animate-fade-in-up delay-200">
          {{ t('splash.subtitle') }}
        </p>

        <!-- Loading Animation -->
        <div class="flex items-center justify-center space-x-2">
          <div class="flex space-x-1">
            <div
              v-for="i in 3"
              :key="i"
              class="size-1.5 rounded-full bg-[#43B3DE] animate-bounce"
              :style="{ animationDelay: `${i * 0.2}s` }"
            />
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-4 w-64 mx-auto">
          <div class="bg-[#211e1f]/10 rounded-full overflow-hidden" style="height: 3px">
            <div
              class="h-full bg-[#43B3DE] size-1.5 rounded-full transition-all duration-1000 ease-out"
              :style="{ width: `100%` }"
            />
          </div>
        </div>

        <!-- Progress Description -->
        <!-- <div class="mt-3 text-sm text-[#211e1f]/70 animate-fade-in">
          {{ t(`splash.progress.${currentStep}`) }}
        </div> -->
      </div>
    </div>

    <!-- Version Info - Fixed at Bottom -->
    <div class="flex flex-col flex-shrink-0 items-center justify-center pb-6">
      <span class="text-sm text-[#211e1f]/50 animate-fade-in delay-500">
        {{ t('splash.powered_by') }}
        <ULink href="https://www.bill24.io">{{ t('splash.bill24') }}</ULink>
      </span>
      <div class="text-xs text-[#211e1f]/50 animate-fade-in delay-500">
        {{ t('splash.version') }} {{ config.public.appVersion }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ShinyText from '~/components/texts/ShinyText.vue'
const { t } = useI18n()
const config = useRuntimeConfig()
</script>
