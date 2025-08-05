import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type {
  Language,
  LanguageSelection,
  LanguageOptions,
  MultiLanguageTranslationData
} from '@/types'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getLanguageByCode } from '@/constants/languages'

export const useLanguageStore = defineStore('language', () => {
  // State
  const selectedLanguages = ref<Language[]>([DEFAULT_LANGUAGE])
  const primaryLanguage = ref<Language>(DEFAULT_LANGUAGE)
  const tableLanguages = ref<Language[]>([DEFAULT_LANGUAGE])

  const languageOptions = reactive<LanguageOptions>({
    generateSeparateFiles: true,
    includeEmptyValues: true,
    addLanguagePrefix: true
  })

  const multiLanguageOptions = reactive({
    generateSeparateFiles: true,
    includeEmptyValues: true,
    addLanguagePrefix: true,
    overwriteExisting: false
  })

  // Getters
  const availableLanguages = computed(() => SUPPORTED_LANGUAGES)

  const hasMultipleLanguages = computed(() => selectedLanguages.value.length > 1)

  const languageCodes = computed(() => selectedLanguages.value.map(lang => lang?.code))

  const primaryLanguageCode = computed(() => primaryLanguage.value?.code)

  const selectedLanguageNames = computed(() =>
    selectedLanguages.value.map(lang => lang?.name || lang?.code)
  )

  const isLanguageSelected = computed(() => (languageCode: string) =>
    selectedLanguages.value.some(lang => lang.code === languageCode)
  )

  const getSelectedLanguageByCode = computed(() => (code: string) =>
    selectedLanguages.value.find(lang => lang.code === code)
  )

  // Translation statistics
  const translationStats = computed(() => {
    return (translationData: MultiLanguageTranslationData) => {
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
          const langData = translationData[lang.code]
          if (langData && key in langData) {
            const value = langData[key]
            if (value && value.trim() !== '') {
              stats.completedTranslations++
            } else {
              stats.emptyValues++
            }
          } else {
            stats.missingTranslations++
          }
        })
      })

      return stats
    }
  })

  // Actions
  function updateLanguageSelection(selection: LanguageSelection) {
    // Create deep copies to avoid mutating the original data
    selectedLanguages.value = structuredClone(selection.selected)
    primaryLanguage.value = structuredClone(selection.primary)
  }

  function addTableLanguage(language: Language) {
    if (!tableLanguages.value.some(lang => lang.code === language.code)) {
      // Create a copy of the language object to avoid mutations
      tableLanguages.value.push(structuredClone(language))
    }
  }

  function removeTableLanguage(language: Language) {
    // Prevent removing English (primary language) or if it's the only language
    if (language.code === 'en' || tableLanguages.value.length <= 1) {
      return false
    }

    const index = tableLanguages.value.findIndex(lang => lang.code === language.code)
    if (index > -1) {
      tableLanguages.value.splice(index, 1)
      return true
    }
    return false
  }

  function setTableLanguages(languages: Language[]) {
    // Create a deep copy to avoid mutating the original array
    tableLanguages.value = structuredClone(languages)
  }

  function addLanguage(language: Language) {
    if (!selectedLanguages.value.some(lang => lang.code === language.code)) {
      // Create a copy of the language object to avoid mutations
      selectedLanguages.value.push(structuredClone(language))
    }
  }

  function removeLanguage(languageCode: string) {
    const index = selectedLanguages.value.findIndex(lang => lang.code === languageCode)
    if (index > -1) {
      selectedLanguages.value.splice(index, 1)

      // If we removed the primary language, set the first remaining language as primary
      if (primaryLanguage.value.code === languageCode && selectedLanguages.value.length > 0) {
        primaryLanguage.value = selectedLanguages.value[0]
      }
    }
  }

  function setPrimaryLanguage(language: Language) {
    // Create a copy of the language object to avoid mutations
    primaryLanguage.value = structuredClone(language)

    // Ensure the primary language is in the selected languages
    if (!selectedLanguages.value.some(lang => lang.code === language.code)) {
      selectedLanguages.value.unshift(structuredClone(language))
    }
  }

  function setPrimaryLanguageByCode(languageCode: string) {
    const language = getLanguageByCode(languageCode)
    if (language) {
      setPrimaryLanguage(language)
    }
  }

  function updateLanguageOptions(options: Partial<LanguageOptions>) {
    Object.assign(languageOptions, options)
  }

  function updateMultiLanguageOptions(options: Partial<typeof multiLanguageOptions>) {
    Object.assign(multiLanguageOptions, options)
  }

  function resetToDefaults() {
    selectedLanguages.value = [DEFAULT_LANGUAGE]
    primaryLanguage.value = DEFAULT_LANGUAGE

    Object.assign(languageOptions, {
      generateSeparateFiles: true,
      includeEmptyValues: true,
      addLanguagePrefix: true
    })

    Object.assign(multiLanguageOptions, {
      generateSeparateFiles: true,
      includeEmptyValues: true,
      addLanguagePrefix: true,
      overwriteExisting: false
    })
  }

  function validateLanguageSelection(): { isValid: boolean; error?: string } {
    if (selectedLanguages.value.length === 0) {
      return { isValid: false, error: 'At least one language must be selected' }
    }

    if (!primaryLanguage.value) {
      return { isValid: false, error: 'Primary language must be set' }
    }

    if (!selectedLanguages.value.some(lang => lang.code === primaryLanguage.value.code)) {
      return { isValid: false, error: 'Primary language must be in the selected languages list' }
    }

    return { isValid: true }
  }

  // Helper function to get language name from code
  function getLanguageName(code: string): string {
    const languageMap: Record<string, string> = {
      'en': 'English',
      'id': 'Indonesian',
      'zh-cn': 'Chinese_Simplified',
      'zh-tw': 'Chinese_Traditional'
    }
    return languageMap[code] || code
  }

  // Helper function to get display name for language
  function getLanguageDisplayName(language: Language): string {
    return language.nativeName || language.name || language.code
  }

  // Helper function to sort languages by name
  function sortLanguagesByName(languages: Language[]): Language[] {
    return [...languages].sort((a, b) => {
      const nameA = getLanguageDisplayName(a)
      const nameB = getLanguageDisplayName(b)
      return nameA.localeCompare(nameB)
    })
  }

  return {
    // State
    selectedLanguages,
    primaryLanguage,
    tableLanguages,
    languageOptions,
    multiLanguageOptions,

    // Getters
    availableLanguages,
    hasMultipleLanguages,
    languageCodes,
    primaryLanguageCode,
    selectedLanguageNames,
    isLanguageSelected,
    getSelectedLanguageByCode,
    translationStats,

    // Actions
    updateLanguageSelection,
    addLanguage,
    removeLanguage,
    setPrimaryLanguage,
    setPrimaryLanguageByCode,
    updateLanguageOptions,
    updateMultiLanguageOptions,
    resetToDefaults,
    validateLanguageSelection,

    // Table language management
    addTableLanguage,
    removeTableLanguage,
    setTableLanguages,

    // Helper functions
    getLanguageName,
    getLanguageDisplayName,
    sortLanguagesByName
  }
})
