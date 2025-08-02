import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DataViewer from '@/components/DataViewer.vue'
import type { MultiLanguageTranslationData, CSVData } from '@/types'

// Mock LanguageMultiSelect component
vi.mock('@/components/LanguageMultiSelect.vue', () => ({
  default: {
    name: 'LanguageMultiSelect',
    template: '<div data-testid="language-multi-select">Language Filter</div>',
    props: ['availableLanguages', 'selectedLanguages'],
    emits: ['update:selectedLanguages', 'selection-change']
  }
}))

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
    template: '<div data-testid="data-table">{{ JSON.stringify(data) }}</div>',
    props: ['data', 'searchQuery', 'showActions']
  }
}))

describe('Language Filtering Functionality', () => {
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
    },
    Indonesian: {
      'app.welcome': 'Selamat datang',
      'app.login': 'Masuk',
      'nav.home': 'Beranda'
    }
  }

  const mockCSVData: CSVData = {
    headers: ['Key', 'English', 'Chinese_Simplified', 'Chinese_Traditional', 'Indonesian'],
    rows: [
      { Key: 'app.welcome', English: 'Welcome', Chinese_Simplified: '欢迎', Chinese_Traditional: '歡迎', Indonesian: 'Selamat datang' },
      { Key: 'app.login', English: 'Login', Chinese_Simplified: '登录', Chinese_Traditional: '登錄', Indonesian: 'Masuk' },
      { Key: 'nav.home', English: 'Home', Chinese_Simplified: '首页', Chinese_Traditional: '首頁', Indonesian: 'Beranda' }
    ]
  }

  describe('Multi-Language JSON Data Filtering', () => {
    it('should show language filter when multi-language data is available', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData
        }
      })

      // Should show language filter component
      const languageFilter = wrapper.findComponent('[data-testid="language-multi-select"]')
      expect(languageFilter.exists()).toBe(true)
    })

    it('should display all languages when no filter is applied', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json'
        }
      })

      // Should display all languages in JSON view
      const jsonViewer = wrapper.findComponent('[data-testid="json-viewer"]')
      const jsonContent = jsonViewer.text()
      expect(jsonContent).toContain('English')
      expect(jsonContent).toContain('Chinese_Simplified')
      expect(jsonContent).toContain('Chinese_Traditional')
      expect(jsonContent).toContain('Indonesian')
    })

    it('should render table view correctly with multi-language data', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'table'
        }
      })

      // Should render table view
      const dataTable = wrapper.findComponent('[data-testid="data-table"]')
      expect(dataTable.exists()).toBe(true)
    })

    it('should render JSON view correctly with multi-language data', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json'
        }
      })

      // Should render JSON view
      const jsonViewer = wrapper.findComponent('[data-testid="json-viewer"]')
      expect(jsonViewer.exists()).toBe(true)
    })
  })

  describe('Basic Functionality', () => {
    it('should render components correctly with multi-language data', () => {
      const wrapper = mount(DataViewer, {
        props: {
          multiLanguageJsonData: mockMultiLanguageData,
          defaultView: 'json'
        }
      })

      // Should render both language filter and JSON viewer
      expect(wrapper.findComponent('[data-testid="language-multi-select"]').exists()).toBe(true)
      expect(wrapper.findComponent('[data-testid="json-viewer"]').exists()).toBe(true)
    })

    it('should render components correctly with CSV data', () => {
      const wrapper = mount(DataViewer, {
        props: {
          csvData: mockCSVData,
          defaultView: 'table'
        }
      })

      // Should render data table
      expect(wrapper.findComponent('[data-testid="data-table"]').exists()).toBe(true)
    })

    it('should handle empty data gracefully', () => {
      const wrapper = mount(DataViewer, {
        props: {
          defaultView: 'json'
        }
      })

      // Should render without errors
      expect(wrapper.exists()).toBe(true)
    })
  })
})
