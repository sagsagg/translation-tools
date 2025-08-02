import { describe, it, expect, beforeEach } from 'vitest'
import { useFileUploadConfirmation } from '@/composables/useFileUploadConfirmation'
import type { FileUploadResult } from '@/types'

describe('useFileUploadConfirmation', () => {
  let composable: ReturnType<typeof useFileUploadConfirmation>

  beforeEach(() => {
    composable = useFileUploadConfirmation()
    composable.resetSessionState()
  })

  it('should detect existing data correctly', () => {
    const { hasExistingData } = composable

    // No existing data
    expect(hasExistingData(null, null, {})).toBe(false)
    expect(hasExistingData(undefined, undefined, {})).toBe(false)

    // Has CSV data
    expect(hasExistingData({ headers: [], rows: [] }, null, {})).toBe(true)

    // Has JSON data
    expect(hasExistingData(null, { key: 'value' }, {})).toBe(true)

    // Has translation data
    expect(hasExistingData(null, null, { en: { key: 'value' } })).toBe(true)
  })

  it('should not require confirmation for first upload', async () => {
    const { shouldConfirmUpload } = composable
    const mockResult: FileUploadResult = {
      success: true,
      format: 'csv',
      data: { headers: [], rows: [] }
    }

    const shouldConfirm = await shouldConfirmUpload(
      mockResult,
      null, // no existing CSV
      null, // no existing JSON
      {}   // no existing translation data
    )

    expect(shouldConfirm).toBe(true)
  })

  it('should require confirmation when data exists', async () => {
    const { shouldConfirmUpload, handleConfirmation } = composable
    const mockResult: FileUploadResult = {
      success: true,
      format: 'csv',
      data: { headers: [], rows: [] }
    }

    // Start the confirmation process (this will show dialog)
    const confirmationPromise = shouldConfirmUpload(
      mockResult,
      { headers: [], rows: [] }, // existing CSV data
      null,
      {}
    )

    // Simulate user confirming
    handleConfirmation(false)

    const shouldConfirm = await confirmationPromise
    expect(shouldConfirm).toBe(true)
  })

  it('should skip confirmation when user chose "don\'t ask again"', async () => {
    const { shouldConfirmUpload, handleConfirmation } = composable
    const mockResult: FileUploadResult = {
      success: true,
      format: 'csv',
      data: { headers: [], rows: [] }
    }

    // First upload with existing data - user chooses "don't ask again"
    const firstConfirmationPromise = shouldConfirmUpload(
      mockResult,
      { headers: [], rows: [] }, // existing CSV data
      null,
      {}
    )

    // User confirms with "don't ask again"
    handleConfirmation(true)
    await firstConfirmationPromise

    // Second upload should not require confirmation
    const secondShouldConfirm = await shouldConfirmUpload(
      mockResult,
      { headers: [], rows: [] }, // existing CSV data
      null,
      {}
    )

    expect(secondShouldConfirm).toBe(true)
  })

  it('should handle user cancellation', async () => {
    const { shouldConfirmUpload, handleCancellation } = composable
    const mockResult: FileUploadResult = {
      success: true,
      format: 'csv',
      data: { headers: [], rows: [] }
    }

    // Start the confirmation process
    const confirmationPromise = shouldConfirmUpload(
      mockResult,
      { headers: [], rows: [] }, // existing CSV data
      null,
      {}
    )

    // Simulate user cancelling
    handleCancellation()

    const shouldConfirm = await confirmationPromise
    expect(shouldConfirm).toBe(false)
  })

  it('should reset session state correctly', () => {
    const { resetSessionState, skipConfirmationForSession, isConfirmDialogOpen } = composable

    // Set some state
    skipConfirmationForSession.value = true
    isConfirmDialogOpen.value = true

    // Reset
    resetSessionState()

    // State should be reset
    expect(skipConfirmationForSession.value).toBe(false)
    expect(isConfirmDialogOpen.value).toBe(false)
  })
})
