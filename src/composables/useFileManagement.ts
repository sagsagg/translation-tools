import { ref, computed } from 'vue'
import type {
  UploadedFile,
  FileUploadResult,
  FileRemovalResult,
  TranslationData,
  CSVData,
  FileFormat
} from '@/types'

export function useFileManagement() {
  const uploadedFiles = ref<UploadedFile[]>([])

  const hasFiles = computed(() => uploadedFiles.value.length > 0)
  const fileCount = computed(() => uploadedFiles.value.length)
  const totalSize = computed(() =>
    uploadedFiles.value.reduce((sum, file) => sum + file.size, 0)
  )

  function generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
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

    if (existingFileIndex !== -1) {
      // Replace existing file instead of creating duplicate
      uploadedFiles.value[existingFileIndex] = file
    } else {
      // Add new file
      uploadedFiles.value.push(file)
    }

    return file
  }

  function addFileWithReplaceInfo(
    uploadResult: FileUploadResult,
    fileSize: number
  ): { file: UploadedFile | null; wasReplaced: boolean; replacedFile?: UploadedFile } {
    if (!uploadResult.success) {
      return { file: null, wasReplaced: false }
    }

    const fileName = uploadResult.filename || `untitled.${uploadResult.format}`
    const languageCode = uploadResult.format === 'json' ? uploadResult.languageCode : undefined

    // Check for existing file with same name, format, and language
    const existingFileIndex = uploadedFiles.value.findIndex(file =>
      file.name === fileName &&
      file.format === uploadResult.format &&
      file.languageCode === languageCode
    )

    const existingFile = existingFileIndex !== -1 ? uploadedFiles.value[existingFileIndex] : undefined

    const file: UploadedFile = {
      id: generateFileId(),
      name: fileName,
      format: uploadResult.format,
      languageCode: languageCode,
      uploadedAt: new Date(),
      size: fileSize,
      data: uploadResult.data
    }

    if (existingFileIndex !== -1) {
      // Replace existing file instead of creating duplicate
      uploadedFiles.value[existingFileIndex] = file
      return { file, wasReplaced: true, replacedFile: existingFile }
    } else {
      // Add new file
      uploadedFiles.value.push(file)
      return { file, wasReplaced: false }
    }
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
    const fileIndex = uploadedFiles.value.findIndex(file => file.id === fileId)

    if (fileIndex === -1) {
      return {
        success: false,
        removedFileId: fileId,
        error: 'File not found'
      }
    }

    uploadedFiles.value.splice(fileIndex, 1)

    return {
      success: true,
      removedFileId: fileId
    }
  }

  function clearAllFiles(): void {
    uploadedFiles.value = []
  }

  function getFileById(fileId: string): UploadedFile | undefined {
    return uploadedFiles.value.find(file => file.id === fileId)
  }

  function getFilesByFormat(format: FileFormat): UploadedFile[] {
    return uploadedFiles.value.filter(file => file.format === format)
  }

  function getFilesByLanguage(languageCode: string): UploadedFile[] {
    return uploadedFiles.value.filter(file => file.languageCode === languageCode)
  }

  function updateFileData(fileId: string, newData: TranslationData | CSVData): boolean {
    const file = getFileById(fileId)
    if (!file) {
      return false
    }

    file.data = newData
    return true
  }

  function getFileStats() {
    const jsonFiles = getFilesByFormat('json')
    const csvFiles = getFilesByFormat('csv')
    const languages = new Set(
      uploadedFiles.value
        .filter(file => file.languageCode)
        .map(file => file.languageCode!)
    )

    return {
      total: fileCount.value,
      json: jsonFiles.length,
      csv: csvFiles.length,
      languages: Array.from(languages),
      totalSize: totalSize.value
    }
  }

  function exportFilesList(): UploadedFile[] {
    return [...uploadedFiles.value]
  }

  function importFilesList(files: UploadedFile[]): void {
    uploadedFiles.value = [...files]
  }

  // Validation helpers
  function validateFileIntegrity(fileId: string): boolean {
    const file = getFileById(fileId)
    if (!file) {
      return false
    }

    try {
      // Basic validation - check if data exists and has expected structure
      if (file.format === 'json') {
        const data = file.data as TranslationData
        return typeof data === 'object' && data !== null
      } else if (file.format === 'csv') {
        const data = file.data as CSVData
        return Array.isArray(data.headers) && Array.isArray(data.rows)
      }
      return false
    } catch {
      return false
    }
  }

  function findDuplicateFiles(): UploadedFile[] {
    const seen = new Set<string>()
    const duplicates: UploadedFile[] = []

    for (const file of uploadedFiles.value) {
      const key = `${file.name}_${file.format}_${file.languageCode || 'no-lang'}`
      if (seen.has(key)) {
        duplicates.push(file)
      } else {
        seen.add(key)
      }
    }

    return duplicates
  }

  return {
    // State
    uploadedFiles: computed(() => uploadedFiles.value),
    hasFiles,
    fileCount,
    totalSize,

    // File operations
    addFile,
    addFileWithReplaceInfo,
    addMultipleFiles,
    removeFile,
    clearAllFiles,
    updateFileData,

    // File queries
    getFileById,
    getFilesByFormat,
    getFilesByLanguage,
    getFileStats,

    // Utility
    exportFilesList,
    importFilesList,
    validateFileIntegrity,
    findDuplicateFiles
  }
}
