import { describe, it, expect } from 'vitest'
import { validateCSV } from '@/utils/validation'

describe('CSV Validation with Multi-line Fields', () => {
  it('should correctly validate CSV with multi-line quoted fields', () => {
    const csvContent = `key,english,Chinese simplified,Chinese traditional
integrations.stripe.section.0.description,"• Available for Singapore businesses with an Aspire SGD account (More coming soon)
• Users with Admin or Finance roles","• 适用于拥有 Aspire SGD 账户的新加坡企业（即将支持更多地区）
• 拥有管理员或财务角色的用户","• 適用於擁有 Aspire SGD 賬戶的新加坡企業（即將支持更多地區）
• 擁有管理者或財務角色的用戶"
integrations.stripe.section.1.title,Who can use this integration,谁可以使用此集成？,誰可以使用此整合？`

    const result = validateCSV(csvContent)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should detect actual column count mismatches', () => {
    const csvContent = `key,english,Chinese simplified,Chinese traditional
valid.key,Valid English,Valid Chinese Simplified,Valid Chinese Traditional
invalid.key,Only English,Only Chinese Simplified`

    const result = validateCSV(csvContent)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toContain('Row 3 has 3 columns, expected 4')
  })

  it('should handle escaped quotes within fields', () => {
    const csvContent = `key,english,chinese
test.key,"This is a ""quoted"" word",这是一个"引用"词`

    const result = validateCSV(csvContent)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
