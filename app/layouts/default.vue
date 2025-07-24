<template>
  <!-- Show loading screen while checking permissions -->
  <PermissionLoadingScreen v-if="isCheckingPermissions" message="Verifying admin access..." />

  <!-- Main layout (only shown after permission check passes) -->
  <div v-else>
    <div
      class="h-screen flex flex-row items-start justify-start gap-2 bg-neutral-100 dark:bg-neutral-800"
    >
      <!-- Navigation sidebar -->
      <div
        :class="[
          'flex flex-col h-full p-2 bg-white dark:bg-slate-900 border-r-1 border-gray-200 dark:border-gray-700 transition-all duration-300 relative gap-4',
          isNavExpanded ? 'w-[260px]' : 'w-[60px]',
        ]"
      >
        <B24header :is-header-nav-open="isNavExpanded" />

        <Navication :collapsed="!isNavExpanded" />

        <!-- Toggle button for navigation -->
        <UButton
          variant="ghost"
          size="sm"
          :class="[
            'absolute bottom-2 p-1 transition-all duration-300',
            isNavExpanded ? 'right-2' : 'left-1/2 transform -translate-x-1/2',
          ]"
          @click="toggleNavigation"
        >
          <Icon
            :name="
              isNavExpanded
                ? 'tabler:layout-sidebar-left-collapse'
                : 'tabler:layout-sidebar-left-expand'
            "
            class="size-4.5 text-gray-500 transition-transform duration-1000"
          />
        </UButton>
      </div>

      <!-- Main content area -->
      <div class="flex flex-col h-full w-full overflow-x-hidden">
        <UCard class="top-0 right-0 z-50" variant="soft">
          <div class="flex flex-row items-center justify-between gap-2 w-full h-2">
            <breadcrumb />
            <div class="flex flex-row items-center justify-end gap-4 h-full">
              <div class="flex items-center gap-2">
                <!-- Profile Display -->
                <div
                  v-if="auth.currentProfile.value"
                  class="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-primary/50 dark:border-primary/20"
                >
                  <Icon name="material-symbols:home-work-outline" class="w-4 h-4 text-primary" />
                  <div class="flex flex-col">
                    <span class="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {{ auth.currentProfile.value.name }}
                    </span>
                    <!-- <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ auth.currentProfile.value.code }}
                      </span> -->
                  </div>
                </div>
                <!-- Theme Switcher -->
                <UTooltip :text="t('navbar.theme')" :delay-duration="500">
                  <UButton
                    :icon="
                      colorMode?.preference === 'dark'
                        ? 'material-symbols:dark-mode-outline'
                        : 'material-symbols:light-mode-outline'
                    "
                    variant="ghost"
                    size="sm"
                    class="px-2"
                    @click="toggleTheme"
                  >
                    <span class="sr-only">Toggle Theme</span>
                  </UButton>
                </UTooltip>
                <!-- Language Switcher -->
                <UTooltip :text="t('navbar.language')" :delay-duration="500">
                  <div>
                    <UPopover placement="bottom-end" :offset="[0, 10]">
                      <UButton
                        icon="material-symbols:language"
                        variant="ghost"
                        size="sm"
                        class="px-2"
                      />
                      <template #content>
                        <div class="flex flex-col gap-1 p-2 w-28">
                          <UButton
                            variant="ghost"
                            class="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all justify-start text-left"
                            block
                            :class="
                              locale === 'en' ? 'bg-blue-100 dark:bg-gray-700 text-primary' : ''
                            "
                            size="sm"
                            @click="
                              () => {
                                setLanguage('en')
                              }
                            "
                            >🇬🇧
                            <span class="text-left w-full">
                              <!-- {{
                      t("lang.english")
                    }} -->
                              English
                            </span>
                          </UButton>
                          <UButton
                            variant="ghost"
                            class="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all justify-start text-left"
                            :class="
                              locale === 'km' ? 'bg-blue-100 dark:bg-gray-700 text-primary' : ''
                            "
                            block
                            size="sm"
                            @click="
                              () => {
                                setLanguage('km')
                              }
                            "
                            >🇰🇭
                            <span class="text-left w-full">
                              ភាសាខ្មែរ
                              <!-- {{
                            t("lang.khmer")
                          }} -->
                            </span></UButton
                          >
                        </div>
                      </template>
                    </UPopover>
                  </div>
                </UTooltip>

                <!-- Setting -->
                <UTooltip :text="t('navbar.settings')" :delay-duration="500">
                  <UButton
                    icon="material-symbols:settings-outline"
                    variant="ghost"
                    size="sm"
                    class="px-2"
                    @click="handleSettings"
                  />
                </UTooltip>

                <!-- Developer Tools -->
                <!-- <UTooltip :text="t('navbar.developer_tools')" :delay-duration="500">
                  <UButton
                    icon="material-symbols:terminal-rounded"
                    variant="ghost"
                    size="sm"
                    class="px-2"
                    @click="handleDeveloperTools"
                  />
                </UTooltip> -->
              </div>
              <!-- User Menu -->
              <UPopover ref="popoverRef" placement="bottom-end" :offset="[0, 10]" class="z-50">
                <UAvatar
                  :src="user?.picture"
                  :alt="String(user?.fullName || 'User')"
                  size="sm"
                  class="cursor-pointer hover:ring-1 hover:ring-primary transition-all"
                />

                <template #content>
                  <div class="w-48 p-2">
                    <!-- User Info Section -->
                    <div class="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                      <div class="flex items-center gap-3">
                        <UAvatar
                          :src="user?.picture"
                          :alt="String(user?.fullName || 'User')"
                          size="sm"
                        />
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
                        variant="ghost"
                        size="md"
                        class="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        @click="handleUserProfile"
                      >
                        <Icon
                          name="material-symbols:person-outline-rounded"
                          class="size-4.5 mr-2"
                        />
                        {{ t('user_profile') }}
                      </UButton>

                      <UButton
                        variant="ghost"
                        size="md"
                        class="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        @click="handleSettings"
                      >
                        <Icon name="material-symbols:settings-outline" class="w-4 h-4 mr-2" />
                        {{ t('profile_popup.settings') }}
                      </UButton>

                      <div class="border-t border-gray-200 dark:border-gray-700" />

                      <UButton
                        variant="ghost"
                        size="md"
                        class="w-full justify-start text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                        @click="isShowLogoutConfirmModal = true"
                      >
                        <Icon name="material-symbols:logout" class="w-4 h-4 mr-2" />
                        {{ t('logout') }}
                      </UButton>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>
        </UCard>

        <!-- Confirmation Logout Modal -->
        <UModal
          v-model:open="isShowLogoutConfirmModal"
          :title="t('confirmation')"
          :transition="true"
          :fullscreen="false"
          :close="{
            class: 'rounded-full',
            onClick: () => logoutEmit('close', false),
          }"
        >
          <template #body>
            <div class="flex flex-col items-center h-32 text-center">
              <!-- Icon with circle background using Bill24 colors -->
              <div
                class="size-14 rounded-full flex items-center justify-center mb-4"
                style="background-color: #eaf6fc"
              >
                <UIcon
                  name="material-symbols:question-mark"
                  size="24"
                  class="text-3xl opacity-80"
                  style="color: #43b3de"
                />
              </div>

              <!-- Question text -->
              <h4 class="text-md font-semibold mb-1">
                {{ t('logout_confirmation') }}
              </h4>
            </div>
          </template>
          <template #footer>
            <div class="w-full flex flex-row justify-end gap-2">
              <UButton
                :label="t('no')"
                color="neutral"
                variant="outline"
                size="sm"
                class="w-16 justify-center"
                @click="closeConfirmationModal"
              />
              <UButton
                :label="t('yes_logout')"
                color="primary"
                size="sm"
                :loading="loggingOut"
                class="justify-center"
                @click="handleLogout"
              />
            </div>
          </template>
        </UModal>

        <!-- Main content slot -->
        <div class="flex-1 p-2 pt-0 overflow-y-auto h-full w-full">
          <slot />
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <UToaster />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import type { UserPreferences } from '~/models/userPreference'

const { locale, t } = useI18n()
const { setLanguage } = useLanguage()
const popoverRef = ref<{ close: () => void } | null>(null)
const logoutEmit = defineEmits<{ close: [boolean] }>()
const runtimeCon = useRuntimeConfig()

const isNavExpanded = ref(true)

// Permission checking state
const isCheckingPermissions = ref(false)
const isShowLogoutConfirmModal = ref(false)

const auth = useAuth()
const user = auth.user
const pref = useUserPreferences().getPreferences()
const loggingOut = ref(false)

const colorMode = useColorMode ? useColorMode() : null
const toggleTheme = () => {
  if (!colorMode) return
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
  if (pref) {
    pref.theme = colorMode.preference as 'light' | 'dark'
    useUserPreferences().savePreferences(pref as UserPreferences)
  }
}

const toggleNavigation = () => {
  isNavExpanded.value = !isNavExpanded.value
}

// User menu handlers
const handleUserProfile = () => {
  // Navigate to Keycloak's user profile
  window.open(runtimeCon.public.userProfileUrl, '_blank')
}

const handleSettings = () => {
  navigateTo('/settings/generate-details')
}

const handleDeveloperTools = () => {
  navigateTo('/settings/developer-tool')
}

const closeConfirmationModal = () => {
  isShowLogoutConfirmModal.value = false
}

const handleLogout = async () => {
  try {
    loggingOut.value = true
    await auth.logout()
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Check if user has admin role and redirect if not
const checkAdminAccess = async () => {
  // Only run on client side to avoid hydration issues
  if (import.meta.client && user.value) {
    if (!auth.hasRole('admin')) {
      console.warn('🚫 Access denied: User does not have admin role')
      // If user is authenticated but not admin, redirect to no permission
      await navigateTo({
        path: '/no-permission',
        query: {
          type: 'role',
          resource: 'Payment Portal',
          action: 'access',
          permissions: 'admin',
        },
      })
    } else {
      console.log('✅ Admin access granted')
      // Permission check passed, hide loading screen
      isCheckingPermissions.value = false
    }
  } else if (import.meta.client && !user.value) {
    // No user, let auth middleware handle redirect
    console.log('🔄 No user found, auth middleware will handle redirect')
    isCheckingPermissions.value = false
  }
}

// Watch for user changes and check admin access immediately
watch(user, checkAdminAccess, { immediate: true })

// Also check on mounted to catch any missed cases
onMounted(async () => {
  // // Wait for auth to stabilize
  // await nextTick()
  // await checkAdminAccess()
  // // Fallback: always hide loading after 5 seconds to prevent infinite loading
  // setTimeout(() => {
  //   if (isCheckingPermissions.value) {
  //     console.log('⚠️ Permission check timeout, proceeding...')
  //     isCheckingPermissions.value = false
  //   }
  // }, 5000)
})

definePageMeta({
  middleware: [
    'auth',
    // "permission"
  ],
  auth: true, // Ensure this layout requires authentication
})
</script>
