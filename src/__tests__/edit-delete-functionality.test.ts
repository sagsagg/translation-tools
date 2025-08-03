import { describe, it, expect, beforeEach } from 'vitest'
import { useEditDelete } from '@/composables/useEditDelete'
import type { 
  TranslationData, 
  CSVData, 
  MultiLanguageTranslationData,
  EditTranslationData,
  DeleteTranslationData 
} from '@/types'

describe('Edit and Delete Functionality', () => {
  let editDelete: ReturnType<typeof useEditDelete>

  beforeEach(() => {
    editDelete = useEditDelete()
  })

  describe('Dialog State Management', () => {
    it('should manage edit dialog state correctly', () => {
      expect(editDelete.isEditDialogOpen.value).toBe(false)
      expect(editDelete.currentEditData.value).toBeNull()

      editDelete.openEditDialog('app.title', 'Test App', 'English')
      
      expect(editDelete.isEditDialogOpen.value).toBe(true)
      expect(editDelete.currentEditData.value).toEqual({
        key: 'app.title',
        value: 'Test App',
        language: 'English'
      })

      editDelete.closeEditDialog()
      
      expect(editDelete.isEditDialogOpen.value).toBe(false)
      expect(editDelete.currentEditData.value).toBeNull()
    })

    it('should manage delete dialog state correctly', () => {
      expect(editDelete.isDeleteDialogOpen.value).toBe(false)
      expect(editDelete.currentDeleteData.value).toBeNull()

      editDelete.openDeleteDialog('app.title', 'Test App', 'English')
      
      expect(editDelete.isDeleteDialogOpen.value).toBe(true)
      expect(editDelete.currentDeleteData.value).toEqual({
        key: 'app.title',
        value: 'Test App',
        language: 'English'
      })

      editDelete.closeDeleteDialog()
      
      expect(editDelete.isDeleteDialogOpen.value).toBe(false)
      expect(editDelete.currentDeleteData.value).toBeNull()
    })
  })

  describe('Edit Translation in Data', () => {
    let testData: TranslationData

    beforeEach(() => {
      testData = {
        'app.title': 'Test Application',
        'app.welcome': 'Welcome User',
        'nav.home': 'Home Page'
      }
    })

    it('should edit translation value successfully', () => {
      const editData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test Application',
        newKey: 'app.title',
        newValue: 'Updated Application'
      }

      const result = editDelete.editTranslationInData(testData, editData)
      
      expect(result.success).toBe(true)
      expect(testData['app.title']).toBe('Updated Application')
    })

    it('should edit translation key successfully', () => {
      const editData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test Application',
        newKey: 'app.name',
        newValue: 'Test Application'
      }

      const result = editDelete.editTranslationInData(testData, editData)
      
      expect(result.success).toBe(true)
      expect(testData['app.name']).toBe('Test Application')
      expect(testData['app.title']).toBeUndefined()
    })

    it('should edit both key and value successfully', () => {
      const editData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test Application',
        newKey: 'app.name',
        newValue: 'Updated Application'
      }

      const result = editDelete.editTranslationInData(testData, editData)
      
      expect(result.success).toBe(true)
      expect(testData['app.name']).toBe('Updated Application')
      expect(testData['app.title']).toBeUndefined()
    })

    it('should fail when original key does not exist', () => {
      const editData: EditTranslationData = {
        originalKey: 'nonexistent.key',
        originalValue: 'Some Value',
        newKey: 'nonexistent.key',
        newValue: 'Updated Value'
      }

      const result = editDelete.editTranslationInData(testData, editData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Original translation key not found')
    })

    it('should fail when new key already exists', () => {
      const editData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test Application',
        newKey: 'app.welcome', // This key already exists
        newValue: 'Updated Application'
      }

      const result = editDelete.editTranslationInData(testData, editData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('New translation key already exists')
    })
  })

  describe('Edit Translation in CSV', () => {
    let testCSVData: CSVData

    beforeEach(() => {
      testCSVData = {
        headers: ['Key', 'English', 'Spanish'],
        rows: [
          { Key: 'app.title', English: 'Test App', Spanish: 'Aplicación de Prueba' },
          { Key: 'app.welcome', English: 'Welcome', Spanish: 'Bienvenido' },
          { Key: 'nav.home', English: 'Home', Spanish: 'Inicio' }
        ]
      }
    })

    it('should edit CSV translation successfully', () => {
      const editData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test App',
        newKey: 'app.title',
        newValue: 'Updated App',
        language: 'English'
      }

      const result = editDelete.editTranslationInCSV(testCSVData, editData)
      
      expect(result.success).toBe(true)
      const updatedRow = testCSVData.rows.find(row => row.Key === 'app.title')
      expect(updatedRow?.English).toBe('Updated App')
    })

    it('should edit CSV key successfully', () => {
      const editData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test App',
        newKey: 'app.name',
        newValue: 'Test App',
        language: 'English'
      }

      const result = editDelete.editTranslationInCSV(testCSVData, editData)
      
      expect(result.success).toBe(true)
      const updatedRow = testCSVData.rows.find(row => row.Key === 'app.name')
      expect(updatedRow).toBeTruthy()
      expect(updatedRow?.English).toBe('Test App')
      
      const oldRow = testCSVData.rows.find(row => row.Key === 'app.title')
      expect(oldRow).toBeUndefined()
    })

    it('should fail when CSV key does not exist', () => {
      const editData: EditTranslationData = {
        originalKey: 'nonexistent.key',
        originalValue: 'Some Value',
        newKey: 'nonexistent.key',
        newValue: 'Updated Value',
        language: 'English'
      }

      const result = editDelete.editTranslationInCSV(testCSVData, editData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Original translation key not found in CSV data')
    })
  })

  describe('Delete Translation from Data', () => {
    let testData: TranslationData

    beforeEach(() => {
      testData = {
        'app.title': 'Test Application',
        'app.welcome': 'Welcome User',
        'nav.home': 'Home Page'
      }
    })

    it('should delete translation successfully', () => {
      const deleteData: DeleteTranslationData = {
        key: 'app.title',
        value: 'Test Application'
      }

      const result = editDelete.deleteTranslationFromData(testData, deleteData)
      
      expect(result.success).toBe(true)
      expect(testData['app.title']).toBeUndefined()
      expect(Object.keys(testData)).toHaveLength(2)
    })

    it('should fail when key does not exist', () => {
      const deleteData: DeleteTranslationData = {
        key: 'nonexistent.key',
        value: 'Some Value'
      }

      const result = editDelete.deleteTranslationFromData(testData, deleteData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Translation key not found')
    })
  })

  describe('Delete Translation from CSV', () => {
    let testCSVData: CSVData

    beforeEach(() => {
      testCSVData = {
        headers: ['Key', 'English', 'Spanish'],
        rows: [
          { Key: 'app.title', English: 'Test App', Spanish: 'Aplicación de Prueba' },
          { Key: 'app.welcome', English: 'Welcome', Spanish: 'Bienvenido' },
          { Key: 'nav.home', English: 'Home', Spanish: 'Inicio' }
        ]
      }
    })

    it('should delete CSV row successfully', () => {
      const deleteData: DeleteTranslationData = {
        key: 'app.title',
        value: 'Test App'
      }

      const result = editDelete.deleteTranslationFromCSV(testCSVData, deleteData)
      
      expect(result.success).toBe(true)
      expect(testCSVData.rows).toHaveLength(2)
      const deletedRow = testCSVData.rows.find(row => row.Key === 'app.title')
      expect(deletedRow).toBeUndefined()
    })

    it('should fail when CSV key does not exist', () => {
      const deleteData: DeleteTranslationData = {
        key: 'nonexistent.key',
        value: 'Some Value'
      }

      const result = editDelete.deleteTranslationFromCSV(testCSVData, deleteData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Translation key not found in CSV data')
    })
  })

  describe('Multi-Language Data Operations', () => {
    let testMultiLangData: MultiLanguageTranslationData

    beforeEach(() => {
      testMultiLangData = {
        English: {
          'app.title': 'Test Application',
          'app.welcome': 'Welcome User'
        },
        Spanish: {
          'app.title': 'Aplicación de Prueba',
          'app.welcome': 'Bienvenido Usuario'
        }
      }
    })

    it('should edit multi-language translation successfully', () => {
      const editData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test Application',
        newKey: 'app.title',
        newValue: 'Updated Application',
        language: 'English'
      }

      const result = editDelete.editTranslationInMultiLanguage(testMultiLangData, editData)
      
      expect(result.success).toBe(true)
      expect(testMultiLangData.English['app.title']).toBe('Updated Application')
      expect(testMultiLangData.Spanish['app.title']).toBe('Aplicación de Prueba') // Unchanged
    })

    it('should delete multi-language translation successfully', () => {
      const deleteData: DeleteTranslationData = {
        key: 'app.title',
        value: 'Test Application',
        language: 'English'
      }

      const result = editDelete.deleteTranslationFromMultiLanguage(testMultiLangData, deleteData)
      
      expect(result.success).toBe(true)
      expect(testMultiLangData.English['app.title']).toBeUndefined()
      expect(testMultiLangData.Spanish['app.title']).toBe('Aplicación de Prueba') // Unchanged
    })

    it('should fail when language does not exist', () => {
      const editData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test Application',
        newKey: 'app.title',
        newValue: 'Updated Application',
        language: 'French' // Does not exist
      }

      const result = editDelete.editTranslationInMultiLanguage(testMultiLangData, editData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Language not found in multi-language data')
    })
  })

  describe('Validation', () => {
    it('should validate edit data correctly', () => {
      const validData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test App',
        newKey: 'app.name',
        newValue: 'Updated App'
      }

      const result = editDelete.validateEditData(validData)
      expect(result).toBeNull()
    })

    it('should reject empty key', () => {
      const invalidData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test App',
        newKey: '',
        newValue: 'Updated App'
      }

      const result = editDelete.validateEditData(invalidData)
      expect(result).toBe('Translation key cannot be empty')
    })

    it('should reject empty value', () => {
      const invalidData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test App',
        newKey: 'app.name',
        newValue: ''
      }

      const result = editDelete.validateEditData(invalidData)
      expect(result).toBe('Translation value cannot be empty')
    })

    it('should reject short key', () => {
      const invalidData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test App',
        newKey: 'a',
        newValue: 'Updated App'
      }

      const result = editDelete.validateEditData(invalidData)
      expect(result).toBe('Translation key must be at least 2 characters')
    })

    it('should reject long value', () => {
      const invalidData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test App',
        newKey: 'app.name',
        newValue: 'a'.repeat(1001)
      }

      const result = editDelete.validateEditData(invalidData)
      expect(result).toBe('Translation value must be less than 1000 characters')
    })

    it('should reject invalid key characters', () => {
      const invalidData: EditTranslationData = {
        originalKey: 'app.title',
        originalValue: 'Test App',
        newKey: 'app title!', // Contains space and exclamation
        newValue: 'Updated App'
      }

      const result = editDelete.validateEditData(invalidData)
      expect(result).toBe('Translation key can only contain letters, numbers, dots, underscores, and hyphens')
    })
  })
})
