import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTranslationStore, useLanguageStore } from '@/stores'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import { memoizedTransforms } from '@/utils/memoization'
import type { TranslationData, MultiLanguageTranslationData, CSVData } from '@/types'

describe('JSON to CSV Language Management Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Single JSON File Upload', () => {
    it('should convert JSON data to CSV format for language management', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      const jsonData: TranslationData = {
        welcome: 'Welcome',
        hello: 'Hello',
        goodbye: 'Goodbye'
      }

      // Simulate the initialization logic from DataViewer
      const language = 'English'
      const csvData: CSVData = {
        headers: ['Key', language],
        rows: Object.entries(jsonData).map(([key, value]) => ({
          Key: key,
          [language]: value
        }))
      }

      translationStore.setCSVData(csvData)
      const englishLang = SUPPORTED_LANGUAGES.find(sl => sl.code === 'en') || SUPPORTED_LANGUAGES[0]
      languageStore.setTableLanguages([englishLang])

      // Verify store has CSV data
      expect(translationStore.csvData).toBeDefined()
      expect(translationStore.csvData?.headers).toEqual(['Key', 'English'])
      expect(translationStore.csvData?.rows).toHaveLength(3)
      expect(translationStore.csvData?.rows[0]).toEqual({
        Key: 'welcome',
        English: 'Welcome'
      })

      // Verify language store is initialized
      expect(languageStore.tableLanguages).toHaveLength(1)
      expect(languageStore.tableLanguages[0].code).toBe('en')
    })

    it('should enable language column management for JSON uploads', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      const jsonData: TranslationData = {
        test: 'Test Value'
      }

      // Simulate initialization from JSON
      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: Object.entries(jsonData).map(([key, value]) => ({
          Key: key,
          English: value
        }))
      }

      translationStore.setCSVData(csvData)
      const englishLang = SUPPORTED_LANGUAGES.find(sl => sl.code === 'en') || SUPPORTED_LANGUAGES[0]
      languageStore.setTableLanguages([englishLang])

      // Verify initial state
      expect(translationStore.csvData?.headers).toEqual(['Key', 'English'])

      // Simulate adding Indonesian language
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1]) // Indonesian
      translationStore.addLanguageColumn('id', 'Indonesian')

      // Verify language was added
      expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Indonesian'])
      expect(translationStore.csvData?.rows[0]).toEqual({
        Key: 'test',
        English: 'Test Value',
        Indonesian: ''
      })
    })
  })

  describe('Multi-Language JSON File Upload', () => {
    it('should initialize store with multi-language CSV data', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      const multiLanguageJsonData: MultiLanguageTranslationData = {
        en: {
          welcome: 'Welcome',
          hello: 'Hello'
        },
        id: {
          welcome: 'Selamat datang',
          hello: 'Halo'
        }
      }

      // Simulate initialization from multi-language JSON
      const languages = Object.keys(multiLanguageJsonData).sort()
      const csvData = memoizedTransforms.jsonToCSV(multiLanguageJsonData, languages)
      translationStore.setCSVData(csvData)

      const supportedLanguages = languages.map(lang =>
        SUPPORTED_LANGUAGES.find(sl => sl.code === lang || sl.name === lang) ||
        { code: lang, name: lang, nativeName: lang }
      )
      languageStore.setTableLanguages(supportedLanguages)

      // Verify store has multi-language CSV data
      expect(translationStore.csvData).toBeDefined()
      expect(translationStore.csvData?.headers).toEqual(['Key', 'en', 'id'])
      expect(translationStore.csvData?.rows).toHaveLength(2)

      // Verify language store has both languages
      expect(languageStore.tableLanguages).toHaveLength(2)
      const languageCodes = languageStore.tableLanguages.map(lang => lang.code)
      expect(languageCodes).toContain('en')
      expect(languageCodes).toContain('id')
    })

    it('should enable adding more languages to multi-language JSON', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      const multiLanguageJsonData: MultiLanguageTranslationData = {
        en: { test: 'Test' },
        id: { test: 'Tes' }
      }

      // Initialize from multi-language JSON
      const languages = Object.keys(multiLanguageJsonData).sort()
      const csvData = memoizedTransforms.jsonToCSV(multiLanguageJsonData, languages)
      translationStore.setCSVData(csvData)

      const supportedLanguages = languages.map(lang =>
        SUPPORTED_LANGUAGES.find(sl => sl.code === lang) || { code: lang, name: lang, nativeName: lang }
      )
      languageStore.setTableLanguages(supportedLanguages)

      // Add Chinese Simplified
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[2])
      translationStore.addLanguageColumn('zh-CN', 'Chinese Simplified')

      // Verify new language was added
      expect(translationStore.csvData?.headers).toEqual(['Key', 'en', 'id', 'Chinese Simplified'])
      expect(translationStore.csvData?.rows[0]).toEqual({
        Key: 'test',
        en: 'Test',
        id: 'Tes',
        'Chinese Simplified': ''
      })
    })
  })

  describe('Backward Compatibility', () => {
    it('should maintain existing CSV upload functionality', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      const csvData = {
        headers: ['Key', 'English', 'Spanish'],
        rows: [
          { Key: 'hello', English: 'Hello', Spanish: 'Hola' }
        ]
      }

      // Initialize from CSV data
      translationStore.setCSVData(csvData)
      const supportedLanguages = ['English', 'Spanish'].map(lang =>
        SUPPORTED_LANGUAGES.find(sl => sl.name === lang) ||
        { code: lang.toLowerCase(), name: lang, nativeName: lang }
      )
      languageStore.setTableLanguages(supportedLanguages)

      // Should work exactly as before
      expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Spanish'])
      expect(languageStore.tableLanguages).toHaveLength(2)

      // Should still be able to add languages
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
      translationStore.addLanguageColumn('id', 'Indonesian')

      expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Spanish', 'Indonesian'])
    })
  })
})
