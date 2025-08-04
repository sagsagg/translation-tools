# Skeleton Loading Components

This directory contains skeleton loading components that provide visual feedback during async component loading, improving perceived performance and user experience.

## Components

### FileUploaderSkeleton.vue
A skeleton component that mimics the structure and layout of the FileUploader component.

**Features:**
- Matches FileUploader dimensions and layout
- Includes skeleton for upload area, format badges, info text, and buttons
- File naming guidelines section skeleton
- Shimmer and pulse animations
- Accessibility attributes (role="status", aria-label)

**Usage:**
```vue
<template>
  <FileUploaderSkeleton />
</template>

<script setup>
import FileUploaderSkeleton from '@/components/skeleton/FileUploaderSkeleton.vue'
</script>
```

### TextInputSkeleton.vue
A skeleton component that mimics the structure and layout of the TextInput component.

**Features:**
- Format selection radio buttons skeleton
- Large textarea skeleton with simulated text lines
- Validation feedback skeleton
- Process button skeleton
- Enhanced shimmer effect for textarea
- Responsive design with mobile adjustments

**Usage:**
```vue
<template>
  <TextInputSkeleton />
</template>

<script setup>
import TextInputSkeleton from '@/components/skeleton/TextInputSkeleton.vue'
</script>
```

### SkeletonDemo.vue
A demonstration component that showcases both skeleton components with interactive controls.

**Features:**
- Toggle visibility for each skeleton
- Side-by-side comparison view
- Feature documentation
- Responsive grid layout

## Integration with Async Components

The skeleton components are integrated with the async component loading system in `App.vue`:

```typescript
// FileUploader with skeleton
const FileUploader = createAsyncComponent(
  () => import('@/components/FileUploader.vue'),
  {
    ...asyncComponentConfigs.sheet,
    name: 'FileUploader',
    loadingComponent: () => import('@/components/skeleton/FileUploaderSkeleton.vue')
  }
)

// TextInput with skeleton
const TextInput = createAsyncComponent(
  () => import('@/components/TextInput.vue'),
  {
    ...asyncComponentConfigs.sheet,
    name: 'TextInput',
    loadingComponent: () => import('@/components/skeleton/TextInputSkeleton.vue')
  }
)
```

## Design System

### Color Scheme
- Uses Slate color palette for consistency with the application
- Supports both light and dark modes
- Colors: slate-200, slate-700, slate-300, slate-600, etc.

### Animations
- **Pulse Animation**: 2s cubic-bezier timing for smooth loading effect
- **Shimmer Animation**: 1.5s linear animation for enhanced visual feedback
- **Responsive Timing**: Optimized for perceived performance

### Accessibility
- `role="status"` for screen readers
- `aria-label` with descriptive loading text
- `.sr-only` text for additional context
- Proper semantic structure

## Technical Specifications

### Vue 3 Composition API
- No props required (pure presentation components)
- TypeScript support with proper type definitions
- Scoped styles with Tailwind CSS

### Responsive Design
- Mobile-friendly layouts
- Flexible grid systems
- Responsive spacing and sizing

### Performance
- Lightweight components with minimal overhead
- CSS-only animations (no JavaScript)
- Optimized for fast rendering

## Testing

Comprehensive test coverage includes:
- Accessibility attribute verification
- Skeleton structure validation
- Color scheme compliance
- Animation presence
- Dark mode support
- Responsive behavior

Run skeleton tests:
```bash
npm run test:unit src/__tests__/skeleton-components.test.ts
```

## File Structure

```
src/components/skeleton/
├── FileUploaderSkeleton.vue    # FileUploader loading skeleton
├── TextInputSkeleton.vue       # TextInput loading skeleton
├── SkeletonDemo.vue            # Interactive demonstration
├── index.ts                    # Component exports
└── README.md                   # This documentation
```

## Best Practices

1. **Match Original Layout**: Skeletons should closely match the dimensions and structure of the actual components
2. **Consistent Styling**: Use the same color scheme and design patterns as the main application
3. **Accessibility First**: Always include proper ARIA attributes and screen reader support
4. **Performance Optimized**: Keep animations lightweight and CSS-based
5. **Responsive Design**: Ensure skeletons work well on all screen sizes

## Future Enhancements

- Additional skeleton components for other async-loaded components
- Configurable animation speeds and styles
- Advanced shimmer effects with gradient animations
- Skeleton component generator utility
