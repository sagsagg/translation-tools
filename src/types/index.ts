// Core translation data structures
export interface TranslationEntry {
  key: string
  value: string
  language: string
}

export type TranslationData = Record<string, string>;

export type MultiLanguageTranslationData = Record<string, TranslationData>;

// CSV data structure
export interface CSVRow {
  Key: string
  [language: string]: string
}

export interface CSVData {
  headers: string[]
  rows: CSVRow[]
}

// File formats
export type FileFormat = 'json' | 'csv'

// Discriminated union for better type safety
export type FileUploadResult =
  | {
      success: true
      format: 'json'
      data: TranslationData
      filename?: string
      languageCode?: string
      fallbackApplied?: boolean
      warningMessage?: string
    }
  | {
      success: true
      format: 'csv'
      data: CSVData
      filename?: string
    }
  | {
      success: false
      error: string
      format?: FileFormat
      filename?: string
    }

// Multiple JSON upload result
export interface MultipleJSONUploadResult {
  success: boolean
  files: FileUploadResult[]
  validFiles: number
  invalidFiles: number
  errors: string[]
}

// File management types
export interface UploadedFile {
  id: string
  name: string
  format: FileFormat
  languageCode?: string
  uploadedAt: Date
  size: number
  data: TranslationData | CSVData
}

export interface FileRemovalResult {
  success: boolean
  removedFileId: string
  error?: string
}

// Edit and delete functionality types
export interface EditTranslationData {
  originalKey: string
  originalValue: string
  newKey: string
  newValue: string
  language?: string
}

export interface DeleteTranslationData {
  key: string
  value: string
  language?: string
}

export interface EditTranslationResult {
  success: boolean
  data?: EditTranslationData
  error?: string
}

export interface DeleteTranslationResult {
  success: boolean
  data?: DeleteTranslationData
  error?: string
}

// Language configuration
export interface Language {
  code: string
  name: string
  nativeName: string
}

export interface LanguageSelection {
  selected: Language[]
  primary: Language
}

// Search functionality
export interface SearchResult {
  key: string
  value: string
  language: string
  score: number
}

export interface SearchOptions {
  threshold?: number
  includeScore?: boolean
  keys?: string[]
  limit?: number
}

// Application state
export interface AppState {
  currentData: MultiLanguageTranslationData
  selectedLanguages: Language[]
  primaryLanguage: Language
  currentView: 'json' | 'csv'
  isDarkMode: boolean
  searchQuery: string
  searchResults: SearchResult[]
}

// Conversion options
export interface ConversionOptions {
  sourceFormat: FileFormat
  targetFormat: FileFormat
  languages: Language[]
  includeEmptyValues: boolean
}

// Validation results
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: 'syntax' | 'structure' | 'duplicate' | 'missing'
  message: string
  line?: number
  column?: number
  key?: string
}

export interface ValidationWarning {
  type: 'empty_value' | 'inconsistent_keys' | 'encoding'
  message: string
  key?: string
}

// File operations
export interface ExportOptions {
  format: FileFormat
  languages: Language[]
  filename?: string
  includeMetadata: boolean
}

export interface ImportOptions {
  format: FileFormat
  targetLanguage?: Language
  overwriteExisting: boolean
  validateStructure: boolean
}

// Theme configuration (now handled by @vueuse/core)
export type ThemeMode = 'light' | 'dark' | 'auto'

// Language configuration options
export interface LanguageOptions {
  generateSeparateFiles: boolean
  includeEmptyValues: boolean
  addLanguagePrefix: boolean
}

// Error details type for better type safety
export interface ErrorDetails {
  code?: string
  line?: number
  column?: number
  key?: string
  value?: string
  context?: string
  [key: string]: unknown
}

// Component props interfaces
export interface FileUploaderProps {
  acceptedFormats: FileFormat[]
  maxFileSize: number
  multiple: boolean
  onUpload: (result: FileUploadResult) => void
}

export interface DataTableProps {
  data: CSVData
  searchQuery: string
  sortable: boolean
  onSort: (column: string, direction: 'asc' | 'desc') => void
}

export interface JsonViewerProps {
  data: TranslationData
  searchQuery: string
  editable: boolean
  onEdit: (key: string, value: string) => void
}

export interface LanguageSelectorProps {
  availableLanguages: Language[]
  selectedLanguages: Language[]
  primaryLanguage: Language
  onSelectionChange: (selection: LanguageSelection) => void
}

// Utility types
export type SortDirection = 'asc' | 'desc'
export type ViewMode = 'table' | 'json' | 'split' | 'dual' | 'csv-table'

// Error types
export class TranslationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: ErrorDetails
  ) {
    super(message)
    this.name = 'TranslationError'
  }
}

export class ValidationException extends TranslationError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationException'
  }
}

export class ConversionError extends TranslationError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'CONVERSION_ERROR', details)
    this.name = 'ConversionError'
  }
}

export class FileError extends TranslationError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'FILE_ERROR', details)
    this.name = 'FileError'
  }
}
