<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 text-white flex flex-col p-4">
      <h1 class="text-2xl font-bold mb-6">⚡ EV Admin</h1>
      <nav class="flex-1">
        <ul class="space-y-3">
          <li>
            <NuxtLink to="/dashboard" class="hover:text-blue-300 hover:underline">📊 Dashboard</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/settlement" class="hover:text-blue-300 hover:underline">💵 Settlement</NuxtLink>
          </li>
        </ul>
      </nav>
      <footer class="text-sm text-gray-400 mt-auto">
        <p class="mt-4">© 2025 EV Admin</p>
      </footer>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-6 bg-gray-100 overflow-auto">
      <slot />
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth' // ✅ make sure you have middleware/auth.ts defined
})
</script>
