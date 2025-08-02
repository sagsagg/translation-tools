import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataTable from '@/components/DataTable.vue'
import type { CSVData } from '@/types'

describe('DataTable Text Wrapping', () => {
  const mockCSVData: CSVData = {
    headers: ['Key', 'english', 'Chinese simplified', 'Chinese traditional'],
    rows: [
      {
        'Key': 'integrations.stripe.section.0.description',
        'english': '• Available for Singapore businesses with an Aspire SGD account (More coming soon)\n• Users with Admin or Finance roles',
        'Chinese simplified': '• 适用于拥有 Aspire SGD 账户的新加坡企业（即将支持更多地区）\n• 拥有管理员或财务角色的用户',
        'Chinese traditional': '• 適用於擁有 Aspire SGD 賬戶的新加坡企業（即將支持更多地區）\n• 擁有管理者或財務角色的用戶'
      },
      {
        'Key': 'integrations.stripe.section.1.description',
        'english': 'Getting paid just got easier. Connect your Aspire account to Stripe and unlock a faster, more seamless payment experience:\n\n- **Collect payments seamlessly** – Get paid via cards, Apple Pay, Google Pay, & more.\n- **Receive global payments** – Get paid in MYR, PHP, INR, and other currencies directly into your SGD account.',
        'Chinese simplified': '收款变得更简单了。立即将您的 Aspire 账户连接至 Stripe，享受更快捷、更顺畅的收款体验：\n\n-**无缝收款** — 通过卡、Apple Pay、Google Pay 等方式接收付款\n-**接收全球付款** — 以马币、菲律宾比索、印度卢比等多种货币直接收款至您的 SGD 账户。',
        'Chinese traditional': '收款變得更簡單了。立即將您的 Aspire 賬戶連接至 Stripe，享受更快、更順暢的收款體驗：\n\n-**無縫收款** — 通過卡、Apple Pay、Google Pay 等方式接收付款\n-**接收全球付款** — 以馬幣、菲律賓比索、印度盧比等多種貨幣直接收款至您的 SGD 賬戶。'
      }
    ]
  }

  it('should apply proper text wrapping classes to table cells', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockCSVData
      }
    })

    // Check that table has the data-table class
    const table = wrapper.find('table')
    expect(table.classes()).toContain('data-table')

    // Check that table cells have proper text wrapping classes
    const cells = wrapper.findAll('td')
    expect(cells.length).toBeGreaterThan(0)

    // Check that cell content divs have the table-cell-content class
    const cellContentDivs = wrapper.findAll('.table-cell-content')
    expect(cellContentDivs.length).toBeGreaterThan(0)
  })

  it('should handle multi-line content properly', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockCSVData
      }
    })

    // Find cells containing multi-line content
    const cellsWithNewlines = wrapper.findAll('td').filter(cell =>
      cell.text().includes('Available for Singapore') ||
      cell.text().includes('Getting paid just got easier')
    )

    expect(cellsWithNewlines.length).toBeGreaterThan(0)

    // Verify that the content divs have proper classes for text wrapping
    cellsWithNewlines.forEach(cell => {
      const contentDiv = cell.find('.table-cell-content')
      expect(contentDiv.exists()).toBe(true)
    })
  })

  it('should apply different width constraints for key vs content columns', () => {
    const wrapper = mount(DataTable, {
      props: {
        data: mockCSVData
      }
    })

    // Check header widths
    const headers = wrapper.findAll('th')
    const keyHeader = headers.find(header => header.text() === 'Key')
    const contentHeaders = headers.filter(header => header.text() !== 'Key' && header.text() !== 'Actions')

    if (keyHeader) {
      expect(keyHeader.classes()).toContain('w-48')
    }

    contentHeaders.forEach(header => {
      expect(header.classes()).toContain('w-64')
    })
  })
})
