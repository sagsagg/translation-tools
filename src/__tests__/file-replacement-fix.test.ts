import { describe, it, expect, beforeEach } from 'vitest'
import { useFileStore } from '@/stores/files'
import { createPinia, setActivePinia } from 'pinia'
import type { FileUploadResult } from '@/types'

describe('File Replacement Fix', () => {
  let fileStore: ReturnType<typeof useFileStore>

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    fileStore = useFileStore()
  })

  it('should replace existing file when uploading same file twice', () => {
    const mockResult: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'Test App' },
      filename: 'test.json',
      languageCode: 'en'
    }

    // Upload first file
    const { file: file1, replaced: replaced1 } = fileStore.addFileWithReplaceInfo(mockResult, 1024)
    
    expect(file1).toBeTruthy()
    expect(replaced1).toBe(false) // First upload, no replacement
    expect(fileStore.fileCount).toBe(1)

    // Upload same file again (should replace)
    const { file: file2, replaced: replaced2 } = fileStore.addFileWithReplaceInfo(mockResult, 2048)
    
    expect(file2).toBeTruthy()
    expect(replaced2).toBe(true) // Second upload, should replace
    expect(fileStore.fileCount).toBe(1) // Still only 1 file
    expect(file2!.size).toBe(2048) // New file has different size
    expect(file2!.id).not.toBe(file1!.id) // New file has different ID
  })

  it('should replace existing file by default (replaceExisting = true)', () => {
    const mockResult: FileUploadResult = {
      success: true,
      format: 'csv',
      data: { headers: ['Key', 'English'], rows: [{ Key: 'test', English: 'Test' }] },
      filename: 'test.csv'
    }

    // Upload first file
    fileStore.addFileWithReplaceInfo(mockResult, 1024)
    expect(fileStore.fileCount).toBe(1)

    // Upload same file again without explicit replaceExisting parameter
    // Should default to true and replace the file
    const { file, replaced } = fileStore.addFileWithReplaceInfo(mockResult, 2048)
    
    expect(file).toBeTruthy()
    expect(replaced).toBe(true)
    expect(fileStore.fileCount).toBe(1) // Still only 1 file
  })

  it('should not replace when replaceExisting is explicitly false', () => {
    const mockResult: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'Test App' },
      filename: 'test.json',
      languageCode: 'en'
    }

    // Upload first file
    fileStore.addFileWithReplaceInfo(mockResult, 1024)
    expect(fileStore.fileCount).toBe(1)

    // Try to upload same file with replaceExisting = false
    const { file, replaced } = fileStore.addFileWithReplaceInfo(mockResult, 2048, false)
    
    expect(file).toBeNull() // Should not add/replace
    expect(replaced).toBe(false)
    expect(fileStore.fileCount).toBe(1) // Still only 1 file (original)
  })

  it('should add different files without replacement', () => {
    const mockResult1: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'Test App' },
      filename: 'english.json',
      languageCode: 'en'
    }

    const mockResult2: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': '测试应用' },
      filename: 'chinese.json',
      languageCode: 'zh-cn'
    }

    // Upload first file
    const { file: file1, replaced: replaced1 } = fileStore.addFileWithReplaceInfo(mockResult1, 1024)
    expect(file1).toBeTruthy()
    expect(replaced1).toBe(false)
    expect(fileStore.fileCount).toBe(1)

    // Upload different file (should add, not replace)
    const { file: file2, replaced: replaced2 } = fileStore.addFileWithReplaceInfo(mockResult2, 1536)
    expect(file2).toBeTruthy()
    expect(replaced2).toBe(false)
    expect(fileStore.fileCount).toBe(2) // Now 2 files
  })
})
