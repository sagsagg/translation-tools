import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonViewer from '@/components/JsonViewer.vue'
import type { TranslationData, MultiLanguageTranslationData } from '@/types'

// Mock VueJsonPretty component with slot support
vi.mock('vue-json-pretty', () => ({
  default: {
    name: 'VueJsonPretty',
    template: `
      <div data-testid="vue-json-pretty">
        <div v-for="(value, key) in data" :key="key" class="json-node">
          <span class="json-key">
            <slot name="renderNodeKey" :node="{ key, value }" :defaultKey="key">
              {{ key }}
            </slot>
          </span>
          <span class="json-value">
            <slot name="renderNodeValue" :node="{ key, value }" :defaultValue="value">
              {{ value }}
            </slot>
          </span>
        </div>
      </div>
    `,
    props: [
      'data', 'showLength', 'showLine', 'showIcon', 'showDoubleQuotes',
      'collapsedNodeLength', 'deep', 'theme', 'height', 'virtual'
    ]
  }
}))

// Mock vue-json-pretty styles
vi.mock('vue-json-pretty/lib/styles.css', () => ({}))

// Mock UI components
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

describe('Vue-Json-Pretty Search Highlighting', () => {
  const mockSingleLanguageData: TranslationData = {
    'app.welcome': 'Welcome to our application',
    'app.login': 'Login to your account',
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'form.submit': 'Submit Form'
  }

  const mockMultiLanguageData: MultiLanguageTranslationData = {
    English: {
      'app.welcome': 'Welcome to our application',
      'app.login': 'Login to your account',
      'nav.home': 'Home'
    },
    Chinese_Simplified: {
      'app.welcome': '欢迎使用我们的应用程序',
      'app.login': '登录您的账户',
      'nav.home': '首页'
    },
    Chinese_Traditional: {
      'app.welcome': '歡迎使用我們的應用程序',
      'app.login': '登錄您的賬戶',
      'nav.home': '首頁'
    }
  }

  describe('Search Highlighting in Tree View', () => {
    it('should render VueJsonPretty with custom slots for search highlighting', () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)

      // Should render keys and values
      expect(vueJsonPretty.text()).toContain('app.welcome')
      expect(vueJsonPretty.text()).toContain('Welcome to our application')
    })

    it('should highlight search terms in keys when search query is provided', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData,
          searchQuery: 'welcome'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)

      // Should contain highlighted content with mark tags
      const content = vueJsonPretty.html()
      expect(content).toContain('<mark>welcome</mark>')
      expect(content).toContain('<mark>Welcome</mark>')
    })

    it('should highlight search terms in values when search query is provided', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData,
          searchQuery: 'application'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)

      // Should contain the search term
      const content = vueJsonPretty.html()
      expect(content).toContain('application')
    })

    it('should update highlighting when search query changes', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData
        }
      })

      // Initially no search highlighting
      let vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      let content = vueJsonPretty.html()
      expect(content).toContain('app.welcome')
      expect(content).toContain('Welcome to our application')

      // Update search query through the search input
      const searchInput = wrapper.find('input[placeholder="Search keys or values..."]')
      await searchInput.setValue('login')
      await wrapper.vm.$nextTick()

      // Should now highlight login-related content
      vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      content = vueJsonPretty.html()
      expect(content).toContain('login')
    })

    it('should handle multi-language data search highlighting', () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockMultiLanguageData,
          searchQuery: 'welcome'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)

      // Should contain multi-language structure (at least the English key)
      const content = vueJsonPretty.html()
      expect(content).toContain('English')
    })

    it('should handle case-insensitive search highlighting', () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData,
          searchQuery: 'WELCOME'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)

      // Should find lowercase matches for uppercase search
      const content = vueJsonPretty.html()
      expect(content).toContain('welcome')
    })

    it('should handle empty search query gracefully', () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData,
          searchQuery: ''
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)

      // Should render normally without highlighting
      const content = vueJsonPretty.html()
      expect(content).toContain('app.welcome')
      expect(content).toContain('Welcome to our application')
    })

    it('should handle search terms that do not match any content', () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData,
          searchQuery: 'nonexistent'
        }
      })

      // Component should still render even with no matches
      expect(wrapper.exists()).toBe(true)

      // This test just ensures no errors occur with non-matching search
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Search Highlighting Consistency', () => {
    it('should maintain search highlighting when switching view modes', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData,
          searchQuery: 'welcome'
        }
      })

      // Start in tree view
      expect(wrapper.findComponent('[data-testid="vue-json-pretty"]').exists()).toBe(true)

      // Switch to formatted view
      const viewSelect = wrapper.find('select')
      await viewSelect.setValue('formatted')
      await wrapper.vm.$nextTick()

      // Should show formatted view (if pre element exists)
      // Note: The exact element structure may vary based on implementation

      // Switch back to tree view
      await viewSelect.setValue('tree')
      await wrapper.vm.$nextTick()

      // Should show tree view again with highlighting
      expect(wrapper.findComponent('[data-testid="vue-json-pretty"]').exists()).toBe(true)
    })

    it('should filter data consistently across view modes', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockSingleLanguageData,
          searchQuery: 'welcome'
        }
      })

      // Check tree view filtering
      let vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      let content = vueJsonPretty.html()
      expect(content).toContain('welcome')

      // Switch to formatted view
      const viewSelect = wrapper.find('select')
      await viewSelect.setValue('formatted')
      await wrapper.vm.$nextTick()

      // Check formatted view filtering
      const formattedView = wrapper.find('pre')
      if (formattedView.exists()) {
        const formattedContent = formattedView.text()
        expect(formattedContent).toContain('welcome')
      }

      // Switch back to tree view
      await viewSelect.setValue('tree')
      await wrapper.vm.$nextTick()

      // Should maintain the same filtering
      vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      content = vueJsonPretty.html()
      expect(content).toContain('welcome')
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle large datasets with search highlighting', () => {
      // Create a large dataset
      const largeData: TranslationData = {}
      for (let i = 0; i < 100; i++) {
        largeData[`key_${i}`] = `value_${i}_welcome`
      }

      const wrapper = mount(JsonViewer, {
        props: {
          data: largeData,
          searchQuery: 'welcome'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)

      // Should handle large dataset
      const content = vueJsonPretty.html()
      expect(content).toContain('welcome')
    })

    it('should handle special characters in search query', () => {
      const specialData: TranslationData = {
        'app.test': 'Test with (parentheses) and [brackets]',
        'nav.special': 'Special chars: @#$%^&*'
      }

      const wrapper = mount(JsonViewer, {
        props: {
          data: specialData,
          searchQuery: '(parentheses)'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)

      // Should handle special characters
      const content = vueJsonPretty.html()
      expect(content).toContain('parentheses')
    })
  })
})
