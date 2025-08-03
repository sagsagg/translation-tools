import { describe, it, expect, beforeEach } from 'vitest'
import { useFileManagement } from '@/composables/useFileManagement'
import type { FileUploadResult, TranslationData, CSVData } from '@/types'

describe('File Management', () => {
  let fileManagement: ReturnType<typeof useFileManagement>

  beforeEach(() => {
    fileManagement = useFileManagement()
  })

  describe('File Addition', () => {
    it('should add a JSON file successfully', () => {
      const mockJSONResult: FileUploadResult = {
        success: true,
        format: 'json',
        data: { 'app.title': 'Test App' } as TranslationData,
        filename: 'test.json',
        languageCode: 'English'
      }

      const file = fileManagement.addFile(mockJSONResult, 1024)

      expect(file).toBeTruthy()
      expect(file?.name).toBe('test.json')
      expect(file?.format).toBe('json')
      expect(file?.languageCode).toBe('English')
      expect(file?.size).toBe(1024)
      expect(fileManagement.fileCount.value).toBe(1)
    })

    it('should add a CSV file successfully', () => {
      const mockCSVResult: FileUploadResult = {
        success: true,
        format: 'csv',
        data: {
          headers: ['Key', 'English'],
          rows: [{ Key: 'app.title', English: 'Test App' }]
        } as CSVData,
        filename: 'test.csv'
      }

      const file = fileManagement.addFile(mockCSVResult, 2048)

      expect(file).toBeTruthy()
      expect(file?.name).toBe('test.csv')
      expect(file?.format).toBe('csv')
      expect(file?.languageCode).toBeUndefined()
      expect(file?.size).toBe(2048)
      expect(fileManagement.fileCount.value).toBe(1)
    })

    it('should not add failed upload results', () => {
      const mockFailedResult: FileUploadResult = {
        success: false,
        error: 'Invalid file format',
        filename: 'invalid.txt'
      }

      const file = fileManagement.addFile(mockFailedResult, 1024)

      expect(file).toBeNull()
      expect(fileManagement.fileCount.value).toBe(0)
    })

    it('should add multiple files', () => {
      const mockResults: FileUploadResult[] = [
        {
          success: true,
          format: 'json',
          data: { 'app.title': 'Test App' } as TranslationData,
          filename: 'english.json',
          languageCode: 'English'
        },
        {
          success: true,
          format: 'json',
          data: { 'app.title': '测试应用' } as TranslationData,
          filename: 'chinese.json',
          languageCode: 'Chinese_Simplified'
        }
      ]

      const files = fileManagement.addMultipleFiles(mockResults, [1024, 1536])

      expect(files).toHaveLength(2)
      expect(fileManagement.fileCount.value).toBe(2)
      expect(files[0].languageCode).toBe('English')
      expect(files[1].languageCode).toBe('Chinese_Simplified')
    })
  })

  describe('File Removal', () => {
    it('should remove a file successfully', () => {
      // Add a file first
      const mockResult: FileUploadResult = {
        success: true,
        format: 'json',
        data: { 'app.title': 'Test App' } as TranslationData,
        filename: 'test.json',
        languageCode: 'English'
      }

      const file = fileManagement.addFile(mockResult, 1024)
      expect(fileManagement.fileCount.value).toBe(1)

      // Remove the file
      const result = fileManagement.removeFile(file!.id)

      expect(result.success).toBe(true)
      expect(result.removedFileId).toBe(file!.id)
      expect(fileManagement.fileCount.value).toBe(0)
    })

    it('should handle removal of non-existent file', () => {
      const result = fileManagement.removeFile('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('File not found')
    })

    it('should clear all files', () => {
      // Add multiple files
      const mockResults: FileUploadResult[] = [
        {
          success: true,
          format: 'json',
          data: { 'app.title': 'Test App' } as TranslationData,
          filename: 'test1.json',
          languageCode: 'English'
        },
        {
          success: true,
          format: 'json',
          data: { 'app.title': '测试应用' } as TranslationData,
          filename: 'test2.json',
          languageCode: 'Chinese_Simplified'
        }
      ]

      fileManagement.addMultipleFiles(mockResults, [1024, 1536])
      expect(fileManagement.fileCount.value).toBe(2)

      // Clear all files
      fileManagement.clearAllFiles()
      expect(fileManagement.fileCount.value).toBe(0)
    })
  })

  describe('File Queries', () => {
    beforeEach(() => {
      // Add test files
      const mockResults: FileUploadResult[] = [
        {
          success: true,
          format: 'json',
          data: { 'app.title': 'Test App' } as TranslationData,
          filename: 'english.json',
          languageCode: 'English'
        },
        {
          success: true,
          format: 'json',
          data: { 'app.title': '测试应用' } as TranslationData,
          filename: 'chinese.json',
          languageCode: 'Chinese_Simplified'
        },
        {
          success: true,
          format: 'csv',
          data: {
            headers: ['Key', 'English', 'Chinese_Simplified'],
            rows: [{ Key: 'app.title', English: 'Test App', Chinese_Simplified: '测试应用' }]
          } as CSVData,
          filename: 'translations.csv'
        }
      ]

      fileManagement.addMultipleFiles(mockResults, [1024, 1536, 2048])
    })

    it('should get files by format', () => {
      const jsonFiles = fileManagement.getFilesByFormat('json')
      const csvFiles = fileManagement.getFilesByFormat('csv')

      expect(jsonFiles).toHaveLength(2)
      expect(csvFiles).toHaveLength(1)
      expect(jsonFiles.every(f => f.format === 'json')).toBe(true)
      expect(csvFiles.every(f => f.format === 'csv')).toBe(true)
    })

    it('should get files by language', () => {
      const englishFiles = fileManagement.getFilesByLanguage('English')
      const chineseFiles = fileManagement.getFilesByLanguage('Chinese_Simplified')

      expect(englishFiles).toHaveLength(1)
      expect(chineseFiles).toHaveLength(1)
      expect(englishFiles[0].languageCode).toBe('English')
      expect(chineseFiles[0].languageCode).toBe('Chinese_Simplified')
    })

    it('should get file statistics', () => {
      const stats = fileManagement.getFileStats()

      expect(stats.total).toBe(3)
      expect(stats.json).toBe(2)
      expect(stats.csv).toBe(1)
      expect(stats.languages).toContain('English')
      expect(stats.languages).toContain('Chinese_Simplified')
      expect(stats.totalSize).toBe(1024 + 1536 + 2048)
    })
  })

  describe('File Validation', () => {
    it('should validate file integrity', () => {
      const mockResult: FileUploadResult = {
        success: true,
        format: 'json',
        data: { 'app.title': 'Test App' } as TranslationData,
        filename: 'test.json',
        languageCode: 'English'
      }

      const file = fileManagement.addFile(mockResult, 1024)
      const isValid = fileManagement.validateFileIntegrity(file!.id)

      expect(isValid).toBe(true)
    })

    it('should detect invalid file integrity', () => {
      const isValid = fileManagement.validateFileIntegrity('non-existent-id')
      expect(isValid).toBe(false)
    })

    it('should prevent duplicate files by replacing them', () => {
      // Add duplicate files
      const mockResults: FileUploadResult[] = [
        {
          success: true,
          format: 'json',
          data: { 'app.title': 'Test App' } as TranslationData,
          filename: 'test.json',
          languageCode: 'English'
        },
        {
          success: true,
          format: 'json',
          data: { 'app.title': 'Test App' } as TranslationData,
          filename: 'test.json', // Same name
          languageCode: 'English' // Same language
        }
      ]

      fileManagement.addMultipleFiles(mockResults, [1024, 1024])

      // After the fix, should only have 1 file (second one replaces first)
      expect(fileManagement.fileCount.value).toBe(1)

      // Should find no duplicates
      const duplicates = fileManagement.findDuplicateFiles()
      expect(duplicates).toHaveLength(0)
    })
  })

  describe('Computed Properties', () => {
    it('should track hasFiles correctly', () => {
      expect(fileManagement.hasFiles.value).toBe(false)

      const mockResult: FileUploadResult = {
        success: true,
        format: 'json',
        data: { 'app.title': 'Test App' } as TranslationData,
        filename: 'test.json',
        languageCode: 'English'
      }

      fileManagement.addFile(mockResult, 1024)
      expect(fileManagement.hasFiles.value).toBe(true)

      fileManagement.clearAllFiles()
      expect(fileManagement.hasFiles.value).toBe(false)
    })

    it('should calculate total size correctly', () => {
      expect(fileManagement.totalSize.value).toBe(0)

      const mockResults: FileUploadResult[] = [
        {
          success: true,
          format: 'json',
          data: { 'app.title': 'Test App' } as TranslationData,
          filename: 'test1.json',
          languageCode: 'English'
        },
        {
          success: true,
          format: 'json',
          data: { 'app.title': '测试应用' } as TranslationData,
          filename: 'test2.json',
          languageCode: 'Chinese_Simplified'
        }
      ]

      fileManagement.addMultipleFiles(mockResults, [1024, 2048])
      expect(fileManagement.totalSize.value).toBe(3072)
    })
  })
})
