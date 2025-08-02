<template>
  <div class="flex items-center space-x-2">
    <label class="text-sm font-medium">Languages:</label>
    <div class="relative">
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            role="combobox"
            :aria-expanded="open"
            class="w-64 justify-between"
          >
            <div class="flex flex-wrap gap-1 flex-1 overflow-hidden">
              <div
                v-if="selectedLanguages.length === 0 || isAllSelected"
                class="text-muted-foreground truncate"
              >
                All Languages
              </div>
              <Badge
                v-for="language in displayedLanguages"
                :key="language"
                variant="secondary"
                class="text-xs"
              >
                {{ language }}
                <button
                  class="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  @click.stop="removeLanguage(language)"
                >
                  <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </Badge>
              <Badge
                v-if="selectedLanguages.length > maxDisplayItems && !isAllSelected"
                variant="secondary"
                class="text-xs"
              >
                +{{ selectedLanguages.length - maxDisplayItems }} more
              </Badge>
            </div>
            <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-64 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search languages..."
              class="h-9"
            />
            <CommandList>
              <CommandEmpty>No languages found.</CommandEmpty>
              <CommandGroup>
                <!-- All Languages Option -->
                <CommandItem
                  value="__all__"
                  @select="toggleAllLanguages"
                  class="cursor-pointer"
                >
                  <Check
                    :class="cn(
                      'mr-2 h-4 w-4',
                      isAllSelected ? 'opacity-100' : 'opacity-0'
                    )"
                  />
                  All Languages
                </CommandItem>
                <CommandSeparator />
                <!-- Individual Language Options -->
                <CommandItem
                  v-for="language in availableLanguages"
                  :key="language"
                  :value="language"
                  @select="toggleLanguage(language)"
                  class="cursor-pointer"
                >
                  <Check
                    :class="cn(
                      'mr-2 h-4 w-4',
                      selectedLanguages.includes(language) ? 'opacity-100' : 'opacity-0'
                    )"
                  />
                  {{ language }}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  availableLanguages: string[]
  selectedLanguages: string[]
  maxDisplayItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplayItems: 2
})

const emit = defineEmits<{
  'update:selectedLanguages': [languages: string[]]
  'selection-change': [languages: string[]]
}>()

const open = ref(false)

const isAllSelected = computed(() => {
  return props.selectedLanguages.length === 0 || 
         props.selectedLanguages.length === props.availableLanguages.length
})

const displayedLanguages = computed(() => {
  if (isAllSelected.value) {
    return []
  }
  return props.selectedLanguages.slice(0, props.maxDisplayItems)
})

function toggleLanguage(language: string) {
  const newSelection = [...props.selectedLanguages]
  const index = newSelection.indexOf(language)
  
  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(language)
  }
  
  emit('update:selectedLanguages', newSelection)
  emit('selection-change', newSelection)
}

function removeLanguage(language: string) {
  const newSelection = props.selectedLanguages.filter(lang => lang !== language)
  emit('update:selectedLanguages', newSelection)
  emit('selection-change', newSelection)
}

function toggleAllLanguages() {
  if (isAllSelected.value) {
    // If all are selected, clear selection
    emit('update:selectedLanguages', [])
    emit('selection-change', [])
  } else {
    // Select all languages
    emit('update:selectedLanguages', [...props.availableLanguages])
    emit('selection-change', [...props.availableLanguages])
  }
  open.value = false
}
</script>
