/**
 * Performance optimization utilities for memoization and caching
 */

// Simple LRU Cache implementation
class LRUCache<K, V> {
  private cache = new Map<K, V>()

  private maxSize: number

  constructor(maxSize = 50) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }
}

// Global cache instances
const dataTransformCache = new LRUCache<string, unknown>(20)
const computationCache = new LRUCache<string, unknown>(100)

/**
 * Creates a cache key from multiple values
 */
export function createCacheKey(...values: unknown[]): string {
  return JSON.stringify(values)
}

import type { CSVData, CSVRow } from '@/types'

// Simple cache maps for specific functions
const jsonToCSVCache = new Map<string, CSVData>()
const filterCSVCache = new Map<string, CSVData>()
const languagesCache = new Map<string, string[]>()
const keyCountCache = new Map<string, number>()

/**
 * Memoized data transformation functions
 */
export const memoizedTransforms = {
  // Cache for JSON to CSV conversion
  jsonToCSV: (jsonData: Record<string, Record<string, string>>, languages: string[]) => {
    const key = createCacheKey(jsonData, languages)

    if (jsonToCSVCache.has(key)) {
      return jsonToCSVCache.get(key)!
    }

    const allKeys = new Set<string>()

    // Collect all unique keys from all languages
    for (const language of languages) {
      if (jsonData[language]) {
        Object.keys(jsonData[language]).forEach(key => allKeys.add(key))
      }
    }

    const result: CSVData = {
      headers: ['Key', ...languages],
      rows: Array.from(allKeys).sort().map(key => {
        const row: CSVRow = { Key: key }
        for (const language of languages) {
          row[language] = jsonData[language]?.[key] || ''
        }
        return row
      })
    }

    jsonToCSVCache.set(key, result)
    return result
  },

  // Cache for CSV filtering
  filterCSV: (csvData: CSVData, selectedLanguages: string[]) => {
    const key = createCacheKey(csvData, selectedLanguages)

    if (filterCSVCache.has(key)) {
      return filterCSVCache.get(key)!
    }

    const filteredHeaders = ['Key', ...selectedLanguages]
    const filteredRows = csvData.rows.map((row: CSVRow) => {
      const filteredRow: CSVRow = { Key: row.Key }
      selectedLanguages.forEach(lang => {
        if (lang in row) {
          filteredRow[lang] = row[lang]
        }
      })
      return filteredRow
    })

    const result: CSVData = { headers: filteredHeaders, rows: filteredRows }
    filterCSVCache.set(key, result)
    return result
  },

  // Cache for language extraction
  getLanguages: (data: Record<string, unknown>) => {
    const key = createCacheKey(data)

    if (languagesCache.has(key)) {
      return languagesCache.get(key)!
    }

    const result = Object.keys(data).sort()
    languagesCache.set(key, result)
    return result
  },

  // Cache for key counting
  countKeys: (data: Record<string, Record<string, unknown>>) => {
    const key = createCacheKey(data)

    if (keyCountCache.has(key)) {
      return keyCountCache.get(key)!
    }

    const allKeys = new Set<string>()
    for (const languageData of Object.values(data)) {
      if (typeof languageData === 'object' && languageData !== null) {
        Object.keys(languageData).forEach(key => allKeys.add(key))
      }
    }

    const result = allKeys.size
    keyCountCache.set(key, result)
    return result
  }
}

/**
 * Clear all caches (useful for memory management)
 */
export function clearAllCaches(): void {
  dataTransformCache.clear()
  computationCache.clear()
}

/**
 * Debounced function wrapper
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttled function wrapper
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Chunked processing for large datasets
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (chunk: T[]) => R[],
  chunkSize = 1000
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)
    const chunkResults = processor(chunk)
    results.push(...chunkResults)

    // Allow UI to breathe between chunks
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  return results
}
