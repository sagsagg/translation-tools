<template>
  <div class="space-y-4">
    <!-- Compact Language Summary -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">
        Selected Languages ({{ selectedLanguages.length }})
      </label>

      <div class="flex flex-wrap gap-2 mt-2">
        <div
          v-for="language in selectedLanguages"
          :key="language.code"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground"
          :class="{
            'bg-primary text-primary-foreground': language.code === primaryLanguage.code
          }"
        >
          <span>{{ language.name }}</span>
          <span v-if="language.code === primaryLanguage.code" class="ml-1 text-xs">(Primary)</span>
        </div>
      </div>

      <p class="text-xs text-muted-foreground">
        Primary: {{ primaryLanguage.name }} • {{ selectedLanguages.length - 1 }} additional language{{ selectedLanguages.length !== 2 ? 's' : '' }}
      </p>
    </div>

    <!-- Multi-language Options Summary -->
    <div v-if="selectedLanguages.length > 1 && options" class="space-y-2 p-3 bg-muted rounded-lg">
      <h4 class="text-sm font-medium text-foreground">
        Export Options
      </h4>
      <div class="text-xs text-muted-foreground space-y-1">
        <div v-if="options.generateSeparateFiles">✓ Separate files per language</div>
        <div v-if="options.includeEmptyValues">✓ Include empty values</div>
        <div v-if="options.addLanguagePrefix">✓ Add language prefix to filenames</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Language } from '@/types'

interface Props {
  selectedLanguages: Language[]
  primaryLanguage: Language
  options?: {
    generateSeparateFiles: boolean
    includeEmptyValues: boolean
    addLanguagePrefix: boolean
  }
}

defineProps<Props>()
</script>
