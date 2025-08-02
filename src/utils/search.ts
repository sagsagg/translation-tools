import Fuse, { type IFuseOptions } from 'fuse.js'
import type {
  TranslationData,
  CSVData,
  SearchResult,
  SearchOptions,
  MultiLanguageTranslationData
} from '@/types'

export interface SearchableItem {
  key: string
  value: string
  language: string
  originalIndex?: number
}

export class SearchEngine {
  private fuse: Fuse<SearchableItem> | null = null
  private searchableData: SearchableItem[] = []

  constructor() {
    this.initializeFuse()
  }

  private initializeFuse() {
    const options: IFuseOptions<SearchableItem> = {
      keys: [
        { name: 'key', weight: 0.7 },
        { name: 'value', weight: 0.3 }
      ],
      threshold: 0.3, // Lower = more strict matching
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
      ignoreLocation: true,
      findAllMatches: true
    }

    this.fuse = new Fuse(this.searchableData, options)
  }

  /**
   * Index JSON translation data for search
   */
  indexJSONData(data: TranslationData, language: string = 'English'): void {
    this.searchableData = Object.entries(data).map(([key, value], index) => ({
      key,
      value,
      language,
      originalIndex: index
    }))
    this.updateFuseIndex()
  }

  /**
   * Index multi-language JSON data for search
   */
  indexMultiLanguageJSONData(data: MultiLanguageTranslationData): void {
    this.searchableData = []
    let globalIndex = 0

    Object.entries(data).forEach(([language, translations]) => {
      Object.entries(translations).forEach(([key, value]) => {
        this.searchableData.push({
          key,
          value,
          language,
          originalIndex: globalIndex++
        })
      })
    })

    this.updateFuseIndex()
  }

  /**
   * Index CSV data for search
   */
  indexCSVData(data: CSVData): void {
    this.searchableData = []
    let globalIndex = 0

    const languageColumns = data.headers.filter(h => h.toLowerCase() !== 'key')

    data.rows.forEach((row) => {
      const key = row.Key
      if (!key) return

      languageColumns.forEach(language => {
        const value = row[language] || ''
        this.searchableData.push({
          key,
          value,
          language,
          originalIndex: globalIndex++
        })
      })
    })

    this.updateFuseIndex()
  }

  private updateFuseIndex(): void {
    if (this.fuse) {
      this.fuse.setCollection(this.searchableData)
    } else {
      this.initializeFuse()
    }
  }

  /**
   * Perform fuzzy search
   */
  search(query: string, options?: Partial<SearchOptions>): SearchResult[] {
    if (!this.fuse || !query.trim()) {
      return []
    }

    const searchOptions = {
      limit: options?.limit ?? 50
    }

    const results = this.fuse.search(query, searchOptions)

    return results.map(result => ({
      key: result.item.key,
      value: result.item.value,
      language: result.item.language,
      score: result.score || 0
    }))
  }

  /**
   * Search only in keys
   */
  searchKeys(query: string, threshold: number = 0.3): SearchResult[] {
    return this.search(query, {
      keys: ['key'],
      threshold,
      includeScore: true
    })
  }

  /**
   * Search only in values
   */
  searchValues(query: string, threshold: number = 0.3): SearchResult[] {
    return this.search(query, {
      keys: ['value'],
      threshold,
      includeScore: true
    })
  }

  /**
   * Search within specific language
   */
  searchInLanguage(query: string, language: string, threshold: number = 0.3): SearchResult[] {
    const languageData = this.searchableData.filter(item => item.language === language)

    if (languageData.length === 0) {
      return []
    }

    const tempFuse = new Fuse(languageData, {
      keys: ['key', 'value'],
      threshold,
      includeScore: true,
      includeMatches: true
    })

    const results = tempFuse.search(query)

    return results.map(result => ({
      key: result.item.key,
      value: result.item.value,
      language: result.item.language,
      score: result.score || 0
    }))
  }

  /**
   * Get exact matches
   */
  getExactMatches(query: string): SearchResult[] {
    const exactMatches = this.searchableData.filter(item =>
      item.key.toLowerCase().includes(query.toLowerCase()) ||
      item.value.toLowerCase().includes(query.toLowerCase())
    )

    return exactMatches.map(item => ({
      key: item.key,
      value: item.value,
      language: item.language,
      score: 0 // Exact matches get perfect score
    }))
  }

  /**
   * Get suggestions based on partial input
   */
  getSuggestions(partialQuery: string, limit: number = 10): string[] {
    if (!partialQuery.trim()) {
      return []
    }

    const suggestions = new Set<string>()
    const query = partialQuery.toLowerCase()

    // Get key suggestions
    this.searchableData.forEach(item => {
      if (item.key.toLowerCase().startsWith(query)) {
        suggestions.add(item.key)
      }
    })

    // Get value suggestions (words that start with query)
    this.searchableData.forEach(item => {
      const words = item.value.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.startsWith(query) && word.length > query.length) {
          suggestions.add(word)
        }
      })
    })

    return Array.from(suggestions).slice(0, limit)
  }

  /**
   * Get search statistics
   */
  getSearchStats(): {
    totalItems: number
    languages: string[]
    averageKeyLength: number
    averageValueLength: number
  } {
    const languages = Array.from(new Set(this.searchableData.map(item => item.language)))
    const totalItems = this.searchableData.length

    const avgKeyLength = this.searchableData.reduce((sum, item) => sum + item.key.length, 0) / totalItems
    const avgValueLength = this.searchableData.reduce((sum, item) => sum + item.value.length, 0) / totalItems

    return {
      totalItems,
      languages,
      averageKeyLength: Math.round(avgKeyLength),
      averageValueLength: Math.round(avgValueLength)
    }
  }

  /**
   * Filter results by language
   */
  filterByLanguage(results: SearchResult[], language: string): SearchResult[] {
    return results.filter(result => result.language === language)
  }

  /**
   * Sort results by score (best matches first)
   */
  sortByScore(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => a.score - b.score)
  }

  /**
   * Sort results by key alphabetically
   */
  sortByKey(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => a.key.localeCompare(b.key))
  }

  /**
   * Get unique keys from search results
   */
  getUniqueKeys(results: SearchResult[]): string[] {
    return Array.from(new Set(results.map(result => result.key)))
  }

  /**
   * Clear search index
   */
  clearIndex(): void {
    this.searchableData = []
    this.updateFuseIndex()
  }

  /**
   * Get all indexed data
   */
  getAllData(): SearchableItem[] {
    return [...this.searchableData]
  }

  /**
   * Update search configuration
   */
  updateConfig(options: Partial<IFuseOptions<SearchableItem>>): void {
    if (this.fuse) {
      // Create new Fuse instance with updated options
      const defaultOptions: IFuseOptions<SearchableItem> = {
        keys: [
          { name: 'key', weight: 0.7 },
          { name: 'value', weight: 0.3 }
        ],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 1,
        ignoreLocation: true,
        findAllMatches: true
      }
      const newOptions = { ...defaultOptions, ...options }
      this.fuse = new Fuse(this.searchableData, newOptions)
    }
  }
}
