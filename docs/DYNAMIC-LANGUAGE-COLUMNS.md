# Dynamic Language Column Management

This document describes the dynamic language column addition feature that allows users to add and remove supported languages as columns in the DataTable component.

## Overview

The dynamic language column management feature enables users to:
- Add any of the supported languages (English, Indonesian, Chinese Simplified, Chinese Traditional) as new columns
- Remove language columns (except English and when it's the only language)
- View empty cells with clear visual indicators for missing translations
- Maintain data consistency across component re-renders

## Architecture

### Components

#### LanguageColumnManager.vue
A dedicated component that provides the UI for managing language columns.

**Features:**
- Popover-based language selection interface
- Display of current active languages with badges
- Remove buttons for non-essential languages
- Prevents removal of English or the last remaining language

**Props:**
```typescript
interface Props {
  currentLanguages: Language[]
}
```

**Events:**
```typescript
interface Events {
  'add-language': [language: Language]
  'remove-language': [language: Language]
}
```

#### Enhanced DataTable.vue
The DataTable component has been enhanced to support language column management.

**New Props:**
```typescript
interface Props {
  // ... existing props
  allowLanguageManagement?: boolean
  currentLanguages?: Language[]
}
```

**New Events:**
```typescript
interface Events {
  // ... existing events
  'add-language': [language: Language]
  'remove-language': [language: Language]
}
```

### Store Integration

#### Translation Store Enhancements
New functions added to manage CSV data structure:

```typescript
// Add a new language column to CSV data
function addLanguageColumn(languageCode: string, languageName: string)

// Remove a language column from CSV data
function removeLanguageColumn(languageName: string)
```

#### Language Store Enhancements
New state and functions for table language management:

```typescript
// State
const tableLanguages = ref<Language[]>([DEFAULT_LANGUAGE])

// Actions
function addTableLanguage(language: Language)
function removeTableLanguage(language: Language): boolean
function setTableLanguages(languages: Language[])
```

## Usage

### Basic Implementation

```vue
<template>
  <DataTable
    :data="csvData"
    :allow-language-management="true"
    :current-languages="tableLanguages"
    @add-language="handleAddLanguage"
    @remove-language="handleRemoveLanguage"
  />
</template>

<script setup lang="ts">
import { useTranslationStore, useLanguageStore, storeToRefs } from '@/stores'

const translationStore = useTranslationStore()
const languageStore = useLanguageStore()
const { tableLanguages } = storeToRefs(languageStore)

function handleAddLanguage(language: Language) {
  languageStore.addTableLanguage(language)
  translationStore.addLanguageColumn(language.code, language.name)
}

function handleRemoveLanguage(language: Language) {
  const removed = languageStore.removeTableLanguage(language)
  if (removed) {
    translationStore.removeLanguageColumn(language.name)
  }
}
</script>
```

### DataViewer Integration

The DataViewer component automatically integrates language column management:

```vue
<!-- Language management is automatically enabled for table views -->
<DataViewer
  :csv-data="csvData"
  :editable="true"
/>
```

## User Interface

### Language Selection Interface

1. **Add Language Button**: Opens a popover with available languages
2. **Language List**: Shows all supported languages not currently active
3. **Language Information**: Displays name, native name, and language code
4. **Current Languages**: Shows active languages as badges with remove buttons

### Visual Indicators

#### Empty Cells
- **Text**: "Empty" in italic, smaller font
- **Color**: Slate-400 (light mode) / Slate-500 (dark mode)
- **Tooltip**: "Add translation for {language}"

#### Language Badges
- **Active Languages**: Displayed as secondary badges
- **Remove Buttons**: X icon for removable languages
- **Protection**: English cannot be removed, last language cannot be removed

## Data Management

### CSV Data Structure

When a language is added:
```typescript
// Before
{
  headers: ['Key', 'English'],
  rows: [
    { Key: 'hello', English: 'Hello' }
  ]
}

// After adding Indonesian
{
  headers: ['Key', 'English', 'Indonesian'],
  rows: [
    { Key: 'hello', English: 'Hello', Indonesian: '' }
  ]
}
```

### Automatic Language Detection

When CSV data is loaded, the system automatically detects and maps language columns:

```typescript
// Maps CSV headers to Language objects
const languages = csvData.headers
  .map(header => SUPPORTED_LANGUAGES.find(lang => 
    lang.name.toLowerCase() === header.toLowerCase() ||
    lang.code.toLowerCase() === header.toLowerCase()
  ))
  .filter(lang => lang !== undefined)
```

## Supported Languages

The feature supports the following languages:

| Code | Name | Native Name |
|------|------|-------------|
| en | English | English |
| id | Indonesian | Bahasa Indonesia |
| zh-CN | Chinese Simplified | 简体中文 |
| zh-TW | Chinese Traditional | 繁體中文 |

## Business Rules

### Language Addition
- ✅ Any supported language can be added
- ✅ Duplicate languages are prevented
- ✅ Empty cells are created for existing translation keys
- ✅ New columns appear immediately in the table

### Language Removal
- ❌ English cannot be removed (primary language)
- ❌ Cannot remove the last remaining language
- ✅ Other languages can be removed freely
- ✅ All data for the language is permanently deleted

### Data Persistence
- ✅ Language changes persist across component re-renders
- ✅ Store state is maintained during navigation
- ✅ CSV export includes all active language columns

## Responsive Design

### Mobile Considerations
- Language management controls stack vertically on small screens
- Popover adjusts position to stay within viewport
- Touch-friendly button sizes and spacing
- Horizontal scrolling for wide tables with many languages

### Desktop Experience
- Inline language management controls
- Hover states for interactive elements
- Keyboard navigation support
- Efficient use of horizontal space

## Accessibility

### ARIA Support
- **Popover**: Proper ARIA attributes for screen readers
- **Buttons**: Descriptive labels and titles
- **Empty Cells**: Meaningful tooltips for context

### Keyboard Navigation
- Tab navigation through language controls
- Enter/Space to activate buttons
- Escape to close popover

### Screen Reader Support
- Announces language additions/removals
- Describes empty cell states
- Provides context for language management actions

## Performance Considerations

### Optimization Strategies
- **Reactive Updates**: Only affected table cells re-render
- **Memoized Computations**: Language availability calculations cached
- **Efficient DOM Updates**: Minimal DOM manipulation for column changes

### Memory Management
- **Store Cleanup**: Removed language data is properly garbage collected
- **Component Lifecycle**: Event listeners cleaned up on unmount
- **Reactive Dependencies**: Optimized dependency tracking

## Testing

### Test Coverage
- **19 comprehensive tests** covering all functionality
- **Component Testing**: UI behavior and event handling
- **Store Testing**: Data management and consistency
- **Integration Testing**: End-to-end workflow validation

### Test Categories
1. **LanguageColumnManager Component Tests**
2. **DataTable Integration Tests**
3. **Translation Store Tests**
4. **Language Store Tests**
5. **Integration and Consistency Tests**

## Error Handling

### Validation
- Prevents invalid language operations
- Validates language codes and names
- Ensures data structure integrity

### Graceful Degradation
- Falls back to English if no languages detected
- Handles missing or corrupted language data
- Maintains functionality with partial data

## Future Enhancements

### Potential Improvements
1. **Custom Language Support**: Allow users to add custom languages
2. **Bulk Operations**: Add/remove multiple languages at once
3. **Language Reordering**: Drag-and-drop column reordering
4. **Import/Export**: Language-specific import/export options
5. **Translation Suggestions**: AI-powered translation suggestions for empty cells

### API Extensions
1. **Language Validation**: Enhanced language code validation
2. **Batch Updates**: Optimized batch language operations
3. **Undo/Redo**: Language change history and reversal
4. **Conflict Resolution**: Handle language naming conflicts

This feature significantly enhances the user experience by providing flexible, intuitive language management capabilities while maintaining data integrity and performance.
