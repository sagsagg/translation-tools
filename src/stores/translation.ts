import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  CSVData,
  TranslationData,
  MultiLanguageTranslationData,
  EditTranslationData,
  DeleteTranslationData,
  EditTranslationResult,
  DeleteTranslationResult
} from '@/types'

export const useTranslationStore = defineStore('translation', () => {
  // State
  const csvData = ref<CSVData | undefined>()
  const jsonData = ref<TranslationData | undefined>()
  const multiLanguageJsonData = ref<MultiLanguageTranslationData | undefined>()
  const multipleJsonData = ref<Record<string, TranslationData>>({})

  // Getters
  const hasData = computed(() => {
    return csvData.value ||
           jsonData.value ||
           Object.keys(multipleJsonData.value).length > 0 ||
           (multiLanguageJsonData.value && Object.keys(multiLanguageJsonData.value).length > 0)
  })

  const hasCSVData = computed(() => !!csvData.value)
  const hasJSONData = computed(() => !!jsonData.value)
  const hasMultiLanguageData = computed(() =>
    multiLanguageJsonData.value && Object.keys(multiLanguageJsonData.value).length > 0
  )
  const hasMultipleJSONData = computed(() => Object.keys(multipleJsonData.value).length > 0)

  const totalEntries = computed(() => {
    if (csvData.value) {
      return csvData.value.rows.length
    }
    if (jsonData.value) {
      return Object.keys(jsonData.value).length
    }
    if (multiLanguageJsonData.value) {
      const allKeys = new Set<string>()
      Object.values(multiLanguageJsonData.value).forEach(langData => {
        Object.keys(langData).forEach(key => allKeys.add(key))
      })
      return allKeys.size
    }
    if (hasMultipleJSONData.value) {
      const allKeys = new Set<string>()
      Object.values(multipleJsonData.value).forEach(data => {
        Object.keys(data).forEach(key => allKeys.add(key))
      })
      return allKeys.size
    }
    return 0
  })

  // Actions
  function setCSVData(data: CSVData | undefined) {
    csvData.value = data
  }

  function setJSONData(data: TranslationData | undefined) {
    jsonData.value = data
  }

  function setMultiLanguageJSONData(data: MultiLanguageTranslationData | undefined) {
    multiLanguageJsonData.value = data
  }

  function setMultipleJSONData(data: Record<string, TranslationData>) {
    multipleJsonData.value = data
  }

  function addToMultipleJSONData(languageCode: string, data: TranslationData) {
    multipleJsonData.value[languageCode] = data
  }

  function removeFromMultipleJSONData(languageCode: string) {
    delete multipleJsonData.value[languageCode]
  }

  function clearAllData() {
    csvData.value = undefined
    jsonData.value = undefined
    multiLanguageJsonData.value = undefined
    multipleJsonData.value = {}
  }

  function clearCSVData() {
    csvData.value = undefined
  }

  function clearJSONData() {
    jsonData.value = undefined
  }

  function clearMultiLanguageData() {
    multiLanguageJsonData.value = undefined
  }

  function clearMultipleJSONData() {
    multipleJsonData.value = {}
  }

  // Edit operations
  function editTranslationInJSON(editData: EditTranslationData): EditTranslationResult {
    if (!jsonData.value) {
      return { success: false, error: 'No JSON data available' }
    }

    try {
      const { originalKey, newKey, newValue } = editData

      // Remove old key if it's different from new key
      if (originalKey !== newKey && originalKey in jsonData.value) {
        delete jsonData.value[originalKey]
      }

      // Set new value
      jsonData.value[newKey] = newValue

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  function editTranslationInCSV(editData: EditTranslationData): EditTranslationResult {
    if (!csvData.value) {
      return { success: false, error: 'No CSV data available' }
    }

    try {
      const { originalKey, newKey, newValue, language } = editData

      // Find the row with the original key
      const rowIndex = csvData.value.rows.findIndex(row => row.Key === originalKey)
      if (rowIndex === -1) {
        return { success: false, error: 'Translation key not found' }
      }

      const row = csvData.value.rows[rowIndex]

      // Update the key if it changed
      if (originalKey !== newKey) {
        row.Key = newKey
      }

      // Update the value for the specified language
      if (language && language in row) {
        row[language] = newValue
      } else if (language) {
        // Add new language column if it doesn't exist
        row[language] = newValue
        // Add to headers if not present
        if (!csvData.value.headers.includes(language)) {
          csvData.value.headers.push(language)
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  function editTranslationInMultiLanguage(editData: EditTranslationData): EditTranslationResult {
    if (!multiLanguageJsonData.value) {
      return { success: false, error: 'No multi-language data available' }
    }

    try {
      const { originalKey, newKey, newValue, language } = editData

      if (!language) {
        return { success: false, error: 'Language is required for multi-language editing' }
      }

      if (!(language in multiLanguageJsonData.value)) {
        multiLanguageJsonData.value[language] = {}
      }

      const langData = multiLanguageJsonData.value[language]

      // Remove old key if it's different from new key
      if (originalKey !== newKey && originalKey in langData) {
        delete langData[originalKey]
      }

      // Set new value
      langData[newKey] = newValue

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Delete operations
  function deleteTranslationFromJSON(deleteData: DeleteTranslationData): DeleteTranslationResult {
    if (!jsonData.value) {
      return { success: false, error: 'No JSON data available' }
    }

    try {
      const { key } = deleteData

      if (!(key in jsonData.value)) {
        return { success: false, error: 'Translation key not found' }
      }

      delete jsonData.value[key]
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  function deleteTranslationFromCSV(deleteData: DeleteTranslationData): DeleteTranslationResult {
    if (!csvData.value) {
      return { success: false, error: 'No CSV data available' }
    }

    try {
      const { key } = deleteData

      // Find and remove the row with the specified key
      const rowIndex = csvData.value.rows.findIndex(row => row.Key === key)
      if (rowIndex === -1) {
        return { success: false, error: 'Translation key not found' }
      }

      csvData.value.rows.splice(rowIndex, 1)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  function deleteTranslationFromMultiLanguage(deleteData: DeleteTranslationData): DeleteTranslationResult {
    if (!multiLanguageJsonData.value) {
      return { success: false, error: 'No multi-language data available' }
    }

    try {
      const { key, language } = deleteData

      if (language) {
        // Delete from specific language
        if (language in multiLanguageJsonData.value && key in multiLanguageJsonData.value[language]) {
          delete multiLanguageJsonData.value[language][key]
          return { success: true }
        }
        return { success: false, error: 'Translation key not found in specified language' }
      } else {
        // Delete from all languages
        let deleted = false
        Object.keys(multiLanguageJsonData.value).forEach(lang => {
          if (key in multiLanguageJsonData.value![lang]) {
            delete multiLanguageJsonData.value![lang][key]
            deleted = true
          }
        })
        return deleted
          ? { success: true }
          : { success: false, error: 'Translation key not found in any language' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  return {
    // State
    csvData,
    jsonData,
    multiLanguageJsonData,
    multipleJsonData,

    // Getters
    hasData,
    hasCSVData,
    hasJSONData,
    hasMultiLanguageData,
    hasMultipleJSONData,
    totalEntries,

    // Actions
    setCSVData,
    setJSONData,
    setMultiLanguageJSONData,
    setMultipleJSONData,
    addToMultipleJSONData,
    removeFromMultipleJSONData,
    clearAllData,
    clearCSVData,
    clearJSONData,
    clearMultiLanguageData,
    clearMultipleJSONData,

    // Edit/Delete operations
    editTranslationInJSON,
    editTranslationInCSV,
    editTranslationInMultiLanguage,
    deleteTranslationFromJSON,
    deleteTranslationFromCSV,
    deleteTranslationFromMultiLanguage
  }
})
