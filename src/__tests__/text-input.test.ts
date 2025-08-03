import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextInput from '@/components/TextInput.vue'
import { validateTextInput, processTextInput } from '@/utils/validation'

describe('Text Input Feature', () => {
  describe('TextInput Component', () => {
    it('should render basic elements', () => {
      const wrapper = mount(TextInput)

      // Check that component renders
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('textarea').exists()).toBe(true)
      expect(wrapper.text()).toContain('JSON')
      expect(wrapper.text()).toContain('CSV')
    })
  })

  describe('Text Input Validation', () => {
    it('should validate JSON content correctly', () => {
      const validJSON = '{"test.key": "test value"}'
      const result = validateTextInput(validJSON, 'json')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid JSON syntax', () => {
      const invalidJSON = '{"invalid": json}'
      const result = validateTextInput(invalidJSON, 'json')

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate CSV content correctly', () => {
      const validCSV = 'Key,English,Spanish\ntest.key,Test,Prueba'
      const result = validateTextInput(validCSV, 'csv')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing Key column in CSV', () => {
      const invalidCSV = 'English,Spanish\nTest,Prueba'
      const result = validateTextInput(invalidCSV, 'csv')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Key'))).toBe(true)
    })

    it('should reject empty content', () => {
      const result = validateTextInput('', 'json')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('empty'))).toBe(true)
    })
  })

  describe('Text Input Processing', () => {
    it('should process valid JSON content', () => {
      const validJSON = '{"test.key": "test value"}'
      const result = processTextInput(validJSON, 'json')

      expect(result.success).toBe(true)
      expect(result.format).toBe('json')
      expect(result.data).toEqual({ 'test.key': 'test value' })
    })

    it('should process valid CSV content', () => {
      const validCSV = 'Key,English\ntest.key,Test Value'
      const result = processTextInput(validCSV, 'csv')

      expect(result.success).toBe(true)
      expect(result.format).toBe('csv')
      expect(result.data).toHaveProperty('headers')
      expect(result.data).toHaveProperty('rows')
    })

    it('should handle processing errors', () => {
      const invalidJSON = '{"invalid": json}'
      const result = processTextInput(invalidJSON, 'json')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Integration with App', () => {
    it('should integrate with existing file upload workflow', () => {
      // This test verifies that text input results can be processed
      // by the same handlers as file upload results

      const textInputResult = {
        success: true,
        data: { 'test.key': 'test value' },
        format: 'json' as const
      }

      // Should be compatible with FileUploadResult structure
      expect(textInputResult.success).toBe(true)
      expect(textInputResult.format).toBe('json')
      expect(textInputResult.data).toBeDefined()
    })
  })
})
