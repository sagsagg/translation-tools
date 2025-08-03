import { describe, it, expect } from 'vitest'
import { useEditDelete } from '@/composables/useEditDelete'
import type { CSVData, CSVRow, TranslationData, MultiLanguageTranslationData, DeleteTranslationData } from '@/types'

describe('Delete Integration Tests', () => {
  describe('Delete Row Data Extraction Logic', () => {
    it('should extract correct delete data from CSV row', () => {
      // Simulate the logic from handleDeleteRowCSV in App.vue
      const mockRow: CSVRow = { Key: 'app.title', English: 'Test App', Spanish: 'Aplicación' }

      const key = mockRow.Key || ''
      const firstValueColumn = Object.keys(mockRow).find(k => k !== 'Key')
      const value = firstValueColumn ? (mockRow as Record<string, string>)[firstValueColumn] || '' : ''
      const language = firstValueColumn

      expect(key).toBe('app.title')
      expect(value).toBe('Test App')
      expect(language).toBe('English')
    })

    it('should handle CSV row with missing Key', () => {
      const mockRow: Partial<CSVRow> = { English: 'Test App', Spanish: 'Aplicación' }

      const key = (mockRow as CSVRow).Key || ''
      const firstValueColumn = Object.keys(mockRow).find(k => k !== 'Key')
      const value = firstValueColumn ? (mockRow as Record<string, string>)[firstValueColumn] || '' : ''
      const language = firstValueColumn

      expect(key).toBe('')
      expect(value).toBe('Test App')
      expect(language).toBe('English')
    })

    it('should handle CSV row with only Key', () => {
      const mockRow: Partial<CSVRow> = { Key: 'app.title' }

      const key = (mockRow as CSVRow).Key || ''
      const firstValueColumn = Object.keys(mockRow).find(k => k !== 'Key')
      const value = firstValueColumn ? (mockRow as Record<string, string>)[firstValueColumn] || '' : ''
      const language = firstValueColumn

      expect(key).toBe('app.title')
      expect(value).toBe('')
      expect(language).toBeUndefined()
    })
  })

  describe('Delete Operations', () => {
    it('should delete from JSON data correctly', () => {
      const { deleteTranslationFromData } = useEditDelete()

      const testData: TranslationData = {
        'app.title': 'Test Application',
        'app.welcome': 'Welcome User',
        'nav.home': 'Home Page'
      }

      const deleteData: DeleteTranslationData = {
        key: 'app.title',
        value: 'Test Application'
      }

      const result = deleteTranslationFromData(testData, deleteData)

      expect(result.success).toBe(true)
      expect(testData['app.title']).toBeUndefined()
      expect(Object.keys(testData)).toHaveLength(2)
      expect(testData['app.welcome']).toBe('Welcome User')
      expect(testData['nav.home']).toBe('Home Page')
    })

    it('should delete from CSV data correctly', () => {
      const { deleteTranslationFromCSV } = useEditDelete()

      const testCSVData: CSVData = {
        headers: ['Key', 'English', 'Spanish'],
        rows: [
          { Key: 'app.title', English: 'Test App', Spanish: 'Aplicación de Prueba' },
          { Key: 'app.welcome', English: 'Welcome', Spanish: 'Bienvenido' },
          { Key: 'nav.home', English: 'Home', Spanish: 'Inicio' }
        ]
      }

      const deleteData: DeleteTranslationData = {
        key: 'app.title',
        value: 'Test App'
      }

      const result = deleteTranslationFromCSV(testCSVData, deleteData)

      expect(result.success).toBe(true)
      expect(testCSVData.rows).toHaveLength(2)

      const deletedRow = testCSVData.rows.find(row => row.Key === 'app.title')
      expect(deletedRow).toBeUndefined()

      const remainingRows = testCSVData.rows.map(row => row.Key)
      expect(remainingRows).toEqual(['app.welcome', 'nav.home'])
    })

    it('should delete from multi-language data correctly', () => {
      const { deleteTranslationFromMultiLanguage } = useEditDelete()

      const testMultiLangData: MultiLanguageTranslationData = {
        English: {
          'app.title': 'Test Application',
          'app.welcome': 'Welcome User'
        },
        Spanish: {
          'app.title': 'Aplicación de Prueba',
          'app.welcome': 'Bienvenido Usuario'
        }
      }

      const deleteData: DeleteTranslationData = {
        key: 'app.title',
        value: 'Test Application',
        language: 'English'
      }

      const result = deleteTranslationFromMultiLanguage(testMultiLangData, deleteData)

      expect(result.success).toBe(true)
      expect(testMultiLangData.English['app.title']).toBeUndefined()
      expect(testMultiLangData.Spanish['app.title']).toBe('Aplicación de Prueba') // Should remain unchanged
      expect(testMultiLangData.English['app.welcome']).toBe('Welcome User') // Should remain unchanged
    })
  })

  describe('Error Handling', () => {
    it('should handle delete from non-existent key in JSON', () => {
      const { deleteTranslationFromData } = useEditDelete()

      const testData: TranslationData = {
        'app.title': 'Test Application'
      }

      const deleteData: DeleteTranslationData = {
        key: 'nonexistent.key',
        value: 'Some Value'
      }

      const result = deleteTranslationFromData(testData, deleteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Translation key not found')
      expect(Object.keys(testData)).toHaveLength(1) // Data should remain unchanged
    })

    it('should handle delete from non-existent key in CSV', () => {
      const { deleteTranslationFromCSV } = useEditDelete()

      const testCSVData: CSVData = {
        headers: ['Key', 'English'],
        rows: [
          { Key: 'app.title', English: 'Test App' }
        ]
      }

      const deleteData: DeleteTranslationData = {
        key: 'nonexistent.key',
        value: 'Some Value'
      }

      const result = deleteTranslationFromCSV(testCSVData, deleteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Translation key not found in CSV data')
      expect(testCSVData.rows).toHaveLength(1) // Data should remain unchanged
    })
  })

  describe('Dialog State Management', () => {
    it('should manage delete dialog state correctly', () => {
      const {
        isDeleteDialogOpen,
        currentDeleteData,
        openDeleteDialog,
        closeDeleteDialog
      } = useEditDelete()

      // Initial state
      expect(isDeleteDialogOpen.value).toBe(false)
      expect(currentDeleteData.value).toBeNull()

      // Open dialog
      openDeleteDialog('app.title', 'Test App', 'English')

      expect(isDeleteDialogOpen.value).toBe(true)
      expect(currentDeleteData.value).toEqual({
        key: 'app.title',
        value: 'Test App',
        language: 'English'
      })

      // Close dialog
      closeDeleteDialog()

      expect(isDeleteDialogOpen.value).toBe(false)
      expect(currentDeleteData.value).toBeNull()
    })
  })

  describe('Performance with Large Datasets', () => {
    it('should handle delete operations efficiently with large CSV data', () => {
      const { deleteTranslationFromCSV } = useEditDelete()

      // Create large CSV dataset
      const largeCSVData: CSVData = {
        headers: ['Key', 'English', 'Spanish'],
        rows: []
      }

      // Add 1000 rows
      for (let i = 0; i < 1000; i++) {
        largeCSVData.rows.push({
          Key: `app.key.${i}`,
          English: `English value ${i}`,
          Spanish: `Spanish value ${i}`
        })
      }

      const deleteData: DeleteTranslationData = {
        key: 'app.key.500', // Delete from middle
        value: 'English value 500'
      }

      const start = performance.now()
      const result = deleteTranslationFromCSV(largeCSVData, deleteData)
      const duration = performance.now() - start

      expect(result.success).toBe(true)
      expect(largeCSVData.rows).toHaveLength(999)
      expect(duration).toBeLessThan(50) // Should complete in < 50ms

      // Verify the correct row was deleted
      const deletedRow = largeCSVData.rows.find(row => row.Key === 'app.key.500')
      expect(deletedRow).toBeUndefined()
    })
  })
})
