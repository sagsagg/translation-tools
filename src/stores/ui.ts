import { ref, computed, nextTick } from 'vue'
import { defineStore } from 'pinia'
import type { ViewMode } from '@/types'

export const useUIStore = defineStore('ui', () => {
  // State
  const currentView = ref<ViewMode>('table')
  const inputMethod = ref<'file' | 'text'>('file')

  // Dialog states
  const isEditDialogOpen = ref(false)
  const isDeleteDialogOpen = ref(false)
  const isConfirmDialogOpen = ref(false)
  const isSupportedLanguagesDialogOpen = ref(false)

  // Edit/Delete data
  const currentEditData = ref<{
    key: string
    value: string
    language?: string
  } | null>(null)

  const currentDeleteData = ref<{
    key: string
    value: string
    language?: string
  } | null>(null)

  // Loading states
  const isLoading = ref(false)
  const loadingMessage = ref('')

  // Error states
  const hasError = ref(false)
  const errorMessage = ref('')

  // Search states
  const isSearchActive = ref(false)
  const searchQuery = ref('')

  // Theme and preferences
  const theme = ref<'light' | 'dark' | 'system'>('system')
  const sidebarCollapsed = ref(false)

  // Performance monitoring
  const performanceMode = ref<'normal' | 'high-performance'>('normal')

  // Getters
  const isAnyDialogOpen = computed(() =>
    isEditDialogOpen.value ||
    isDeleteDialogOpen.value ||
    isConfirmDialogOpen.value ||
    isSupportedLanguagesDialogOpen.value
  )

  const canChangeView = computed(() => !isLoading.value && !isAnyDialogOpen.value)

  const canChangeInputMethod = computed(() => !isLoading.value && !isAnyDialogOpen.value)

  const hasActiveSearch = computed(() => isSearchActive.value && searchQuery.value.trim().length > 0)

  const isHighPerformanceMode = computed(() => performanceMode.value === 'high-performance')

  // Actions
  function setCurrentView(view: ViewMode) {
    if (canChangeView.value) {
      currentView.value = view
    }
  }

  function setInputMethod(method: 'file' | 'text') {
    if (canChangeInputMethod.value) {
      inputMethod.value = method
    }
  }

  // Dialog management
  function openEditDialog(key: string, value: string, language?: string) {
    // Use nextTick to break reactive dependency chain and prevent recursive updates
    nextTick(() => {
      currentEditData.value = { key, value, language }
      isEditDialogOpen.value = true
    })
  }

  function closeEditDialog() {
    isEditDialogOpen.value = false
    currentEditData.value = null
  }

  function openDeleteDialog(key: string, value: string, language?: string) {
    // Use nextTick to break reactive dependency chain and prevent recursive updates
    nextTick(() => {
      currentDeleteData.value = { key, value, language }
      isDeleteDialogOpen.value = true
    })
  }

  function closeDeleteDialog() {
    isDeleteDialogOpen.value = false
    currentDeleteData.value = null
  }

  function openConfirmDialog() {
    isConfirmDialogOpen.value = true
  }

  function closeConfirmDialog() {
    isConfirmDialogOpen.value = false
  }

  function openSupportedLanguagesDialog() {
    isSupportedLanguagesDialogOpen.value = true
  }

  function closeSupportedLanguagesDialog() {
    isSupportedLanguagesDialogOpen.value = false
  }

  function closeAllDialogs() {
    closeEditDialog()
    closeDeleteDialog()
    closeConfirmDialog()
    closeSupportedLanguagesDialog()
  }

  // Loading state management
  function setLoading(loading: boolean, message = '') {
    isLoading.value = loading
    loadingMessage.value = message

    if (!loading) {
      loadingMessage.value = ''
    }
  }

  function startLoading(message = 'Loading...') {
    setLoading(true, message)
  }

  function stopLoading() {
    setLoading(false)
  }

  // Error state management
  function setError(error: boolean, message = '') {
    hasError.value = error
    errorMessage.value = message

    if (!error) {
      errorMessage.value = ''
    }
  }

  function showError(message: string) {
    setError(true, message)
  }

  function clearError() {
    setError(false)
  }

  // Search state management
  function setSearchActive(active: boolean) {
    isSearchActive.value = active

    if (!active) {
      searchQuery.value = ''
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
    isSearchActive.value = query.trim().length > 0
  }

  function clearSearch() {
    searchQuery.value = ''
    isSearchActive.value = false
  }

  // Theme management
  function setTheme(newTheme: 'light' | 'dark' | 'system') {
    theme.value = newTheme
  }

  function toggleTheme() {
    switch (theme.value) {
      case 'light':
        setTheme('dark')
        break
      case 'dark':
        setTheme('system')
        break
      case 'system':
        setTheme('light')
        break
    }
  }

  // Sidebar management
  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // Performance management
  function setPerformanceMode(mode: 'normal' | 'high-performance') {
    performanceMode.value = mode
  }

  function togglePerformanceMode() {
    performanceMode.value = performanceMode.value === 'normal'
      ? 'high-performance'
      : 'normal'
  }

  // Utility actions
  function resetUIState() {
    currentView.value = 'table'
    inputMethod.value = 'file'
    closeAllDialogs()
    stopLoading()
    clearError()
    clearSearch()
  }

  function getUISnapshot() {
    return {
      currentView: currentView.value,
      inputMethod: inputMethod.value,
      dialogs: {
        edit: isEditDialogOpen.value,
        delete: isDeleteDialogOpen.value,
        confirm: isConfirmDialogOpen.value,
        supportedLanguages: isSupportedLanguagesDialogOpen.value
      },
      loading: {
        isLoading: isLoading.value,
        message: loadingMessage.value
      },
      error: {
        hasError: hasError.value,
        message: errorMessage.value
      },
      search: {
        isActive: isSearchActive.value,
        query: searchQuery.value
      },
      theme: theme.value,
      sidebar: {
        collapsed: sidebarCollapsed.value
      },
      performance: {
        mode: performanceMode.value
      }
    }
  }

  function restoreUISnapshot(snapshot: ReturnType<typeof getUISnapshot>) {
    currentView.value = snapshot.currentView
    inputMethod.value = snapshot.inputMethod

    isEditDialogOpen.value = snapshot.dialogs.edit
    isDeleteDialogOpen.value = snapshot.dialogs.delete
    isConfirmDialogOpen.value = snapshot.dialogs.confirm
    isSupportedLanguagesDialogOpen.value = snapshot.dialogs.supportedLanguages

    isLoading.value = snapshot.loading.isLoading
    loadingMessage.value = snapshot.loading.message

    hasError.value = snapshot.error.hasError
    errorMessage.value = snapshot.error.message

    isSearchActive.value = snapshot.search.isActive
    searchQuery.value = snapshot.search.query

    theme.value = snapshot.theme
    sidebarCollapsed.value = snapshot.sidebar.collapsed
    performanceMode.value = snapshot.performance.mode
  }

  return {
    // State
    currentView,
    inputMethod,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isConfirmDialogOpen,
    isSupportedLanguagesDialogOpen,
    currentEditData,
    currentDeleteData,
    isLoading,
    loadingMessage,
    hasError,
    errorMessage,
    isSearchActive,
    searchQuery,
    theme,
    sidebarCollapsed,
    performanceMode,

    // Getters
    isAnyDialogOpen,
    canChangeView,
    canChangeInputMethod,
    hasActiveSearch,
    isHighPerformanceMode,

    // Actions
    setCurrentView,
    setInputMethod,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openConfirmDialog,
    closeConfirmDialog,
    openSupportedLanguagesDialog,
    closeSupportedLanguagesDialog,
    closeAllDialogs,
    setLoading,
    startLoading,
    stopLoading,
    setError,
    showError,
    clearError,
    setSearchActive,
    setSearchQuery,
    clearSearch,
    setTheme,
    toggleTheme,
    setSidebarCollapsed,
    toggleSidebar,
    setPerformanceMode,
    togglePerformanceMode,
    resetUIState,
    getUISnapshot,
    restoreUISnapshot
  }
})
