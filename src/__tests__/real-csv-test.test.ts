import { describe, it, expect } from 'vitest'
import { csvToMultiLanguageJSON } from '@/utils/csv'
import type { CSVData } from '@/types'

describe('Real CSV File Structure Test', () => {
  // This matches the actual structure of src/data/example.csv
  const realCSVData: CSVData = {
    headers: ['Key', 'english', 'Chinese simplified', 'Chinese traditional'],
    rows: [
      {
        'Key': 'integrations.how-to-configure.stripe.title',
        'english': 'Connect with Stripe',
        'Chinese simplified': '连接 Stripe 账户',
        'Chinese traditional': '連接 Stripe 賬戶'
      },
      {
        'Key': 'integrations.stripe.section.0.description',
        'english': '• Available for Singapore businesses with an Aspire SGD account (More coming soon)\n• Users with Admin or Finance roles',
        'Chinese simplified': '• 适用于拥有 Aspire SGD 账户的新加坡企业（即将支持更多地区）\n• 拥有管理员或财务角色的用户',
        'Chinese traditional': '• 適用於擁有 Aspire SGD 賬戶的新加坡企業（即將支持更多地區）\n• 擁有管理者或財務角色的用戶'
      }
    ]
  }

  it('should handle lowercase key column and convert to proper language codes', () => {
    const result = csvToMultiLanguageJSON(realCSVData)

    // Should have proper language codes as keys
    expect(Object.keys(result)).toEqual(['en', 'zh-CN', 'zh-TW'])

    // Should contain the translation data with multi-line content preserved
    expect(result['en']).toEqual({
      'integrations.how-to-configure.stripe.title': 'Connect with Stripe',
      'integrations.stripe.section.0.description': '• Available for Singapore businesses with an Aspire SGD account (More coming soon)\n• Users with Admin or Finance roles'
    })

    expect(result['zh-CN']).toEqual({
      'integrations.how-to-configure.stripe.title': '连接 Stripe 账户',
      'integrations.stripe.section.0.description': '• 适用于拥有 Aspire SGD 账户的新加坡企业（即将支持更多地区）\n• 拥有管理员或财务角色的用户'
    })

    expect(result['zh-TW']).toEqual({
      'integrations.how-to-configure.stripe.title': '連接 Stripe 賬戶',
      'integrations.stripe.section.0.description': '• 適用於擁有 Aspire SGD 賬戶的新加坡企業（即將支持更多地區）\n• 擁有管理者或財務角色的用戶'
    })
  })

  it('should handle both uppercase and lowercase key columns', () => {
    const uppercaseCSVData: CSVData = {
      headers: ['Key', 'english', 'Chinese simplified', 'Chinese traditional'],
      rows: [
        {
          'Key': 'test.key',
          'english': 'Test Value',
          'Chinese simplified': '测试值',
          'Chinese traditional': '測試值'
        }
      ]
    }

    const lowercaseCSVData: CSVData = {
      headers: ['Key', 'english', 'Chinese simplified', 'Chinese traditional'],
      rows: [
        {
          'Key': 'test.key',
          'english': 'Test Value',
          'Chinese simplified': '测试值',
          'Chinese traditional': '測試值'
        }
      ]
    }

    const uppercaseResult = csvToMultiLanguageJSON(uppercaseCSVData)
    const lowercaseResult = csvToMultiLanguageJSON(lowercaseCSVData)

    // Both should produce the same result
    expect(uppercaseResult).toEqual(lowercaseResult)
    expect(Object.keys(uppercaseResult)).toEqual(['en', 'zh-CN', 'zh-TW'])
    expect(uppercaseResult['en']['test.key']).toBe('Test Value')
  })
})
