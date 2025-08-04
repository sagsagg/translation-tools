<template>
  <div class="flex items-center space-x-2">
    <!-- Add Language Button -->
    <Popover v-model:open="isPopoverOpen">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          size="sm"
          class="flex items-center space-x-2"
          :disabled="availableLanguagesForAddition.length === 0"
        >
          <Plus class="w-4 h-4" />
          <span>Add Language</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-80 p-0" align="start">
        <div class="p-4">
          <div class="space-y-3">
            <div>
              <h4 class="font-medium text-sm text-slate-900 dark:text-slate-100">
                Add Language Column
              </h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Select a language to add as a new column to the table
              </p>
            </div>
            
            <!-- Language Selection -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300">
                Available Languages
              </label>
              <div class="space-y-1">
                <button
                  v-for="language in availableLanguagesForAddition"
                  :key="language.code"
                  @click="handleAddLanguage(language)"
                  class="w-full flex items-center justify-between p-2 text-left rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {{ language.name }}
                    </span>
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                      {{ language.nativeName }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">
                    {{ language.code }}
                  </div>
                </button>
              </div>
              
              <!-- No available languages message -->
              <div
                v-if="availableLanguagesForAddition.length === 0"
                class="text-center py-4 text-sm text-slate-500 dark:text-slate-400"
              >
                All supported languages are already added
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <!-- Current Languages Display -->
    <div v-if="currentLanguageColumns.length > 1" class="flex items-center space-x-1">
      <span class="text-xs text-slate-600 dark:text-slate-400">Languages:</span>
      <div class="flex items-center space-x-1">
        <Badge
          v-for="language in currentLanguageColumns"
          :key="language.code"
          variant="secondary"
          class="text-xs flex items-center space-x-1"
        >
          <span>{{ language.name }}</span>
          <button
            v-if="language.code !== 'en' && currentLanguageColumns.length > 1"
            @click="handleRemoveLanguage(language)"
            class="ml-1 hover:text-red-500 transition-colors"
            :title="`Remove ${language.name}`"
          >
            <X class="w-3 h-3" />
          </button>
        </Badge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, X } from 'lucide-vue-next'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import type { Language } from '@/types'

interface Props {
  currentLanguages: Language[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-language': [language: Language]
  'remove-language': [language: Language]
}>()

const isPopoverOpen = ref(false)

// Computed properties
const currentLanguageColumns = computed(() => props.currentLanguages)

const availableLanguagesForAddition = computed(() => {
  const currentCodes = props.currentLanguages.map(lang => lang.code)
  return SUPPORTED_LANGUAGES.filter(lang => !currentCodes.includes(lang.code))
})

// Event handlers
function handleAddLanguage(language: Language) {
  emit('add-language', language)
  isPopoverOpen.value = false
}

function handleRemoveLanguage(language: Language) {
  // Prevent removing English (primary language) or if it's the only language
  if (language.code === 'en' || props.currentLanguages.length <= 1) {
    return
  }
  emit('remove-language', language)
}
</script>

<style scoped>
/* Additional styles for better visual feedback */
.language-button {
  transition: all 0.2s ease-in-out;
}

.language-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark .language-button:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
