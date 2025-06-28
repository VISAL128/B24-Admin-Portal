<template>
  <div>
    <h1>Settlement Dashboard</h1>
    <ul>
      <li v-for="item in settlements" :key="item.cpoId">
        <NuxtLink :to="`/settlement/${item.cpoId}`">{{ item.cpoName }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<!-- <script setup>
const { data: settlements } = await useFetch('/api/settlement/list')
</script> -->

<!-- <script setup>
definePageMeta({
  middleware: () => navigateTo('/settlement')
})
</script> -->