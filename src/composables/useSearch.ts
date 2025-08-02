import { ref, computed, watch } from 'vue'
import type { 
  SearchResult, 
  TranslationData, 
  CSVData, 
  MultiLanguageTranslationData 
} from '@/types'
import { SearchEngine } from '@/utils/search'
import { debounce } from '@/utils'

export function useSearch() {
  const searchEngine = new SearchEngine()
  
  const searchQuery = ref('')
  const searchResults = ref<SearchResult[]>([])
  const isSearching = ref(false)
  const searchStats = ref({
    totalItems: 0,
    languages: [] as string[],
    averageKeyLength: 0,
    averageValueLength: 0
  })
  
  const selectedLanguage = ref<string>('')
  const searchMode = ref<'all' | 'keys' | 'values'>('all')
  const searchThreshold = ref(0.3)
  const maxResults = ref(100)

  // Debounced search function
  const debouncedSearch = debounce(performSearch, 300)

  const hasResults = computed(() => searchResults.value.length > 0)
  const hasQuery = computed(() => searchQuery.value.trim().length > 0)
  const filteredResults = computed(() => {
    let results = searchResults.value

    // Filter by selected language if specified
    if (selectedLanguage.value) {
      results = results.filter(result => result.language === selectedLanguage.value)
    }

    // Limit results
    return results.slice(0, maxResults.value)
  })

  const availableLanguages = computed(() => searchStats.value.languages)

  function indexJSONData(data: TranslationData, language: string = 'English'): void {
    searchEngine.indexJSONData(data, language)
    updateSearchStats()
  }

  function indexMultiLanguageJSONData(data: MultiLanguageTranslationData): void {
    searchEngine.indexMultiLanguageJSONData(data)
    updateSearchStats()
  }

  function indexCSVData(data: CSVData): void {
    searchEngine.indexCSVData(data)
    updateSearchStats()
  }

  function performSearch(): void {
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      return
    }

    isSearching.value = true

    try {
      let results: SearchResult[] = []

      switch (searchMode.value) {
        case 'keys':
          results = searchEngine.searchKeys(searchQuery.value, searchThreshold.value)
          break
        case 'values':
          results = searchEngine.searchValues(searchQuery.value, searchThreshold.value)
          break
        case 'all':
        default:
          results = searchEngine.search(searchQuery.value, {
            threshold: searchThreshold.value,
            includeScore: true
          })
          break
      }

      // Sort by score (best matches first)
      searchResults.value = searchEngine.sortByScore(results)
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  function searchInLanguage(language: string): void {
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      return
    }

    isSearching.value = true

    try {
      const results = searchEngine.searchInLanguage(
        searchQuery.value, 
        language, 
        searchThreshold.value
      )
      searchResults.value = searchEngine.sortByScore(results)
    } catch (error) {
      console.error('Language search error:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  function getExactMatches(): SearchResult[] {
    if (!searchQuery.value.trim()) {
      return []
    }
    return searchEngine.getExactMatches(searchQuery.value)
  }

  function getSuggestions(limit: number = 10): string[] {
    if (!searchQuery.value.trim()) {
      return []
    }
    return searchEngine.getSuggestions(searchQuery.value, limit)
  }

  function clearSearch(): void {
    searchQuery.value = ''
    searchResults.value = []
  }

  function clearIndex(): void {
    searchEngine.clearIndex()
    searchResults.value = []
    updateSearchStats()
  }

  function updateSearchStats(): void {
    searchStats.value = searchEngine.getSearchStats()
  }

  function setSearchMode(mode: 'all' | 'keys' | 'values'): void {
    searchMode.value = mode
    if (searchQuery.value.trim()) {
      debouncedSearch()
    }
  }

  function setSearchThreshold(threshold: number): void {
    searchThreshold.value = Math.max(0, Math.min(1, threshold))
    if (searchQuery.value.trim()) {
      debouncedSearch()
    }
  }

  function setSelectedLanguage(language: string): void {
    selectedLanguage.value = language
  }

  function setMaxResults(max: number): void {
    maxResults.value = Math.max(1, max)
  }

  function highlightMatches(text: string, query: string): string {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  }

  function exportSearchResults(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(filteredResults.value, null, 2)
    } else {
      // CSV format
      const headers = ['Key', 'Value', 'Language', 'Score']
      const rows = filteredResults.value.map(result => [
        `"${result.key.replace(/"/g, '""')}"`,
        `"${result.value.replace(/"/g, '""')}"`,
        `"${result.language}"`,
        result.score.toFixed(3)
      ])
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    }
  }

  // Watch for search query changes
  watch(searchQuery, () => {
    debouncedSearch()
  })

  // Watch for search mode changes
  watch(searchMode, () => {
    if (searchQuery.value.trim()) {
      debouncedSearch()
    }
  })

  return {
    // State
    searchQuery,
    searchResults: filteredResults,
    isSearching: computed(() => isSearching.value),
    searchStats: computed(() => searchStats.value),
    selectedLanguage,
    searchMode,
    searchThreshold,
    maxResults,
    
    // Computed
    hasResults,
    hasQuery,
    availableLanguages,

    // Methods
    indexJSONData,
    indexMultiLanguageJSONData,
    indexCSVData,
    performSearch,
    searchInLanguage,
    getExactMatches,
    getSuggestions,
    clearSearch,
    clearIndex,
    setSearchMode,
    setSearchThreshold,
    setSelectedLanguage,
    setMaxResults,
    highlightMatches,
    exportSearchResults
  }
}
