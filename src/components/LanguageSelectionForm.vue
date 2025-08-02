<template>
  <div class="space-y-8 p-4">
    <!-- Language Selection Header -->
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-foreground">
          Language Selection
        </h3>
        <p class="text-sm text-muted-foreground">
          Choose languages for your translation project
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          @click="selectAll"
        >
          Select All
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="clearAll"
        >
          Clear All
        </Button>
      </div>
    </div>

    <!-- Primary Language Selection -->
    <div class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium text-foreground">
          Primary Language *
        </label>
        <p class="text-xs text-muted-foreground">
          The primary language will be used as the default for conversions
        </p>
      </div>
      <Select v-model="primaryLanguageCode">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Select primary language..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="language in availableLanguages"
            :key="language.code"
            :value="language.code"
          >
            {{ language.name }} ({{ language.nativeName }})
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Additional Languages Selection -->
    <div class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium text-foreground">
          Additional Languages
        </label>
        <p class="text-xs text-muted-foreground">
          Select additional languages for your translation project. The primary language is automatically included.
        </p>
      </div>

      <MultiSelect
        :items="availableAdditionalLanguages"
        :selected-items="additionalSelectedLanguages"
        placeholder="Select additional languages..."
        search-placeholder="Search languages..."
        empty-message="No languages found."
        :max-display-items="2"
        :get-item-value="(lang) => lang?.code"
        :get-item-label="(lang) => lang?.name"
        :get-item-description="(lang) => lang.nativeName"
        @update:selected-items="updateAdditionalLanguages"
        @item-select="onLanguageSelect"
        @item-remove="onLanguageRemove"
      />
    </div>

    <!-- Selected Languages Summary -->
    <div v-if="computedSelectedLanguages.length > 0" class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium text-foreground">
          Selected Languages ({{ computedSelectedLanguages.length }})
        </label>
        <p class="text-xs text-muted-foreground">
          Review and manage your selected languages
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <div
          v-for="language in computedSelectedLanguages"
          :key="language.code"
          class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground"
          :class="{
            'bg-primary text-primary-foreground': language.code === primaryLanguageCode
          }"
        >
          <span>{{ language.name }}</span>
          <span v-if="language.code === primaryLanguageCode" class="ml-1 text-xs">(Primary)</span>
          <button
            v-if="language.code !== primaryLanguageCode"
            class="ml-2 text-muted-foreground hover:text-foreground transition-colors"
            @click="removeLanguage(language.code)"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Conversion Options -->
    <div v-if="computedSelectedLanguages.length > 1" class="space-y-4 p-5 bg-muted/50 rounded-lg border">
      <div class="space-y-1">
        <h4 class="text-sm font-medium text-foreground">
          Export Options
        </h4>
        <p class="text-xs text-muted-foreground">
          Configure how your multi-language files will be exported
        </p>
      </div>

      <div class="space-y-3">
        <div class="flex items-start space-x-3">
          <Checkbox
            id="generateSeparateFiles"
            v-model:checked="options.generateSeparateFiles"
            class="mt-0.5"
          />
          <div class="space-y-1">
            <label
              for="generateSeparateFiles"
              class="text-sm font-medium text-foreground cursor-pointer leading-none"
            >
              Generate separate JSON files for each language
            </label>
            <p class="text-xs text-muted-foreground">
              Creates individual files for each language instead of one combined file
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-3">
          <Checkbox
            id="includeEmptyValues"
            v-model:checked="options.includeEmptyValues"
            class="mt-0.5"
          />
          <div class="space-y-1">
            <label
              for="includeEmptyValues"
              class="text-sm font-medium text-foreground cursor-pointer leading-none"
            >
              Include empty translation values
            </label>
            <p class="text-xs text-muted-foreground">
              Keeps keys with empty or missing translations in the output
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-3">
          <Checkbox
            id="addLanguagePrefix"
            v-model:checked="options.addLanguagePrefix"
            class="mt-0.5"
          />
          <div class="space-y-1">
            <label
              for="addLanguagePrefix"
              class="text-sm font-medium text-foreground cursor-pointer leading-none"
            >
              Add language code prefix to filenames
            </label>
            <p class="text-xs text-muted-foreground">
              Prefixes filenames with language codes (e.g., en_translations.json)
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Validation Messages -->
    <div v-if="validationErrors.length > 0" class="space-y-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div class="flex items-center space-x-2">
        <svg class="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h5 class="text-sm font-medium text-destructive">Validation Errors</h5>
      </div>
      <div class="space-y-1">
        <div
          v-for="error in validationErrors"
          :key="error"
          class="text-sm text-destructive"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Language, LanguageSelection } from '@/types'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/constants/languages'

interface Props {
  selectedLanguages?: Language[]
  primaryLanguage?: Language
  maxLanguages?: number
}

interface MultiLanguageOptions {
  generateSeparateFiles: boolean
  includeEmptyValues: boolean
  addLanguagePrefix: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedLanguages: () => [DEFAULT_LANGUAGE],
  primaryLanguage: () => DEFAULT_LANGUAGE,
  maxLanguages: 10
})

const emit = defineEmits<{
  'selection-change': [selection: LanguageSelection]
  'options-change': [options: MultiLanguageOptions]
}>()

const primaryLanguageCode = ref(props.primaryLanguage.code)
const selectedLanguageCodes = ref<string[]>(
  props.selectedLanguages.map(lang => lang?.code)
)

const options = ref<MultiLanguageOptions>({
  generateSeparateFiles: true,
  includeEmptyValues: true,
  addLanguagePrefix: true
})

const availableLanguages = computed(() => SUPPORTED_LANGUAGES)

// Languages available for additional selection (excluding primary language)
const availableAdditionalLanguages = computed(() => {
  return availableLanguages.value.filter(lang => lang?.code !== primaryLanguageCode.value)
})

// Additional selected languages (excluding primary language)
const additionalSelectedLanguages = computed(() => {
  return computedSelectedLanguages.value.filter(lang => lang?.code !== primaryLanguageCode.value)
})

const computedSelectedLanguages = computed(() => {
  return selectedLanguageCodes.value
    .map(code => availableLanguages.value.find(lang => lang?.code === code))
    .filter((lang): lang is Language => lang !== undefined)
})

const computedPrimaryLanguage = computed(() => {
  return availableLanguages.value.find(lang => lang?.code === primaryLanguageCode.value) || DEFAULT_LANGUAGE
})

const validationErrors = computed(() => {
  const errors: string[] = []

  if (!primaryLanguageCode.value) {
    errors.push('Please select a primary language')
  }

  if (computedSelectedLanguages.value.length === 0) {
    errors.push('At least one language must be selected')
  }

  if (computedSelectedLanguages.value.length > props.maxLanguages) {
    errors.push(`Maximum ${props.maxLanguages} languages allowed`)
  }

  return errors
})

function updateAdditionalLanguages(languages: Language[]) {
  // Combine primary language with additional languages
  const primaryLang = computedPrimaryLanguage.value
  const allLanguageCodes = [primaryLang.code, ...languages.map(lang => lang?.code)]

  // Remove duplicates and ensure we don't exceed max languages
  const uniqueCodes = Array.from(new Set(allLanguageCodes)).slice(0, props.maxLanguages)
  selectedLanguageCodes.value = uniqueCodes

  emitSelectionChange()
}

function onLanguageSelect() {
  // This is called when a language is selected in the multi-select
  // The updateAdditionalLanguages function handles the actual update
}

function onLanguageRemove() {
  // This is called when a language is removed in the multi-select
  // The updateAdditionalLanguages function handles the actual update
}

function removeLanguage(languageCode: string) {
  const index = selectedLanguageCodes.value.indexOf(languageCode)
  if (index > -1) {
    selectedLanguageCodes.value.splice(index, 1)
    emitSelectionChange()
  }
}



function selectAll() {
  // Select all available languages up to the maximum limit
  const allLanguages = availableLanguages.value.slice(0, props.maxLanguages)
  selectedLanguageCodes.value = allLanguages.map(lang => lang?.code)

  // Ensure primary language is first if it's selected
  if (primaryLanguageCode.value && !selectedLanguageCodes.value.includes(primaryLanguageCode.value)) {
    selectedLanguageCodes.value.unshift(primaryLanguageCode.value)
    selectedLanguageCodes.value = selectedLanguageCodes.value.slice(0, props.maxLanguages)
  }

  emitSelectionChange()
}

function clearAll() {
  // Keep only the primary language
  selectedLanguageCodes.value = primaryLanguageCode.value ? [primaryLanguageCode.value] : []
  emitSelectionChange()
}

function emitSelectionChange() {
  const selection: LanguageSelection = {
    selected: computedSelectedLanguages.value,
    primary: computedPrimaryLanguage.value
  }

  emit('selection-change', selection)
}

// Watch for options changes
watch(options, (newOptions) => {
  emit('options-change', newOptions)
}, { deep: true })

// Ensure primary language is always selected
watch(primaryLanguageCode, (newCode) => {
  if (newCode && !selectedLanguageCodes.value.includes(newCode)) {
    selectedLanguageCodes.value.unshift(newCode)
    emitSelectionChange()
  }
})

// Initialize with primary language selected
if (primaryLanguageCode.value && !selectedLanguageCodes.value.includes(primaryLanguageCode.value)) {
  selectedLanguageCodes.value.unshift(primaryLanguageCode.value)
}
</script>
