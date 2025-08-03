import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  UploadedFile,
  FileUploadResult,
  FileRemovalResult,
  MultipleFileRemovalResult,
  TranslationData,
  CSVData,
  FileFormat
} from '@/types'

export const useFileStore = defineStore('files', () => {
  // State
  const uploadedFiles = ref<UploadedFile[]>([])
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const lastUploadResult = ref<FileUploadResult | null>(null)

  // Getters
  const hasFiles = computed(() => uploadedFiles.value.length > 0)
  const fileCount = computed(() => uploadedFiles.value.length)
  const totalSize = computed(() =>
    uploadedFiles.value.reduce((sum, file) => sum + file.size, 0)
  )

  const filesByFormat = computed(() => {
    const grouped: Record<FileFormat, UploadedFile[]> = {
      csv: [],
      json: []
    }

    uploadedFiles.value.forEach(file => {
      grouped[file.format].push(file)
    })

    return grouped
  })

  const csvFiles = computed(() => filesByFormat.value.csv)
  const jsonFiles = computed(() => filesByFormat.value.json)

  const filesByLanguage = computed(() => {
    const grouped: Record<string, UploadedFile[]> = {}

    uploadedFiles.value.forEach(file => {
      const lang = file.languageCode || 'unknown'
      if (!grouped[lang]) {
        grouped[lang] = []
      }
      grouped[lang].push(file)
    })

    return grouped
  })

  const availableLanguageCodes = computed(() => {
    const codes = new Set<string>()
    uploadedFiles.value.forEach(file => {
      if (file.languageCode) {
        codes.add(file.languageCode)
      }
    })
    return Array.from(codes).sort()
  })

  const getFileById = computed(() => (fileId: string) =>
    uploadedFiles.value.find(file => file.id === fileId)
  )

  const getFilesByLanguageCode = computed(() => (languageCode: string) =>
    uploadedFiles.value.filter(file => file.languageCode === languageCode)
  )

  const hasFileWithName = computed(() => (fileName: string, format: FileFormat, languageCode?: string) =>
    uploadedFiles.value.some(file =>
      file.name === fileName &&
      file.format === format &&
      file.languageCode === languageCode
    )
  )

  // Actions
  function generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  function setUploading(uploading: boolean) {
    isUploading.value = uploading
  }

  function setUploadProgress(progress: number) {
    uploadProgress.value = Math.max(0, Math.min(100, progress))
  }

  function setLastUploadResult(result: FileUploadResult | null) {
    lastUploadResult.value = result
  }

  function addFile(
    uploadResult: FileUploadResult,
    fileSize: number
  ): UploadedFile | null {
    if (!uploadResult.success) {
      return null
    }

    const fileName = uploadResult.filename || `untitled.${uploadResult.format}`
    const languageCode = uploadResult.format === 'json' ? uploadResult.languageCode : undefined

    // Check for existing file with same name, format, and language
    const existingFileIndex = uploadedFiles.value.findIndex(file =>
      file.name === fileName &&
      file.format === uploadResult.format &&
      file.languageCode === languageCode
    )

    const file: UploadedFile = {
      id: generateFileId(),
      name: fileName,
      format: uploadResult.format,
      languageCode: languageCode,
      uploadedAt: new Date(),
      size: fileSize,
      data: uploadResult.data
    }

    if (existingFileIndex > -1) {
      // Replace existing file
      uploadedFiles.value[existingFileIndex] = file
    } else {
      // Add new file
      uploadedFiles.value.push(file)
    }

    return file
  }

  function addFileWithReplaceInfo(
    uploadResult: FileUploadResult,
    fileSize: number,
    replaceExisting = true
  ): { file: UploadedFile | null; replaced: boolean } {
    if (!uploadResult.success) {
      return { file: null, replaced: false }
    }

    const fileName = uploadResult.filename || `untitled.${uploadResult.format}`
    const languageCode = uploadResult.format === 'json' ? uploadResult.languageCode : undefined

    // Check for existing file
    const existingFileIndex = uploadedFiles.value.findIndex(file =>
      file.name === fileName &&
      file.format === uploadResult.format &&
      file.languageCode === languageCode
    )

    const file: UploadedFile = {
      id: generateFileId(),
      name: fileName,
      format: uploadResult.format,
      languageCode: languageCode,
      uploadedAt: new Date(),
      size: fileSize,
      data: uploadResult.data
    }

    const replaced = existingFileIndex > -1

    if (replaced) {
      if (replaceExisting) {
        // Replace existing file
        uploadedFiles.value[existingFileIndex] = file
      } else {
        // Don't replace if replaceExisting is false
        return { file: null, replaced: false }
      }
    } else {
      // Add new file (no existing file found)
      uploadedFiles.value.push(file)
    }

    return { file, replaced }
  }

  function addMultipleFiles(
    uploadResults: FileUploadResult[],
    fileSizes: number[]
  ): UploadedFile[] {
    const addedFiles: UploadedFile[] = []

    uploadResults.forEach((result, index) => {
      const fileSize = fileSizes[index] || 0
      const file = addFile(result, fileSize)
      if (file) {
        addedFiles.push(file)
      }
    })

    return addedFiles
  }

  function removeFile(fileId: string): FileRemovalResult {
    const index = uploadedFiles.value.findIndex(file => file.id === fileId)

    if (index === -1) {
      return {
        success: false,
        removedFileId: fileId,
        error: 'File not found'
      }
    }

    const removedFile = uploadedFiles.value[index]
    uploadedFiles.value.splice(index, 1)

    return {
      success: true,
      removedFileId: removedFile.id
    }
  }

  function removeFilesByLanguage(languageCode: string): MultipleFileRemovalResult {
    const filesToRemove = uploadedFiles.value.filter(file => file.languageCode === languageCode)

    if (filesToRemove.length === 0) {
      return {
        success: false,
        removedFiles: [],
        error: 'No files found for the specified language'
      }
    }

    uploadedFiles.value = uploadedFiles.value.filter(file => file.languageCode !== languageCode)

    return {
      success: true,
      removedFiles: filesToRemove
    }
  }

  function clearAllFiles(): void {
    uploadedFiles.value = []
    isUploading.value = false
    uploadProgress.value = 0
    lastUploadResult.value = null
  }

  function updateFileData(fileId: string, data: CSVData | TranslationData): boolean {
    const file = uploadedFiles.value.find(f => f.id === fileId)
    if (file) {
      file.data = data
      return true
    }
    return false
  }

  function getFileData(fileId: string): CSVData | TranslationData | undefined {
    const file = uploadedFiles.value.find(f => f.id === fileId)
    return file?.data
  }

  function validateFileIntegrity(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    uploadedFiles.value.forEach((file, index) => {
      // Check for required fields
      if (!file.id) {
        errors.push(`File at index ${index} is missing ID`)
      }
      if (!file.name) {
        errors.push(`File at index ${index} is missing name`)
      }
      if (!file.format) {
        errors.push(`File at index ${index} is missing format`)
      }
      if (!file.data) {
        errors.push(`File at index ${index} is missing data`)
      }

      // Check for duplicate IDs
      const duplicateIds = uploadedFiles.value.filter(f => f.id === file.id)
      if (duplicateIds.length > 1) {
        errors.push(`Duplicate file ID found: ${file.id}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  function getFileStats() {
    return {
      total: fileCount.value,
      csv: csvFiles.value.length,
      json: jsonFiles.value.length,
      totalSize: totalSize.value,
      languages: availableLanguageCodes.value.length,
      averageSize: fileCount.value > 0 ? totalSize.value / fileCount.value : 0
    }
  }

  return {
    // State
    uploadedFiles,
    isUploading,
    uploadProgress,
    lastUploadResult,

    // Getters
    hasFiles,
    fileCount,
    totalSize,
    filesByFormat,
    csvFiles,
    jsonFiles,
    filesByLanguage,
    availableLanguageCodes,
    getFileById,
    getFilesByLanguageCode,
    hasFileWithName,

    // Actions
    generateFileId,
    setUploading,
    setUploadProgress,
    setLastUploadResult,
    addFile,
    addFileWithReplaceInfo,
    addMultipleFiles,
    removeFile,
    removeFilesByLanguage,
    clearAllFiles,
    updateFileData,
    getFileData,
    validateFileIntegrity,
    getFileStats
  }
})
