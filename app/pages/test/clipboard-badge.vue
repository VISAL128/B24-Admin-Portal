<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold text-primary">ClipboardBadge Component Test</h1>
      </template>

      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-3">Basic Usage</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="w-32 text-sm text-gray-600">Payment ID:</span>
              <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" />
            </div>

            <div class="flex items-center gap-3">
              <span class="w-32 text-sm text-gray-600">Account Number:</span>
              <ClipboardBadge text="1234567890123456" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">With Labels</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="w-32 text-sm text-gray-600">Payment ID:</span>
              <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" label="Payment ID" />
            </div>

            <div class="flex items-center gap-3">
              <span class="w-32 text-sm text-gray-600">Transaction:</span>
              <ClipboardBadge text="txn_1234567890abcdef" label="TXN" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Custom Length Limits</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="w-32 text-sm text-gray-600">Short (10 chars):</span>
              <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" :max-length="10" />
            </div>

            <div class="flex items-center gap-3">
              <span class="w-32 text-sm text-gray-600">Medium (15 chars):</span>
              <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" :max-length="15" />
            </div>

            <div class="flex items-center gap-3">
              <span class="w-32 text-sm text-gray-600">Full length:</span>
              <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" :max-length="50" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Without Copy Icon</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="w-32 text-sm text-gray-600">No icon:</span>
              <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" :show-icon="false" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Custom Tooltip Text</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="w-32 text-sm text-gray-600">Custom tooltip:</span>
              <ClipboardBadge
                text="pi_3RM3bFB4GYNtG73L0kYxJJG5"
                tooltip-text="Click to copy payment ID"
                copied-tooltip-text="Payment ID copied!"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Real-world Examples</h3>
          <div class="space-y-3">
            <div class="p-4 border rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium">Payment Transaction</h4>
                  <p class="text-sm text-gray-600">Completed payment for order #12345</p>
                </div>
                <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" label="Payment ID" />
              </div>
            </div>

            <div class="p-4 border rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium">Bank Account</h4>
                  <p class="text-sm text-gray-600">Primary checking account</p>
                </div>
                <ClipboardBadge text="1234567890123456" label="Account" :max-length="12" />
              </div>
            </div>

            <div class="p-4 border rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium">API Key</h4>
                  <p class="text-sm text-gray-600">Production environment key</p>
                </div>
                <ClipboardBadge
                  text="sk_live_51HYZ3pJqQ9aB2C3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA5bC6dE7fG8hI9jK"
                  :max-length="20"
                  tooltip-text="Click to copy API key"
                  copied-tooltip-text="API key copied to clipboard!"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'ClipboardBadge Test',
  requiresAuth: true,
})
</script>
