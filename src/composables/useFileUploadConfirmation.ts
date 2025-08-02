import { ref } from 'vue'
import type { FileUploadResult } from '@/types'

export function useFileUploadConfirmation() {
  const isConfirmDialogOpen = ref(false)
  const skipConfirmationForSession = ref(false)
  const pendingUpload = ref<{
    result: FileUploadResult | FileUploadResult[]
    resolve: (value: boolean) => void
  } | null>(null)

  /**
   * Check if there is existing translation data
   */
  function hasExistingData(
    currentCSVData: any,
    currentJSONData: any,
    translationData: Record<string, any>
  ): boolean {
    return !!(
      currentCSVData || 
      currentJSONData || 
      Object.keys(translationData).length > 0
    )
  }

  /**
   * Show confirmation dialog and return a promise that resolves with user's choice
   */
  function requestUploadConfirmation(
    result: FileUploadResult | FileUploadResult[]
  ): Promise<boolean> {
    return new Promise((resolve) => {
      pendingUpload.value = { result, resolve }
      isConfirmDialogOpen.value = true
    })
  }

  /**
   * Handle user confirmation
   */
  function handleConfirmation(dontAskAgain: boolean) {
    if (dontAskAgain) {
      skipConfirmationForSession.value = true
    }
    
    if (pendingUpload.value) {
      pendingUpload.value.resolve(true)
      pendingUpload.value = null
    }
    
    isConfirmDialogOpen.value = false
  }

  /**
   * Handle user cancellation
   */
  function handleCancellation() {
    if (pendingUpload.value) {
      pendingUpload.value.resolve(false)
      pendingUpload.value = null
    }
    
    isConfirmDialogOpen.value = false
  }

  /**
   * Check if confirmation should be shown for upload
   */
  async function shouldConfirmUpload(
    result: FileUploadResult | FileUploadResult[],
    currentCSVData: any,
    currentJSONData: any,
    translationData: Record<string, any>
  ): Promise<boolean> {
    // Don't show confirmation if no existing data
    if (!hasExistingData(currentCSVData, currentJSONData, translationData)) {
      return true
    }

    // Don't show confirmation if user chose "don't ask again"
    if (skipConfirmationForSession.value) {
      return true
    }

    // Show confirmation dialog and wait for user response
    return await requestUploadConfirmation(result)
  }

  /**
   * Reset the session state (useful for testing or manual reset)
   */
  function resetSessionState() {
    skipConfirmationForSession.value = false
    isConfirmDialogOpen.value = false
    pendingUpload.value = null
  }

  return {
    // State
    isConfirmDialogOpen,
    skipConfirmationForSession,
    
    // Methods
    shouldConfirmUpload,
    handleConfirmation,
    handleCancellation,
    resetSessionState,
    hasExistingData
  }
}
