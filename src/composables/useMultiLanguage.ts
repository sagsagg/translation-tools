import { ref, computed, reactive } from 'vue'
import type {
  Language,
  LanguageSelection,
  MultiLanguageTranslationData,
  TranslationData,
  CSVData
} from '@/types'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getLanguageByCode } from '@/constants/languages'
import { ConversionEngine } from '@/utils/conversion'
import { csvToMultiLanguageJSON } from '@/utils/csv'

export function useMultiLanguage() {
  const selectedLanguages = ref<Language[]>([DEFAULT_LANGUAGE])
  const primaryLanguage = ref<Language>(DEFAULT_LANGUAGE)
  const translationData = reactive<MultiLanguageTranslationData>({})

  const multiLanguageOptions = reactive({
    generateSeparateFiles: true,
    includeEmptyValues: true,
    addLanguagePrefix: true,
    overwriteExisting: false
  })

  const availableLanguages = computed(() => SUPPORTED_LANGUAGES)

  const hasMultipleLanguages = computed(() => selectedLanguages.value.length > 1)

  const languageCodes = computed(() => selectedLanguages.value.map(lang => lang?.code))

  const translationStats = computed(() => {
    const stats = {
      totalLanguages: selectedLanguages.value.length,
      totalKeys: 0,
      completedTranslations: 0,
      missingTranslations: 0,
      emptyValues: 0
    }

    const allKeys = new Set<string>()

    // Collect all unique keys
    Object.values(translationData).forEach(langData => {
      Object.keys(langData).forEach(key => allKeys.add(key))
    })

    stats.totalKeys = allKeys.size

    // Calculate completion statistics
    allKeys.forEach(key => {
      selectedLanguages.value.forEach(lang => {
        const value = translationData[lang?.code]?.[key]
        if (value && value.trim() !== '') {
          stats.completedTranslations++
        } else if (value === '') {
          stats.emptyValues++
        } else {
          stats.missingTranslations++
        }
      })
    })

    return stats
  })

  function updateLanguageSelection(selection: LanguageSelection) {
    selectedLanguages.value = selection.selected
    primaryLanguage.value = selection.primary

    // Ensure primary language data exists
    if (!translationData[selection.primary.code]) {
      translationData[selection.primary.code] = {}
    }
  }

  function addLanguage(language: Language) {
    if (!selectedLanguages.value.find(lang => lang?.code === language.code)) {
      selectedLanguages.value.push(language)

      // Initialize empty translation data for new language
      if (!translationData[language.code]) {
        translationData[language.code] = {}
      }
    }
  }

  function removeLanguage(languageCode: string) {
    // Don't allow removing primary language
    if (languageCode === primaryLanguage.value.code) {
      return false
    }

    const index = selectedLanguages.value.findIndex(lang => lang?.code === languageCode)
    if (index > -1) {
      selectedLanguages.value.splice(index, 1)
      delete translationData[languageCode]
      return true
    }
    return false
  }

  function setPrimaryLanguage(language: Language) {
    primaryLanguage.value = language

    // Ensure primary language is in selected languages
    if (!selectedLanguages.value.find(lang => lang?.code === language.code)) {
      selectedLanguages.value.unshift(language)
    }

    // Ensure primary language data exists
    if (!translationData[language.code]) {
      translationData[language.code] = {}
    }
  }

  function loadTranslationData(data: MultiLanguageTranslationData) {
    // Clear existing data
    Object.keys(translationData).forEach(key => {
      delete translationData[key]
    })

    // Load new data
    Object.assign(translationData, data)

    // Update selected languages based on loaded data
    const loadedLanguages = Object.keys(data)
      .map(code => getLanguageByCode(code))
      .filter((lang): lang is Language => lang !== null)

    if (loadedLanguages.length > 0) {
      selectedLanguages.value = loadedLanguages

      // Set first language as primary if current primary is not in loaded data
      if (!loadedLanguages.find(lang => lang?.code === primaryLanguage.value?.code)) {
        primaryLanguage.value = loadedLanguages[0]
      }
    }
  }

  function loadFromCSV(csvData: CSVData) {
    const multiLangData = csvToMultiLanguageJSON(csvData)
    loadTranslationData(multiLangData)
  }

  function loadFromJSON(jsonData: TranslationData, languageCode: string) {
    const language = getLanguageByCode(languageCode)
    if (language) {
      translationData[languageCode] = { ...jsonData }

      // Add language to selection if not already present
      if (!selectedLanguages.value.find(lang => lang?.code === languageCode)) {
        selectedLanguages.value.push(language)
      }
    }
  }

  function exportToCSV(filename?: string): string {
    const csvContent = ConversionEngine.multipleJSONToCSV(translationData, selectedLanguages.value)

    if (filename) {
      ConversionEngine.downloadCSV(csvContent, filename)
    }

    return csvContent
  }

  function exportToMultipleJSON(baseFilename?: string) {
    const basename = baseFilename || 'translations'

    if (multiLanguageOptions.generateSeparateFiles) {
      ConversionEngine.downloadMultipleJSON(translationData, basename)
    } else {
      // Download as single file with all languages
      const filename = `${basename}_multilang.json`
      const blob = new Blob([JSON.stringify(translationData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  function updateTranslation(languageCode: string, key: string, value: string) {
    if (!translationData[languageCode]) {
      translationData[languageCode] = {}
    }

    translationData[languageCode][key] = value
  }

  function deleteTranslation(key: string, languageCode?: string) {
    if (languageCode) {
      // Delete from specific language
      if (translationData[languageCode]) {
        delete translationData[languageCode][key]
      }
    } else {
      // Delete from all languages
      Object.keys(translationData).forEach(langCode => {
        if (translationData[langCode]) {
          delete translationData[langCode][key]
        }
      })
    }
  }

  function addTranslationKey(key: string, values: Record<string, string> = {}) {
    selectedLanguages.value.forEach(lang => {
      if (!translationData[lang?.code]) {
        translationData[lang?.code] = {}
      }

      translationData[lang?.code][key] = values[lang?.code] || ''
    })
  }

  function getTranslation(languageCode: string, key: string): string {
    return translationData[languageCode]?.[key] || ''
  }

  function getAllTranslationsForKey(key: string): Record<string, string> {
    const result: Record<string, string> = {}

    selectedLanguages.value.forEach(lang => {
      result[lang?.code] = getTranslation(lang?.code, key)
    })

    return result
  }

  function findMissingTranslations(): Array<{ key: string; missingLanguages: string[] }> {
    const allKeys = new Set<string>()

    // Collect all unique keys
    Object.values(translationData).forEach(langData => {
      Object.keys(langData).forEach(key => allKeys.add(key))
    })

    const missing: Array<{ key: string; missingLanguages: string[] }> = []

    allKeys.forEach(key => {
      const missingLanguages: string[] = []

      selectedLanguages.value.forEach(lang => {
        const value = translationData[lang?.code]?.[key]
        if (!value || value.trim() === '') {
          missingLanguages.push(lang?.code)
        }
      })

      if (missingLanguages.length > 0) {
        missing.push({ key, missingLanguages })
      }
    })

    return missing
  }

  function clearAllData() {
    Object.keys(translationData).forEach(key => {
      delete translationData[key]
    })
  }

  function resetToDefaults() {
    selectedLanguages.value = [DEFAULT_LANGUAGE]
    primaryLanguage.value = DEFAULT_LANGUAGE
    clearAllData()
    translationData[DEFAULT_LANGUAGE.code] = {}
  }

  return {
    // State
    selectedLanguages: computed(() => selectedLanguages.value),
    primaryLanguage: computed(() => primaryLanguage.value),
    translationData: computed(() => translationData),
    multiLanguageOptions,

    // Computed
    availableLanguages,
    hasMultipleLanguages,
    languageCodes,
    translationStats,

    // Methods
    updateLanguageSelection,
    addLanguage,
    removeLanguage,
    setPrimaryLanguage,
    loadTranslationData,
    loadFromCSV,
    loadFromJSON,
    exportToCSV,
    exportToMultipleJSON,
    updateTranslation,
    deleteTranslation,
    addTranslationKey,
    getTranslation,
    getAllTranslationsForKey,
    findMissingTranslations,
    clearAllData,
    resetToDefaults
  }
}
