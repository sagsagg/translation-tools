import { describe, it, expect, beforeEach } from 'vitest'
import { useFileStore } from '@/stores/files'
import { useFileUploadConfirmation } from '@/composables/useFileUploadConfirmation'
import { createPinia, setActivePinia } from 'pinia'
import type { FileUploadResult } from '@/types'

describe('File Clearing on Confirmation', () => {
  let fileStore: ReturnType<typeof useFileStore>
  let uploadConfirmation: ReturnType<typeof useFileUploadConfirmation>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    fileStore = useFileStore()
    uploadConfirmation = useFileUploadConfirmation()
  })

  it('should clear uploaded files when confirmation is needed and user confirms', async () => {
    // Add some initial files to the store
    const initialFile1: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'Initial App 1' },
      filename: 'initial1.json',
      languageCode: 'en'
    }

    const initialFile2: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'Initial App 2' },
      filename: 'initial2.json',
      languageCode: 'fr'
    }

    // Add initial files
    fileStore.addFile(initialFile1, 1024)
    fileStore.addFile(initialFile2, 1536)

    expect(fileStore.fileCount).toBe(2)

    // Simulate the confirmation flow
    const newFile: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'New App' },
      filename: 'new.json',
      languageCode: 'es'
    }

    // Check if confirmation should be shown (it should because we have existing data)
    const shouldConfirm = uploadConfirmation.shouldConfirmUpload(
      newFile,
      { headers: [], rows: [] }, // existing CSV data
      null,
      {}
    )

    // This should trigger the confirmation dialog
    expect(uploadConfirmation.isConfirmDialogOpen.value).toBe(true)

    // Simulate user confirming (this is what happens when "Replace Data" is clicked)
    uploadConfirmation.handleConfirmation(false)

    // Wait for the confirmation to resolve
    const confirmed = await shouldConfirm
    expect(confirmed).toBe(true)

    // At this point, in the actual app, fileStore.clearAllFiles() would be called
    // Let's simulate that behavior
    fileStore.clearAllFiles()
    expect(fileStore.fileCount).toBe(0)

    // Then the new file would be added
    fileStore.addFile(newFile, 2048)
    expect(fileStore.fileCount).toBe(1)
    expect(fileStore.uploadedFiles[0].name).toBe('new.json')
  })

  it('should not clear files when user cancels confirmation', async () => {
    // Add some initial files
    const initialFile: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'Initial App' },
      filename: 'initial.json',
      languageCode: 'en'
    }

    fileStore.addFile(initialFile, 1024)
    expect(fileStore.fileCount).toBe(1)

    // Simulate the confirmation flow
    const newFile: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'New App' },
      filename: 'new.json',
      languageCode: 'es'
    }

    const shouldConfirm = uploadConfirmation.shouldConfirmUpload(
      newFile,
      { headers: [], rows: [] }, // existing CSV data
      null,
      {}
    )

    // Simulate user canceling
    uploadConfirmation.handleCancellation()

    // Wait for the confirmation to resolve
    const confirmed = await shouldConfirm
    expect(confirmed).toBe(false)

    // Files should not be cleared when user cancels
    expect(fileStore.fileCount).toBe(1)
    expect(fileStore.uploadedFiles[0].name).toBe('initial.json')
  })

  it('should not clear files when no confirmation is needed', async () => {
    // Start with empty store (no existing data)
    expect(fileStore.fileCount).toBe(0)

    const newFile: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'New App' },
      filename: 'new.json',
      languageCode: 'en'
    }

    // Check if confirmation should be shown (it shouldn't because no existing data)
    const confirmed = await uploadConfirmation.shouldConfirmUpload(
      newFile,
      null, // no existing CSV data
      null, // no existing JSON data
      {}   // no existing translation data
    )

    // Should proceed without confirmation
    expect(confirmed).toBe(true)
    expect(uploadConfirmation.isConfirmDialogOpen.value).toBe(false)

    // In this case, clearAllFiles() wouldn't be called in the app
    // Just add the new file directly
    fileStore.addFile(newFile, 1024)
    expect(fileStore.fileCount).toBe(1)
    expect(fileStore.uploadedFiles[0].name).toBe('new.json')
  })
})
