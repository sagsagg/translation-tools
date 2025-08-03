import { ref, computed, watch } from 'vue'
import type {
  TextInputFormat,
  TextInputResult,
  ValidationResult
} from '@/types'
import { validateTextInput, processTextInput } from '@/utils/validation'

// Simple debounce implementation
function debounce<T extends (...args: never[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function useTextInput() {
  // State
  const content = ref('')
  const format = ref<TextInputFormat>('json')
  const isProcessing = ref(false)
  const lastValidationResult = ref<ValidationResult | null>(null)
  const lastProcessResult = ref<TextInputResult | null>(null)

  // Computed properties
  const hasContent = computed(() => content.value.trim().length > 0)

  const isValid = computed(() => {
    if (!hasContent.value) return false
    return lastValidationResult.value?.isValid ?? false
  })

  const validationErrors = computed(() =>
    lastValidationResult.value?.errors ?? []
  )

  const validationWarnings = computed(() =>
    lastValidationResult.value?.warnings ?? []
  )

  const canProcess = computed(() =>
    hasContent.value && isValid.value && !isProcessing.value
  )

  // Debounced validation function
  const debouncedValidate = debounce((contentValue: string, formatValue: TextInputFormat) => {
    if (!contentValue.trim()) {
      lastValidationResult.value = null
      return
    }

    const result = validateTextInput(contentValue, formatValue)
    lastValidationResult.value = result
  }, 300)

  // Watch for content and format changes
  watch([content, format], ([newContent, newFormat]) => {
    debouncedValidate(newContent, newFormat)
  }, { immediate: true })

  // Functions
  function setContent(newContent: string) {
    content.value = newContent
  }

  function setFormat(newFormat: TextInputFormat) {
    format.value = newFormat
  }

  function clearContent() {
    content.value = ''
    lastValidationResult.value = null
    lastProcessResult.value = null
  }

  async function processContent(): Promise<TextInputResult> {
    if (!canProcess.value) {
      const error = !hasContent.value
        ? 'No content to process'
        : !isValid.value
        ? 'Content is not valid'
        : 'Already processing'

      return {
        success: false,
        error
      }
    }

    isProcessing.value = true

    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100))

      const result = processTextInput(content.value, format.value)
      lastProcessResult.value = result

      return result
    } catch (error) {
      const errorResult: TextInputResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      }
      lastProcessResult.value = errorResult
      return errorResult
    } finally {
      isProcessing.value = false
    }
  }

  function getExampleContent(formatType: TextInputFormat): string {
    switch (formatType) {
      case 'json':
        return `{
  "app.title": "My Application",
  "app.welcome": "Welcome to our app",
  "nav.home": "Home",
  "nav.about": "About",
  "nav.contact": "Contact"
}`
      case 'csv':
        return `Key,English,Spanish,French
app.title,My Application,Mi Aplicación,Mon Application
app.welcome,Welcome to our app,Bienvenido a nuestra aplicación,Bienvenue dans notre application
nav.home,Home,Inicio,Accueil
nav.about,About,Acerca de,À propos
nav.contact,Contact,Contacto,Contact`
      default:
        return ''
    }
  }

  function getFormatDescription(formatType: TextInputFormat): string {
    switch (formatType) {
      case 'json':
        return 'JSON format with key-value pairs for translations'
      case 'csv':
        return 'CSV format with Key column and language columns'
      default:
        return ''
    }
  }

  function getPlaceholderText(formatType: TextInputFormat): string {
    switch (formatType) {
      case 'json':
        return 'Paste your JSON translation data here...\n\nExample:\n{\n  "app.title": "My App",\n  "nav.home": "Home"\n}'
      case 'csv':
        return 'Paste your CSV translation data here...\n\nExample:\nKey,English,Spanish\napp.title,My App,Mi App\nnav.home,Home,Inicio'
      default:
        return 'Paste your translation data here...'
    }
  }

  // Return reactive state and functions
  return {
    // State - return the actual refs for two-way binding
    content,
    format,
    isProcessing: computed(() => isProcessing.value),
    lastValidationResult: computed(() => lastValidationResult.value),
    lastProcessResult: computed(() => lastProcessResult.value),

    // Computed
    hasContent,
    isValid,
    validationErrors,
    validationWarnings,
    canProcess,

    // Functions
    setContent,
    setFormat,
    clearContent,
    processContent,
    getExampleContent,
    getFormatDescription,
    getPlaceholderText
  }
}
