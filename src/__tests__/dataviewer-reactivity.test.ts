import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTranslationStore, useLanguageStore } from '@/stores'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import type { CSVData } from '@/types'

describe('DataViewer Reactivity Fix', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should ensure store CSV data takes precedence over props for reactivity', () => {
    const translationStore = useTranslationStore()
    const languageStore = useLanguageStore()

    // Initial CSV data (simulates props.csvData)
    const propsCSVData: CSVData = {
      headers: ['Key', 'English'],
      rows: [
        { Key: 'hello', English: 'Hello' },
        { Key: 'world', English: 'World' }
      ]
    }

    // Simulate the DataViewer logic: when CSV data is not in store, use props
    expect(translationStore.csvData).toBeUndefined()
    const initialData = translationStore.csvData || propsCSVData
    expect(initialData).toBe(propsCSVData)
    expect(initialData.headers).toEqual(['Key', 'English'])

    // Simulate handleAddLanguage: set CSV data in store first
    translationStore.setCSVData(propsCSVData)
    expect(translationStore.csvData).toBeDefined()
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English'])

    // Add language to language store
    languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1]) // Indonesian

    // Add column to CSV data in store
    translationStore.addLanguageColumn('id', 'Indonesian')

    // Verify store data has been updated
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Indonesian'])
    expect(translationStore.csvData?.rows).toHaveLength(2)
    expect(translationStore.csvData?.rows[0]).toEqual({
      Key: 'hello',
      English: 'Hello',
      Indonesian: ''
    })

    // Simulate DataViewer displayData logic: store data should take precedence
    const currentData = translationStore.csvData || propsCSVData
    expect(currentData).toBe(translationStore.csvData) // Should be store data, not props
    expect(currentData.headers).toEqual(['Key', 'English', 'Indonesian'])

    // Verify props data is unchanged (immutable)
    expect(propsCSVData.headers).toEqual(['Key', 'English'])
    expect(propsCSVData.rows[0]).toEqual({ Key: 'hello', English: 'Hello' })
  })

  it('should handle multiple language additions with proper reactivity', () => {
    const translationStore = useTranslationStore()
    const languageStore = useLanguageStore()

    // Initial data
    const csvData: CSVData = {
      headers: ['Key', 'English'],
      rows: [{ Key: 'test', English: 'Test' }]
    }

    // Set data in store (simulates DataViewer initialization)
    translationStore.setCSVData(csvData)
    languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])

    // Verify initial state
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English'])

    // Add Indonesian
    languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
    translationStore.addLanguageColumn('id', 'Indonesian')

    // Verify Indonesian was added
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Indonesian'])
    expect(translationStore.csvData?.rows[0].Indonesian).toBe('')

    // Add Chinese Simplified
    languageStore.addTableLanguage(SUPPORTED_LANGUAGES[2])
    translationStore.addLanguageColumn('zh-CN', 'Chinese Simplified')

    // Verify Chinese Simplified was added
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Indonesian', 'Chinese Simplified'])
    expect(translationStore.csvData?.rows[0]['Chinese Simplified']).toBe('')

    // Verify all data is consistent
    expect(translationStore.csvData?.rows[0]).toEqual({
      Key: 'test',
      English: 'Test',
      Indonesian: '',
      'Chinese Simplified': ''
    })

    // Verify language store is updated
    expect(languageStore.tableLanguages).toHaveLength(3)
    const languageCodes = languageStore.tableLanguages.map(lang => lang.code)
    expect(languageCodes).toEqual(['en', 'id', 'zh-CN'])
  })

  it('should maintain reactivity when removing languages', () => {
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

    translationStore.setCSVData(csvData)
    languageStore.setTableLanguages([
      SUPPORTED_LANGUAGES[0], // English
      SUPPORTED_LANGUAGES[1], // Indonesian
      SUPPORTED_LANGUAGES[2]  // Chinese Simplified
    ])

    // Verify initial state
    expect(translationStore.csvData?.headers).toHaveLength(4)
    expect(languageStore.tableLanguages).toHaveLength(3)

    // Remove Indonesian
    const removed = languageStore.removeTableLanguage(SUPPORTED_LANGUAGES[1])
    expect(removed).toBe(true)
    translationStore.removeLanguageColumn('Indonesian')

    // Verify Indonesian was removed
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Chinese Simplified'])
    expect(translationStore.csvData?.rows[0]).toEqual({
      Key: 'test',
      English: 'Test',
      'Chinese Simplified': '测试'
    })
    expect(translationStore.csvData?.rows[0]).not.toHaveProperty('Indonesian')

    // Verify language store is updated
    expect(languageStore.tableLanguages).toHaveLength(2)
    const languageCodes = languageStore.tableLanguages.map(lang => lang.code)
    expect(languageCodes).toEqual(['en', 'zh-CN'])
  })

  it('should handle edge case: adding language when no CSV data exists', () => {
    const translationStore = useTranslationStore()
    const languageStore = useLanguageStore()

    // No CSV data initially
    expect(translationStore.csvData).toBeUndefined()

    // Try to add language (should not crash)
    languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
    translationStore.addLanguageColumn('id', 'Indonesian')

    // Should still have no CSV data (function should return early)
    expect(translationStore.csvData).toBeUndefined()

    // Language store should still be updated
    expect(languageStore.tableLanguages).toHaveLength(2) // Default English + Indonesian
  })

  it('should prevent duplicate language additions', () => {
    const translationStore = useTranslationStore()
    const languageStore = useLanguageStore()

    const csvData: CSVData = {
      headers: ['Key', 'English'],
      rows: [{ Key: 'test', English: 'Test' }]
    }

    translationStore.setCSVData(csvData)
    languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])

    // Add Indonesian
    languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
    translationStore.addLanguageColumn('id', 'Indonesian')

    expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Indonesian'])

    // Try to add Indonesian again
    languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
    translationStore.addLanguageColumn('id', 'Indonesian')

    // Should still only have one Indonesian column
    expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Indonesian'])
    
    // Language store should not have duplicates
    const indonesianCount = languageStore.tableLanguages.filter(lang => lang.code === 'id').length
    expect(indonesianCount).toBe(1)
  })
})
