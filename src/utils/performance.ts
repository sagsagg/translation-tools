/**
 * Performance monitoring and optimization utilities for Vue components
 */

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor

  private measurements = new Map<string, number[]>()

  private isEnabled = import.meta.env.DEV

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startMeasurement(name: string): void {
    if (!this.isEnabled) return
    performance.mark(`${name}-start`)
  }

  endMeasurement(name: string): number {
    if (!this.isEnabled) return 0

    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)

    const measure = performance.getEntriesByName(name, 'measure').pop()
    const duration = measure?.duration || 0

    // Store measurement
    if (!this.measurements.has(name)) {
      this.measurements.set(name, [])
    }
    this.measurements.get(name)!.push(duration)

    // Clean up marks
    performance.clearMarks(`${name}-start`)
    performance.clearMarks(`${name}-end`)
    performance.clearMeasures(name)

    return duration
  }

  getAverageTime(name: string): number {
    const times = this.measurements.get(name) || []
    if (times.length === 0) return 0
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  getStats(name: string): { avg: number; min: number; max: number; count: number } {
    const times = this.measurements.get(name) || []
    if (times.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 }
    }

    return {
      avg: times.reduce((sum, time) => sum + time, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      count: times.length
    }
  }

  logStats(): void {
    if (!this.isEnabled) return

    console.group('🚀 Performance Stats')
    for (const [name] of this.measurements) {
      const stats = this.getStats(name)
      console.log(`${name}:`, {
        average: `${stats.avg.toFixed(2)}ms`,
        min: `${stats.min.toFixed(2)}ms`,
        max: `${stats.max.toFixed(2)}ms`,
        samples: stats.count
      })
    }
    console.groupEnd()
  }

  clear(): void {
    this.measurements.clear()
  }
}

// Performance decorator for functions
export function measurePerformance<T extends (...args: never[]) => unknown>(
  target: T,
  name?: string
): T {
  const monitor = PerformanceMonitor.getInstance()
  const measurementName = name || target.name || 'anonymous'

  return ((...args: Parameters<T>): ReturnType<T> => {
    monitor.startMeasurement(measurementName)
    const result = target(...args) as ReturnType<T>
    monitor.endMeasurement(measurementName)
    return result
  }) as T
}

// Vue composable for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()

  return {
    startMeasurement: monitor.startMeasurement.bind(monitor),
    endMeasurement: monitor.endMeasurement.bind(monitor),
    getStats: monitor.getStats.bind(monitor),
    logStats: monitor.logStats.bind(monitor),
    clear: monitor.clear.bind(monitor)
  }
}

// Component performance tracking
export function trackComponentPerformance(componentName: string) {
  const monitor = PerformanceMonitor.getInstance()

  return {
    onMounted() {
      monitor.startMeasurement(`${componentName}-mount`)
    },
    onUpdated() {
      monitor.endMeasurement(`${componentName}-mount`)
      monitor.startMeasurement(`${componentName}-update`)
    },
    onUnmounted() {
      monitor.endMeasurement(`${componentName}-update`)
    }
  }
}

// Memory usage monitoring
export function getMemoryUsage(): { used: number; total: number; percentage: number } {
  if ('memory' in performance) {
    const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
    }
  }
  return { used: 0, total: 0, percentage: 0 }
}

// Bundle size analysis helper
export function logBundleInfo(): void {
  if (import.meta.env.DEV) {
    console.group('📦 Bundle Information')
    console.log('Environment:', import.meta.env.MODE)
    console.log('Memory usage:', getMemoryUsage())
    console.groupEnd()
  }
}

// Lazy loading helper with performance tracking
export function createLazyComponent(
  loader: () => Promise<unknown>,
  name: string,
  options?: {
    delay?: number
    timeout?: number
    loadingComponent?: unknown
    errorComponent?: unknown
  }
) {
  const monitor = PerformanceMonitor.getInstance()

  return {
    loader: async () => {
      monitor.startMeasurement(`lazy-load-${name}`)
      try {
        const component = await loader()
        monitor.endMeasurement(`lazy-load-${name}`)
        return component
      } catch (error) {
        monitor.endMeasurement(`lazy-load-${name}`)
        throw error
      }
    },
    delay: options?.delay || 200,
    timeout: options?.timeout || 3000,
    loadingComponent: options?.loadingComponent,
    errorComponent: options?.errorComponent
  }
}

// Performance optimization recommendations
export function analyzePerformance(): string[] {
  const monitor = PerformanceMonitor.getInstance()
  const recommendations: string[] = []

  // Check component mount times
  const mountStats = monitor.getStats('DataViewer-mount')
  if (mountStats.avg > 100) {
    recommendations.push('Consider lazy loading DataViewer component')
  }

  // Check memory usage
  const memory = getMemoryUsage()
  if (memory.percentage > 80) {
    recommendations.push('High memory usage detected - consider implementing virtual scrolling')
  }

  // Check update frequency
  const updateStats = monitor.getStats('DataViewer-update')
  if (updateStats.count > 10 && updateStats.avg > 50) {
    recommendations.push('Frequent updates detected - consider using v-memo or computed properties')
  }

  return recommendations
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()
