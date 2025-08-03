import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { useFileStore } from '@/stores/files'
import type { FileUploadResult } from '@/types'

// Test component that uses storeToRefs (like App.vue)
const TestComponentWithStoreToRefs = {
  template: `
    <div>
      <div data-testid="file-count">{{ fileCount }}</div>
      <div data-testid="has-files">{{ hasFiles }}</div>
      <ul data-testid="file-list">
        <li v-for="file in uploadedFiles" :key="file.id" :data-testid="'file-' + file.id">
          {{ file.name }} - {{ file.size }}
        </li>
      </ul>
    </div>
  `,
  setup() {
    const fileStore = useFileStore()
    const { uploadedFiles, hasFiles, fileCount } = storeToRefs(fileStore)
    return { uploadedFiles, hasFiles, fileCount, fileStore }
  }
}

// Simple test component that uses the store directly (old pattern)
const TestComponentDirect = {
  template: `
    <div>
      <div data-testid="file-count">{{ fileStore.fileCount }}</div>
      <div data-testid="has-files">{{ fileStore.hasFiles }}</div>
      <ul data-testid="file-list">
        <li v-for="file in fileStore.uploadedFiles" :key="file.id" :data-testid="'file-' + file.id">
          {{ file.name }} - {{ file.size }}
        </li>
      </ul>
    </div>
  `,
  setup() {
    const fileStore = useFileStore()
    return { fileStore }
  }
}

describe('Reactivity Fix', () => {
  let pinia: ReturnType<typeof createPinia>
  let fileStore: ReturnType<typeof useFileStore>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    fileStore = useFileStore()
  })

  describe('With storeToRefs (fixed pattern)', () => {
    it('should reactively update component when files are added to store', async () => {
      const wrapper = mount(TestComponentWithStoreToRefs, {
        global: {
          plugins: [pinia]
        }
      })

    // Initially no files
    expect(wrapper.find('[data-testid="file-count"]').text()).toBe('0')
    expect(wrapper.find('[data-testid="has-files"]').text()).toBe('false')

    // Add a file to the store
    const mockResult: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'Test App' },
      filename: 'test.json',
      languageCode: 'en'
    }

    fileStore.addFile(mockResult, 1024)

    // Wait for reactivity
    await wrapper.vm.$nextTick()

    // Component should update
    expect(wrapper.find('[data-testid="file-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="has-files"]').text()).toBe('true')
    expect(wrapper.find('[data-testid="file-list"]').text()).toContain('test.json')
  })

    it('should reactively update component when files are replaced in store', async () => {
      const wrapper = mount(TestComponentWithStoreToRefs, {
        global: {
          plugins: [pinia]
        }
      })

    const mockResult: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'Test App' },
      filename: 'test.json',
      languageCode: 'en'
    }

    // Add first file
    fileStore.addFile(mockResult, 1024)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="file-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="file-list"]').text()).toContain('1024')

    // Replace with same file but different size
    fileStore.addFile(mockResult, 2048)
    await wrapper.vm.$nextTick()

    // Should still be 1 file but with updated size
    expect(wrapper.find('[data-testid="file-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="file-list"]').text()).toContain('2048')
    expect(wrapper.find('[data-testid="file-list"]').text()).not.toContain('1024')
  })

    it('should reactively update component when files are removed from store', async () => {
      const wrapper = mount(TestComponentWithStoreToRefs, {
        global: {
          plugins: [pinia]
        }
      })

    const mockResult: FileUploadResult = {
      success: true,
      format: 'json',
      data: { 'app.title': 'Test App' },
      filename: 'test.json',
      languageCode: 'en'
    }

    // Add a file
    const file = fileStore.addFile(mockResult, 1024)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="file-count"]').text()).toBe('1')

    // Remove the file
    if (file) {
      fileStore.removeFile(file.id)
      await wrapper.vm.$nextTick()
    }

      // Component should update
      expect(wrapper.find('[data-testid="file-count"]').text()).toBe('0')
      expect(wrapper.find('[data-testid="has-files"]').text()).toBe('false')
    })
  })

  describe('Direct store access (old pattern)', () => {
    it('should also work with direct store access', async () => {
      const wrapper = mount(TestComponentDirect, {
        global: {
          plugins: [pinia]
        }
      })

      // Initially no files
      expect(wrapper.find('[data-testid="file-count"]').text()).toBe('0')

      // Add a file to the store
      const mockResult: FileUploadResult = {
        success: true,
        format: 'json',
        data: { 'app.title': 'Test App' },
        filename: 'test.json',
        languageCode: 'en'
      }

      fileStore.addFile(mockResult, 1024)
      await wrapper.vm.$nextTick()

      // Component should update (this also works, but storeToRefs is preferred)
      expect(wrapper.find('[data-testid="file-count"]').text()).toBe('1')
    })
  })
})
