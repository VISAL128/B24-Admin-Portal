<template>
  <div class="flex flex-col h-full w-full space-y-4 overflow-hidden">
    <!-- Header -->
    <div
      class="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded shadow"
    >
      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          icon="i-lucide-arrow-left"
          size="sm"
          @click="$router.push('/organization/banks')"
        >
          {{ t('back') }}
        </UButton>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('banks.bank_details') }}
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="bank"
          color="primary"
          variant="outline"
          icon="i-lucide-edit"
          size="sm"
          @click="$router.push(`/organization/banks/${bank.id}/edit`)"
        >
          {{ t('banks.edit_bank') }}
        </UButton>
        <UButton
          v-if="bank"
          :color="bank.is_active ? 'error' : 'success'"
          variant="outline"
          :icon="bank.is_active ? 'i-lucide-pause' : 'i-lucide-play'"
          size="sm"
          @click="toggleStatus"
        >
          {{ bank.is_active ? t('banks.deactivate_bank') : t('banks.activate_bank') }}
        </UButton>
      </div>
    </div>

    <!-- Content -->
    <div v-if="loading" class="flex items-center justify-center flex-1">
      <LoadingSpinner />
    </div>

    <div v-else-if="bank" class="flex-1 overflow-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- General Information -->
        <UCard>
          <template #header>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t('banks.general_information') }}
            </h3>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.bank_code') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white font-mono">{{ bank.bank_code }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.bank_short_name') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">{{ bank.bank_short_name }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('banks.bank_name') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white font-semibold">
                {{ bank.name }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.swift_code') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white font-mono">
                  {{ bank.swift_code || '-' }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.is_active') }}
                </label>
                <UBadge :color="bank.is_active ? 'success' : 'error'" variant="subtle">
                  {{ bank.is_active ? t('status.active') : t('status.inactive') }}
                </UBadge>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.country_code') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">{{ bank.country_code }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.currency_code') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">{{ bank.currency }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.is_settlement_bank') }}
                </label>
                <UBadge :color="bank.is_settlement_bank ? 'success' : 'neutral'" variant="subtle">
                  {{ bank.is_settlement_bank ? t('yes') : t('no') }}
                </UBadge>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.is_collection_bank') }}
                </label>
                <UBadge :color="bank.is_collection_bank ? 'success' : 'neutral'" variant="subtle">
                  {{ bank.is_collection_bank ? t('yes') : t('no') }}
                </UBadge>
              </div>
            </div>

            <div v-if="bank.description">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('banks.description') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">{{ bank.description }}</p>
            </div>
          </div>
        </UCard>

        <!-- Account Information -->
        <UCard>
          <template #header>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t('banks.account_information') }}
            </h3>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('banks.account_number') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white font-mono">
                {{ bank.account_number || '-' }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('banks.account_name') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">{{ bank.account_name || '-' }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.branch_name') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">{{ bank.branch_name || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.branch_code') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white font-mono">
                  {{ bank.branch_code || '-' }}
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Contact Information -->
        <UCard>
          <template #header>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t('banks.contact_information') }}
            </h3>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('banks.contact_person') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">{{ bank.contact_person || '-' }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.contact_phone') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">{{ bank.contact_phone || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.contact_email') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">{{ bank.contact_email || '-' }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('banks.address') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">{{ bank.address || '-' }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-if="bank.website_url">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.website_url') }}
                </label>
                <a
                  :href="bank.website_url"
                  target="_blank"
                  class="text-sm text-primary hover:text-primary-dark underline"
                >
                  {{ bank.website_url }}
                </a>
              </div>
              <div v-if="bank.logo">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.logo_url') }}
                </label>
                <div class="flex items-center gap-2">
                  <img
                    :src="bank.logo"
                    :alt="bank.name"
                    class="w-8 h-8 object-contain"
                    @error="
                      (e) => {
                        if (e.target) (e.target as HTMLElement).style.display = 'none'
                      }
                    "
                  />
                  <span class="text-xs text-gray-500">{{ bank.logo }}</span>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Metadata -->
        <UCard>
          <template #header>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t('metadata') }}
            </h3>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.created_at') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ useFormat().formatDateTime(bank.created_at) }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.created_by') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">{{ bank.created_by || '-' }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.updated_at') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ useFormat().formatDateTime(bank.updated_at) }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('banks.updated_by') }}
                </label>
                <p class="text-sm text-gray-900 dark:text-white">{{ bank.updated_by || '-' }}</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <div v-else class="flex items-center justify-center flex-1">
      <div class="text-center">
        <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ t('banks.no_banks_found') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ t('banks.bank_not_found_desc') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBankApi } from '~/composables/api/useBankApi'
import type { Bank } from '~/models/bank'
import { useI18n } from 'vue-i18n'
import { useFormat } from '~/composables/utils/useFormat'
import LoadingSpinner from '~/components/LoadingSpinner.vue'

definePageMeta({
  auth: true,
  breadcrumbs: [
    { label: 'navigation.banks', to: '/organization/banks' },
    { label: 'banks.bank_details', active: true },
  ],
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getBankById, toggleBankStatus } = useBankApi()
const errorHandler = useErrorHandler()
const notification = useNotification()

const bank = ref<Bank | null>(null)
const loading = ref(false)

const bankId = computed(() => route.params.id as string)

const fetchBank = async () => {
  if (!bankId.value) return

  loading.value = true
  try {
    const response = await getBankById(bankId.value)
    bank.value = response
  } catch (error) {
    errorHandler.handleApiError(error)
    router.push('/organization/banks')
  } finally {
    loading.value = false
  }
}

const toggleStatus = async () => {
  if (!bank.value) return

  const newStatus = !bank.value.is_active
  const confirmMessage = newStatus ? t('banks.confirm_activate') : t('banks.confirm_deactivate')

  if (!confirm(confirmMessage)) return

  try {
    const updatedBank = await toggleBankStatus(bank.value.id, newStatus)
    if (updatedBank) {
      bank.value = updatedBank
      notification.showSuccess({
        title: newStatus ? t('banks.bank_activated') : t('banks.bank_deactivated'),
      })
    }
  } catch (error) {
    errorHandler.handleApiError(error)
  }
}

onMounted(() => {
  fetchBank()
})
</script>
