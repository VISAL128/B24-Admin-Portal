<script setup lang="ts">

import type {BreadcrumbItem} from "#ui/components/Breadcrumb.vue";

const route = useRoute()
const { t } = useI18n()

let pageBreadcrumbs = computed(() => {
  return route.meta.breadcrumbs || [];
});
const items: BreadcrumbItem[] = computed(() => {
  return pageBreadcrumbs.value.map((item) => ({
    label: t(item.label) || item.label,
    to: item.to,
    active: item.active || false,
  }));
});

</script>

<template>
  <UBreadcrumb :items="items" :class="{
    'opacity-0': !pageBreadcrumbs.length,
  }">
    <template #separator>
      <span class="mx-2 text-muted">/</span>
    </template>
  </UBreadcrumb>
</template>

