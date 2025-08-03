import { ref } from 'vue'
import type { 
  EditTranslationData, 
  DeleteTranslationData, 
  EditTranslationResult, 
  DeleteTranslationResult,
  TranslationData,
  CSVData,
  MultiLanguageTranslationData
} from '@/types'

export function useEditDelete() {
  const isEditDialogOpen = ref(false)
  const isDeleteDialogOpen = ref(false)
  
  const currentEditData = ref<{
    key: string
    value: string
    language?: string
  } | null>(null)

  const currentDeleteData = ref<{
    key: string
    value: string
    language?: string
  } | null>(null)

  function openEditDialog(key: string, value: string, language?: string) {
    currentEditData.value = { key, value, language }
    isEditDialogOpen.value = true
  }

  function closeEditDialog() {
    isEditDialogOpen.value = false
    currentEditData.value = null
  }

  function openDeleteDialog(key: string, value: string, language?: string) {
    currentDeleteData.value = { key, value, language }
    isDeleteDialogOpen.value = true
  }

  function closeDeleteDialog() {
    isDeleteDialogOpen.value = false
    currentDeleteData.value = null
  }

  function editTranslationInData(
    data: TranslationData,
    editData: EditTranslationData
  ): EditTranslationResult {
    try {
      // Check if the original key exists
      if (!(editData.originalKey in data)) {
        return {
          success: false,
          error: 'Original translation key not found'
        }
      }

      // If key is changing, check if new key already exists
      if (editData.originalKey !== editData.newKey && editData.newKey in data) {
        return {
          success: false,
          error: 'New translation key already exists'
        }
      }

      // Create a new data object with the changes
      const newData = { ...data }

      // Remove old key if it's changing
      if (editData.originalKey !== editData.newKey) {
        delete newData[editData.originalKey]
      }

      // Set new value
      newData[editData.newKey] = editData.newValue

      // Replace the original data
      Object.keys(data).forEach(key => delete data[key])
      Object.assign(data, newData)

      return {
        success: true,
        data: editData
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  function editTranslationInCSV(
    csvData: CSVData,
    editData: EditTranslationData
  ): EditTranslationResult {
    try {
      // Find the row with the original key
      const rowIndex = csvData.rows.findIndex(row => row.Key === editData.originalKey)
      
      if (rowIndex === -1) {
        return {
          success: false,
          error: 'Original translation key not found in CSV data'
        }
      }

      // If key is changing, check if new key already exists
      if (editData.originalKey !== editData.newKey) {
        const existingRow = csvData.rows.find(row => row.Key === editData.newKey)
        if (existingRow) {
          return {
            success: false,
            error: 'New translation key already exists in CSV data'
          }
        }
      }

      // Update the row
      const updatedRow = { ...csvData.rows[rowIndex] }
      updatedRow.Key = editData.newKey

      // Update the value in the appropriate language column
      if (editData.language && editData.language in updatedRow) {
        updatedRow[editData.language] = editData.newValue
      } else {
        // If no specific language, update the first non-Key column
        const valueColumns = csvData.headers.filter(header => header !== 'Key')
        if (valueColumns.length > 0) {
          updatedRow[valueColumns[0]] = editData.newValue
        }
      }

      // Replace the row
      csvData.rows[rowIndex] = updatedRow

      return {
        success: true,
        data: editData
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  function editTranslationInMultiLanguage(
    multiLangData: MultiLanguageTranslationData,
    editData: EditTranslationData
  ): EditTranslationResult {
    try {
      if (!editData.language || !(editData.language in multiLangData)) {
        return {
          success: false,
          error: 'Language not found in multi-language data'
        }
      }

      const languageData = multiLangData[editData.language]
      const result = editTranslationInData(languageData, editData)

      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  function deleteTranslationFromData(
    data: TranslationData,
    deleteData: DeleteTranslationData
  ): DeleteTranslationResult {
    try {
      if (!(deleteData.key in data)) {
        return {
          success: false,
          error: 'Translation key not found'
        }
      }

      delete data[deleteData.key]

      return {
        success: true,
        data: deleteData
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  function deleteTranslationFromCSV(
    csvData: CSVData,
    deleteData: DeleteTranslationData
  ): DeleteTranslationResult {
    try {
      const rowIndex = csvData.rows.findIndex(row => row.Key === deleteData.key)
      
      if (rowIndex === -1) {
        return {
          success: false,
          error: 'Translation key not found in CSV data'
        }
      }

      csvData.rows.splice(rowIndex, 1)

      return {
        success: true,
        data: deleteData
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  function deleteTranslationFromMultiLanguage(
    multiLangData: MultiLanguageTranslationData,
    deleteData: DeleteTranslationData
  ): DeleteTranslationResult {
    try {
      if (!deleteData.language || !(deleteData.language in multiLangData)) {
        return {
          success: false,
          error: 'Language not found in multi-language data'
        }
      }

      const languageData = multiLangData[deleteData.language]
      const result = deleteTranslationFromData(languageData, deleteData)

      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  function validateEditData(editData: EditTranslationData): string | null {
    if (!editData.newKey.trim()) {
      return 'Translation key cannot be empty'
    }

    if (!editData.newValue.trim()) {
      return 'Translation value cannot be empty'
    }

    if (editData.newKey.length < 2) {
      return 'Translation key must be at least 2 characters'
    }

    if (editData.newValue.length > 1000) {
      return 'Translation value must be less than 1000 characters'
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(editData.newKey)) {
      return 'Translation key can only contain letters, numbers, dots, underscores, and hyphens'
    }

    return null
  }

  return {
    // Dialog state
    isEditDialogOpen,
    isDeleteDialogOpen,
    currentEditData,
    currentDeleteData,

    // Dialog controls
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,

    // Edit operations
    editTranslationInData,
    editTranslationInCSV,
    editTranslationInMultiLanguage,

    // Delete operations
    deleteTranslationFromData,
    deleteTranslationFromCSV,
    deleteTranslationFromMultiLanguage,

    // Validation
    validateEditData
  }
}
