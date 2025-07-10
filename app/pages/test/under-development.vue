<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-[#211e1f] mb-6">
      {{ t('underDevelopment.title') }} Component Demo
    </h1>

    <div class="grid gap-8">
      <!-- Basic Usage -->
      <div>
        <h2 class="text-lg font-semibold mb-4">Basic Usage</h2>
        <UnderDevelopment />
      </div>

      <!-- Without Back Button -->
      <div>
        <h2 class="text-lg font-semibold mb-4">Without Back Button</h2>
        <UnderDevelopment :show-back-button="false" />
      </div>
    </div>

    <!-- Usage Instructions -->
    <div class="mt-12 p-6 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-4">How to Use</h3>
      <pre class="bg-white p-4 rounded border text-sm overflow-x-auto"><code>&lt;template&gt;
  &lt;!-- Basic usage with back button --&gt;
  &lt;UnderDevelopment /&gt;

  &lt;!-- Without back button --&gt;
  &lt;UnderDevelopment :show-back-button="false" /&gt;
&lt;/template&gt;</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Set page meta
definePageMeta({
  title: 'Under Development Demo',
  description: 'Demo page for the UnderDevelopment component',
})
</script>
