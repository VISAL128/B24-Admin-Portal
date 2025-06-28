<template>
  <div class="h-screen flex flex-row items-start justify-start gap-2 p-2 bg-gray-100 dark:bg-gray-900">

    <div class="flex flex-col h-[100%] w-[260px] rounded-lg shadow-lg p-2 bg-white dark:bg-slate-900 border-r-2 border-gray-200 dark:border-gray-700">
      <B24header />
      <Navication />
    </div>
    <div class="flex flex-col h-[100%] w-full rounded-lg shadow-lg p-4 ">
      <slot />
    </div>
  </div>

</template>
<script setup lang="ts">
</script>