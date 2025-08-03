/**
 * Mock async components for testing
 * This file provides synchronous mocks for async components to prevent test failures
 */

import { vi } from 'vitest'

// Mock the async component utilities
vi.mock('@/utils/asyncComponents', () => ({
  createAsyncComponent: vi.fn((_loader, options) => {
    // In tests, return a synchronous mock component instead of loading async
    // This prevents the "Component is missing template or render function: Promise" warning
    return {
      name: options?.name || 'MockAsyncComponent',
      template: `<div data-testid="mock-${options?.name?.toLowerCase() || 'async-component'}">Mock ${options?.name || 'AsyncComponent'}</div>`,
      props: ['data', 'csvData', 'jsonData', 'multiLanguageJsonData', 'searchQuery', 'editable', 'showActions', 'defaultView', 'files', 'open', 'originalKey', 'translationKey'],
      emits: ['export', 'edit-row', 'delete-row', 'edit-json', 'sort', 'view-change', 'edit', 'confirm', 'cancel', 'update:open', 'remove-file', 'view-file', 'clear-all', 'process']
    }
  }),

  preloadAsyncComponent: vi.fn(() => Promise.resolve({})),
  preloadComponents: vi.fn(() => Promise.resolve([])),
  useAsyncComponentState: vi.fn(() => ({
    setLoading: vi.fn(),
    setError: vi.fn(),
    isLoading: vi.fn(() => false),
    getError: vi.fn(() => null),
    clear: vi.fn(),
    clearAll: vi.fn()
  })),

  asyncComponentConfigs: {
    dataViewer: { name: 'DataViewer', delay: 100, timeout: 5000, retries: 3 },
    jsonViewer: { name: 'JsonViewer', delay: 150, timeout: 4000, retries: 2 },
    dataTable: { name: 'DataTable', delay: 100, timeout: 4000, retries: 2 },
    dialog: { name: 'Dialog', delay: 50, timeout: 2000, retries: 1 },
    sheet: { name: 'Sheet', delay: 100, timeout: 3000, retries: 1 }
  }
}))

// The createAsyncComponent mock above handles all async components
// (DataViewer, AdvancedSearchSheet, UploadedFilesList, LanguageSelectorSheet, SupportedLanguagesDialog)
// by loading them synchronously in tests

// Mock skeleton components
vi.mock('@/components/skeleton/DataViewerSkeleton.vue', () => ({
  default: {
    name: 'DataViewerSkeleton',
    template: '<div data-testid="data-viewer-skeleton">Loading DataViewer...</div>'
  }
}))

vi.mock('@/components/skeleton/JsonViewerSkeleton.vue', () => ({
  default: {
    name: 'JsonViewerSkeleton',
    template: '<div data-testid="json-viewer-skeleton">Loading JsonViewer...</div>'
  }
}))

vi.mock('@/components/skeleton/DialogSkeleton.vue', () => ({
  default: {
    name: 'DialogSkeleton',
    template: '<div data-testid="dialog-skeleton">Loading Dialog...</div>'
  }
}))

// Mock dialog components
vi.mock('@/components/EditTranslationDialog.vue', () => ({
  default: {
    name: 'EditTranslationDialog',
    template: `
      <div data-testid="edit-translation-dialog">
        <div>Edit Translation Dialog</div>
      </div>
    `,
    props: {
      open: Boolean,
      editData: Object
    },
    emits: ['update:open', 'confirm', 'cancel']
  }
}))

vi.mock('@/components/DeleteConfirmationDialog.vue', () => ({
  default: {
    name: 'DeleteConfirmationDialog',
    template: `
      <div data-testid="delete-confirmation-dialog">
        <div>Delete Confirmation Dialog</div>
      </div>
    `,
    props: {
      open: Boolean,
      deleteData: Object
    },
    emits: ['update:open', 'confirm', 'cancel']
  }
}))

vi.mock('@/components/ReplaceDataConfirmDialog.vue', () => ({
  default: {
    name: 'ReplaceDataConfirmDialog',
    template: `
      <div data-testid="replace-data-confirm-dialog">
        <div>Replace Data Confirm Dialog</div>
      </div>
    `,
    props: {
      open: Boolean
    },
    emits: ['update:open', 'confirm', 'cancel']
  }
}))

// Only dialog components are async loaded, so no need for sheet component mocks

// Export mock utilities for tests
export const mockAsyncComponent = (name: string, template?: string) => ({
  name,
  template: template || `<div data-testid="mock-${name.toLowerCase()}">${name}</div>`
})

export const flushAsyncComponents = async () => {
  // Helper to flush all pending async component loads in tests
  await new Promise(resolve => setTimeout(resolve, 0))
}
