import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonViewer from '@/components/JsonViewer.vue'
import type { TranslationData, MultiLanguageTranslationData } from '@/types'

// Mock VueJsonPretty component
vi.mock('vue-json-pretty', () => ({
  default: {
    name: 'VueJsonPretty',
    template: '<div data-testid="vue-json-pretty">VueJsonPretty Component</div>',
    props: [
      'data', 'showLength', 'showLine', 'showIcon', 'showDoubleQuotes',
      'collapsedNodeLength', 'deep', 'theme', 'height', 'virtual'
    ]
  }
}))

// Mock vue-json-pretty styles
vi.mock('vue-json-pretty/lib/styles.css', () => ({}))

// Mock UI components to avoid setup issues
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: { name: 'Tooltip', template: '<div><slot /></div>' },
  TooltipTrigger: { name: 'TooltipTrigger', template: '<div><slot /></div>' },
  TooltipContent: { name: 'TooltipContent', template: '<div><slot /></div>' }
}))

vi.mock('@/components/ui/select', () => ({
  Select: { name: 'Select', template: '<select><slot /></select>' },
  SelectContent: { name: 'SelectContent', template: '<div><slot /></div>' },
  SelectItem: { name: 'SelectItem', template: '<option><slot /></option>' },
  SelectTrigger: { name: 'SelectTrigger', template: '<div><slot /></div>' },
  SelectValue: { name: 'SelectValue', template: '<div><slot /></div>' }
}))

vi.mock('@/components/ui/button', () => ({
  Button: { name: 'Button', template: '<button><slot /></button>' }
}))

vi.mock('@/components/ui/input', () => ({
  Input: { name: 'Input', template: '<input />' }
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: { name: 'Badge', template: '<span><slot /></span>' }
}))

describe('Vue-Json-Pretty Integration', () => {
  const mockSingleLanguageData: TranslationData = {
    'app.welcome': 'Welcome',
    'app.login': 'Login',
    'nav.home': 'Home',
    'form.submit': 'Submit'
  }

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

  describe('Tree View with Vue-Json-Pretty', () => {
    it('should render VueJsonPretty component in tree view mode', () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData
        }
      })

      // Should default to tree view and render VueJsonPretty
      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)
    })

    it('should handle multi-language data in tree view', () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockMultiLanguageData
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)
    })

    it('should handle empty data gracefully', () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: {}
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)
    })
  })

  describe('Basic Integration', () => {
    it('should render component without errors', () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle different data types', () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockMultiLanguageData
        }
      })

      expect(wrapper.exists()).toBe(true)
      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)
    })
  })
})
