<template>
  <div
    class="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-b from-[#43B3DE] to-white rounded-lg shadow-lg"
  >
    <div class="text-center max-w-md mx-auto">
      <!-- Icon -->
      <div class="mb-6">
        <svg
          class="w-20 h-20 mx-auto text-white drop-shadow-lg"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      <!-- Main Content -->
      <h1 class="text-3xl font-bold text-white mb-4 drop-shadow-md">
        {{ t('underDevelopment.title') }}
      </h1>

      <p class="text-white text-lg mb-6 opacity-90">
        {{ t('underDevelopment.description') }}
      </p>

      <!-- Progress Indicator -->
      <div class="mb-6">
        <div class="flex items-center justify-center space-x-2 mb-2">
          <div class="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div
            class="w-3 h-3 bg-white rounded-full animate-bounce"
            style="animation-delay: 0.1s"
          ></div>
          <div
            class="w-3 h-3 bg-white rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
        </div>
        <p class="text-white text-sm opacity-75">
          {{ t('underDevelopment.workingOnIt') }}
        </p>
      </div>

      <!-- Action Button (Optional) -->
      <button
        v-if="showBackButton"
        @click="goBack"
        class="bg-white text-[#43B3DE] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        {{ t('underDevelopment.goBack') }}
      </button>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute top-4 left-4 opacity-20">
      <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <div class="absolute top-4 right-4 opacity-20">
      <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <div class="absolute bottom-4 left-4 opacity-20">
      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  showBackButton?: boolean
  customMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  showBackButton: true,
  customMessage: '',
})

const { t } = useI18n()
const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
