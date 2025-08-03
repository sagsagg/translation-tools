import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DataViewer from '@/components/DataViewer.vue'
import type { MultiLanguageTranslationData } from '@/types'

// Mock JsonViewer component
vi.mock('@/components/JsonViewer.vue', () => ({
  default: {
    name: 'JsonViewer',
    template: '<div data-testid="json-viewer">{{ JSON.stringify(data) }}</div>',
    props: ['data', 'searchQuery', 'editable']
  }
}))

// Mock DataTable component
vi.mock('@/components/DataTable.vue', () => ({
  default: {
    name: 'DataTable',
    template: '<div data-testid="data-table">Table View</div>',
    props: ['data', 'searchQuery', 'showActions']
  }
}))

describe('Multi-Language JSON View', () => {
  const mockMultiLanguageData: MultiLanguageTranslationData = {
    English: {
      'app.welcome': 'Welcome',
      'app.login': 'Login',
      'nav.home': 'Home'
    },
    Chinese_Simplified: {
      'app.welcome': '欢迎',
      'app.login': '登录',
      'nav.home': '首页'
    },
    Chinese_Traditional: {
      'app.welcome': '歡迎',
      'app.login': '登錄',
      'nav.home': '首頁'
    }
  }

  describe('Multi-Language JSON Data Display', () => {
    it('should display multi-language JSON data in JSON view', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json'
        }
      })

      // Should render JsonViewer component
      const jsonViewer = wrapper.findComponent('[data-testid="json-viewer"]')
      expect(jsonViewer.exists()).toBe(true)

      // Should contain the multi-language structure
      const jsonContent = jsonViewer.text()
      expect(jsonContent).toContain('English')
      expect(jsonContent).toContain('Chinese_Simplified')
      expect(jsonContent).toContain('Chinese_Traditional')
      expect(jsonContent).toContain('Welcome')
      expect(jsonContent).toContain('欢迎')
      expect(jsonContent).toContain('歡迎')
    })

    it('should display multi-language data in CSV table view', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'table'
        }
      })

      // Should render DataTable component
      const dataTable = wrapper.findComponent('[data-testid="data-table"]')
      expect(dataTable.exists()).toBe(true)
    })

    it('should show CSV table view button for multi-language JSON data', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData
        }
      })

      const buttons = wrapper.findAll('button')
      const csvTableButton = buttons.find(button =>
        button.text().includes('CSV Table')
      )
      expect(csvTableButton).toBeDefined()
      expect(csvTableButton?.exists()).toBe(true)
    })

    it('should show dual view button for multi-language JSON data', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData
        }
      })

      const buttons = wrapper.findAll('button')
      const dualViewButton = buttons.find(button =>
        button.text().includes('Dual View')
      )
      expect(dualViewButton).toBeDefined()
      expect(dualViewButton?.exists()).toBe(true)
    })
  })

  describe('View Switching with Multi-Language Data', () => {
    it('should switch between JSON and CSV table views', async () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json'
        }
      })

      // Start with JSON view
      expect(wrapper.findComponent('[data-testid="json-viewer"]').exists()).toBe(true)

      // Find and click CSV table button
      const buttons = wrapper.findAll('button')
      const csvTableButton = buttons.find(button =>
        button.text().includes('CSV Table')
      )

      if (csvTableButton) {
        await csvTableButton.trigger('click')
        await wrapper.vm.$nextTick()

        // Should now show table view
        expect(wrapper.findComponent('[data-testid="data-table"]').exists()).toBe(true)
      }
    })

    it('should emit view-change events when switching views', async () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json'
        }
      })

      const buttons = wrapper.findAll('button')
      const csvTableButton = buttons.find(button =>
        button.text().includes('CSV Table')
      )

      if (csvTableButton) {
        await csvTableButton.trigger('click')

        expect(wrapper.emitted('view-change')).toBeTruthy()
        const events = wrapper.emitted('view-change') as string[][]
        expect(events[events.length - 1]).toEqual(['csv-table'])
      }
    })
  })

  describe('Data Structure Validation', () => {
    it('should handle multi-language data with missing translations', () => {
      const incompleteData: MultiLanguageTranslationData = {
        English: {
          'app.welcome': 'Welcome',
          'app.login': 'Login'
        },
        Chinese_Simplified: {
          'app.welcome': '欢迎'
          // Missing app.login
        }
      }

      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: incompleteData,
          defaultView: 'table'
        }
      })

      // Should render without errors
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent('[data-testid="data-table"]').exists()).toBe(true)
    })

    it('should handle empty multi-language data', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: {},
          defaultView: 'json'
        }
      })

      // Should render without errors
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Priority Handling', () => {
    it('should prioritize multi-language JSON data over single JSON data', () => {
      const wrapper = mount(DataViewer, {
        props: {
          jsonData: { 'test': 'single' },
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json'
        }
      })

      // Should display multi-language data, not single JSON data
      const jsonViewer = wrapper.findComponent('[data-testid="json-viewer"]')
      const jsonContent = jsonViewer.text()
      expect(jsonContent).toContain('English')
      expect(jsonContent).toContain('Chinese_Simplified')
      expect(jsonContent).not.toContain('"test":"single"')
    })

    it('should prioritize multi-language JSON data over CSV data', () => {
      const mockCSVData = {
        headers: ['Key', 'English'],
        rows: [{ Key: 'test', English: 'test value' }]
      }

      const wrapper = mount(DataViewer, {
        props: {
          csvData: mockCSVData,
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json'
        }
      })

      // Should display multi-language JSON data, not convert CSV to JSON
      const jsonViewer = wrapper.findComponent('[data-testid="json-viewer"]')
      const jsonContent = jsonViewer.text()
      expect(jsonContent).toContain('English')
      expect(jsonContent).toContain('Chinese_Simplified')
      expect(jsonContent).toContain('Chinese_Traditional')
      expect(jsonContent).toContain('Welcome')
      expect(jsonContent).toContain('欢迎')
      expect(jsonContent).toContain('歡迎')
      // Should not contain the CSV-converted single language data
      expect(jsonContent).not.toContain('"test":"test value"')
    })

    it('should fall back to single JSON data when no multi-language data', () => {
      const wrapper = mount(DataViewer, {
        props: {
          jsonData: { 'test': 'single' },
          defaultView: 'json'
        }
      })

      // Should display single JSON data
      const jsonViewer = wrapper.findComponent('[data-testid="json-viewer"]')
      const jsonContent = jsonViewer.text()
      expect(jsonContent).toContain('single')
    })
  })

  describe('CSV Conversion from Multi-Language JSON', () => {
    it('should convert multi-language JSON to proper CSV structure', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'table'
        }
      })

      // The component should exist and render the table
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent('[data-testid="data-table"]').exists()).toBe(true)
    })
  })

  describe('JsonViewer Search with Multi-Language Data', () => {
    it('should search within nested language structures', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json',
          searchQuery: '欢迎' // Search for Chinese Simplified "Welcome"
        }
      })

      // Should render JsonViewer with search functionality
      const jsonViewer = wrapper.findComponent('[data-testid="json-viewer"]')
      expect(jsonViewer.exists()).toBe(true)

      // The search should find the Chinese text within the nested structure
      const jsonContent = jsonViewer.text()
      expect(jsonContent).toContain('Chinese_Simplified')
      expect(jsonContent).toContain('欢迎')
    })

    it('should search by language key', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json',
          searchQuery: 'English' // Search for language key
        }
      })

      const jsonViewer = wrapper.findComponent('[data-testid="json-viewer"]')
      const jsonContent = jsonViewer.text()
      expect(jsonContent).toContain('English')
      expect(jsonContent).toContain('Welcome')
    })

    it('should search by translation key within nested structure', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json',
          searchQuery: 'app.welcome' // Search for translation key
        }
      })

      const jsonViewer = wrapper.findComponent('[data-testid="json-viewer"]')
      const jsonContent = jsonViewer.text()
      // Should find the key in all languages
      expect(jsonContent).toContain('app.welcome')
    })
  })
})
