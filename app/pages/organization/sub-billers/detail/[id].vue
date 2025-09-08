<template>
  <div class="flex flex-col h-[calc(100vh-64px)] space-y-3">
    <!-- Page header (always visible) -->
    <!-- <div class="flex-shrink-0">
      <PageHeader :title="t('sub_biller_detail')" :subtitle="t('sub_biller_detail_description')" />
    </div> -->
    <div class="lg:hidden px-4 pt-3">
      <div class="grid grid-cols-2 gap-1 rounded-xl p-1 bg-gray-100 dark:bg-gray-800">
        <button
          type="button"
          @click="activeTab = 'wallet'"
          :class="[
            'py-2 rounded-lg text-sm font-medium transition',
            activeTab === 'wallet'
              ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-300',
          ]"
        >
          {{ t('wallet') }}
        </button>
        <button
          type="button"
          @click="activeTab = 'details'"
          :class="[
            'py-2 rounded-lg text-sm font-medium transition',
            activeTab === 'details'
              ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-300',
          ]"
        >
          {{ t('details') }}
        </button>
      </div>
    </div>

    <!-- Make this container relative so the floating expand tab can anchor to it -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 relative overflow-hidden">
      <!-- Floating expand tab when collapsed (desktop only) -->

      <!-- SINGLE CARD with Wallets + Table -->
      <section
        :class="[
          'min-h-0 overflow-hidden flex flex-col',
          /* mobile: only show when wallet tab active */
          activeTab === 'wallet' ? 'block' : 'hidden',
          /* desktop: always show as the left pane */
          'lg:flex lg:block flex-1',
        ]"
      >
        <div
          class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col bg-white dark:bg-gray-900"
        >
          <div class="p-4">
            <template v-if="isLoadingWallets">
              <div class="flex gap-4 overflow-x-auto">
                <USkeleton v-for="n in 2" :key="n" class="min-w-[320px] h-44 rounded-2xl" />
              </div>
            </template>

            <template v-else>
              <div
                v-if="wallets.length === 0"
                class="w-full rounded-xl border border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center h-44 text-gray-400 dark:text-gray-500"
              >
                <UIcon name="i-heroicons-banknotes" class="w-10 h-10 mb-2" />
                <span class="text-base font-medium">
                  {{ t('wallet_page.no_wallets_found') }}
                </span>
              </div>

              <!-- Horizontal scroll row -->
              <div v-else class="overflow-x-auto">
                <div class="flex flex-nowrap gap-4 pr-2">
                  <!-- Wallet cards -->
                  <div
                    v-for="(wallet, index) in wallets"
                    :key="wallet.walletId"
                    :class="[
                      'min-w-[320px] rounded-2xl text-white p-6 relative overflow-hidden shadow-lg flex flex-col justify-between h-44',
                      getCardGradientByIndex(index),
                    ]"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="text-xl font-semibold">
                        {{ wallet.bankName }}
                      </div>
                      <UIcon name="i-heroicons-banknotes" class="w-5 h-5 opacity-70" />
                    </div>

                    <div class="flex-1 flex flex-col justify-center items-center text-center">
                      <div class="text-xs opacity-80 tracking-wide uppercase">
                        {{ t('wallet_page.current_balance') }}
                      </div>
                      <div class="text-2xl font-bold tracking-wide mt-1">
                        {{ useCurrency().formatAmount(wallet.balance ?? '0', wallet.currency) }}
                        {{ wallet.currency }}
                      </div>
                    </div>

                    <div class="flex items-center justify-between text-xs text-white opacity-90">
                      <div class="flex flex-col">
                        <span class="opacity-60">
                          {{ t('wallet_page.bank_account_number') }}
                        </span>
                        <div class="flex items-center gap-2 font-mono mt-1">
                          <span class="truncate">
                            {{ wallet.accountNo }}
                          </span>
                          <button
                            class="hover:text-yellow-300 transition"
                            :title="t('wallet_page.copy_account_number')"
                            @click="copyToClipboard(wallet.accountNo ?? '')"
                          >
                            <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div class="flex flex-col items-end text-right">
                        <span class="opacity-60">
                          {{ t('wallet_page.wallet_number') }}
                        </span>
                        <div class="flex items-center gap-2 font-mono mt-1">
                          <span class="truncate">
                            {{ wallet.walletNo }}
                          </span>
                          <button
                            class="hover:text-yellow-300 transition"
                            :title="t('wallet_page.copy_wallet_number')"
                            @click="copyToClipboard(wallet.walletNo ?? '')"
                          >
                            <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Placeholder card -->
                  <div
                    v-if="wallets.length === 1"
                    class="min-w-[320px] h-44 rounded-2xl border-1 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500"
                  >
                    <div class="flex flex-col items-center">
                      <UIcon name="i-heroicons-banknotes" class="w-8 h-8 mb-2" />
                      <span class="text-sm">
                        {{ t('wallet_page.more_wallets_coming') }}
                      </span>
                    </div>
                  </div>

                  <!-- Spacer at end -->
                  <div class="w-2 flex-none"></div>
                </div>
              </div>
            </template>
          </div>

          <div class="flex-1 overflow-auto">
            <template v-if="isLoadingTable">
              <div class="p-4 space-y-2">
                <USkeleton v-for="n in 10" :key="n" class="h-10 w-full rounded" />
              </div>
            </template>
            <template v-else>
              <TablesExTable
                ref="table"
                :columns="columns"
                table-id="sub-biller-transaction-table"
                :fetch-data-fn="fetchTransactions"
                :default-sorting="[{ id: 'tranDate', desc: true }]"
                show-row-number
                show-date-filter
                date-format="dd/MM/yyyy"
                enabled-auto-refresh
                @row-click="handleViewDetails"
              />
            </template>
          </div>
        </div>
      </section>

      <!-- DETAILS (collapsible like sidebar) -->
      <section
        :class="[
          'relative overflow-hidden flex-shrink-0 transition-[width] duration-300 ease-in-out h-full',
          activeTab === 'details' ? 'block' : 'hidden',
          isDetailsCollapsed ? 'lg:w-[48px]' : 'lg:w-[360px]',
          'lg:block w-full',
        ]"
        :aria-hidden="activeTab !== 'details' && !isDetailsCollapsed"
        :aria-expanded="!isDetailsCollapsed"
      >
        <div
          class="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <!-- Expanded header -->
          <div
            v-if="!isDetailsCollapsed"
            class="relative rounded-t-2xl px-8 py-6 flex flex-col items-center justify-center text-center space-y-4 bg-cover bg-center"
            :style="{ backgroundImage: `url('${supplierBackgroundImage}')` }"
          >
            <div
              class="absolute inset-0 backdrop-blur-sm bg-black/20 dark:bg-black/40 w-full h-full pointer-events-none z-0"
            ></div>
            <div class="absolute top-2 right-2 z-10">
              <UPopover placement="bottom-end" :offset="[0, 10]">
                <UButton
                  variant="ghost"
                  size="sm"
                  class="px-2 rounded-full"
                  :aria-label="t('actions')"
                >
                  <UIcon
                    name="i-heroicons-ellipsis-horizontal-20-solid"
                    class="w-5 h-5 text-white"
                  />
                </UButton>
                <template #content>
                  <div class="flex flex-col gap-1 p-2 w-36">
                    <UButton
                      variant="ghost"
                      size="sm"
                      class="justify-start"
                      block
                      @click="openEditModal()"
                    >
                      <UIcon name="i-heroicons-pencil-square-20-solid" class="w-4 h-4 mr-2" />
                      {{ t('edit') }}
                    </UButton>
                    <UButton
                      variant="ghost"
                      size="sm"
                      class="justify-start text-left text-red-600 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                      block
                      @click="isShowDeactivateConfirmModal = true"
                    >
                      <UIcon name="i-heroicons-no-symbol-20-solid" class="w-4 h-4 mr-2" />
                      {{ t('deactivate') }}
                    </UButton>
                  </div>
                </template>
              </UPopover>
            </div>

            <div class="relative z-10 flex flex-col items-center">
              <div
                class="w-24 h-24 border-3 border-white rounded-full overflow-hidden flex items-center justify-center bg-white/10"
              >
                <template v-if="supplierProfileImage">
                  <img
                    :src="supplierProfileImage"
                    alt="Supplier"
                    class="w-full h-full object-cover"
                  />
                </template>
                <template v-else>
                  <UIcon name="material-symbols:home-work-outline" class="w-10 h-10 text-white" />
                </template>
              </div>
              <h4 class="text-2xl font-medium text-white mt-4">
                {{ supplierData?.name ?? '-' }}
              </h4>
            </div>
          </div>

          <!-- Collapsed rail header -->
          <div v-else class="flex-1 flex flex-col items-center justify-start pt-3 gap-2">
            <!-- Avatar as a button to expand -->
            <button
              type="button"
              @click="isDetailsCollapsed = false"
              @keyup.enter="isDetailsCollapsed = false"
              @keyup.space.prevent="isDetailsCollapsed = false"
              :aria-label="t('expand')"
              class="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 cursor-pointer"
            >
              <template v-if="supplierProfileImage">
                <img
                  :src="supplierProfileImage"
                  alt="Supplier"
                  class="w-full h-full object-cover"
                />
              </template>
              <template v-else>
                <div
                  class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                >
                  <UIcon name="material-symbols:home-work-outline" class="w-5 h-5 text-gray-500" />
                </div>
              </template>
            </button>

            <!-- Edit button (icon-only, no background) -->
            <UButton
              variant="ghost"
              size="sm"
              square
              :aria-label="t('edit')"
              @click="openEditModal()"
              class="!p-1 hover:bg-transparent focus:ring-0 text-gray-600 dark:text-white"
            >
              <UIcon name="i-heroicons-pencil-square-20-solid" class="w-5 h-5 mt-2" />
            </UButton>
          </div>

          <!-- Details body (hidden when collapsed) -->
          <div
            v-if="!isDetailsCollapsed"
            class="grid grid-cols-1 gap-8 px-8 pb-20 pt-4 overflow-auto"
          >
            <div class="space-y-0">
              <div
                v-for="(field, index) in supplierOverviewFields"
                :key="index"
                :class="[
                  'flex items-start py-4',
                  index !== supplierOverviewFields.length - 1
                    ? 'border-b border-gray-200 dark:border-gray-700'
                    : '',
                ]"
              >
                <span class="text-sm text-gray-600 dark:text-gray-400 min-w-[120px]">
                  {{ field.label }}
                </span>

                <div class="flex-1 text-right">
                  <TransactionTypeBadge
                    v-if="field.type === 'badge'"
                    :transaction-type="field.value"
                    size="sm"
                  />
                  <span
                    v-else-if="field.type === 'amount'"
                    class="text-sm text-gray-900 dark:text-white"
                  >
                    {{ field.value }}
                  </span>
                  <ClipboardBadge
                    v-else-if="field.type === 'code' && field.copyable"
                    :text="field.rawValue || field.value"
                    :copied-tooltip-text="$t('clipboard.copied')"
                  />
                  <span
                    v-else
                    :class="[
                      'text-sm text-gray-900 dark:text-white',
                      field.type === 'code' ? 'font-mono break-all' : '',
                    ]"
                  >
                    {{ field.value }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom icon-only toggle (no background) -->
          <div
            class="absolute bottom-2 left-0 right-0 hidden lg:flex"
            :class="isDetailsCollapsed ? 'flex justify-center' : 'flex justify-start pl-2'"
          >
            <UButton
              size="sm"
              variant="ghost"
              square
              :icon="isDetailsCollapsed ? 'lucide:panel-left-close' : 'lucide:panel-left-open'"
              :aria-label="isDetailsCollapsed ? t('expand') : t('collapse')"
              @click="toggleDetails()"
              class="rounded-full !p-2 hover:bg-transparent focus:ring-0 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </section>
    </div>

    <UModal
      v-model:open="isShowDeactivateConfirmModal"
      :title="t('confirmation')"
      :transition="true"
      :fullscreen="false"
    >
      <template #body>
        <p class="text-sm">
          {{ t('deactivate_subbiller_confirmation') }}
        </p>
      </template>

      <template #footer>
        <div class="w-full flex justify-end gap-2">
          <UButton
            :label="t('cancel')"
            color="neutral"
            variant="outline"
            size="sm"
            @click="isShowDeactivateConfirmModal = false"
          />
          <UButton
            :label="t('confirm')"
            color="error"
            size="sm"
            :loading="isDeactivating"
            @click="confirmDeactivateSubBiller"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isShowEditModal"
      :title="t('edit')"
      :transition="true"
      :fullscreen="false"
      :close="{ class: 'rounded-full', onClick: () => {} }"
    >
      <template #header="{ close }">
        <div class="flex items-center justify-between w-full">
          <h3 class="text-base font-semibold">
            {{ t('edit') }}
          </h3>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-x-mark-20-solid"
              color="neutral"
              variant="ghost"
              size="md"
              @click="close"
            />
          </div>
        </div>
      </template>
      <template #body>
        <div class="space-y-6">
          <!-- Profile image section -->
          <div
            class="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40"
          >
            <div class="relative">
              <img
                v-if="avatarPreview"
                :src="avatarPreview"
                alt="Logo"
                class="w-20 h-20 rounded-full object-cover border border-white shadow"
              />
              <div
                v-else
                class="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500"
              >
                <UIcon name="material-symbols:home-work-outline" class="w-8 h-8" />
              </div>

              <!-- camera button -->
              <button
                type="button"
                class="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow hover:bg-gray-50"
                @click="triggerAvatarPick"
                :title="t('change_logo')"
              >
                <UIcon name="i-heroicons-camera" class="w-4 h-4" />
              </button>

              <!-- remove button -->
              <button
                v-if="avatarPreview"
                type="button"
                class="absolute -top-1 -right-1 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow hover:bg-white"
                @click="removeAvatar"
                :title="t('remove_logo')"
              >
                <UIcon name="i-heroicons-x-mark-20-solid" class="w-4 h-4" />
              </button>

              <input
                ref="avatarInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onAvatarSelected"
              />
            </div>

            <div class="flex-1">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('logo_recommendation') }} • 512×512 PNG/JPG • &lt; 2MB
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="grid grid-cols-2 gap-4 w-full">
            <!-- Row 1 -->
            <div class="min-w-0">
              <label for="edit-name" class="block text-xs font-medium mb-1">
                {{ t('name') }} <span class="text-red-500">*</span>
              </label>
              <UFormGroup :error="formErrors.name" :required="true">
                <UInput
                  id="edit-name"
                  v-model="editForm.name"
                  :placeholder="t('enter_name')"
                  size="md"
                  icon="i-heroicons-user-20-solid"
                  autocomplete="organization"
                  :ui="{ base: 'rounded-xl' }"
                  input-class="px-3 py-2.5 w-full"
                  required
                  aria-required="true"
                />
              </UFormGroup>
            </div>

            <div class="min-w-0">
              <label for="edit-code" class="block text-xs font-medium mb-1">
                {{ t('code') }}
              </label>
              <UFormGroup :error="formErrors.syncCode" help="Managed by system">
                <UInput
                  id="edit-code"
                  v-model="editForm.syncCode"
                  size="md"
                  icon="i-heroicons-hashtag-20-solid"
                  readonly
                  disabled
                  :ui="{ base: 'rounded-xl text-gray-500 dark:text-gray-400' }"
                  input-class="px-3 py-2.5 w-full"
                />
              </UFormGroup>
            </div>

            <!-- Row 2 -->
            <div class="min-w-0">
              <label for="edit-phone" class="block text-xs font-medium mb-1">
                {{ t('settlement.generate.form.phone') }}
              </label>
              <UFormGroup :error="formErrors.phone">
                <UInput
                  id="edit-phone"
                  v-model="editForm.phone"
                  :placeholder="t('enter_phone')"
                  size="md"
                  icon="i-heroicons-phone-20-solid"
                  inputmode="tel"
                  autocomplete="tel"
                  maxlength="20"
                  :ui="{ base: 'rounded-xl' }"
                  input-class="px-3 py-2.5 w-full"
                />
              </UFormGroup>
            </div>

            <div class="min-w-0">
              <label for="edit-email" class="block text-xs font-medium mb-1">
                {{ t('settlement.generate.form.email') }}
              </label>
              <UFormGroup :error="formErrors.email">
                <UInput
                  id="edit-email"
                  v-model="editForm.email"
                  :placeholder="t('enter_email')"
                  type="email"
                  size="md"
                  icon="i-heroicons-envelope-20-solid"
                  autocomplete="email"
                  :ui="{ base: 'rounded-xl' }"
                  input-class="px-3 py-2.5 w-full"
                />
              </UFormGroup>
            </div>

            <!-- Row 3 -->
            <div class="min-w-0">
              <label for="edit-tin" class="block text-xs font-medium mb-1">
                {{ t('tin') }}
              </label>
              <UFormGroup :error="formErrors.tinNumber">
                <UInput
                  id="edit-tin"
                  v-model="editForm.tinNumber"
                  :placeholder="t('enter_tin')"
                  size="md"
                  icon="i-heroicons-identification-20-solid"
                  maxlength="30"
                  :ui="{ base: 'rounded-xl' }"
                  input-class="px-3 py-2.5 w-full"
                />
              </UFormGroup>
            </div>

            <div class="min-w-0">
              <label for="edit-address" class="block text-xs font-medium mb-1">
                {{ t('settlement.generate.form.address') }}
              </label>
              <UFormGroup :error="formErrors.address">
                <UInput
                  id="edit-address"
                  v-model="editForm.address"
                  :placeholder="t('enter_address')"
                  size="md"
                  icon="i-heroicons-map-pin-20-solid"
                  :ui="{ base: 'rounded-xl' }"
                  input-class="px-3 py-2.5 w-full"
                />
              </UFormGroup>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="w-full flex flex-row justify-end gap-2">
          <UButton
            :label="t('cancel')"
            color="neutral"
            variant="outline"
            size="sm"
            class="w-20 justify-center"
            @click="isShowEditModal = false"
            :disabled="isSavingEdit"
          />
          <UButton
            :label="t('save')"
            color="primary"
            size="sm"
            class="w-24 justify-center"
            :loading="isSavingEdit"
            @click="handleSaveEdit"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ClipboardBadge from '~/components/buttons/ClipboardBadge.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import TablesExTable from '~/components/tables/ExTable.vue'
import type { BaseTableColumn } from '~/components/tables/table'
import TransactionTypeBadge from '~/components/TransactionTypeBadge.vue'
import { usePgwModuleApi } from '~/composables/api/usePgwModuleApi'
import { useTransactionApi } from '~/composables/api/useTransactionApi'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import type { QueryParams } from '~/models/baseModel'
import type { SubBillerWallet, DeactivateSubBillerReq } from '~/models/subBiller'
import type { Supplier } from '~/models/supplier'
import type { TransactionHistoryRecord, WalletTransaction } from '~/models/transaction'
import { FilterOperatorPgwModule } from '~/utils/enumModel'
import { useMediaQuery } from '@vueuse/core'

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'sub_biller', to: '/organization/sub-billers' },
    { label: 'details', active: true },
  ],
})

const { t } = useI18n()

/** Tabs & active tab (already existed) */
const tabs = [
  { label: t('wallet'), value: 'wallet' },
  { label: t('details'), value: 'details' },
]
const activeTab = ref('wallet')

const route = useRoute()
const notification = useNotification()

const transactionId = computed(() => route.params.id as string)
const showDownloadModal = ref(false)
const page = ref(1)
const pageSize = ref<{ label: string; value: number }>({ label: '10', value: 10 })
const total = ref(0)
const totalPage = ref(0)
const search = ref('')
const startDate = ref('')
const endDate = ref('')
const transactions = ref<TransactionHistoryRecord[]>([])
const errorMsg = ref('')
const router = useRouter()
const { copy } = useClipboard()
const { showSuccess } = useNotification()
const { createSortableHeader } = useTable()
const isLoadingSupplier = ref(true)
const isLoadingWallets = ref(true)
const isLoadingTable = ref(true)

/** collapse state (desktop only) */
const isDetailsCollapsed = ref(false)
const isDesktop = useMediaQuery('(min-width: 1024px)') // Tailwind lg breakpoint
const toggleDetails: (e?: MouseEvent) => void = () => {
  isDetailsCollapsed.value = !isDetailsCollapsed.value
}
const isShowEditModal = ref(false)
const isSavingEdit = ref(false)

type EditForm = {
  name: string
  syncCode: string
  phone: string
  email: string
  tinNumber: string
  address: string
}

const editForm = ref<EditForm>({
  name: '',
  syncCode: '',
  phone: '',
  email: '',
  tinNumber: '',
  address: '',
})

const formErrors = ref<Record<string, string | null>>({
  name: null,
  syncCode: null,
  phone: null,
  email: null,
  tinNumber: null,
  address: null,
})

// avatar state/refs
const avatarInputRef = ref<HTMLInputElement | null>(null)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

const triggerAvatarPick = () => avatarInputRef.value?.click()

const onAvatarSelected = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files[0]) return
  const file = files[0]

  // basic checks
  if (file.size > 2 * 1024 * 1024) {
    notification.showWarning({ title: t('file_too_large'), description: t('max_2mb') })
    return
  }

  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = () => (avatarPreview.value = String(reader.result || ''))
  reader.readAsDataURL(file)
}

const isActionMenuOpen = ref(false)

const actionsMenuFlat = [
  {
    label: t('edit'),
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => openEditModal(),
  },
  {
    label: t('deactivate'),
    icon: 'i-heroicons-no-symbol-20-solid',
    class: 'text-red-600',
    click: () => {
      isShowDeactivateConfirmModal.value = true
    },
  },
]

const removeAvatar = () => {
  avatarFile.value = null
  avatarPreview.value = null
  if (avatarInputRef.value) avatarInputRef.value.value = ''
}

// seed form + image when opening
const openEditModal = () => {
  const s = supplierData.value
  editForm.value = {
    name: s?.name ?? '',
    syncCode: s?.syncCode ?? '',
    phone: s?.phone ?? '',
    email: s?.email ?? '',
    tinNumber: s?.tinNumber ?? '',
    address: s?.address ?? '',
  }
  // image preview (use existing logo if any)
  avatarFile.value = null
  avatarPreview.value = supplierProfileImage.value || null

  Object.keys(formErrors.value).forEach((k) => (formErrors.value[k] = null))
  isShowEditModal.value = true
}

// replace the whole function with this
const uploadImageAndGetUrl = async (file: File): Promise<string> => {
  const res = await uploadFile(file) // POST multipart
  if (!res || res.code !== 'SUCCESS') {
    // show the backend’s message (Khmer if you like)
    notification.showError({
      title: t('failed'),
      description: res?.message || t('failed_to_upload_file'),
    })
    throw new Error(res?.message || 'Upload failed')
  }
  return res.data?.url || ''
}

const isShowDeactivateConfirmModal = ref(false)
const isDeactivating = ref(false)

const confirmDeactivateSubBiller = async () => {
  try {
    isDeactivating.value = true
    await deactivateSubBiller({
      subBillerId: supplierData?.value?.id ?? '',
    })
    notification.showSuccess({
      title: t('success'),
      description: t('sub_biller_deactivated_successfully'),
    })
    isShowDeactivateConfirmModal.value = false
    router.replace(`/organization/sub-billers`)
  } catch (err) {
    console.error('Deactivate sub-biller failed:', err)
    notification.showError({
      title: t('failed'),
      description: t('failed_to_deactivate_sub_biller'),
    })
  } finally {
    isDeactivating.value = false
  }
}

function safeParseJson<T extends object = Record<string, unknown>>(s?: string | null): T {
  try {
    return s ? (JSON.parse(s) as T) : ({} as T)
  } catch {
    return {} as T
  }
}

const handleSaveEdit = async () => {
  if (!validateEditForm()) {
    notification.showError({
      title: t('notifications.error'),
      description: t('name_required'),
    })
    return
  }
  try {
    isSavingEdit.value = true
    const id = transactionId.value
    const current = supplierData.value
    const currExt = safeParseJson(current?.extData)

    // 1) Decide logoUrl action
    let logoUrl: string | null = null
    if (avatarFile.value) {
      logoUrl = await uploadImageAndGetUrl(avatarFile.value) // set new logo
    } else if (avatarPreview.value === null) {
      logoUrl = '' // explicit clear
    } // else: null means keep existing

    if (logoUrl !== null) {
      if (logoUrl === '') {
        delete currExt.logo
      } else {
        currExt.logo = logoUrl
      }
    }
    // 2) Build the request from existing Supplier to avoid losing fields
    const request: Supplier = {
      ...(current ?? ({} as Supplier)),
      id: current?.id ?? id,
      name: editForm.value.name,
      syncCode: editForm.value.syncCode || null,
      phone: editForm.value.phone || null,
      email: editForm.value.email || null,
      tinNumber: editForm.value.tinNumber || null,
      address: editForm.value.address || null,
      extData: JSON.stringify(currExt), // ✅ persist logo in extData
    }

    // 3) ✅ Update via API
    const updated = await updateSubBiller(request)

    // 4) Refresh UI (use API return if it returns Supplier, otherwise refetch)
    if (updated) {
      supplierData.value = updated.data as unknown as Supplier
    } else {
      await fetchSubBillerById()
    }

    isShowEditModal.value = false
    notification.showSuccess({
      title: t('success'),
      description: t('updated_sub_biller_success'),
    })
  } catch (err) {
    console.error('Save sub-biller failed:', err)
    notification.showError({
      title: t('failed'),
      description: t('failed_to_save_changes'),
    })
  } finally {
    isSavingEdit.value = false
  }
}

// simple validations
const validateEditForm = (): boolean => {
  let ok = true
  Object.keys(formErrors.value).forEach((k) => (formErrors.value[k] = null))

  if (!editForm.value.name?.trim()) {
    formErrors.value.name = t('validation.required') as string
    ok = false
  }

  if (editForm.value.email?.trim()) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.value.email)
    if (!emailOk) {
      formErrors.value.email = t('validation.invalid_email') as string
      ok = false
    }
  }

  return ok
}

const { getTransactionStatusTranslationKey } = useStatusBadge()

const getCardGradientByIndex = (index: number): string | undefined => {
  const gradients: string[] = [
    'bg-gradient-to-r from-blue-500 to-blue-500',
    'bg-gradient-to-r from-yellow-500 to-orange-500',
    'bg-gradient-to-r from-gray-500 to-gray-500',
    'bg-gradient-to-r from-pink-500 to-rose-500',
    'bg-gradient-to-r from-purple-500 to-indigo-500',
    'bg-gradient-to-r from-green-500 to-emerald-500',
    'bg-gradient-to-r from-red-500 to-orange-400',
    'bg-gradient-to-r from-teal-500 to-cyan-500',
    'bg-gradient-to-r from-fuchsia-500 to-pink-600',
  ]
  const safeIndex = index % gradients.length
  return gradients[safeIndex]
}

const handleViewDetails = (record: WalletTransaction) => {
  navigateToDetails(record.tranId)
}

// Handle Repush Transaction
const handleRepush = () => {
  notification.showWarning({
    title: t('pages.transaction.info'),
    description: t('pages.transaction.info_des'),
  })
}

const navigateToDetails = (rowId: string) => {
  router.push(`/transactions/detail/${rowId}`)
}

const transactionTypeFilterOptions = computed(() =>
  Object.entries(TransactionType)
    .filter(
      ([key, value]) =>
        value === TransactionType.WalletPayment || value === TransactionType.WalletTopup
    )
    .map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, ' $1').trim(),
      value: value,
    }))
)

const getTranslatedTransactionStatusLabel = (status: string) => {
  const key = getTransactionStatusTranslationKey(status)
  const translated = t(key)
  return translated !== key ? translated : status.charAt(0).toUpperCase() + status.slice(1)
}

const transactionStatusFilterOptions = computed(() =>
  Object.values(TransactionStatus).map((status) => ({
    label: getTranslatedTransactionStatusLabel(status),
    value: status,
  }))
)

const copyCell = (text?: string | null) =>
  h(
    'div',
    {
      class: 'inline-flex items-center',
      onClick: (e: MouseEvent) => e.stopPropagation(),
      onMousedown: (e: MouseEvent) => e.stopPropagation(),
    },
    [
      h(ClipboardBadge, {
        text: text ?? '-',
        copiedTooltipText: t('clipboard.copied'),
      }),
    ]
  )

const wallets = ref<SubBillerWallet[]>([])

const walletFilterOptions = computed(() =>
  wallets.value.map((w) => ({ label: w.accountNo ?? '-', value: w.walletId ?? '' }))
)
const columns = ref<BaseTableColumn<WalletTransaction>[]>([])

function buildColumns() {
  columns.value = [
    {
      id: 'tranDate',
      accessorKey: 'tranDate',
      headerText: t('pages.transaction.created_date'),
      cell: ({ row }) => useFormat().formatDateTime(row.original.tranDate),
      enableSorting: true,
    },
    {
      id: 'transactionNo',
      accessorKey: 'transactionNo',
      headerText: t('wallet_page.transaction_no'),
      cell: ({ row }) => copyCell(row.original.transactionNo),
      enableHiding: false,
    },

    {
      id: 'bankRefId',
      accessorKey: 'bankRefId',
      headerText: t('pages.transaction.bank_ref'),
      cell: ({ row }) => copyCell(row.original.bankRefId),
      enableSorting: true,
    },
    {
      id: 'wallet',
      accessorKey: 'wallet',
      headerText: t('wallet'),
      cell: ({ row }) => row.original.wallet || '-',
      enableColumnFilter: true,
      filterType: 'select',
      filterOptions: walletFilterOptions.value,
    },
    {
      id: 'tranType',
      accessorKey: 'tranType',
      headerText: t('transaction_type'),
      cell: ({ row }) => {
        const group = groupByTranType(row.original.tranType as TransactionType)
        if (group !== null) {
          // Convert enum number to readable string and format it nicely
          const groupName = TranTypeGroup[group]
          if (groupName) {
            // Get display text
            let displayText = ''
            if (groupName === 'DeeplinkCheckout') {
              displayText = 'Deeplink/Checkout'
            } else {
              // Convert camelCase to readable format (e.g., "PayBill" → "Pay Bill")
              displayText = groupName.replace(/([A-Z])/g, ' $1').trim()
            }

            // Create element with icon and text
            return h('div', { class: 'flex items-center gap-2' }, [
              h(
                'div',
                {
                  class: `w-6 h-6 rounded-full flex items-center justify-center ${getTranTypeGroupIconStyle(group)}`,
                },
                [
                  h(resolveComponent('UIcon'), {
                    name: getTranTypeGroupIcon(group),
                    class: `w-3 h-3 ${getTranTypeGroupIconColor(group)}`,
                  }),
                ]
              ),
              h('span', { class: 'text-sm' }, displayText),
            ])
          }
        }
        return row.original.tranType || '-'
      },
      enableSorting: true,
      enableColumnFilter: true,
      filterOptions: transactionTypeFilterOptions.value,
    },
    {
      id: 'status',
      headerText: t('status.header'),
      cell: ({ row }) =>
        h(StatusBadge, {
          status: row.original.status,
          variant: 'subtle',
          size: 'sm',
        }),
      enableColumnFilter: true,
      filterType: 'status',
      filterOptions: transactionStatusFilterOptions.value,
    },
    {
      id: 'currencyId',
      accessorKey: 'currencyId',
      headerText: t('settlement.currency'),
      cell: ({ row }) => h('div', { class: 'text-left' }, row.original.currencyId || '-'),
      enableColumnFilter: true,
      filterOptions: [
        { label: t('currency.usd'), value: 'USD' },
        { label: t('currency.khr'), value: 'KHR' },
      ],
      enableHiding: false,
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      headerText: t('total_amount'),
      cell: ({ row }) =>
        h(
          'div',
          { class: 'text-right' },
          useCurrency().formatAmount(row.original.amount, row.original.currencyId)
        ),
      enableMultiSort: true,
      enableSorting: true,
      size: 50,
      maxSize: 150,
      enableHiding: false,
    },
  ]
}

const {
  getSubBillerById,
  getSubBillerWalletList,
  deactivateSubBiller,
  updateSubBiller,
  uploadFile,
  getWalletTransactionBySubBiller,
} = usePgwModuleApi()
const { getTransactionList } = useTransactionApi()

const {
  getTranTypeGroupIcon,
  getTranTypeGroupIconStyle,
  getTranTypeGroupIconColor,
  groupByTranType,
  tranTypesByGroup,
} = useTransactionTypeIcon()

const supplierData = ref<Supplier | null>(null)

const fetchSubBillerById = async () => {
  try {
    const id = transactionId.value
    if (!id) return

    const response = await getSubBillerById(id)
    supplierData.value = response
  } catch (error) {
    console.error('Error fetching sub biller detail:', error)
    errorMsg.value = t('failed_to_load_data')
  }
}

const errorHandler = useErrorHandler()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    showSuccess({ title: t('wallet_page.copy_success_message') })
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

const fetchWallets = async () => {
  try {
    const id = transactionId.value
    if (!id) return

    const response = await getSubBillerWalletList(id)
    wallets.value = response.data ?? []
  } catch (error) {
    console.error('Error fetching wallets:', error)
    errorMsg.value = t('failed_to_load_wallets')
  }
}

// Push Back Transaction Data (kept from your snippet)
const webhookHistoryData = ref([
  {
    id: 'pushback-001',
    transactionId: 'TXN-20240722001',
    action: 'push back',
    date: '2024-07-22T10:30:00+07:00',
    status: 'Failed',
    retrying: false,
  },
  {
    id: 'pushback-002',
    transactionId: 'TXN-20240722001',
    action: 'push back',
    date: '2024-07-22T11:00:00+07:00',
    status: 'Success',
    retrying: false,
  },
])

const retryPushBack = (id: string) => {
  const item = webhookHistoryData.value.find((x) => x.id === id)
  if (!item) return

  item.retrying = true
  notification.showInfo({
    title: 'Retry Push Back',
    description: `Retrying push back for ID ${id}...`,
  })

  setTimeout(() => {
    item.status = 'Success'
    item.retrying = false
    notification.showSuccess({
      title: 'Push Back Success',
      description: `Push back for ID ${id} has been resent successfully.`,
    })
  }, 1500)
}

const webhookColumns = [
  {
    id: 'actions',
    header: () => 'Actions',
    cell: ({ row }: any) =>
      h('div', { class: 'relative inline-block group' }, [
        h(
          'button',
          {
            class: `
                inline-flex items-center justify-center w-8 h-8 rounded transition-colors
                ${
                  row.original.retrying
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:text-gray-500 dark:bg-gray-800'
                    : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                }
              `,
            disabled: row.original.retrying,
            onClick: () => retryPushBack(row.original.id),
            title: row.original.retrying ? 'Retrying...' : 'Retry Push Back',
          },
          [
            row.original.retrying
              ? h('svg', {
                  class: 'animate-spin h-4 w-4',
                  xmlns: 'http://www.w3.org/2000/svg',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  innerHTML: `
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    `,
                })
              : h('svg', {
                  class: 'w-4 h-4',
                  xmlns: 'http://www.w3.org/2000/svg',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  'stroke-width': '1.5',
                  stroke: 'currentColor',
                  innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />`,
                }),
          ]
        ),
      ]),
    size: 80,
  },
  {
    id: 'date',
    header: () => 'Date',
    accessorKey: 'date',
    cell: ({ row }: any) => {
      const date = new Date(row.original.date)
      return h(
        'span',
        {},
        date.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      )
    },
    size: 180,
  },
  {
    id: 'status',
    header: () => 'Status',
    accessorKey: 'status',
    cell: ({ row }: any) =>
      h(StatusBadge, {
        status: row.original.status,
        variant: 'subtle',
        size: 'md',
      }),
    size: 120,
  },
]

const supplierInitials = computed(() => {
  const name = supplierData.value?.name?.trim() || ''
  if (!name) return 'SP'
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const supplierProfileImage = computed(() => {
  try {
    const ext = supplierData.value?.extData ? JSON.parse(supplierData.value?.extData) : {}
    return ext?.logo || null // return null so v-if falls back to icon
  } catch {
    return null
  }
})

const supplierBackgroundImage = computed(() => {
  try {
    const ext = supplierData.value?.extData ? JSON.parse(supplierData.value?.extData) : {}
    return ext.logo || 'https://i.pinimg.com/736x/3c/24/46/3c24462450c2a902bf7e18f3d9aada81.jpg'
  } catch {
    return 'https://i.pinimg.com/736x/3c/24/46/3c24462450c2a902bf7e18f3d9aada81.jpg'
  }
})

const getTransactionTypeKey = (value: string): string => {
  const entry = Object.entries(TransactionType).find(([key, val]) => val === value)
  return entry ? entry[0] : value
}

const fetchTransactions = async (
  params?: QueryParams
): Promise<{
  data: WalletTransaction[]
  total_record: number
  total_page: number
} | null> => {
  try {
    params?.filters.push({
      field: 'subBillerId',
      operator: FilterOperatorPgwModule.Equals,
      value: transactionId.value,
    })

    // sort tranDate by default if not set
    if (params?.sortAsString == '') {
      params?.sorts?.push({
        field: 'tranDate',
        direction: 'desc',
      })
      params.sortAsString = 'tranDate-'
    }

    console.log('Fetching transactions with params:', params)
    const response = await getWalletTransactionBySubBiller(params)
    console.log('Fetched transactions:', response)
    return {
      data: response.results || [],
      total_record: response.param?.rowCount || 0,
      total_page: response.param?.pageCount || 0,
    }
  } catch (error) {
    errorHandler.handleApiError(error)
    return null
  }
}

const fetchTransactionHistory = async (
  params?: QueryParams
): Promise<{
  data: TransactionHistoryRecord[]
  total_record: number
  total_page: number
} | null> => {
  try {
    params?.filters.push({
      field: 'subBillerId',
      operator: FilterOperatorPgwModule.Equals,
      value: transactionId.value,
    })
    const response = await getTransactionList(params)
    console.log('Fetched transactions:', response)
    return {
      data: response.results || [],
      total_record: response.param?.rowCount || 0,
      total_page: response.param?.pageCount || 0,
    }
  } catch (error) {
    errorHandler.handleApiError(error)
    return null
  }
}

const supplierOverviewFields = computed(() => [
  {
    label: 'Code',
    value: supplierData.value?.syncCode ?? '-',
    type: 'code',
    copyable: true,
    rawValue: supplierData.value?.syncCode,
  },
  { label: 'Phone', value: supplierData.value?.phone || '-', type: 'text' },
  { label: 'Email', value: supplierData.value?.email || '-', type: 'text' },
  { label: 'Address', value: supplierData.value?.address || '-', type: 'text' },
  { label: 'TIN', value: supplierData.value?.tinNumber || '-', type: 'text' },
  { label: 'Status', value: supplierData.value?.isActive ? 'Active' : 'Inactive', type: 'badge' },
])

// Download functions
const download = async () => {
  showDownloadModal.value = true
}

onMounted(async () => {
  isLoadingSupplier.value = true
  isLoadingWallets.value = true
  isLoadingTable.value = true

  await Promise.all([
    fetchSubBillerById().finally(() => (isLoadingSupplier.value = false)),
    fetchWallets().finally(() => {
      isLoadingWallets.value = false
      buildColumns()
    }),
  ])

  isLoadingTable.value = false
})

// auto expand when leaving desktop
watch(isDesktop, (val) => {
  if (!val) {
    isDetailsCollapsed.value = false
  }
})
</script>
