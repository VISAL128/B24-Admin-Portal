import { ref } from 'vue'

export const useClipboard = () => {
  const isSupported = ref(navigator && 'clipboard' in navigator)
  const isCopied = ref(false)
  const error = ref<string | null>(null)

  const copy = async (text: string): Promise<boolean> => {
    if (!isSupported.value) {
      error.value = 'Clipboard API not supported'
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      isCopied.value = true
      error.value = null
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
      
      return true
    } catch (err) {
      error.value = 'Failed to copy to clipboard'
      console.error('Copy failed:', err)
      return false
    }
  }

  return {
    isSupported,
    isCopied,
    error,
    copy
  }
}
