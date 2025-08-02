import { ref, computed } from 'vue'
import type {
  FileUploadResult,
  FileFormat,
  ValidationResult,
  TranslationData,
  MultipleJSONUploadResult,
} from '@/types'
import { readFileAsText, getFileExtension } from '@/utils'
import { validateJSON, validateCSV } from '@/utils/validation'
import { parseCSV } from '@/utils/csv.ts'
import {
  validateJSONFilename,
  validateJSONFilenameWithFallback,
  validateMultipleJSONFiles
} from '@/utils/filename-validation'

export function useFileUpload() {
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const lastUploadResult = ref<FileUploadResult | null>(null)

  const acceptedFormats = computed(() => ['.json', '.csv'])
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  async function uploadFile(file: File): Promise<FileUploadResult> {
    isUploading.value = true
    uploadProgress.value = 0

    try {
      // Validate file size
      if (file.size > maxFileSize) {
        throw new Error(`File size exceeds ${maxFileSize / 1024 / 1024}MB limit`)
      }

      // Validate file extension
      const extension = getFileExtension(file.name)
      if (!['json', 'csv'].includes(extension)) {
        throw new Error('Only JSON and CSV files are supported')
      }

      // For JSON files, validate filename convention with fallback for single uploads
      let filenameValidation: ReturnType<typeof validateJSONFilenameWithFallback> | null = null
      if (extension === 'json') {
        filenameValidation = validateJSONFilenameWithFallback(file.name, true)
        if (!filenameValidation.isValid) {
          throw new Error(filenameValidation.error || 'Invalid JSON filename')
        }
      }

      uploadProgress.value = 25

      // Read file content
      const content = await readFileAsText(file)
      uploadProgress.value = 50

      // Determine format and validate
      if (!['json', 'csv'].includes(extension)) {
        throw new Error(`Unsupported file format: ${extension}`)
      }

      const format = extension as FileFormat
      let validationResult: ValidationResult

      if (format === 'json') {
        validationResult = validateJSON(content)
        if (validationResult.isValid) {
          const data = JSON.parse(content) as TranslationData
          // Use the fallback validation result from earlier
          return {
            success: true,
            format: 'json',
            data,
            filename: file.name,
            languageCode: filenameValidation?.languageCode || 'en',
            fallbackApplied: filenameValidation?.fallbackApplied,
            warningMessage: filenameValidation?.warningMessage
          }
        } else {
          throw new Error(`JSON validation failed: ${validationResult.errors[0]?.message}`)
        }
      } else {
        validationResult = validateCSV(content)
        if (validationResult.isValid) {
          const data = parseCSV(content)
          return {
            success: true,
            format: 'csv',
            data,
            filename: file.name
          }
        } else {
          throw new Error(`CSV validation failed: ${validationResult.errors[0]?.message}`)
        }
      }

    } catch (error) {
      const result: FileUploadResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }

      lastUploadResult.value = result
      return result

    } finally {
      isUploading.value = false
      // Reset progress after a delay
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }

  async function uploadFiles(files: FileList): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(files[i])
      results.push(result)
    }

    return results
  }

  async function uploadMultipleJSONFiles(files: File[]): Promise<MultipleJSONUploadResult> {
    // Validate file types and naming convention (strict validation for multiple files)
    const validation = validateMultipleJSONFiles(files)

    const results: FileUploadResult[] = []
    const errors: string[] = []

    // Add validation errors
    validation.invalid.forEach(({ file, error }) => {
      errors.push(`${file.name}: ${error}`)
      results.push({
        success: false,
        error,
        filename: file.name
      })
    })

    // Process valid files with strict validation (no fallback for multiple uploads)
    for (const file of validation.valid) {
      try {
        // Use strict validation for multiple file uploads
        const filenameValidation = validateJSONFilename(file.name)
        if (!filenameValidation.isValid) {
          throw new Error(filenameValidation.error || 'Invalid JSON filename')
        }

        // Read and validate file content
        const content = await readFileAsText(file)
        const validationResult = validateJSON(content)

        if (!validationResult.isValid) {
          throw new Error(`JSON validation failed: ${validationResult.errors[0]?.message}`)
        }

        const data = JSON.parse(content) as TranslationData
        results.push({
          success: true,
          format: 'json',
          data,
          filename: file.name,
          languageCode: filenameValidation.languageCode
        })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Upload failed'
        errors.push(`${file.name}: ${errorMsg}`)
        results.push({
          success: false,
          error: errorMsg,
          filename: file.name
        })
      }
    }

    return {
      success: validation.valid.length > 0 && errors.length === validation.invalid.length,
      files: results,
      validFiles: validation.valid.length,
      invalidFiles: validation.invalid.length,
      errors
    }
  }

  function validateFileBeforeUpload(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds ${maxFileSize / 1024 / 1024}MB size limit`
      }
    }

    // Check file extension
    const extension = getFileExtension(file.name)
    if (!['json', 'csv'].includes(extension)) {
      return {
        valid: false,
        error: `File "${file.name}" has unsupported format. Only JSON and CSV files are allowed.`
      }
    }

    return { valid: true }
  }

  function resetUploadState() {
    isUploading.value = false
    uploadProgress.value = 0
    lastUploadResult.value = null
  }

  return {
    // State
    isUploading: computed(() => isUploading.value),
    uploadProgress: computed(() => uploadProgress.value),
    lastUploadResult: computed(() => lastUploadResult.value),
    acceptedFormats,
    maxFileSize,

    // Methods
    uploadFile,
    uploadFiles,
    uploadMultipleJSONFiles,
    validateFileBeforeUpload,
    resetUploadState
  }
}
