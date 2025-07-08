<template>
  <!-- Show loading screen while checking permissions -->
  <PermissionLoadingScreen 
    v-if="isCheckingPermissions" 
    message="Verifying admin access..."
  />
  
  <!-- Main layout (only shown after permission check passes) -->
  <div v-else>
    <div
      class="h-screen flex flex-row items-start justify-start gap-2 bg-neutral-100 dark:bg-neutral-800"
    >
      <!-- Navigation sidebar -->
      <div
        :class="[
          'flex flex-col h-full rounded-lg shadow-lg p-2 bg-white dark:bg-slate-900 border-r-2 border-gray-200 dark:border-gray-700 transition-all duration-300 relative gap-4',
          isNavExpanded ? 'w-[260px]' : 'w-[60px]',
        ]"
      >
        <B24header :isNavExpanded="isNavExpanded" />

        <Navication :collapsed="!isNavExpanded" />

        <!-- Toggle button for navigation -->
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
      <div class="flex flex-col h-full w-full rounded-lg">
        <div class="flex-row">
          <UCard class="top-0 right-0 z-50" variant="soft">
            <div
              class="flex flex-row items-center justify-between gap-2 w-full h-5"
            >
              <breadcrumb />
              <div class="flex flex-row items-center justify-end gap-4 h-full">
                <div class="flex items-center gap-2">
                  <UPopover placement="bottom-end" :offset="[0, 10]">
                    <UButton
                      icon="heroicons:globe-alt"
                      variant="ghost"
                      size="sm"
                      class="px-2"
                    >
                      <span class="ml-1 font-medium">{{
                        locale === "en" ? "English" : "ភាសាខ្មែរ"
                      }}</span>
                    </UButton>
                    <template #content>
                      <div class="flex flex-col gap-1 p-2 w-28">
                        <UButton
                          variant="ghost"
                          class="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all justify-start text-left"
                          @click="
                            () => {
                              setLanguage('en');
                            }
                          "
                          block
                          size="sm"
                          >🇬🇧
                          <span class="text-left w-full">
                            <!-- {{
                      t("lang.english")
                    }} -->
                            English
                          </span></UButton
                        >
                        <UButton
                          variant="ghost"
                          class="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all justify-start text-left"
                          @click="
                            () => {
                              setLanguage('km');
                            }
                          "
                          block
                          size="sm"
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
                  <!-- Theme Switcher -->
                  <UButton
                    :icon="
                      colorMode?.preference === 'dark'
                        ? 'heroicons:sun'
                        : 'heroicons:moon'
                    "
                    variant="ghost"
                    size="sm"
                    class="px-2"
                    @click="toggleTheme"
                  >
                    <span class="sr-only">Toggle Theme</span>
                  </UButton>
                </div>
                <!-- User Popover -->
                <UPopover
                  ref="popoverRef"
                  placement="bottom-end"
                  :offset="[0, 10]"
                  class="z-50"
                >
                  <UAvatar
                    :src="user?.picture"
                    size="xl"
                    class="cursor-pointer hover:ring-1 hover:ring-primary transition-all"
                  >
                    <template v-if="!user?.picture" #default>
                      <Icon
                        name="heroicons:user"
                        class="w-6 h-6 text-primary"
                      />
                    </template>
                  </UAvatar>

                  <template #content>
                    <div class="w-48 p-2">
                      <!-- User Info Section -->
                      <div
                        class="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3"
                      >
                        <div class="flex items-center gap-3">
                          <UAvatar :src="user?.picture" size="sm">
                            <template v-if="!user?.picture" #default>
                              <Icon
                                name="heroicons:user"
                                class="w-4 h-4 text-[#43B3DE]"
                              />
                            </template>
                          </UAvatar>
                          <div class="flex flex-col">
                            <span
                              class="text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              {{ user?.fullName || "User" }}
                            </span>
                            <span
                              class="text-xs text-gray-500 dark:text-gray-400"
                            >
                              {{ user?.email || "user@example.com" }}
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
                          {{ t("user_profile") }}
                        </UButton>

                        <UButton
                          @click="handleSettings"
                          variant="ghost"
                          size="md"
                          class="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Icon
                            name="heroicons:cog-6-tooth"
                            class="w-4 h-4 mr-2"
                          />
                          {{ t("settings") }}
                        </UButton>

                        <UDivider class="my-2" />

                        <UButton
                          @click="handleLogout"
                          variant="ghost"
                          size="md"
                          class="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Icon
                            name="heroicons:arrow-right-on-rectangle"
                            class="w-4 h-4 mr-2"
                          />
                          {{ t("logout") }}
                        </UButton>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Main content slot -->
        <div class="flex-1 p-2 overflow-y-auto h-full w-full">
          <slot />
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <UToaster />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
const { locale, t, setLocale } = useI18n();
const { setLanguage, initializeLanguage } =
  useLanguage();
const popoverRef = ref<{ close: () => void } | null>(null);

const isNavExpanded = ref(true);

// Permission checking state
const isCheckingPermissions = ref(false);

const auth = useAuth();
const user = auth.user;

// Initialize language on mount
onMounted(() => {
  initializeLanguage();
});

const colorMode = useColorMode ? useColorMode() : null;
const toggleTheme = () => {
  if (!colorMode) return;
  colorMode.preference = colorMode.preference === "dark" ? "light" : "dark";
};

const toggleNavigation = () => {
  isNavExpanded.value = !isNavExpanded.value;
};

// User menu handlers
const handleUserProfile = () => {
  navigateTo("/profile");
};

const handleSettings = () => {
  navigateTo("/settings");
};

const handleLogout = async () => {
  try {
    console.log("🔄 User initiated logout...");
    await auth.logout();
    // Don't manually navigate - let the auth composable handle the redirect
  } catch (error) {
    console.error("Logout failed:", error);
    // Fallback: navigate to logout page if auth.logout fails
    await navigateTo("/logout", { replace: true });
  }
}

// Check if user has admin role and redirect if not
const checkAdminAccess = async () => {
  // Only run on client side to avoid hydration issues
  if (process.client && user.value) {
    if (!auth.hasRole('admin')) {
      console.warn('🚫 Access denied: User does not have admin role')
      // If user is authenticated but not admin, redirect to no permission
      await navigateTo({
        path: '/no-permission',
        query: {
          type: 'role',
          resource: 'Admin Portal',
          action: 'access',
          permissions: 'admin'
        }
      })
    } else {
      console.log('✅ Admin access granted')
      // Permission check passed, hide loading screen
      isCheckingPermissions.value = false
    }
  } else if (process.client && !user.value) {
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
    "auth",
    // "permission"
  ],
  // Proper permission options for admin requirement
  // permissionOptions: {
  //   roles: [],
  //   resource: "Admin Portal",
  //   action: "access",
  //   requireAll: true
  // },
  auth: true, // Ensure this layout requires authentication
});
</script>
