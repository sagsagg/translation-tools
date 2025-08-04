import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LanguageColumnManager from '@/components/LanguageColumnManager.vue'
import { useTranslationStore, useLanguageStore } from '@/stores'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import type { CSVData } from '@/types'

describe('Language Column Management - Edge Cases & Production Readiness', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Error Handling & Edge Cases', () => {
    it('should handle empty CSV data gracefully', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Try to add language with no CSV data
      expect(() => {
        languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
        translationStore.addLanguageColumn('id', 'Indonesian')
      }).not.toThrow()

      // Should not crash and language store should still be updated
      expect(languageStore.tableLanguages.some(lang => lang.code === 'id')).toBe(true)
    })

    it('should handle malformed CSV data', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Set malformed CSV data
      const malformedData: CSVData = {
        headers: [],
        rows: []
      }
      translationStore.setCSVData(malformedData)

      // Should handle gracefully
      expect(() => {
        languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
        translationStore.addLanguageColumn('id', 'Indonesian')
      }).not.toThrow()

      expect(translationStore.csvData?.headers).toContain('Indonesian')
    })

    it('should handle CSV data with missing properties in rows', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // CSV data with inconsistent row structure
      const inconsistentData: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'hello', English: 'Hello' },
          { Key: 'world', English: '' }, // Missing English property (now empty string)
          { Key: '', English: 'Goodbye' }, // Missing Key property (now empty string)
        ]
      }
      translationStore.setCSVData(inconsistentData)

      // Add Indonesian language
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
      translationStore.addLanguageColumn('id', 'Indonesian')

      // Should add Indonesian column to all rows
      expect(translationStore.csvData?.headers).toContain('Indonesian')
      translationStore.csvData?.rows.forEach(row => {
        expect(row).toHaveProperty('Indonesian')
        expect(row.Indonesian).toBe('')
      })
    })

    it('should prevent adding more than supported languages', () => {
      const languageStore = useLanguageStore()

      // Add all supported languages
      SUPPORTED_LANGUAGES.forEach(lang => {
        languageStore.addTableLanguage(lang)
      })

      expect(languageStore.tableLanguages).toHaveLength(4)

      // Try to add a duplicate
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[0])
      expect(languageStore.tableLanguages).toHaveLength(4) // Should not increase
    })

    it('should handle rapid successive language additions', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: [{ Key: 'test', English: 'Test' }]
      }
      translationStore.setCSVData(csvData)

      // Rapidly add multiple languages
      const languagesToAdd = [
        SUPPORTED_LANGUAGES[1], // Indonesian
        SUPPORTED_LANGUAGES[2], // Chinese Simplified
        SUPPORTED_LANGUAGES[3]  // Chinese Traditional
      ]

      languagesToAdd.forEach(lang => {
        languageStore.addTableLanguage(lang)
        translationStore.addLanguageColumn(lang.code, lang.name)
      })

      // All should be added correctly
      expect(languageStore.tableLanguages).toHaveLength(4)
      expect(translationStore.csvData?.headers).toHaveLength(5) // Key + 4 languages

      // Data integrity should be maintained
      const testRow = translationStore.csvData?.rows[0]
      expect(testRow?.English).toBe('Test')
      expect(testRow?.Indonesian).toBe('')
      expect(testRow?.['Chinese Simplified']).toBe('')
      expect(testRow?.['Chinese Traditional']).toBe('')
    })
  })

  describe('Performance & Memory Management', () => {
    it('should handle large CSV datasets efficiently', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

      // Create large dataset (1000 rows)
      const largeDataset: CSVData = {
        headers: ['Key', 'English'],
        rows: Array.from({ length: 1000 }, (_, i) => ({
          Key: `key_${i}`,
          English: `English text ${i}`
        }))
      }

      const startTime = performance.now()
      translationStore.setCSVData(largeDataset)

      // Add language to large dataset
      languageStore.addTableLanguage(SUPPORTED_LANGUAGES[1])
      translationStore.addLanguageColumn('id', 'Indonesian')

      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (< 100ms for 1000 rows)
      expect(duration).toBeLessThan(100)

      // Verify all rows have the new language
      expect(translationStore.csvData?.rows).toHaveLength(1000)
      translationStore.csvData?.rows.forEach(row => {
        expect(row).toHaveProperty('Indonesian')
        expect(row.Indonesian).toBe('')
      })
    })

    it('should properly clean up when removing languages', () => {
      const translationStore = useTranslationStore()
      const languageStore = useLanguageStore()

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

      // Remove Indonesian
      const removed = languageStore.removeTableLanguage(SUPPORTED_LANGUAGES[1])
      expect(removed).toBe(true)
      translationStore.removeLanguageColumn('Indonesian')

      // Verify complete cleanup
      expect(translationStore.csvData?.headers).not.toContain('Indonesian')
      expect(translationStore.csvData?.rows[0]).not.toHaveProperty('Indonesian')

      // Other data should remain intact
      expect(translationStore.csvData?.rows[0].English).toBe('Test')
      expect(translationStore.csvData?.rows[0]['Chinese Simplified']).toBe('测试')
    })
  })

  describe('Component Resilience', () => {
    it('should handle component unmounting gracefully', () => {
      const wrapper = mount(LanguageColumnManager, {
        props: {
          currentLanguages: [SUPPORTED_LANGUAGES[0]]
        }
      })

      expect(wrapper.exists()).toBe(true)

      // Unmount component
      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })

    it('should handle prop changes reactively', async () => {
      const wrapper = mount(LanguageColumnManager, {
        props: {
          currentLanguages: [SUPPORTED_LANGUAGES[0]]
        }
      })

      // Initially should show 1 current language
      expect(wrapper.props('currentLanguages')).toHaveLength(1)

      // Update props to include Indonesian
      await wrapper.setProps({
        currentLanguages: [SUPPORTED_LANGUAGES[0], SUPPORTED_LANGUAGES[1]]
      })

      // Should now show 2 current languages
      expect(wrapper.props('currentLanguages')).toHaveLength(2)
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
  })

  describe('Data Validation', () => {
    it('should validate language codes and names', () => {
      const translationStore = useTranslationStore()
      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: [{ Key: 'test', English: 'Test' }]
      }
      translationStore.setCSVData(csvData)

      // Valid language addition
      expect(() => {
        translationStore.addLanguageColumn('id', 'Indonesian')
      }).not.toThrow()

      // Should handle empty language name gracefully
      expect(() => {
        translationStore.addLanguageColumn('', '')
      }).not.toThrow()

      // Should handle special characters in language name
      expect(() => {
        translationStore.addLanguageColumn('test', 'Test Language (Special)')
      }).not.toThrow()
    })

    it('should maintain data types consistency', () => {
      const translationStore = useTranslationStore()
      const csvData: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'test1', English: 'Test 1' },
          { Key: 'test2', English: 'Test 2' }
        ]
      }
      translationStore.setCSVData(csvData)

      // Add language
      translationStore.addLanguageColumn('id', 'Indonesian')

      // Verify data structure integrity
      expect(Array.isArray(translationStore.csvData?.headers)).toBe(true)
      expect(Array.isArray(translationStore.csvData?.rows)).toBe(true)

      translationStore.csvData?.rows.forEach(row => {
        expect(typeof row).toBe('object')
        expect(typeof row.Key).toBe('string')
        expect(typeof row.English).toBe('string')
        expect(typeof row.Indonesian).toBe('string')
      })
    })
  })
})
