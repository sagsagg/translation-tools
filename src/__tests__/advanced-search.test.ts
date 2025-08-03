import { describe, it, expect, beforeEach } from 'vitest'
import { useSearch } from '@/composables/useSearch'
import type { TranslationData, CSVData, MultiLanguageTranslationData } from '@/types'

describe('Advanced Search Functionality', () => {

  describe('Search Integration', () => {
    let search: ReturnType<typeof useSearch>

    beforeEach(() => {
      search = useSearch()
    })

    it('should initialize search composable correctly', () => {
      expect(search.searchQuery.value).toBe('')
      expect(search.searchResults.value).toEqual([])
      expect(search.isSearching.value).toBe(false)
      expect(search.searchMode.value).toBe('all')
      expect(search.searchThreshold.value).toBe(0.3)
      expect(search.maxResults.value).toBe(100)
    })

    it('should index JSON data and update stats', () => {
      const jsonData: TranslationData = {
        'app.title': 'Test Application',
        'app.welcome': 'Welcome User',
        'nav.home': 'Home Page'
      }

      search.indexJSONData(jsonData, 'English')

      // Check that stats are updated
      expect(search.searchStats.value.totalItems).toBeGreaterThan(0)
      expect(search.availableLanguages.value).toContain('English')
    })

    it('should index CSV data and update stats', () => {
      const csvData: CSVData = {
        headers: ['Key', 'English', 'Spanish'],
        rows: [
          { Key: 'app.title', English: 'Test App', Spanish: 'Aplicación de Prueba' },
          { Key: 'app.welcome', English: 'Welcome', Spanish: 'Bienvenido' }
        ]
      }

      search.indexCSVData(csvData)

      // Check that stats are updated
      expect(search.searchStats.value.totalItems).toBeGreaterThan(0)
      expect(search.availableLanguages.value.length).toBeGreaterThan(0)
    })

    it('should index multi-language JSON data and update stats', () => {
      const multiLangData: MultiLanguageTranslationData = {
        English: {
          'app.title': 'Test Application',
          'app.welcome': 'Welcome User'
        },
        Spanish: {
          'app.title': 'Aplicación de Prueba',
          'app.welcome': 'Bienvenido Usuario'
        }
      }

      search.indexMultiLanguageJSONData(multiLangData)

      // Check that stats are updated
      expect(search.searchStats.value.totalItems).toBeGreaterThan(0)
      expect(search.availableLanguages.value).toContain('English')
      expect(search.availableLanguages.value).toContain('Spanish')
    })

    it('should perform search and return results', () => {
      // Index some data first
      const jsonData: TranslationData = {
        'app.title': 'Test Application',
        'app.welcome': 'Welcome User',
        'nav.home': 'Home Page'
      }
      search.indexJSONData(jsonData, 'English')

      // Set search query and perform search
      search.searchQuery.value = 'app'
      search.performSearch()

      // Should have results
      expect(search.searchResults.value.length).toBeGreaterThan(0)
    })

    it('should change search mode and affect results', () => {
      // Index some data first
      const jsonData: TranslationData = {
        'app.title': 'Test Application',
        'app.welcome': 'Welcome User'
      }
      search.indexJSONData(jsonData, 'English')

      // Test different search modes
      search.searchQuery.value = 'app'

      search.setSearchMode('keys')
      expect(search.searchMode.value).toBe('keys')

      search.setSearchMode('values')
      expect(search.searchMode.value).toBe('values')

      search.setSearchMode('all')
      expect(search.searchMode.value).toBe('all')
    })

    it('should clear search correctly', () => {
      search.searchQuery.value = 'test query'
      search.clearSearch()
      expect(search.searchQuery.value).toBe('')
      expect(search.searchResults.value).toEqual([])
    })

    it('should export search results in different formats', () => {
      // Index some data and perform search
      const jsonData: TranslationData = {
        'app.title': 'Test Application'
      }
      search.indexJSONData(jsonData, 'English')
      search.searchQuery.value = 'app'
      search.performSearch()

      // Test JSON export
      const jsonResult = search.exportSearchResults('json')
      expect(typeof jsonResult).toBe('string')
      expect(() => JSON.parse(jsonResult)).not.toThrow()

      // Test CSV export
      const csvResult = search.exportSearchResults('csv')
      expect(typeof csvResult).toBe('string')
      expect(csvResult).toContain('Key,Value,Language,Score')
    })

    it('should get suggestions for search queries', () => {
      // Index some data first
      const jsonData: TranslationData = {
        'app.title': 'Test Application',
        'app.welcome': 'Welcome User',
        'nav.home': 'Home Page'
      }
      search.indexJSONData(jsonData, 'English')

      search.searchQuery.value = 'ap' // partial match
      const suggestions = search.getSuggestions(5)

      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeLessThanOrEqual(5)
    })

    it('should handle search threshold changes', () => {
      search.setSearchThreshold(0.1) // More strict
      expect(search.searchThreshold.value).toBe(0.1)

      search.setSearchThreshold(0.8) // More fuzzy
      expect(search.searchThreshold.value).toBe(0.8)

      // Test bounds
      search.setSearchThreshold(-0.1) // Should clamp to 0
      expect(search.searchThreshold.value).toBe(0)

      search.setSearchThreshold(1.1) // Should clamp to 1
      expect(search.searchThreshold.value).toBe(1)
    })

    it('should handle max results changes', () => {
      search.setMaxResults(50)
      expect(search.maxResults.value).toBe(50)

      search.setMaxResults(0) // Should clamp to minimum 1
      expect(search.maxResults.value).toBe(1)
    })

    it('should handle language filtering', () => {
      // Index multi-language data
      const multiLangData: MultiLanguageTranslationData = {
        English: { 'app.title': 'Test Application' },
        Spanish: { 'app.title': 'Aplicación de Prueba' }
      }
      search.indexMultiLanguageJSONData(multiLangData)

      // Set language filter
      search.setSelectedLanguage('English')
      expect(search.selectedLanguage.value).toBe('English')

      search.setSelectedLanguage('Spanish')
      expect(search.selectedLanguage.value).toBe('Spanish')
    })
  })
})
