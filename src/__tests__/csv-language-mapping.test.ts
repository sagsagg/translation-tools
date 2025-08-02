import { describe, it, expect } from 'vitest'
import { csvToMultiLanguageJSON } from '@/utils/csv'
import { mapLanguageNameToCode, getLanguageByName } from '@/constants/languages'
import type { CSVData } from '@/types'

describe('CSV Language Mapping', () => {
  const mockCSVData: CSVData = {
    headers: ['Key', 'english', 'Chinese simplified', 'Chinese traditional'],
    rows: [
      {
        'Key': 'test.key1',
        'english': 'Hello World',
        'Chinese simplified': '你好世界',
        'Chinese traditional': '你好世界'
      },
      {
        'Key': 'test.key2',
        'english': 'Welcome',
        'Chinese simplified': '欢迎',
        'Chinese traditional': '歡迎'
      }
    ]
  }

  it('should map language names to proper language codes', () => {
    expect(mapLanguageNameToCode('english')).toBe('en')
    expect(mapLanguageNameToCode('Chinese simplified')).toBe('zh-CN')
    expect(mapLanguageNameToCode('Chinese traditional')).toBe('zh-TW')
  })

  it('should find languages by name', () => {
    const english = getLanguageByName('english')
    expect(english).toBeDefined()
    expect(english?.code).toBe('en')
    expect(english?.name).toBe('English')

    const chineseSimplified = getLanguageByName('Chinese simplified')
    expect(chineseSimplified).toBeDefined()
    expect(chineseSimplified?.code).toBe('zh-CN')
    expect(chineseSimplified?.name).toBe('Chinese Simplified')

    const chineseTraditional = getLanguageByName('Chinese traditional')
    expect(chineseTraditional).toBeDefined()
    expect(chineseTraditional?.code).toBe('zh-TW')
    expect(chineseTraditional?.name).toBe('Chinese Traditional')
  })

  it('should convert CSV to multi-language JSON with proper language codes', () => {
    const result = csvToMultiLanguageJSON(mockCSVData)

    // Should have proper language codes as keys
    expect(Object.keys(result)).toEqual(['en', 'zh-CN', 'zh-TW'])

    // Should contain the translation data
    expect(result['en']).toEqual({
      'test.key1': 'Hello World',
      'test.key2': 'Welcome'
    })

    expect(result['zh-CN']).toEqual({
      'test.key1': '你好世界',
      'test.key2': '欢迎'
    })

    expect(result['zh-TW']).toEqual({
      'test.key1': '你好世界',
      'test.key2': '歡迎'
    })
  })

  it('should handle case variations in language names', () => {
    expect(mapLanguageNameToCode('English')).toBe('en')
    expect(mapLanguageNameToCode('ENGLISH')).toBe('en')
    expect(mapLanguageNameToCode('chinese simplified')).toBe('zh-CN')
    expect(mapLanguageNameToCode('CHINESE TRADITIONAL')).toBe('zh-TW')
  })
})
