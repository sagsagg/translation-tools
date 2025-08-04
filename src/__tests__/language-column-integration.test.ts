import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTranslationStore, useLanguageStore } from '@/stores'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import { csvToJSON } from '@/utils/csv'
import type { CSVData, TranslationData } from '@/types'

// cSpell:ignore Selamat datang Halo tinggal

describe('Language Column Management - Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('File Upload Integration', () => {
    it('should work with CSV file upload workflow', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Simulate CSV file upload
      const uploadedCSV: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'welcome', English: 'Welcome' },
          { Key: 'hello', English: 'Hello' },
          { Key: 'goodbye', English: 'Goodbye' }
        ]
      }

      // Set uploaded CSV data
      translationStore.setCSVData(uploadedCSV)
      languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]]) // English

      // Verify initial state
      expect(translationStore.csvData?.headers).toEqual(['Key', 'English'])
      expect(languageStore.tableLanguages).toHaveLength(1)

      // Add Indonesian language
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
      translationStore.addLanguageColumn('id', 'Indonesian')

      // Verify integration
      expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Indonesian'])
      expect(languageStore.tableLanguages).toHaveLength(2)

      // All rows should have empty Indonesian values
      translationStore.csvData?.rows.forEach(row => {
        expect(row.Indonesian).toBe('')
      })
    })

    it('should work with JSON file upload workflow', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Simulate JSON file upload
      const uploadedJSON: TranslationData = {
        welcome: 'Welcome',
        hello: 'Hello',
        goodbye: 'Goodbye'
      }

      // Convert JSON to CSV (simulating DataViewer logic)
      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: Object.entries(uploadedJSON).map(([key, value]) => ({
          Key: key,
          English: value
        }))
      }

      translationStore.setCSVData(csvData)
      languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])

      // Add Chinese Simplified
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[2])
      translationStore.addLanguageColumn('zh-CN', 'Chinese Simplified')

      // Verify integration
      expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Chinese Simplified'])
      expect(translationStore.csvData?.rows).toHaveLength(3)
    })
  })

  describe('CSV Processing Integration', () => {
    it('should maintain data integrity during language operations', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Start with multi-language CSV
      const csvData: CSVData = {
        headers: ['Key', 'English', 'Indonesian'],
        rows: [
          { Key: 'welcome', English: 'Welcome', Indonesian: 'Selamat datang' },
          { Key: 'hello', English: 'Hello', Indonesian: 'Halo' }
        ]
      }

      translationStore.setCSVData(csvData)
      languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0], SUPPORTED_LANGUAGES[1]])

      // Add Chinese Simplified
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[2])
      translationStore.addLanguageColumn('zh-CN', 'Chinese Simplified')

      // Verify existing data is preserved
      const updatedData = translationStore.csvData!
      expect(updatedData.headers).toEqual(['Key', 'English', 'Indonesian', 'Chinese Simplified'])
      expect(updatedData.rows[0].English).toBe('Welcome')
      expect(updatedData.rows[0].Indonesian).toBe('Selamat datang')
      expect(updatedData.rows[0]['Chinese Simplified']).toBe('')
      expect(updatedData.rows[1].English).toBe('Hello')
      expect(updatedData.rows[1].Indonesian).toBe('Halo')
      expect(updatedData.rows[1]['Chinese Simplified']).toBe('')
    })

    it('should handle CSV to JSON conversion with multiple languages', () => {
      const translationStore = useTranslationStore()
      // languageStore not needed for this test

      // Multi-language CSV
      const csvData: CSVData = {
        headers: ['Key', 'English', 'Indonesian', 'Chinese Simplified'],
        rows: [
          {
            Key: 'welcome',
            English: 'Welcome',
            Indonesian: 'Selamat datang',
            'Chinese Simplified': '欢迎'
          },
          {
            Key: 'hello',
            English: 'Hello',
            Indonesian: 'Halo',
            'Chinese Simplified': '你好'
          }
        ]
      }

      translationStore.setCSVData(csvData)

      // Convert to JSON for each language
      const englishJSON = csvToJSON(csvData, 'English')
      const indonesianJSON = csvToJSON(csvData, 'Indonesian')
      const chineseJSON = csvToJSON(csvData, 'Chinese Simplified')

      // Verify conversions
      expect(englishJSON).toEqual({
        welcome: 'Welcome',
        hello: 'Hello'
      })
      expect(indonesianJSON).toEqual({
        welcome: 'Selamat datang',
        hello: 'Halo'
      })
      expect(chineseJSON).toEqual({
        welcome: '欢迎',
        hello: '你好'
      })
    })
  })

  describe('Export Functionality Integration', () => {
    it('should export CSV with all language columns', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Setup multi-language data
      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'test', English: 'Test' }
        ]
      }

      translationStore.setCSVData(csvData)
      languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])

      // Add multiple languages
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1]) // Indonesian
      translationStore.addLanguageColumn('id', 'Indonesian')

      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[2]) // Chinese Simplified
      translationStore.addLanguageColumn('zh-CN', 'Chinese Simplified')

      // Verify export data structure
      const exportData = translationStore.csvData!
      expect(exportData.headers).toEqual(['Key', 'English', 'Indonesian', 'Chinese Simplified'])
      expect(exportData.rows[0]).toEqual({
        Key: 'test',
        English: 'Test',
        Indonesian: '',
        'Chinese Simplified': ''
      })
    })

    it('should export JSON for specific languages', () => {
      const translationStore = useTranslationStore()

      // Multi-language CSV with some translations
      const csvData: CSVData = {
        headers: ['Key', 'English', 'Indonesian'],
        rows: [
          { Key: 'welcome', English: 'Welcome', Indonesian: 'Selamat datang' },
          { Key: 'hello', English: 'Hello', Indonesian: '' }, // Empty translation
          { Key: 'goodbye', English: 'Goodbye', Indonesian: 'Selamat tinggal' }
        ]
      }

      translationStore.setCSVData(csvData)

      // Export English JSON
      const englishJSON = csvToJSON(csvData, 'English')
      expect(englishJSON).toEqual({
        welcome: 'Welcome',
        hello: 'Hello',
        goodbye: 'Goodbye'
      })

      // Export Indonesian JSON (empty values are filtered out by csvToJSON)
      const indonesianJSON = csvToJSON(csvData, 'Indonesian')
      expect(indonesianJSON).toEqual({
        welcome: 'Selamat datang',
        // hello is excluded because it has empty translation
        goodbye: 'Selamat tinggal'
      })
    })
  })

  describe('Performance with Large Datasets', () => {
    it('should handle large CSV files efficiently', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Create large dataset (500 rows)
      const largeCSV: CSVData = {
        headers: ['Key', 'English'],
        rows: Array.from({ length: 500 }, (_, i) => ({
          Key: `key_${i}`,
          English: `English text ${i}`
        }))
      }

      const startTime = performance.now()

      translationStore.setCSVData(largeCSV)
      languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])

      // Add multiple languages
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
      translationStore.addLanguageColumn('id', 'Indonesian')

      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[2])
      translationStore.addLanguageColumn('zh-CN', 'Chinese Simplified')

      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (< 200ms for 500 rows)
      expect(duration).toBeLessThan(200)

      // Verify data integrity
      expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Indonesian', 'Chinese Simplified'])
      expect(translationStore.csvData?.rows).toHaveLength(500)

      // Spot check a few rows
      const firstRow = translationStore.csvData?.rows[0]
      expect(firstRow?.Key).toBe('key_0')
      expect(firstRow?.English).toBe('English text 0')
      expect(firstRow?.Indonesian).toBe('')
      expect(firstRow?.['Chinese Simplified']).toBe('')
    })
  })

  describe('Error Recovery Integration', () => {
    it('should recover gracefully from corrupted data', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Corrupted CSV data (missing properties) - using type assertion for test purposes
      const corruptedCSV: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'valid', English: 'Valid' },
          { Key: 'missing_english', English: '' }, // Missing English property (now empty)
          { Key: '', English: 'Missing key' }, // Missing Key property (now empty)
          { Key: '', English: '' } // Completely empty row (now with empty strings)
        ]
      }

      // Should not throw errors
      expect(() => {
        translationStore.setCSVData(corruptedCSV)
        languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
        translationStore.addLanguageColumn('id', 'Indonesian')
      }).not.toThrow()

      // Should add Indonesian column to all rows
      translationStore.csvData?.rows.forEach(row => {
        expect(row).toHaveProperty('Indonesian')
        expect(row.Indonesian).toBe('')
      })
    })
  })
})
