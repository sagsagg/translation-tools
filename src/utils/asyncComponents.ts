/**
 * Async component loading utilities with performance tracking and error handling
 */

import { defineAsyncComponent, type AsyncComponentLoader, type Component } from 'vue'
import { performanceMonitor } from './performance'

// Error component for failed async loads
const AsyncErrorComponent = {
  template: `
    <div class="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
      <div class="flex items-center space-x-2 text-red-600 dark:text-red-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span class="font-medium">Component failed to load</span>
      </div>
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">
        Please refresh the page to try again.
      </p>
    </div>
  `
}

// Retry mechanism for failed loads
function createRetryLoader<T>(
  loader: AsyncComponentLoader<T>,
  maxRetries = 2,
  retryDelay = 1000
): AsyncComponentLoader<T> {
  return async () => {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await loader()
      } catch (error) {
        lastError = error as Error

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
        }
      }
    }

    throw lastError
  }
}

// Create async component with performance tracking and error handling
export function createAsyncComponent<T extends Component>(
  loader: AsyncComponentLoader<T>,
  options: {
    name: string
    loadingComponent?: Component
    errorComponent?: Component
    delay?: number
    timeout?: number
    retries?: number
    retryDelay?: number
  }
) {
  const {
    name,
    loadingComponent,
    errorComponent = AsyncErrorComponent,
    delay = 200,
    timeout = 3000,
    retries = 2,
    retryDelay = 1000
  } = options

  // Create performance-tracked loader
  const trackedLoader: AsyncComponentLoader<T> = async () => {
    const measurementName = `async-load-${name}`
    performanceMonitor.startMeasurement(measurementName)

    try {
      const component = await loader()
      performanceMonitor.endMeasurement(measurementName)

      // Log successful load in development
      if (import.meta.env.DEV) {
        const stats = performanceMonitor.getStats(measurementName)
        console.log(`✅ Async component '${name}' loaded in ${stats.avg.toFixed(2)}ms`)
      }

      return component
    } catch (error) {
      performanceMonitor.endMeasurement(measurementName)

      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ Failed to load async component '${name}':`, error)
      }

      throw error
    }
  }

  // Create retry-enabled loader
  const retryLoader = retries > 0
    ? createRetryLoader(trackedLoader, retries, retryDelay)
    : trackedLoader

  return defineAsyncComponent({
    loader: retryLoader,
    loadingComponent,
    errorComponent,
    delay,
    timeout
  })
}

// Preload async component for better UX
export async function preloadAsyncComponent<T extends Component>(
  loader: AsyncComponentLoader<T>,
  name: string
): Promise<T> {
  const measurementName = `preload-${name}`
  performanceMonitor.startMeasurement(measurementName)

  try {
    const componentModule = await loader()
    performanceMonitor.endMeasurement(measurementName)

    if (import.meta.env.DEV) {
      const stats = performanceMonitor.getStats(measurementName)
      console.log(`🚀 Preloaded component '${name}' in ${stats.avg.toFixed(2)}ms`)
    }

    // Handle both ES module default exports and direct component exports
    const component = (componentModule as { default?: T }).default ?? componentModule
    return component as T
  } catch (error) {
    performanceMonitor.endMeasurement(measurementName)

    if (import.meta.env.DEV) {
      console.error(`❌ Failed to preload component '${name}':`, error)
    }

    throw error
  }
}

// Batch preload multiple components
export async function preloadComponents(
  components: {
    name: string
    loader: AsyncComponentLoader<Component>
  }[]
): Promise<Component[]> {
  const results = await Promise.allSettled(
    components.map(({ name, loader }) => preloadAsyncComponent(loader, name))
  )

  const successful = results
    .filter((result): result is PromiseFulfilledResult<Component> =>
      result.status === 'fulfilled'
    )
    .map(result => result.value)

  if (import.meta.env.DEV) {
    const failed = results.filter(result => result.status === 'rejected').length
    console.log(`📦 Preloaded ${successful.length}/${components.length} components (${failed} failed)`)
  }

  return successful
}

// Component loading state management
export function useAsyncComponentState() {
  const loadingStates = new Map<string, boolean>()
  const errorStates = new Map<string, Error | null>()

  return {
    setLoading: (name: string, loading: boolean) => {
      loadingStates.set(name, loading)
    },

    setError: (name: string, error: Error | null) => {
      errorStates.set(name, error)
    },

    isLoading: (name: string) => loadingStates.get(name) || false,

    getError: (name: string) => errorStates.get(name) || null,

    clear: (name: string) => {
      loadingStates.delete(name)
      errorStates.delete(name)
    },

    clearAll: () => {
      loadingStates.clear()
      errorStates.clear()
    }
  }
}

// Export common async component configurations
export const asyncComponentConfigs = {
  // Heavy data components
  dataViewer: {
    name: 'DataViewer',
    delay: 100,
    timeout: 5000,
    retries: 3
  },

  jsonViewer: {
    name: 'JsonViewer',
    delay: 150,
    timeout: 4000,
    retries: 2
  },

  dataTable: {
    name: 'DataTable',
    delay: 100,
    timeout: 4000,
    retries: 2
  },

  // Dialog components
  dialog: {
    name: 'Dialog',
    delay: 50,
    timeout: 2000,
    retries: 1
  },

  // Sheet components
  sheet: {
    name: 'Sheet',
    delay: 100,
    timeout: 3000,
    retries: 1
  }
} as const
