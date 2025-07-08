<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-[#211e1f] mb-8">Admin Access Test</h1>
    
    <!-- User Info -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Current User Information</h2>
      <div v-if="user" class="space-y-2">
        <p><strong>Name:</strong> {{ user.fullName }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Roles:</strong> 
          <span v-if="user.roles?.length" class="space-x-2">
            <span v-for="role in user.roles" :key="role" 
                  class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {{ role }}
            </span>
          </span>
          <span v-else class="text-gray-500">No roles assigned</span>
        </p>
        <p><strong>Is Admin:</strong> 
          <span :class="isAdmin ? 'text-green-600' : 'text-red-600'">
            {{ isAdmin ? '✅ Yes' : '❌ No' }}
          </span>
        </p>
      </div>
      <div v-else class="text-gray-500">
        No user information available.
      </div>
    </div>

    <!-- Admin Status -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Admin Access Status</h2>
      <div v-if="isAdmin" class="p-4 bg-green-50 border border-green-200 rounded">
        <p class="text-green-800 font-medium">✅ Admin Access Granted</p>
        <p class="text-green-700 text-sm mt-1">
          You have successfully accessed the admin portal. All admin features are available.
        </p>
      </div>
      <div v-else class="p-4 bg-red-50 border border-red-200 rounded">
        <p class="text-red-800 font-medium">❌ Admin Access Required</p>
        <p class="text-red-700 text-sm mt-1">
          This page should only be accessible to admin users. If you can see this, there might be an issue with the permission system.
        </p>
      </div>
    </div>

    <!-- Test Actions -->
    <div class="bg-white rounded-lg shadow p-6 mt-8">
      <h2 class="text-xl font-semibold mb-4">Test Actions</h2>
      <div class="space-y-4">
        <button 
          @click="testNoPermission"
          class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Test No Permission Page
        </button>
        <button 
          @click="refreshUserInfo"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4"
        >
          Refresh User Info
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  // This page uses the default layout, so admin permission is enforced there
})

useHead({
  title: 'Admin Access Test - Bill24 Admin Portal'
})

// Use auth composable
const auth = useAuth()
const user = auth.user
const isAdmin = computed(() => auth.hasRole('admin'))

// Test functions
const testNoPermission = () => {
  navigateTo({
    path: '/no-permission',
    query: {
      type: 'role',
      resource: 'Test Feature',
      action: 'test access',
      permissions: 'admin,super-admin'
    }
  })
}

const refreshUserInfo = () => {
  // Force refresh by navigating to current route
  window.location.reload()
}

// Log user info for debugging
onMounted(() => {
  console.log('👤 Current user:', user.value)
  console.log('🔑 Is admin:', isAdmin.value)
})
</script>
