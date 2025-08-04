import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTranslationStore, useLanguageStore } from '@/stores'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import type { CSVData } from '@/types'

describe('Language Column Workflow Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should complete full workflow: add language → update stores → display in table', () => {
    const translationStore = useTranslationStore()
    const languageStore = useLanguageStore()

    // Initial CSV data with English only
    const initialCSVData: CSVData = {
      headers: ['Key', 'English'],
      rows: [
        { Key: 'welcome', English: 'Welcome' },
        { Key: 'hello', English: 'Hello' },
        { Key: 'goodbye', English: 'Goodbye' }
      ]
    }

    // Set initial data in stores (simulates DataViewer initialization)
    translationStore.setCSVData(initialCSVData)
    languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]]) // English

    // Verify initial language state
    expect(languageStore.tableLanguages).toHaveLength(1)
    expect(languageStore.tableLanguages[0].code).toBe('en')

    // Verify initial CSV data in store
    expect(translationStore.csvData).toBeDefined()
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English'])
    expect(translationStore.csvData?.rows).toHaveLength(3)

    // Simulate adding Indonesian language through the component
    const indonesianLanguage = SUPPORTED_LANGUAGES[1] // Indonesian

    // Step 1: Add language to language store (simulates LanguageColumnManager action)
    languageStore.addTableLanguage(indonesianLanguage)

    // Step 2: Add column to CSV data (simulates DataViewer handleAddLanguage)
    translationStore.addLanguageColumn(indonesianLanguage.code, indonesianLanguage.name)

    // Verify language store update
    expect(languageStore.tableLanguages).toHaveLength(2)
    const hasIndonesian = languageStore.tableLanguages.some(lang => lang.code === 'id')
    expect(hasIndonesian).toBe(true)

    // Verify translation store update
    expect(translationStore.csvData?.headers).toContain('Indonesian')
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Indonesian'])

    // Verify existing rows get empty values for new language
    expect(translationStore.csvData?.rows).toHaveLength(3)
    translationStore.csvData?.rows.forEach(row => {
      expect(row).toHaveProperty('Indonesian')
      expect(row.Indonesian).toBe('') // Empty string for new language
      expect(row).toHaveProperty('English') // Existing data preserved
      expect(row.English).toBeTruthy() // Should have existing English values
    })

    // Verify specific row data integrity
    const welcomeRow = translationStore.csvData?.rows.find(row => row.Key === 'welcome')
    expect(welcomeRow).toBeDefined()
    expect(welcomeRow?.English).toBe('Welcome')
    expect(welcomeRow?.Indonesian).toBe('')

    const helloRow = translationStore.csvData?.rows.find(row => row.Key === 'hello')
    expect(helloRow).toBeDefined()
    expect(helloRow?.English).toBe('Hello')
    expect(helloRow?.Indonesian).toBe('')

    // The stores now contain the updated data ready for display in the table
    // The DataViewer component would reactively display the new Indonesian column with empty cells
  })

  it('should handle multiple language additions in sequence', () => {
    const translationStore = useTranslationStore()
    const languageStore = useLanguageStore()

    // Initial data
    const csvData: CSVData = {
      headers: ['Key', 'English'],
      rows: [
        { Key: 'test1', English: 'Test One' },
        { Key: 'test2', English: 'Test Two' }
      ]
    }

    // Set initial data in stores
    translationStore.setCSVData(csvData)
    languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])

    // Add languages in sequence: Indonesian, Chinese Simplified, Chinese Traditional
    const languagesToAdd = [
      SUPPORTED_LANGUAGES[1], // Indonesian
      SUPPORTED_LANGUAGES[2], // Chinese Simplified
      SUPPORTED_LANGUAGES[3]  // Chinese Traditional
    ]

    for (const language of languagesToAdd) {
      // Two-step process for each language
      languageStore.addTableLanguage(language)
      translationStore.addLanguageColumn(language.code, language.name)

      // Verify incremental updates
      const expectedLanguageCount = languageStore.tableLanguages.length
      const expectedHeaderCount = expectedLanguageCount + 1 // +1 for 'Key' column

      expect(translationStore.csvData?.headers).toHaveLength(expectedHeaderCount)
      expect(translationStore.csvData?.headers).toContain(language.name)

      // Verify all rows have the new language column with empty values
      translationStore.csvData?.rows.forEach(row => {
        expect(row).toHaveProperty(language.name)
        expect(row[language.name]).toBe('')
      })
    }

    // Final verification: all languages added
    expect(languageStore.tableLanguages).toHaveLength(4) // All supported languages
    expect(translationStore.csvData?.headers).toEqual([
      'Key', 'English', 'Indonesian', 'Chinese Simplified', 'Chinese Traditional'
    ])

    // Verify data integrity for all rows
    const test1Row = translationStore.csvData?.rows.find(row => row.Key === 'test1')
    expect(test1Row).toBeDefined()
    expect(test1Row?.English).toBe('Test One')
    expect(test1Row?.Indonesian).toBe('')
    expect(test1Row?.['Chinese Simplified']).toBe('')
    expect(test1Row?.['Chinese Traditional']).toBe('')
  })

  it('should maintain reactivity when CSV data is updated through store', () => {
    const translationStore = useTranslationStore()
    const languageStore = useLanguageStore()

    // Initial data
    const csvData: CSVData = {
      headers: ['Key', 'English'],
      rows: [{ Key: 'reactive_test', English: 'Reactive Test' }]
    }

    // Set initial data in stores
    translationStore.setCSVData(csvData)
    languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])

    // Verify initial state
    expect(translationStore.csvData?.headers).toHaveLength(2)

    // Add a language through store operations
    languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1]) // Indonesian
    translationStore.addLanguageColumn('id', 'Indonesian')

    // Verify the store reflects the changes
    expect(translationStore.csvData?.headers).toContain('Indonesian')
    expect(translationStore.csvData?.rows[0].Indonesian).toBe('')

    // Add another language
    languageStore.addTableLanguage(SUPPORTED_LANGUAGES[2]) // Chinese Simplified
    translationStore.addLanguageColumn('zh-CN', 'Chinese Simplified')

    // Verify both languages are present
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Indonesian', 'Chinese Simplified'])
    expect(translationStore.csvData?.rows[0]).toEqual({
      Key: 'reactive_test',
      English: 'Reactive Test',
      Indonesian: '',
      'Chinese Simplified': ''
    })
  })

  it('should handle language removal correctly', () => {
    const translationStore = useTranslationStore()
    const languageStore = useLanguageStore()

    // Start with multiple languages
    const csvData: CSVData = {
      headers: ['Key', 'English', 'Indonesian', 'Chinese Simplified'],
      rows: [
        {
          Key: 'test',
          English: 'Test',
          Indonesian: 'Tes',
          'Chinese Simplified': '测试'
        }
      ]
    }

    // Set initial data in stores
    translationStore.setCSVData(csvData)
    languageStore.setTableLanguages([
      SUPPORTED_LANGUAGES[0], // English
      SUPPORTED_LANGUAGES[1], // Indonesian
      SUPPORTED_LANGUAGES[2]  // Chinese Simplified
    ])

    // Remove Indonesian
    const removed = languageStore.removeTableLanguage(SUPPORTED_LANGUAGES[1])
    expect(removed).toBe(true)

    translationStore.removeLanguageColumn('Indonesian')

    // Verify removal
    expect(languageStore.tableLanguages).toHaveLength(2)
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Chinese Simplified'])
    expect(translationStore.csvData?.rows[0]).toEqual({
      Key: 'test',
      English: 'Test',
      'Chinese Simplified': '测试'
    })

    // Verify Indonesian data is completely removed
    expect(translationStore.csvData?.rows[0]).not.toHaveProperty('Indonesian')
  })
})
