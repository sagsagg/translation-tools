<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button variant="outline" size="sm">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        Languages
        <Badge v-if="selectedLanguages.length > 1" variant="secondary" class="ml-2">
          {{ selectedLanguages.length }}
        </Badge>
      </Button>
    </SheetTrigger>

    <SheetContent side="right" class="w-full sm:w-[540px] flex flex-col">
      <SheetHeader class="pb-4">
        <SheetTitle class="text-xl">Language Configuration</SheetTitle>
        <SheetDescription class="text-base">
          Configure languages for your translation project
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="h-72 flex-1 -mx-6 px-6">
        <LanguageSelectionForm
          :selected-languages="selectedLanguages"
          :primary-language="primaryLanguage"
          @selection-change="handleSelectionChange"
          @options-change="handleOptionsChange"
        />
      </ScrollArea>

      <SheetFooter class="pt-6 border-t">
        <div class="flex items-center justify-between w-full">
          <div class="text-sm text-muted-foreground">
            {{ selectedLanguages.length }} language{{ selectedLanguages.length !== 1 ? 's' : '' }} selected
          </div>
          <SheetClose as-child>
            <Button size="sm">Done</Button>
          </SheetClose>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import LanguageSelectionForm from './LanguageSelectionForm.vue'
import type { Language, LanguageSelection, LanguageOptions } from '@/types'

interface Props {
  selectedLanguages: Language[]
  primaryLanguage: Language
}

defineProps<Props>()

const emit = defineEmits<{
  'selection-change': [selection: LanguageSelection]
  'options-change': [options: LanguageOptions]
}>()

const isOpen = ref(false)

function handleSelectionChange(selection: LanguageSelection) {
  emit('selection-change', selection)
}

function handleOptionsChange(options: LanguageOptions) {
  emit('options-change', options)
}
</script>
