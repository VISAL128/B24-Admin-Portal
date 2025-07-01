<template>
    <UModal :transition="transition" :title="title" :body="body" @close="$emit('close')">
    <UButton label="Open" color="neutral" variant="subtle" />

    <template #body>
      <Placeholder class="h-48" />
    </template>
  </UModal>
</template>

<script setup lang="ts">

const { t } = useI18n()

interface Props {
  transition?: boolean
  title?: string
  body?: string
  btnLabel?: string
  btnColor?: string
}
const props = withDefaults(defineProps<Props>(), {
  transition: false,
  title: t('confirm_button.title'),
  body: t('confirm_button.body'),
  btnLabel: t('confirm_button.confirm'),
  btnColor: 'primary'
})
</script>