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

<script setup>
definePageMeta({
  auth: true
})

useHead({
  title: 'Settlement Dashboard - Bill24 Admin Portal'
})

// const { data: settlements } = await useFetch('/api/settlement/list')
const settlements = ref([])
</script>