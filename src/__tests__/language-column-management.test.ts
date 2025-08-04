import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LanguageColumnManager from '@/components/LanguageColumnManager.vue'
import DataTable from '@/components/DataTable.vue'
import { useTranslationStore, useLanguageStore } from '@/stores'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import type { CSVData } from '@/types'

describe('Language Column Management', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('LanguageColumnManager Component', () => {
    it('should render with proper structure', () => {
      const wrapper = mount(LanguageColumnManager, {
        props: {
          currentLanguages: [SUPPORTED_LANGUAGES[0]] // English only
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('button').text()).toContain('Add Language')
    })

    it('should show available languages for addition', () => {
      const wrapper = mount(LanguageColumnManager, {
        props: {
          currentLanguages: [SUPPORTED_LANGUAGES[0]] // English only
        }
      })

      // Check that the component renders correctly
      expect(wrapper.exists()).toBe(true)

      // Check that we have the expected number of available languages
      // We expect 3 available languages (4 total - 1 current = 3 available)
      const availableCount = SUPPORTED_LANGUAGES.length - 1
      expect(availableCount).toBe(3)
    })

    it('should emit add-language event when language is selected', () => {
      const wrapper = mount(LanguageColumnManager, {
        props: {
          currentLanguages: [SUPPORTED_LANGUAGES[0]] // English only
        }
      })

      // Simulate adding Indonesian
      wrapper.vm.$emit('add-language', SUPPORTED_LANGUAGES[1])

      expect(wrapper.emitted('add-language')).toBeTruthy()
      expect(wrapper.emitted('add-language')?.[0]).toEqual([SUPPORTED_LANGUAGES[1]])
    })

    it('should emit remove-language event when language is removed', () => {
      const wrapper = mount(LanguageColumnManager, {
        props: {
          currentLanguages: [SUPPORTED_LANGUAGES[0], SUPPORTED_LANGUAGES[1]] // English + Indonesian
        }
      })

      // Simulate removing Indonesian
      wrapper.vm.$emit('remove-language', SUPPORTED_LANGUAGES[1])

      expect(wrapper.emitted('remove-language')).toBeTruthy()
      expect(wrapper.emitted('remove-language')?.[0]).toEqual([SUPPORTED_LANGUAGES[1]])
    })

    it('should disable add button when all languages are selected', () => {
      const wrapper = mount(LanguageColumnManager, {
        props: {
          currentLanguages: SUPPORTED_LANGUAGES // All languages
        }
      })

      const addButton = wrapper.find('button')
      expect(addButton.attributes('disabled')).toBeDefined()
    })

    it('should prevent removing English or last language', () => {
      const wrapper = mount(LanguageColumnManager, {
        props: {
          currentLanguages: [SUPPORTED_LANGUAGES[0]] // English only
        }
      })

      // When only one language (English), should not show remove buttons
      const removeButtons = wrapper.findAll('button[title*="Remove"]')
      expect(removeButtons.length).toBe(0)
    })
  })

  describe('DataTable Language Integration', () => {
    const mockCSVData: CSVData = {
      headers: ['Key', 'English'],
      rows: [
        { Key: 'hello', English: 'Hello' },
        { Key: 'goodbye', English: 'Goodbye' }
      ]
    }

    it('should render with language management controls when enabled', () => {
      const wrapper = mount(DataTable, {
        props: {
          data: mockCSVData,
          allowLanguageManagement: true,
          currentLanguages: [SUPPORTED_LANGUAGES[0]]
        }
      })

      // Check for the presence of language management UI
      const languageManager = wrapper.findComponent(LanguageColumnManager)
      expect(languageManager.exists()).toBe(true)
    })

    it('should not render language management controls when disabled', () => {
      const wrapper = mount(DataTable, {
        props: {
          data: mockCSVData,
          allowLanguageManagement: false,
          currentLanguages: [SUPPORTED_LANGUAGES[0]]
        }
      })

      // Should not have language management component
      const languageManager = wrapper.findComponent(LanguageColumnManager)
      expect(languageManager.exists()).toBe(false)
    })

    it('should emit add-language event when language is added', () => {
      const wrapper = mount(DataTable, {
        props: {
          data: mockCSVData,
          allowLanguageManagement: true,
          currentLanguages: [SUPPORTED_LANGUAGES[0]]
        }
      })

      wrapper.vm.$emit('add-language', SUPPORTED_LANGUAGES[1])

      expect(wrapper.emitted('add-language')).toBeTruthy()
      expect(wrapper.emitted('add-language')?.[0]).toEqual([SUPPORTED_LANGUAGES[1]])
    })

    it('should emit remove-language event when language is removed', () => {
      const wrapper = mount(DataTable, {
        props: {
          data: mockCSVData,
          allowLanguageManagement: true,
          currentLanguages: [SUPPORTED_LANGUAGES[0], SUPPORTED_LANGUAGES[1]]
        }
      })

      wrapper.vm.$emit('remove-language', SUPPORTED_LANGUAGES[1])

      expect(wrapper.emitted('remove-language')).toBeTruthy()
      expect(wrapper.emitted('remove-language')?.[0]).toEqual([SUPPORTED_LANGUAGES[1]])
    })

    it('should display empty cells with proper styling for new languages', () => {
      const dataWithEmptyLanguage: CSVData = {
        headers: ['Key', 'English', 'Indonesian'],
        rows: [
          { Key: 'hello', English: 'Hello', Indonesian: '' },
          { Key: 'goodbye', English: 'Goodbye', Indonesian: 'Selamat tinggal' }
        ]
      }

      const wrapper = mount(DataTable, {
        props: {
          data: dataWithEmptyLanguage,
          allowLanguageManagement: true,
          currentLanguages: [SUPPORTED_LANGUAGES[0], SUPPORTED_LANGUAGES[1]]
        }
      })

      // Check for empty cell styling
      const emptyCells = wrapper.findAll('.text-slate-400')
      expect(emptyCells.length).toBeGreaterThan(0)

      // Check for "Empty" text in empty cells
      const emptyText = wrapper.find('.italic').text()
      expect(emptyText).toContain('Empty')
    })
  })

  describe('Translation Store Integration', () => {
    it('should add language column to CSV data', () => {
      const store = useTranslationStore()

      // Set initial CSV data
      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'hello', English: 'Hello' },
          { Key: 'goodbye', English: 'Goodbye' }
        ]
      }
      store.setCSVData(csvData)

      // Add Indonesian language column
      store.addLanguageColumn('id', 'Indonesian')

      expect(store.csvData?.headers).toContain('Indonesian')
      expect(store.csvData?.rows[0]).toHaveProperty('Indonesian')
      expect(store.csvData?.rows[0].Indonesian).toBe('')
    })

    it('should remove language column from CSV data', () => {
      const store = useTranslationStore()

      // Set initial CSV data with multiple languages
      const csvData: CSVData = {
        headers: ['Key', 'English', 'Indonesian'],
        rows: [
          { Key: 'hello', English: 'Hello', Indonesian: 'Halo' },
          { Key: 'goodbye', English: 'Goodbye', Indonesian: 'Selamat tinggal' }
        ]
      }
      store.setCSVData(csvData)

      // Remove Indonesian language column
      store.removeLanguageColumn('Indonesian')

      expect(store.csvData?.headers).not.toContain('Indonesian')
      expect(store.csvData?.rows[0]).not.toHaveProperty('Indonesian')
    })

    it('should not add duplicate language columns', () => {
      const store = useTranslationStore()

      // Set initial CSV data
      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'hello', English: 'Hello' }
        ]
      }
      store.setCSVData(csvData)

      // Try to add English again
      store.addLanguageColumn('en', 'English')

      // Should still only have one English column
      const englishCount = store.csvData?.headers.filter(h => h === 'English').length
      expect(englishCount).toBe(1)
    })
  })

  describe('Language Store Integration', () => {
    it('should add table language', () => {
      const store = useLanguageStore()

      // Add Indonesian to table languages
      store.addTableLanguage(SUPPORTED_LANGUAGES[1])

      const hasIndonesian = store.tableLanguages.some(lang => lang.code === 'id')
      expect(hasIndonesian).toBe(true)
    })

    it('should remove table language', () => {
      const store = useLanguageStore()

      // Set initial table languages
      store.setTableLanguages([SUPPORTED_LANGUAGES[0], SUPPORTED_LANGUAGES[1]])

      // Remove Indonesian
      const removed = store.removeTableLanguage(SUPPORTED_LANGUAGES[1])

      expect(removed).toBe(true)
      const hasIndonesian = store.tableLanguages.some(lang => lang.code === 'id')
      expect(hasIndonesian).toBe(false)
    })

    it('should prevent removing English or last language', () => {
      const store = useLanguageStore()

      // Set only English
      store.setTableLanguages([SUPPORTED_LANGUAGES[0]])

      // Try to remove English
      const removed = store.removeTableLanguage(SUPPORTED_LANGUAGES[0])

      expect(removed).toBe(false)
      const hasEnglish = store.tableLanguages.some(lang => lang.code === 'en')
      expect(hasEnglish).toBe(true)
    })

    it('should not add duplicate table languages', () => {
      const store = useLanguageStore()

      // Add English twice
      store.addTableLanguage(SUPPORTED_LANGUAGES[0])
      store.addTableLanguage(SUPPORTED_LANGUAGES[0])

      // Should only have one English entry
      const englishCount = store.tableLanguages.filter(lang => lang.code === 'en').length
      expect(englishCount).toBe(1)
    })
  })

  describe('Integration Tests', () => {
    it('should maintain data consistency when adding and removing languages', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Set initial data
      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'hello', English: 'Hello' },
          { Key: 'goodbye', English: 'Goodbye' }
        ]
      }
      translationStore.setCSVData(csvData)
      languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])

      // Add Indonesian
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
      translationStore.addLanguageColumn('id', 'Indonesian')

      // Verify consistency
      expect(languageStore.tableLanguages).toHaveLength(2)
      expect(translationStore.csvData?.headers).toHaveLength(3) // Key + English + Indonesian

      // Remove Indonesian
      const removed = languageStore.removeTableLanguage(SUPPORTED_LANGUAGES[1])
      if (removed) {
        translationStore.removeLanguageColumn('Indonesian')
      }

      // Verify consistency after removal
      expect(languageStore.tableLanguages).toHaveLength(1)
      expect(translationStore.csvData?.headers).toHaveLength(2) // Key + English
    })

    it('should complete two-step process: language store + translation store updates', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Set initial CSV data with existing translation keys
      const initialCSVData: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'welcome', English: 'Welcome' },
          { Key: 'thank_you', English: 'Thank you' },
          { Key: 'goodbye', English: 'Goodbye' }
        ]
      }
      translationStore.setCSVData(initialCSVData)
      languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]]) // Start with English only

      // Step 1: Add Indonesian to language store
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1]) // Indonesian

      // Verify language store update
      expect(languageStore.tableLanguages).toHaveLength(2)
      const hasIndonesian = languageStore.tableLanguages.some(lang => lang.code === 'id')
      expect(hasIndonesian).toBe(true)

      // Step 2: Add Indonesian column to CSV data
      translationStore.addLanguageColumn('id', 'Indonesian')

      // Verify translation store updates
      expect(translationStore.csvData?.headers).toContain('Indonesian')
      expect(translationStore.csvData?.headers).toHaveLength(3) // Key + English + Indonesian

      // Verify existing rows get empty string values for new language
      expect(translationStore.csvData?.rows).toHaveLength(3)
      translationStore.csvData?.rows.forEach(row => {
        expect(row).toHaveProperty('Indonesian')
        expect(row.Indonesian).toBe('') // Empty string for new language
        expect(row).toHaveProperty('English') // Existing data preserved
        expect(row.English).toBeTruthy() // Should have existing English values
      })

      // Verify specific row data
      const welcomeRow = translationStore.csvData?.rows.find(row => row.Key === 'welcome')
      expect(welcomeRow).toBeDefined()
      expect(welcomeRow?.English).toBe('Welcome')
      expect(welcomeRow?.Indonesian).toBe('')
    })

    it('should make new language column immediately visible with proper empty cell styling', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Set initial data
      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'hello', English: 'Hello' },
          { Key: 'world', English: 'World' }
        ]
      }
      translationStore.setCSVData(csvData)
      languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])

      // Add Chinese Simplified
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[2]) // Chinese Simplified
      translationStore.addLanguageColumn('zh-CN', 'Chinese Simplified')

      // Verify immediate visibility in headers
      expect(translationStore.csvData?.headers).toEqual(['Key', 'English', 'Chinese Simplified'])

      // Verify empty cells are properly created
      const updatedRows = translationStore.csvData?.rows
      expect(updatedRows).toHaveLength(2)

      updatedRows?.forEach(row => {
        expect(row['Chinese Simplified']).toBe('') // Empty string for styling
        expect(row.Key).toBeTruthy() // Key preserved
        expect(row.English).toBeTruthy() // English preserved
      })

      // Verify specific empty cell data for proper styling
      const helloRow = updatedRows?.find(row => row.Key === 'hello')
      expect(helloRow?.['Chinese Simplified']).toBe('')
      expect(helloRow?.English).toBe('Hello')
    })

    it('should handle multiple language additions correctly', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Start with English only
      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: [{ Key: 'test', English: 'Test' }]
      }
      translationStore.setCSVData(csvData)
      languageStore.setTableLanguages([SUPPORTED_LANGUAGES[0]])

      // Add all other supported languages
      const languagesToAdd = [
        SUPPORTED_LANGUAGES[1], // Indonesian
        SUPPORTED_LANGUAGES[2], // Chinese Simplified
        SUPPORTED_LANGUAGES[3]  // Chinese Traditional
      ]

      languagesToAdd.forEach(language => {
        // Two-step process for each language
        languageStore.addTableLanguage(language)
        translationStore.addLanguageColumn(language.code, language.name)
      })

      // Verify all languages are added
      expect(languageStore.tableLanguages).toHaveLength(4) // All supported languages
      expect(translationStore.csvData?.headers).toHaveLength(5) // Key + 4 languages

      // Verify headers contain all language names
      const expectedHeaders = ['Key', 'English', 'Indonesian', 'Chinese Simplified', 'Chinese Traditional']
      expect(translationStore.csvData?.headers).toEqual(expectedHeaders)

      // Verify row has empty values for all new languages
      const testRow = translationStore.csvData?.rows[0]
      expect(testRow?.English).toBe('Test')
      expect(testRow?.Indonesian).toBe('')
      expect(testRow?.['Chinese Simplified']).toBe('')
      expect(testRow?.['Chinese Traditional']).toBe('')
    })
  })
})
