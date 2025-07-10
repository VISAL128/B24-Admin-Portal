<template>
    <UModal :transition="transition" :title="title" :body="body" @close="$emit('close')">
    <UButton label="Open" color="neutral" variant="subtle" v-on:click="onClicked"/>

    <template #body>
      <p>{{ body }}</p>
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
  onClicked?: () => void
}
const props = withDefaults(defineProps<Props>(), {
  transition: false,
  title: t('confirm_button.title'),
  body: t('confirm_button.body'),
  btnLabel: t('confirm_button.confirm'),
  btnColor: 'primary',
  onClicked: () => {}
})
</script>