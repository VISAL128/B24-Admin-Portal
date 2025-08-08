<template>
  <div class="flex flex-col h-full w-full space-y-6">
    <!-- Page Header with Status -->
    <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <UIcon name="material-symbols:receipt-long-outline" class="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              Void Payment Request
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Transaction ID: {{ transactionId }}
            </p>
          </div>
        </div>
        <StatusBadge :status="voidPaymentResponse.status" variant="subtle" size="lg" />
      </div>
      
      <!-- Horizontal Timeline -->
      <div class="mt-6">
        <div class="flex items-center justify-between relative">
          <!-- Progress Line -->
          <div class="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 dark:bg-gray-700">
            <div 
              class="h-full bg-blue-500 transition-all duration-500"
              :style="{ width: getProgressWidth() }"
            ></div>
          </div>
          
          <!-- Timeline Steps -->
          <div class="flex items-center justify-between w-full relative z-10">
            <!-- Requested Step -->
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500 text-white">
                <UIcon name="material-symbols:schedule" class="w-5 h-5" />
              </div>
              <div class="mt-2 text-center">
                <p class="text-xs font-medium text-gray-900 dark:text-white">Requested</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ format.formatDateTime(voidPaymentResponse.requestDate, { dateStyle: 'short', timeStyle: 'short' }) }}
                </p>
              </div>
            </div>
            
            <!-- Processing Step -->
            <div class="flex flex-col items-center">
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                :class="getStepClass('processing')"
              >
                <UIcon name="material-symbols:hourglass-empty" class="w-5 h-5" />
              </div>
              <div class="mt-2 text-center">
                <p class="text-xs font-medium text-gray-900 dark:text-white">Processing</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">In Review</p>
              </div>
            </div>
            
            <!-- Completed Step -->
            <div class="flex flex-col items-center">
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                :class="getStepClass('completed')"
              >
                <UIcon 
                  :name="voidPaymentResponse.status === 'accepted' ? 'material-symbols:check' : 'material-symbols:close'" 
                  class="w-5 h-5" 
                />
              </div>
              <div class="mt-2 text-center">
                <p class="text-xs font-medium text-gray-900 dark:text-white">
                  {{ voidPaymentResponse.status === 'accepted' ? 'Approved' : voidPaymentResponse.status === 'rejected' ? 'Rejected' : 'Pending' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ voidPaymentResponse.actionDate ? format.formatDateTime(voidPaymentResponse.actionDate, { dateStyle: 'short', timeStyle: 'short' }) : '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Transaction Details Card -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <UIcon name="material-symbols:receipt-outline" class="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          Transaction Details
        </h3>
        
        <div class="space-y-4">
          <!-- Bank Information -->
          <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-sm text-gray-600 dark:text-gray-400">Bank</span>
            <div class="flex items-center space-x-2">
              <UAvatar
                :src="voidPaymentResponse.bankLogo"
                :alt="voidPaymentResponse.bankName"
                size="sm"
              />
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ voidPaymentResponse.bankName }}
              </span>
            </div>
          </div>
          
          <!-- Bank Reference -->
          <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-sm text-gray-600 dark:text-gray-400">Bank Reference</span>
            <ClipboardBadge
              :text="voidPaymentResponse.bankRef"
              :copied-tooltip-text="$t('clipboard.copied')"
            />
          </div>
          
          <!-- Transaction Date -->
          <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-sm text-gray-600 dark:text-gray-400">Transaction Date</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ format.formatDateTime(voidPaymentResponse.transactionDate, { dateStyle: 'medium', timeStyle: 'short' }) }}
            </span>
          </div>
          
          <!-- Total Amount -->
          <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-sm text-gray-600 dark:text-gray-400">Total Amount</span>
            <span class="text-lg font-bold text-red-600 dark:text-red-400">
              {{ useCurrency().formatAmount(voidPaymentResponse.totalAmount) }} {{ voidPaymentResponse.currency }}
            </span>
          </div>
          
          <!-- Biller Name -->
          <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-sm text-gray-600 dark:text-gray-400">Biller</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ voidPaymentResponse.billerName }}
            </span>
          </div>
          
          <!-- Request Date -->
          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Request Date</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ format.formatDateTime(voidPaymentResponse.requestDate, { dateStyle: 'medium', timeStyle: 'short' }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Customer Details Card -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <UIcon name="material-symbols:person-outline" class="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          Customer Details
        </h3>
        
        <div class="space-y-4">
          <div 
            v-for="(customer, index) in voidPaymentResponse.customerDetails" 
            :key="index"
            class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Customer Name</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ customer.customerName }}
                </span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Customer Code</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ customer.customerCode }}
                </span>
              </div>
              
              <div v-if="customer.billNumber" class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Bill Number</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ customer.billNumber }}
                </span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                <span class="text-sm font-bold text-red-600 dark:text-red-400">
                  {{ useCurrency().formatAmount(customer.amount) }} {{ customer.currency }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notes Section -->
    <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <UIcon name="material-symbols:note-outline" class="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
        Notes
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Bank Note -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bank Note
          </label>
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-sm text-gray-900 dark:text-white">
              {{ voidPaymentResponse.bankNote || 'No bank note provided' }}
            </p>
          </div>
        </div>
        
        <!-- Biller Note -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Biller Note
          </label>
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-sm text-gray-900 dark:text-white">
              {{ voidPaymentResponse.billerNote || 'No biller note provided' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons (Only shown for pending status) -->
    <!-- <div 
      v-if="voidPaymentResponse.status === 'pending' && (voidPaymentResponse.actions.canApprove || voidPaymentResponse.actions.canReject)"
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Actions Required
      </h3>
      
      <div class="flex flex-col sm:flex-row gap-3">
        <UButton
          v-if="voidPaymentResponse.actions.canApprove"
          color="success"
          icon="material-symbols:check"
          @click="handleApprove"
          :loading="isProcessing && actionType === 'approve'"
          :disabled="isProcessing"
          class="flex-1"
        >
          {{ isProcessing && actionType === 'approve' ? 'Approving...' : 'Approve Request' }}
        </UButton>
        
        <UButton
          v-if="voidPaymentResponse.actions.canReject"
          color="error"
          variant="outline"
          icon="material-symbols:close"
          @click="handleReject"
          :loading="isProcessing && actionType === 'reject'"
          :disabled="isProcessing"
          class="flex-1"
        >
          {{ isProcessing && actionType === 'reject' ? 'Rejecting...' : 'Reject Request' }}
        </UButton>
      </div>
    </div> -->

    <!-- Back Button -->
    <div class="flex justify-start">
      <UButton
        variant="outline"
        icon="material-symbols:arrow-back"
        @click="goBack"
      >
        Go Back
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ClipboardBadge from '~/components/buttons/ClipboardBadge.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import { useNotification } from '~/composables/useNotification'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import type { VoidPaymentResponse } from '~~/server/model/pgw_module_api/void_payment/void_payment_response'

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'void_payment', to: '/void-payment' },
    { label: 'details', active: true },
  ],
})

const route = useRoute()
const router = useRouter()
const notification = useNotification()
const format = useFormat()
const { t } = useI18n()

const transactionId = computed(() => route.params.id as string)
const isProcessing = ref(false)
const actionType = ref<'approve' | 'reject' | null>(null)

// Sample void payment response data
const voidPaymentResponse = ref<VoidPaymentResponse>({
  status: 'pending',
  bankLogo: 'https://b24-upload.s3.ap-southeast-1.amazonaws.com/banklogo2024/AC.png',
  bankRef: 'B243324FED',
  bankName: 'ACLEDA',
  transactionDate: '2022-11-10T10:29:00',
  totalAmount: 800,
  currency: 'KHR',
  billerName: 'License 666-Water',
  bankNote: 'Testing',
  billerNote: null,
  requestDate: '2024-08-13T13:36:00',
  actionDate: null,
  customerDetails: [
    {
      customerName: 'Sorphorn',
      customerCode: '666-002005',
      billNumber: null,
      amount: 800,
      currency: 'KHR'
    }
  ],
  actions: {
    canApprove: true,
    canReject: true
  }
})

// Timeline progress calculation
const getProgressWidth = () => {
  switch (voidPaymentResponse.value.status) {
    case 'pending':
      return '50%'
    case 'accepted':
    case 'rejected':
      return '100%'
    default:
      return '33%'
  }
}

// Timeline step styling
const getStepClass = (step: 'processing' | 'completed') => {
  const status = voidPaymentResponse.value.status
  
  if (step === 'processing') {
    if (status === 'pending') {
      return 'bg-blue-500 text-white'
    } else if (status === 'accepted' || status === 'rejected') {
      return 'bg-blue-500 text-white'
    }
    return 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
  }
  
  if (step === 'completed') {
    if (status === 'accepted') {
      return 'bg-green-500 text-white'
    } else if (status === 'rejected') {
      return 'bg-red-500 text-white'
    }
    return 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
  }
  
  return 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
}

// Handle approve action
const handleApprove = async () => {
  try {
    isProcessing.value = true
    actionType.value = 'approve'
    
    notification.showInfo({
      title: 'Processing Request',
      description: 'Approving void payment request...',
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update the response
    voidPaymentResponse.value = {
      ...voidPaymentResponse.value,
      status: 'accepted',
      actionDate: new Date().toISOString(),
      actions: {
        canApprove: false,
        canReject: false
      }
    }
    
    notification.showSuccess({
      title: 'Request Approved',
      description: 'Void payment request has been approved successfully.',
    })
  } catch (error) {
    console.error('Error approving request:', error)
    notification.showError({
      title: 'Approval Failed',
      description: 'Failed to approve void payment request. Please try again.',
    })
  } finally {
    isProcessing.value = false
    actionType.value = null
  }
}

// Handle reject action
const handleReject = async () => {
  try {
    isProcessing.value = true
    actionType.value = 'reject'
    
    notification.showInfo({
      title: 'Processing Request',
      description: 'Rejecting void payment request...',
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update the response
    voidPaymentResponse.value = {
      ...voidPaymentResponse.value,
      status: 'rejected',
      actionDate: new Date().toISOString(),
      actions: {
        canApprove: false,
        canReject: false
      }
    }
    
    notification.showSuccess({
      title: 'Request Rejected',
      description: 'Void payment request has been rejected successfully.',
    })
  } catch (error) {
    console.error('Error rejecting request:', error)
    notification.showError({
      title: 'Rejection Failed',
      description: 'Failed to reject void payment request. Please try again.',
    })
  } finally {
    isProcessing.value = false
    actionType.value = null
  }
}

// Go back to previous page
const goBack = () => {
  router.back()
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
