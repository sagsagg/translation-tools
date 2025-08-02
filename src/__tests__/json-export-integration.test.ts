import { describe, it, expect, vi } from 'vitest'
import { useMultiLanguage } from '@/composables/useMultiLanguage'
import { ConversionEngine } from '@/utils/conversion'
import type { CSVData } from '@/types'

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}))

describe('JSON Export Integration', () => {
  const mockCSVData: CSVData = {
    headers: ['Key', 'english', 'Chinese simplified', 'Chinese traditional'],
    rows: [
      {
        'Key': 'integrations.stripe.title',
        'english': 'Connect with Stripe',
        'Chinese simplified': '连接 Stripe 账户',
        'Chinese traditional': '連接 Stripe 賬戶'
      },
      {
        'Key': 'integrations.stripe.description',
        'english': 'Accept payments via Stripe',
        'Chinese simplified': '通过 Stripe 接受付款',
        'Chinese traditional': '通過 Stripe 接受付款'
      }
    ]
  }

  it('should load CSV data and export multiple JSON files with correct language codes', () => {
    const {
      loadFromCSV,
      translationData,
      selectedLanguages,
      exportToMultipleJSON
    } = useMultiLanguage()

    // Load CSV data
    loadFromCSV(mockCSVData)

    // Check that translation data is loaded with proper language codes
    const data = translationData.value
    expect(Object.keys(data)).toEqual(['en', 'zh-CN', 'zh-TW'])

    // Check that selected languages are updated correctly
    const languages = selectedLanguages.value
    expect(languages).toHaveLength(3)
    expect(languages.map(lang => lang?.code)).toEqual(['en', 'zh-CN', 'zh-TW'])
    expect(languages.map(lang => lang?.name)).toEqual(['English', 'Chinese Simplified', 'Chinese Traditional'])

    // Check translation data content
    expect(data['en']).toEqual({
      'integrations.stripe.title': 'Connect with Stripe',
      'integrations.stripe.description': 'Accept payments via Stripe'
    })

    expect(data['zh-CN']).toEqual({
      'integrations.stripe.title': '连接 Stripe 账户',
      'integrations.stripe.description': '通过 Stripe 接受付款'
    })

    expect(data['zh-TW']).toEqual({
      'integrations.stripe.title': '連接 Stripe 賬戶',
      'integrations.stripe.description': '通過 Stripe 接受付款'
    })

    // Mock the downloadJSON method to capture calls
    const downloadJSONSpy = vi.spyOn(ConversionEngine, 'downloadJSON')
    downloadJSONSpy.mockImplementation(() => {})

    // Export to multiple JSON files
    exportToMultipleJSON('test-translations')

    // Verify that downloadJSON was called for each language with correct data
    expect(downloadJSONSpy).toHaveBeenCalledTimes(3)

    expect(downloadJSONSpy).toHaveBeenCalledWith(
      data['en'],
      'test-translations_English.json'
    )

    expect(downloadJSONSpy).toHaveBeenCalledWith(
      data['zh-CN'],
      'test-translations_Chinese_Simplified.json'
    )

    expect(downloadJSONSpy).toHaveBeenCalledWith(
      data['zh-TW'],
      'test-translations_Chinese_Traditional.json'
    )

    downloadJSONSpy.mockRestore()
  })

  it('should handle the example CSV file structure correctly', () => {
    const exampleCSVData: CSVData = {
      headers: ['Key', 'english', 'Chinese simplified', 'Chinese traditional'],
      rows: [
        {
          'Key': 'integrations.how-to-configure.stripe.title',
          'english': 'Connect with Stripe',
          'Chinese simplified': '连接 Stripe 账户',
          'Chinese traditional': '連接 Stripe 賬戶'
        }
      ]
    }

    const { loadFromCSV, translationData } = useMultiLanguage()

    // Load the example CSV structure
    loadFromCSV(exampleCSVData)

    // Verify the data is loaded correctly with proper language codes
    const data = translationData.value
    expect(Object.keys(data)).toEqual(['en', 'zh-CN', 'zh-TW'])

    // Verify each language has the correct data
    expect(data['en']['integrations.how-to-configure.stripe.title']).toBe('Connect with Stripe')
    expect(data['zh-CN']['integrations.how-to-configure.stripe.title']).toBe('连接 Stripe 账户')
    expect(data['zh-TW']['integrations.how-to-configure.stripe.title']).toBe('連接 Stripe 賬戶')
  })
})
