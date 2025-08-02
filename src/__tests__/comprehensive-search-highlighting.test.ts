import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonViewer from '@/components/JsonViewer.vue'
import type { TranslationData, MultiLanguageTranslationData } from '@/types'

// Mock VueJsonPretty component with proper slot support
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

describe('Comprehensive Search Highlighting', () => {
  const mockTranslationData: TranslationData = {
    'app.login.title': 'Login to Your Account',
    'app.login.username': 'Username',
    'app.login.password': 'Password',
    'app.login.submit': 'Submit Login Form',
    'nav.home': 'Home Page',
    'nav.about': 'About Us',
    'forms.validation.required': 'This field is required',
    'forms.validation.email': 'Please enter a valid email',
    'messages.success.login': 'Login successful',
    'messages.error.login': 'Login failed'
  }

  const mockMultiLanguageData: MultiLanguageTranslationData = {
    English: {
      'app.welcome': 'Welcome to our application',
      'app.login': 'Login to your account',
      'forms.submit': 'Submit Form'
    },
    Chinese_Simplified: {
      'app.welcome': '欢迎使用我们的应用程序',
      'app.login': '登录您的账户',
      'forms.submit': '提交表单'
    }
  }

  describe('Key Highlighting', () => {
    it('should highlight search terms in JSON keys', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'login'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)

      const content = vueJsonPretty.html()
      // Should highlight 'login' in keys like 'app.login.title'
      expect(content).toContain('<mark>login</mark>')
    })

    it('should highlight multiple occurrences in keys', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'app'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()

      // Should highlight 'app' in multiple keys
      const matches = (content.match(/<mark>app<\/mark>/g) || []).length
      expect(matches).toBeGreaterThan(1)
    })

    it('should be case insensitive for key highlighting', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'LOGIN'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()

      // Should highlight lowercase 'login' when searching for uppercase 'LOGIN'
      expect(content).toContain('<mark>login</mark>')
    })
  })

  describe('Value Highlighting', () => {
    it('should highlight search terms in JSON values', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'Account'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()

      // Should highlight 'Account' in values like 'Login to Your Account'
      expect(content).toContain('<mark>Account</mark>')
    })

    it('should highlight partial matches in values', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'submit'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()

      // Should highlight 'Submit' in 'Submit Login Form'
      expect(content).toContain('<mark>Submit</mark>')
    })

    it('should highlight multiple words in values', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'required'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()

      // Should highlight 'required' in 'This field is required'
      expect(content).toContain('<mark>required</mark>')
    })
  })

  describe('Both Keys and Values Highlighting', () => {
    it('should highlight terms that appear in both keys and values', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'login'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()

      // Should highlight 'login' in both keys and values
      const loginMatches = (content.match(/<mark>login<\/mark>/gi) || []).length
      expect(loginMatches).toBeGreaterThan(1) // Should appear in multiple places

      // Should highlight 'Login' (capitalized) in values
      expect(content).toContain('<mark>Login</mark>')
    })

    it('should maintain highlighting consistency across different cases', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'email'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()

      // Should highlight 'email' in both keys and values
      expect(content).toContain('<mark>email</mark>')
    })
  })

  describe('Multi-Language Data Highlighting', () => {
    it('should handle multi-language data structure', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockMultiLanguageData,
          searchQuery: 'English'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      expect(vueJsonPretty.exists()).toBe(true)

      // Should contain the language key
      const content = vueJsonPretty.html()
      expect(content).toContain('<mark>English</mark>')
    })

    it('should handle Chinese language keys', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockMultiLanguageData,
          searchQuery: 'Chinese'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()

      // Should highlight Chinese in the key name
      expect(content).toContain('<mark>Chinese</mark>')
    })
  })

  describe('Filtering and Highlighting Integration', () => {
    it('should only show filtered data with highlighting', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'validation'
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()

      // Should only show entries that match 'validation'
      expect(content).toContain('<mark>validation</mark>')
      // Should not show unrelated entries
      expect(content).not.toContain('Home Page')
      expect(content).not.toContain('About Us')
    })

    it('should update highlighting when search query changes', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData
        }
      })

      // Initially no search highlighting
      let vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      let content = vueJsonPretty.html()
      expect(content).not.toContain('<mark>')

      // Update search query via props
      await wrapper.setProps({ searchQuery: 'password' })
      await wrapper.vm.$nextTick()

      // Should now show highlighting
      vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      content = vueJsonPretty.html()
      expect(content).toContain('<mark>password</mark>')
      expect(content).toContain('<mark>Password</mark>')
    })

    it('should handle search query changes', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'login'
        }
      })

      // Should have highlighting for initial search
      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()
      expect(content).toContain('<mark>login</mark>')

      // Verify component handles search correctly
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in search', async () => {
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
      const content = vueJsonPretty.html()

      // Should highlight special characters
      expect(content).toContain('<mark>(parentheses)</mark>')
    })

    it('should handle empty search gracefully', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: ''
        }
      })

      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      const content = vueJsonPretty.html()

      // Should not have any highlighting
      expect(content).not.toContain('<mark>')
      // Should show all data
      expect(content).toContain('app.login.title')
      expect(content).toContain('nav.home')
    })

    it('should handle non-matching search terms', async () => {
      const wrapper = mount(JsonViewer, {
        props: {
          data: mockTranslationData,
          searchQuery: 'nonexistent'
        }
      })

      // Component should still render
      expect(wrapper.exists()).toBe(true)

      // Should not show any data (filtered out)
      const vueJsonPretty = wrapper.findComponent('[data-testid="vue-json-pretty"]')
      if (vueJsonPretty.exists()) {
        const content = vueJsonPretty.html()
        expect(content).not.toContain('app.login.title')
      }
    })
  })
})
