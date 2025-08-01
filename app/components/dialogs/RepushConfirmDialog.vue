<template>
  <UModal v-model="modelValue" title="Repush Transaction">
    <div class="space-y-4">
      <p>Are you sure you want to repush this transaction?</p>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" @click="$emit('update:modelValue', false)">Cancel</UButton>
        <UButton color="primary" @click="confirm">OK</UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const confirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}
</script>
