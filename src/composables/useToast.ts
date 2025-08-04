import { ref, readonly } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastIdCounter}`
    const newToast: Toast = {
      id,
      duration: 3000,
      persistent: false,
      ...toast
    }

    toasts.value.push(newToast)

    // Auto-remove toast after duration (unless persistent)
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAllToasts = () => {
    toasts.value = []
  }

  const success = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'success', title, message, ...options })
  }

  const error = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'error', title, message, ...options })
  }

  const warning = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'warning', title, message, ...options })
  }

  const info = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'info', title, message, ...options })
  }

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }
}

// Global toast instance
export const toast = useToast()
