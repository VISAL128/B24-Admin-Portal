<template>
  <div>
    <UCard class="fixed top-0 left-0 w-full z-50">
      <div class="flex flex-row items-center justify-between gap-2 w-full h-5">
        <div class="w-fit">
          <B24header />
        </div>
        <div class="flex flex-row items-center justify-end gap-4 h-full">
          <div class="flex items-center gap-2">
            <UPopover placement="bottom-end" :offset="[0, 10]">
              <UButton icon="heroicons:globe-alt" variant="ghost" size="sm" class="px-2">
                <span class="ml-1 font-medium">{{ locale === 'en' ? 'EN' : 'KM' }}</span>
              </UButton>
              <template #content>
                <div class="flex flex-col gap-1 p-2 w-28">
                  <UButton
                    variant="ghost"
                    class="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all justify-start text-left"
                    @click="() => { setLocale('en') }"
                    block size="sm"
                  >🇬🇧 <span class="text-left w-full">{{ t('lang.english') }}</span></UButton>
                  <UButton
                    variant="ghost"
                    class="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all justify-start text-left"
                    @click="() => { setLocale('km') }"
                    block size="sm"
                  >🇰🇭 <span class="text-left w-full">{{ t('lang.khmer') }}</span></UButton>
                </div>
              </template>
            </UPopover>
            <!-- Theme Switcher -->
            <UButton icon="heroicons:moon" variant="ghost" size="sm" class="px-2" @click="toggleTheme">
              <span class="sr-only">Toggle Theme</span>
            </UButton>
          </div>
          <!-- User Popover -->
          <UPopover ref="popoverRef" placement="bottom-end" :offset="[0, 10]" class="z-50">
            <UAvatar
              :src="user?.picture"
              size="xl"
              class="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
            >
              <template v-if="!user?.picture" #default>
                <Icon name="heroicons:user" class="w-6 h-6 text-[#43B3DE]" />
              </template>
            </UAvatar>

            <template #content>
              <div class="w-48 p-2">
                <!-- User Info Section -->
                <div class="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                  <div class="flex items-center gap-3">
                    <UAvatar :src="user?.picture" size="sm">
                      <template v-if="!user?.picture" #default>
                        <Icon name="heroicons:user" class="w-4 h-4 text-[#43B3DE]" />
                      </template>
                    </UAvatar>
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {{ user?.fullName || 'User' }}
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ user?.email || 'user@example.com' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Menu Items -->
                <div class="space-y-1">
                  <UButton
                    @click="handleUserProfile"
                    variant="ghost"
                    size="md"
                    class="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Icon name="heroicons:user" class="w-4 h-4 mr-2" />
                    {{ t('user_profile') }}
                  </UButton>

                  <UButton
                    @click="handleSettings"
                    variant="ghost"
                    size="md"
                    class="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Icon name="heroicons:cog-6-tooth" class="w-4 h-4 mr-2" />
                    {{ t('settings') }}
                  </UButton>

                  <UDivider class="my-2" />

                  <UButton
                    @click="handleLogout"
                    variant="ghost"
                    size="md"
                    class="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
                    {{ t('logout') }}
                  </UButton>
                </div>
              </div>
            </template>
          </UPopover>
        </div>
      </div>
    </UCard>
    <div
      class="pt-18 h-screen flex flex-row items-start justify-start gap-2 bg-gray-100 dark:bg-gray-900"
    >
      <!-- Navigation sidebar -->
      <div
        :class="[
          'flex flex-col h-[calc(100vh-5rem)] rounded-lg shadow-lg p-2 bg-white dark:bg-slate-900 border-r-2 border-gray-200 dark:border-gray-700 transition-all duration-300 relative',
          isNavExpanded ? 'w-[260px]' : 'w-[60px]',
        ]"
      >
        <Navication :collapsed="!isNavExpanded" />
        <UButton
          @click="toggleNavigation"
          variant="ghost"
          size="sm"
          class="absolute bottom-2 right-2 p-1"
        >
          <Icon
            :name="
              isNavExpanded
                ? 'heroicons:chevron-left'
                : 'heroicons:chevron-right'
            "
            class="w-4 h-4"
          />
        </UButton>
      </div>
      <!-- Main content area -->
      <div
        class="flex flex-col h-[calc(100vh-5rem)] w-full rounded-lg shadow-lg p-4"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale, t, setLocale } = useI18n()
const popoverRef = ref<{ close: () => void } | null>(null)

const isNavExpanded = ref(true);

const auth = useAuth();

const user = auth.user;


const colorMode = useColorMode ? useColorMode() : null;
const toggleTheme = () => {
  if (!colorMode) return;
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark';
};

const toggleNavigation = () => {
  isNavExpanded.value = !isNavExpanded.value;
};

// User menu handlers
const handleUserProfile = () => {
  navigateTo('/profile');
};

const handleSettings = () => {
  navigateTo('/settings');
};

const handleLogout = async () => {
  try {
    await auth.logout();
    await navigateTo('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>
