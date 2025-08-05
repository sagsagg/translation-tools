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
    // Create a deep copy to avoid mutating the original data
    if (data) {
      csvData.value = {
        headers: [...data.headers],
        rows: data.rows.map(row => ({ ...row }))
      }
    } else {
      csvData.value = data
    }
  }

  function addLanguageColumn(_languageCode: string, languageName: string) {
    if (!csvData.value) return

    // Add the new language to headers if not already present
    if (!csvData.value.headers.includes(languageName)) {
      csvData.value.headers.push(languageName)
    }

    // Add empty values for the new language in all existing rows
    csvData.value.rows.forEach(row => {
      if (!(languageName in row)) {
        row[languageName] = ''
      }
    })
  }

  function removeLanguageColumn(languageName: string) {
    if (!csvData.value) return

    // Remove the language from headers
    const headerIndex = csvData.value.headers.indexOf(languageName)
    if (headerIndex > -1) {
      csvData.value.headers.splice(headerIndex, 1)
    }

    // Remove the language column from all rows
    csvData.value.rows.forEach(row => {
      delete row[languageName]
    })
  }

  function setJSONData(data: TranslationData | undefined) {
    // Create a deep copy to avoid mutating the original data
    jsonData.value = data ? structuredClone(data) : data
  }

  function setMultiLanguageJSONData(data: MultiLanguageTranslationData | undefined) {
    // Create a deep copy to avoid mutating the original data
    multiLanguageJsonData.value = data ? structuredClone(data) : data
  }

  function setMultipleJSONData(data: Record<string, TranslationData>) {
    // Create a deep copy to avoid mutating the original data
    multipleJsonData.value = structuredClone(data)
  }

  function addToMultipleJSONData(languageCode: string, data: TranslationData) {
    // Create a deep copy to avoid mutating the original data
    multipleJsonData.value[languageCode] = structuredClone(data)
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

      // Create immutable update by filtering out the key
      const updatedData = { ...jsonData.value }
      delete updatedData[key]

      // Update store to trigger reactivity
      setJSONData(updatedData)
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

      // Find the row to delete by matching the key
      const rowIndex = csvData.value.rows.findIndex(row => row.Key === key)
      if (rowIndex === -1) {
        return { success: false, error: 'Translation key not found' }
      }

      // Create a new CSV data object with the row removed (immutable update)
      const updatedCSVData = {
        ...csvData.value,
        rows: csvData.value.rows.filter(row => row.Key !== key)
      }

      // Update the store with the new data to trigger reactivity
      setCSVData(updatedCSVData)

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
          // Create immutable update for specific language
          const updatedData = { ...multiLanguageJsonData.value }
          updatedData[language] = { ...updatedData[language] }
          delete updatedData[language][key]

          // Update store to trigger reactivity
          setMultiLanguageJSONData(updatedData)
          return { success: true }
        }
        return { success: false, error: 'Translation key not found in specified language' }
      } else {
        // Delete from all languages
        let deleted = false
        const updatedData = { ...multiLanguageJsonData.value }

        Object.keys(updatedData).forEach(lang => {
          if (key in updatedData[lang]) {
            updatedData[lang] = { ...updatedData[lang] }
            delete updatedData[lang][key]
            deleted = true
          }
        })

        if (deleted) {
          // Update store to trigger reactivity
          setMultiLanguageJSONData(updatedData)
          return { success: true }
        }

        return { success: false, error: 'Translation key not found in any language' }
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

    // Language column management
    addLanguageColumn,
    removeLanguageColumn,

    // Edit/Delete operations
    editTranslationInJSON,
    editTranslationInCSV,
    editTranslationInMultiLanguage,
    deleteTranslationFromJSON,
    deleteTranslationFromCSV,
    deleteTranslationFromMultiLanguage
  }
})
