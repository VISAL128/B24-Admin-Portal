<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-[#211e1f] mb-8">Permission System Demo</h1>
    
    <!-- User Info Section -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Current User Information</h2>
      <div v-if="userInfo" class="space-y-2">
        <p><strong>Email:</strong> {{ userInfo.email || 'Not available' }}</p>
        <p><strong>Username:</strong> {{ userInfo.username || 'Not available' }}</p>
        <p><strong>Roles:</strong> 
          <span v-if="userRoles.length" class="space-x-2">
            <span v-for="role in userRoles" :key="role" 
                  class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {{ role }}
            </span>
          </span>
          <span v-else class="text-gray-500">No roles assigned</span>
        </p>
        <p><strong>Permissions:</strong>
          <span v-if="userPermissions.length" class="space-x-2">
            <span v-for="permission in userPermissions" :key="permission" 
                  class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              {{ permission }}
            </span>
          </span>
          <span v-else class="text-gray-500">No permissions assigned</span>
        </p>
      </div>
      <div v-else class="text-gray-500">
        No user information available. Please log in.
      </div>
    </div>

    <!-- Permission Testing Section -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Permission Testing</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Role-based Access -->
        <div class="space-y-4">
          <h3 class="font-medium text-lg">Role-based Access</h3>
          
          <div class="p-4 bg-gray-50 rounded">
            <p class="font-medium mb-2">Admin Access:</p>
            <p class="text-sm text-gray-600 mb-3">Only visible to admin users</p>
            <div v-if="isAdmin" class="p-3 bg-green-50 border border-green-200 rounded">
              <p class="text-green-800">✅ You have admin access!</p>
              <button class="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Delete System Data
              </button>
            </div>
            <div v-else class="p-3 bg-red-50 border border-red-200 rounded">
              <p class="text-red-800">❌ Admin access required</p>
              <button @click="simulateAdminAction" 
                      class="mt-2 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
                Delete System Data (Restricted)
              </button>
            </div>
          </div>

          <div class="p-4 bg-gray-50 rounded">
            <p class="font-medium mb-2">Manager Access:</p>
            <p class="text-sm text-gray-600 mb-3">Visible to managers and admins</p>
            <div v-if="isManager" class="p-3 bg-green-50 border border-green-200 rounded">
              <p class="text-green-800">✅ You have manager access!</p>
              <button class="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Approve Settlements
              </button>
            </div>
            <div v-else class="p-3 bg-red-50 border border-red-200 rounded">
              <p class="text-red-800">❌ Manager access required</p>
              <button @click="simulateManagerAction"
                      class="mt-2 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
                Approve Settlements (Restricted)
              </button>
            </div>
          </div>
        </div>

        <!-- Permission-based Access -->
        <div class="space-y-4">
          <h3 class="font-medium text-lg">Permission-based Access</h3>
          
          <div class="p-4 bg-gray-50 rounded">
            <p class="font-medium mb-2">Settlement Read Access:</p>
            <p class="text-sm text-gray-600 mb-3">Requires 'settlement:read' permission</p>
            <div v-if="canReadSettlements" class="p-3 bg-green-50 border border-green-200 rounded">
              <p class="text-green-800">✅ You can view settlements!</p>
              <button class="mt-2 bg-[#43B3DE] text-white px-4 py-2 rounded hover:bg-[#7FCDE8]">
                View Settlements
              </button>
            </div>
            <div v-else class="p-3 bg-red-50 border border-red-200 rounded">
              <p class="text-red-800">❌ Settlement read permission required</p>
              <button @click="simulateSettlementRead"
                      class="mt-2 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
                View Settlements (Restricted)
              </button>
            </div>
          </div>

          <div class="p-4 bg-gray-50 rounded">
            <p class="font-medium mb-2">Report Generation:</p>
            <p class="text-sm text-gray-600 mb-3">Requires 'reports:generate' permission</p>
            <div v-if="canGenerateReports" class="p-3 bg-green-50 border border-green-200 rounded">
              <p class="text-green-800">✅ You can generate reports!</p>
              <button class="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                Generate Report
              </button>
            </div>
            <div v-else class="p-3 bg-red-50 border border-red-200 rounded">
              <p class="text-red-800">❌ Report generation permission required</p>
              <button @click="simulateReportGeneration"
                      class="mt-2 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
                Generate Report (Restricted)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mock User Controls -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Mock User Controls (Demo)</h2>
      <p class="text-sm text-gray-600 mb-4">
        These buttons simulate different user types for testing the permission system.
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button @click="setMockUser('guest')"
                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Guest User
        </button>
        <button @click="setMockUser('user')"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Regular User
        </button>
        <button @click="setMockUser('manager')"
                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Manager
        </button>
        <button @click="setMockUser('admin')"
                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Admin
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'] // Only require authentication, not specific permissions
})

useHead({
  title: 'Permission System Demo - Bill24 Admin Portal'
})

// Use the permissions composable
const { 
  userInfo, 
  userRoles, 
  userPermissions, 
  isAdmin, 
  isManager, 
  hasPermission,
  setUserInfo,
  redirectToNoPermission 
} = usePermissions()

// Permission checks
const canReadSettlements = computed(() => hasPermission('settlement:read'))
const canGenerateReports = computed(() => hasPermission('reports:generate'))

// Mock user setup functions
const setMockUser = (type: 'guest' | 'user' | 'manager' | 'admin') => {
  const mockUsers = {
    guest: {
      email: 'guest@bill24.com',
      username: 'guest',
      roles: [],
      permissions: []
    },
    user: {
      email: 'user@bill24.com',
      username: 'regularuser',
      roles: ['user'],
      permissions: ['settlement:read']
    },
    manager: {
      email: 'manager@bill24.com',
      username: 'manager',
      roles: ['manager', 'user'],
      permissions: ['settlement:read', 'settlement:write', 'reports:generate']
    },
    admin: {
      email: 'admin@bill24.com',
      username: 'admin',
      roles: ['admin', 'manager', 'user'],
      permissions: ['settlement:read', 'settlement:write', 'settlement:delete', 'reports:generate', 'user:manage', 'system:admin']
    }
  }

  setUserInfo(mockUsers[type])
  
  // Show notification
  const { showSuccess } = useNotification()
  showSuccess({
    title: 'User Type Changed',
    description: `You are now logged in as a ${type}`
  })
}

// Simulated restricted actions
const simulateAdminAction = () => {
  redirectToNoPermission({
    type: 'role',
    resource: 'System Administration',
    action: 'delete data',
    requiredRoles: ['admin'],
    info: 'Only system administrators can delete system data.'
  })
}

const simulateManagerAction = () => {
  redirectToNoPermission({
    type: 'role',
    resource: 'Settlement Management',
    action: 'approve',
    requiredRoles: ['manager', 'admin'],
    info: 'Settlement approval requires manager-level access or higher.'
  })
}

const simulateSettlementRead = () => {
  redirectToNoPermission({
    type: 'permission',
    resource: 'Settlement Data',
    action: 'view',
    requiredPermissions: ['settlement:read'],
    info: 'You need the settlement:read permission to view settlement data.'
  })
}

const simulateReportGeneration = () => {
  redirectToNoPermission({
    type: 'permission',
    resource: 'Report System',
    action: 'generate',
    requiredPermissions: ['reports:generate'],
    info: 'Report generation requires the reports:generate permission.'
  })
}

// Initialize with a guest user if no user info exists
onMounted(() => {
  if (!userInfo.value) {
    setMockUser('guest')
  }
})
</script>
