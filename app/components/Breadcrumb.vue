<script setup lang="ts">
import type { BreadcrumbItem } from '#ui/components/Breadcrumb.vue'
import appConfig from '~~/app.config'

interface BreadcrumbMeta {
  label: string
  to?: string
  active?: boolean
}

interface Props {
  showBackButton?: boolean
  backButtonText?: string
  onBack?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  showBackButton: true, // Changed to true by default
  backButtonText: 'back',
  onBack: undefined,
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const pageBreadcrumbs = computed(() => {
  return (route.meta.breadcrumbs as BreadcrumbMeta[]) || []
})

const items = computed<BreadcrumbItem[]>(() => {
  return pageBreadcrumbs.value.map((item: BreadcrumbMeta) => ({
    label: t(item.label) || item.label,
    to: item.to,
    active: item.active || false,
  }))
})

const handleBack = () => {
  if (props.onBack) {
    props.onBack()
  } else {
    router.back()
  }
}

// Smart back button visibility - show for detail pages, hide for index pages
const shouldShowBackButton = computed(() => {
  if (!props.showBackButton) return false

  // Don't show on root/home pages
  if (route.path === '/' || route.path === '/dashboard') return false

  // Don't show on index/list pages (routes ending with just the module name)
  const isIndexPage =
    route.path.match(/^\/[^\/]+\/?$/) ||
    route.path.endsWith('/index') ||
    route.path === '/transactions' ||
    route.path === '/settlements' ||
    route.path === '/users' ||
    route.path === '/organization/banks' ||
    route.path === '/organization/sub-billers' ||
    route.path.match(/^\/[^\/]+\/[^\/]+\/?$/) // Two-level routes like /organization/banks

  if (isIndexPage) return false

  // Show on detail pages (routes with additional path segments beyond index level)
  const isDetailPage =
    route.path.includes('/detail/') ||
    route.path.includes('/edit/') ||
    route.path.includes('/view/') ||
    route.path.includes('/create/') ||
    route.path.match(/\/[^\/]+\/[^\/]+\/[^\/]+/) // Has at least 3 segments like /organization/banks/123

  // Show if it's a detail page and has breadcrumbs with navigation
  return (
    isDetailPage &&
    pageBreadcrumbs.value.length > 0 &&
    pageBreadcrumbs.value.some((item) => item.to)
  )
})
</script>

<template>
  <div class="flex items-center space-x-3">
    <!-- Back Button -->
    <UButton
      v-if="shouldShowBackButton"
      variant="soft"
      size="sm"
      icon="i-lucide-arrow-left"
      class="sm:inline-flex"
      @click="handleBack"
    />

    <!-- Breadcrumb -->
    <UBreadcrumb
      :items="items"
      class="text-lg"
      :class="{
        'opacity-0': !pageBreadcrumbs.length,
      }"
      :ui="appConfig.ui.breadcrumb.slots"
    >
      <template #separator>
        <span class="text-muted">/</span>
      </template>
    </UBreadcrumb>
  </div>
</template>
