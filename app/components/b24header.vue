<script setup lang="ts">
const isNavExpanded = ref(true);
const props = defineProps<{
  isNavExpanded?: boolean;
}>();
watch(() => props.isNavExpanded, (newVal) => {
  console.log('props.isNavExpanded changed:', newVal);
  isNavExpanded.value = newVal;
});

let labelClass = computed(() => {
  console.log('isNavExpanded.value', isNavExpanded.value!==true);
  return isNavExpanded.value!==true ? 'opacity-0' : 'transition-all duration-800 opacity-100';
});

</script>

<template>
  <div class="flex flex-row items-center justify-start gap-2 p-2">
    <img src="/images/Bill24 logo.png" alt="logo" class="w-10 m-0 d-inline-block" />
    <h1 class="text-lg" :class="labelClass">Admin Portal</h1>
  </div>
</template>
