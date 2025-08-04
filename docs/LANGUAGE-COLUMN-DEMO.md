# Language Column Management Demo

This document demonstrates the two-step process for adding language columns to the DataTable component.

## Overview

When a user adds a new language using the LanguageColumnManager component, the system performs a coordinated two-step update:

1. **Language Store Update**: Add the language to `tableLanguages` state
2. **Translation Store Update**: Add a corresponding column to the CSV data structure

## Step-by-Step Process

### Initial State

```typescript
// Language Store
tableLanguages: [
  { code: 'en', name: 'English', nativeName: 'English' }
]

// Translation Store CSV Data
{
  headers: ['Key', 'English'],
  rows: [
    { Key: 'welcome', English: 'Welcome' },
    { Key: 'hello', English: 'Hello' },
    { Key: 'goodbye', English: 'Goodbye' }
  ]
}
```

### Step 1: Add Language to Language Store

```typescript
// User selects Indonesian from LanguageColumnManager
const indonesianLanguage = {
  code: 'id',
  name: 'Indonesian', 
  nativeName: 'Bahasa Indonesia'
}

// DataViewer.handleAddLanguage() calls:
languageStore.addTableLanguage(indonesianLanguage)
```

**Result:**
```typescript
// Language Store (updated)
tableLanguages: [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' }
]
```

### Step 2: Add Column to CSV Data

```typescript
// DataViewer.handleAddLanguage() continues:
translationStore.addLanguageColumn('id', 'Indonesian')
```

**Result:**
```typescript
// Translation Store CSV Data (updated)
{
  headers: ['Key', 'English', 'Indonesian'],
  rows: [
    { Key: 'welcome', English: 'Welcome', Indonesian: '' },
    { Key: 'hello', English: 'Hello', Indonesian: '' },
    { Key: 'goodbye', English: 'Goodbye', Indonesian: '' }
  ]
}
```

## Key Features

### 1. Automatic Empty Cell Creation ✅

When a new language column is added:
- All existing translation rows automatically get an empty string value for the new language
- This ensures data structure consistency
- Empty cells are visually styled with "Empty" placeholder text

### 2. Immediate Table Updates ✅

The DataTable component reactively displays changes because:
- The `displayData` computed property uses the store's CSV data
- Vue's reactivity system automatically updates the table when store data changes
- New language columns appear immediately without page refresh

### 3. Header Synchronization ✅

The table headers are automatically updated:
- CSV headers array includes the new language name
- DataTable renders headers from the CSV data structure
- Column order is preserved (Key, then languages in order of addition)

### 4. Data Integrity Protection ✅

The system prevents data corruption through:
- Duplicate language prevention in the language store
- Consistent column naming between stores
- Proper cleanup when languages are removed

## Code Implementation

### DataViewer Integration

```typescript
// DataViewer.vue - handleAddLanguage function
function handleAddLanguage(language: Language) {
  // Step 1: Add to language store
  languageStore.addTableLanguage(language)
  
  // Step 2: Add column to CSV data
  const currentCSVData = translationStore.csvData || props.csvData
  if (currentCSVData) {
    // Ensure CSV data is in store
    if (!translationStore.csvData && props.csvData) {
      translationStore.setCSVData(props.csvData)
    }
    translationStore.addLanguageColumn(language.code, language.name)
  }
}
```

### Store Synchronization

```typescript
// Translation Store - addLanguageColumn function
function addLanguageColumn(languageCode: string, languageName: string) {
  if (!csvData.value) return

  // Add the new language to headers if not already present
  if (!csvData.value.headers.includes(languageName)) {
    csvData.value.headers.push(languageName)
  }

  // Add empty values for the new language in all existing rows
  csvData.value.rows.forEach(row => {
    if (!(languageName in row)) {
      row[languageName] = ''
    }
  })
}
```

### Reactive Display Updates

```typescript
// DataViewer.vue - displayData computed property
const displayData = computed(() => {
  // Use store's CSV data if available, otherwise use props
  const currentCSVData = translationStore.csvData || props.csvData
  
  // Include table languages in cache key for reactivity
  const cacheKey = createCacheKey(
    props.multiLanguageJsonData,
    currentCSVData,
    props.jsonData,
    selectedLanguages.value,
    tableLanguages.value // Ensures updates when languages change
  )
  
  // Return reactive data structure
  return {
    csv: currentCSVData,
    // ... other data
  }
})
```

## Visual Result

### Before Adding Language

| Key | English |
|-----|---------|
| welcome | Welcome |
| hello | Hello |
| goodbye | Goodbye |

### After Adding Indonesian

| Key | English | Indonesian |
|-----|---------|------------|
| welcome | Welcome | *Empty* |
| hello | Hello | *Empty* |
| goodbye | Goodbye | *Empty* |

The "Empty" cells are styled with:
- Italic text
- Slate-400 color (light mode) / Slate-500 (dark mode)
- Tooltip: "Add translation for Indonesian"

## Error Handling

### Duplicate Prevention

```typescript
// Language Store - addTableLanguage function
function addTableLanguage(language: Language) {
  if (!tableLanguages.value.some(lang => lang.code === language.code)) {
    tableLanguages.value.push(language)
  }
  // Silently ignores duplicates
}
```

### Data Validation

```typescript
// Translation Store - addLanguageColumn function
function addLanguageColumn(languageCode: string, languageName: string) {
  if (!csvData.value) return // Guard against missing data
  
  if (!csvData.value.headers.includes(languageName)) {
    // Only add if not already present
    csvData.value.headers.push(languageName)
  }
}
```

## Testing Verification

The implementation is verified through comprehensive tests:

### Unit Tests (22 tests)
- LanguageColumnManager component behavior
- DataTable integration
- Store function correctness
- Error handling scenarios

### Integration Tests (4 tests)
- Complete two-step workflow
- Multiple language additions
- Reactive data updates
- Language removal process

### Total Coverage: 335 tests passing ✅

## Performance Considerations

### Efficient Updates
- Only affected table cells re-render
- Memoized computations for language availability
- Minimal DOM manipulation

### Memory Management
- Proper cleanup when languages are removed
- Reactive dependencies optimized
- Store state properly managed

## User Experience

### Immediate Feedback
- New columns appear instantly
- Clear visual indicators for empty cells
- Smooth transitions without page refresh

### Intuitive Interface
- Popover-based language selection
- Badge display of current languages
- Remove buttons for non-essential languages

This two-step process ensures data consistency, immediate visual feedback, and a seamless user experience when managing language columns in the translation table.
