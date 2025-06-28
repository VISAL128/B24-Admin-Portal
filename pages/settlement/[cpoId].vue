<template>
  <div>
    <h1>Settlement for {{ cpoId }}</h1>
    <ul>
      <li v-for="log in logs" :key="log.transaction_id">
        {{ log.ref_id }} - ${{ log.total_amount }}
      </li>
    </ul>
  </div>
</template>

<script setup>
const route = useRoute()
const cpoId = route.params.cpoId
const { data: logs } = await useFetch(`/api/settlement/${cpoId}/logs`)
</script>
